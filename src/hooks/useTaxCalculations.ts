import { useEffect, useMemo, useState } from 'react';
import { TaxState } from '../../types';
import { TAX_CONSTANTS } from '../constants/taxConstants';
import { validateTaxState } from '../utils/validateTaxState';
import {
  LAND_GRADE_TABLE,
  calculateDeadline,
  calculateTax,
  isLandLike,
  parseNumber,
} from '../../utils/taxCalculations';

export function useTaxCalculations(
  state: TaxState,
  set: (field: string, value: any) => void,
) {
  const [errors, setErrors] = useState<string[]>([]);

  const { state: validatedState, errors: validationErrors } = useMemo(() => validateTaxState(state), [state]);
  useEffect(() => setErrors(validationErrors), [validationErrors]);

  const isPre1985 = useMemo(() => {
    const targetDate =
      state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate
        ? state.origAcquisitionDate
        : state.acquisitionDate;

    if (!targetDate) return false;
    return new Date(targetDate) < new Date(TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1985);
  }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause]);

  const result = useMemo(() => calculateTax(validatedState), [validatedState]);

  useEffect(() => {
    if (['자경/대토 농지', '분양권', '미등기'].includes(state.assetType)) {
      if (state.assetType === '자경/대토 농지') {
        set('taxExemptionType', 'farm_8y');
      } else if (state.taxExemptionType === 'public_cash_standard') {
        set('taxExemptionType', 'none');
      }
    } else if (state.yangdoCause !== 'expropriation' && state.taxExemptionType === 'public_cash_standard') {
      set('taxExemptionType', 'none');
    }
  }, [state.assetType, state.yangdoCause, state.taxExemptionType, set]);

  useEffect(() => {
    if (state.taxExemptionType === 'farm_8y') {
      set('isNongteukseExempt', true);
    } else if (state.taxExemptionType === 'none') {
      set('isNongteukseExempt', false);
    }
  }, [state.taxExemptionType, set]);

  useEffect(() => {
    if (state.hasPriorDeclaration) {
      set('useCustomBasicDeduction', true);
      set('basicDeductionInput', String(TAX_CONSTANTS.BASE_DEDUCTION));
    } else if (state.basicDeductionInput === String(TAX_CONSTANTS.BASE_DEDUCTION)) {
      set('useCustomBasicDeduction', false);
    }
  }, [state.hasPriorDeclaration, state.basicDeductionInput, set]);

  useEffect(() => {
    const targetDate =
      state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate
        ? state.origAcquisitionDate
        : state.acquisitionDate;

    if (targetDate) {
      const acq = new Date(targetDate);
      const refDate = new Date(TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1990);
      set('isPre1990', acq < refDate);
    } else {
      set('isPre1990', false);
    }
  }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause, set]);

  useEffect(() => {
    if (isLandLike(state.assetType) && state.isPre1990 && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
      const p90_1_1_unit = parseNumber(state.price1990Jan1);
      const v_acq_input = parseNumber(state.gradeAcq);
      const v_90 = parseNumber(state.grade1990Aug30);
      const v_prev = parseNumber(state.gradePrev1990Aug30);

      if (p90_1_1_unit > 0 && v_acq_input > 0 && v_90 > 0 && v_prev > 0) {
        const val_90 = LAND_GRADE_TABLE.get(v_90);
        const val_prev = LAND_GRADE_TABLE.get(v_prev);
        const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
        const denominator = (val_90 + val_prev) / 2;
        if (denominator > 0) {
          const calcUnitPrice = Math.floor((p90_1_1_unit * val_acq) / denominator);
          set('unitOfficialPrice', calcUnitPrice);
        }
      }
    }
  }, [state.price1990Jan1, state.gradeAcq, state.grade1990Aug30, state.gradePrev1990Aug30, state.assetType, state.isPre1990, state.acqPriceMethod, set]);

  useEffect(() => {
    if (['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause)) {
      if (state.acqPriceMethod !== 'actual' && state.yangdoCause !== 'burden_gift') {
        set('acqPriceMethod', 'actual');
      }
    }
  }, [state.acquisitionCause, state.acqPriceMethod, state.yangdoCause, set]);

  useEffect(() => {
    if (state.yangdoCause === 'burden_gift') {
      if (state.giftEvaluationMethod === 'official') {
        set('acqPriceMethod', 'official');
        set('useActualExpenseWithConverted', false);
      } else if (state.acqPriceMethod === 'official') {
        set('acqPriceMethod', 'actual');
      }
    }
  }, [state.yangdoCause, state.giftEvaluationMethod, state.acqPriceMethod, set]);

  useEffect(() => {
    if (isLandLike(state.assetType) && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
      const area = parseNumber(state.landArea);
      const unitAcq = parseNumber(state.unitOfficialPrice);
      const unitTransfer = parseNumber(state.unitTransferOfficialPrice);

      if (area > 0 && unitAcq > 0) {
        set('officialPrice', Math.floor(area * unitAcq));
      }
      if (area > 0 && unitTransfer > 0) {
        set('transferOfficialPrice', Math.floor(area * unitTransfer));
      }
    }
  }, [state.landArea, state.unitOfficialPrice, state.unitTransferOfficialPrice, state.assetType, state.acqPriceMethod, set]);

  useEffect(() => {
    if (state.declarationType === 'regular' && state.yangdoDate) {
      set('paymentDate', calculateDeadline(state.yangdoDate));
    }
  }, [state.yangdoDate, state.declarationType, set]);

  useEffect(() => {
    if (state.yangdoCause === 'burden_gift') {
      const deposit = parseNumber(state.burdenDebtDeposit);
      const loan = parseNumber(state.burdenDebtLoan);
      const totalDebt = deposit + loan;

      if (state.burdenDebtDeposit || state.burdenDebtLoan) {
        set('debtAmount', totalDebt);
      }
      set('yangdoPrice', state.debtAmount);
    }
  }, [state.yangdoCause, state.debtAmount, state.burdenDebtDeposit, state.burdenDebtLoan, set]);

  return { result, isPre1985, errors };
}
