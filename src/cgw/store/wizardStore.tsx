import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { CapitalGainTransaction, CapitalGainTransactionDraft } from '../domain/CapitalGainTransaction';
import { evaluateScenario } from '../scenario/evaluateScenario';
import { ScenarioKey } from '../scenario/scenarioKey';

const TODAY = new Date().toISOString().split('T')[0];

const createInitialDraft = (): CapitalGainTransaction => ({
  returnMeta: { returnType: 'ON_TIME', taxYear: undefined },
  taxpayer: { name: '', ssn: '', address: '', phone: '' },
  useProfile: { isOneHouseOneHouseholdExempt: false, isBusinessUse: true },
  assetInfo: { assetType: 'HOUSE', description: '', address: '', landArea: undefined },
  dealInfo: {
    acquisitionType: 'SALE',
    transferType: 'SALE',
    acquisitionDate: '',
    transferDate: TODAY,
  },
  amountInfo: {
    transferValue: 0,
    acquisitionValue: 0,
    necessaryExpenses: 0,
    previousTaxPaid: 0,
  },
  reliefInfo: { reliefFlags: [], creditFlags: [] },
});

type WizardAction =
  | { type: 'UPDATE_SECTION'; section: keyof CapitalGainTransaction; value: Partial<CapitalGainTransaction[keyof CapitalGainTransaction]> }
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET' };

interface WizardState {
  draft: CapitalGainTransaction;
  step: number;
}

const WizardContext = createContext<{
  draft: CapitalGainTransaction;
  step: number;
  scenarioKey: ScenarioKey;
  updateSection: <K extends keyof CapitalGainTransaction>(section: K, value: Partial<CapitalGainTransaction[K]>) => void;
  goNext: () => void;
  goBack: () => void;
  isStepValid: (step?: number) => boolean;
  missingFields: (step?: number) => string[];
  resetWizard: () => void;
} | null>(null);

function reducer(state: WizardState, action: WizardAction): WizardState {
  if (action.type === 'UPDATE_SECTION') {
    return {
      ...state,
      draft: {
        ...state.draft,
        [action.section]: {
          ...(state.draft[action.section as keyof CapitalGainTransaction] as object),
          ...action.value,
        },
      } as CapitalGainTransaction,
    };
  }

  if (action.type === 'SET_STEP') {
    return { ...state, step: action.step };
  }

  if (action.type === 'RESET') {
    return { draft: createInitialDraft(), step: 0 };
  }

  return state;
}

function validateStep(draft: CapitalGainTransaction, scenarioKey: ScenarioKey, step: number): string[] {
  const missing: string[] = [];

  switch (step) {
    case 1: {
      if (!draft.returnMeta.returnType) missing.push('returnType');
      break;
    }
    case 2: {
      if (!draft.taxpayer.name) missing.push('taxpayer.name');
      if (!draft.taxpayer.ssn) missing.push('taxpayer.ssn');
      if (!draft.taxpayer.phone) missing.push('taxpayer.phone');
      break;
    }
    case 3: {
      if (!draft.assetInfo.assetType) missing.push('assetInfo.assetType');
      if (scenarioKey === 'LAND_GENERAL' && draft.assetInfo.landArea === undefined) missing.push('assetInfo.landArea');
      break;
    }
    case 4: {
      const fields: Array<keyof CapitalGainTransaction['dealInfo']> = [
        'acquisitionType',
        'transferType',
        'acquisitionDate',
        'transferDate',
      ];
      fields.forEach((field) => {
        if (!draft.dealInfo[field]) missing.push(`dealInfo.${field}`);
      });
      break;
    }
    case 5: {
      if (!draft.amountInfo.transferValue) missing.push('amountInfo.transferValue');
      if (!draft.amountInfo.acquisitionValue) missing.push('amountInfo.acquisitionValue');
      if (draft.amountInfo.necessaryExpenses === undefined || draft.amountInfo.necessaryExpenses === null)
        missing.push('amountInfo.necessaryExpenses');
      break;
    }
    default:
      break;
  }

  return missing;
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { draft: createInitialDraft(), step: 0 });

  const scenarioKey = useMemo(() => evaluateScenario(state.draft as CapitalGainTransactionDraft), [state.draft]);

  const updateSection = <K extends keyof CapitalGainTransaction>(section: K, value: Partial<CapitalGainTransaction[K]>) => {
    dispatch({ type: 'UPDATE_SECTION', section, value });
  };

  const isStepValid = (stepOverride?: number) => validateStep(state.draft, scenarioKey, stepOverride ?? state.step).length === 0;

  const missingFields = (stepOverride?: number) => validateStep(state.draft, scenarioKey, stepOverride ?? state.step);

  const goNext = () => {
    if (state.step >= 7) return;
    if (!isStepValid()) return;
    dispatch({ type: 'SET_STEP', step: state.step + 1 });
  };

  const goBack = () => {
    if (state.step === 0) return;
    dispatch({ type: 'SET_STEP', step: state.step - 1 });
  };

  const resetWizard = () => dispatch({ type: 'RESET' });

  const value = {
    draft: state.draft,
    step: state.step,
    scenarioKey,
    updateSection,
    goNext,
    goBack,
    isStepValid,
    missingFields,
    resetWizard,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizardStore() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('WizardStore가 초기화되지 않았습니다. WizardProvider로 감싸주세요.');
  }
  return ctx;
}

export function useWizardNavigation() {
  const { step, goBack, goNext, isStepValid, missingFields } = useWizardStore();
  return { step, goBack, goNext, isStepValid, missingFields };
}

export const TOTAL_STEPS = 8;
