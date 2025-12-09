import { useCallback, useReducer } from 'react';
import { TaxState } from '../../types';
import { TAX_CONSTANTS } from '../constants/taxConstants';

export const INITIAL_STATE: TaxState = {
  declarationType: 'regular',
  reportDate: new Date().toISOString().split('T')[0],
  paymentDate: new Date().toISOString().split('T')[0],
  installmentInput: '',

  initialIncomeTax: '',
  initialNongteukse: '',

  hasPriorDeclaration: false,
  priorIncomeAmount: '',
  priorTaxAmount: '',

  transferorInfo: { name: '', ssn: '', phone: '' },
  transfereeInfo: { name: '', ssn: '' },
  propertyAddress: '',

  assetType: '일반주택',
  landArea: '',
  landUseType: 'business',
  isBisatoException: false,

  isPre1990: false,
  price1990Jan1: '',
  gradeAcq: '',
  grade1990Aug30: '',
  gradePrev1990Aug30: '',

  acquisitionOrigin: 'purchase',
  acquisitionCause: 'sale',
  origAcquisitionCause: 'sale',
  yangdoCause: 'sale',
  yangdoDate: new Date().toISOString().split('T')[0],
  acquisitionDate: '',
  origAcquisitionDate: '',

  acquisitionLandOfficialUnitPrice: null,
  acquisitionLandArea: null,

  transferLandOfficialUnitPrice: null,
  transferLandArea: null,

  giftEvaluationMethod: 'market',
  giftValue: '',
  burdenDebtDeposit: '',
  burdenDebtLoan: '',
  debtAmount: '',

  yangdoPrice: '',
  acqPriceMethod: 'actual',
  acqPriceActual: { maega: '', acqTax: '', other: '', acqBrokerage: '' },

  officialPrice: '',
  transferOfficialPrice: '',
  unitOfficialPrice: '',
  unitTransferOfficialPrice: '',

  expenseMethod: 'actual',
  expenseActual: { repair: '', sellBrokerage: '', other: '' },
  deductionInput: '',
  useActualExpenseWithConverted: false,

  giftTaxPaid: '',

  residenceYears: '',
  useResidenceSpecial: false,
  taxExemptionType: 'none',
  customRate: '',
  isNongteukseExempt: false,

  useCustomBasicDeduction: false,
  basicDeductionInput: String(TAX_CONSTANTS.BASE_DEDUCTION),

  nongInstallmentInput: '',
};

function reducer(state: TaxState, action: any): TaxState {
  if (action.type === 'SET') return { ...state, [action.field]: action.value };
  if (action.type === 'SET_NESTED') {
    return {
      ...state,
      [action.field]: {
        ...(state[action.field as keyof TaxState] as object),
        [action.subField]: action.value,
      },
    };
  }
  if (action.type === 'RESET') return INITIAL_STATE;
  return state;
}

export function useTaxState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const set = useCallback((field: string, value: any) => dispatch({ type: 'SET', field, value }), []);
  const setNested = useCallback(
    (field: string, subField: string, value: any) =>
      dispatch({ type: 'SET_NESTED', field, subField, value }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, set, setNested, reset, dispatch };
}
