import { addMonths, isBefore } from 'date-fns';
import { TaxState } from '../../types';
import { TAX_CONSTANTS } from '../constants/taxConstants';

export const safeNumberParse = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * 입력 상태를 검증하고, 잘못된 값은 보정한 새 상태와 오류 메시지를 반환합니다.
 */
export function validateTaxState(state: TaxState) {
  const errors: string[] = [];

  if (!state.assetType) errors.push('자산 종류를 선택하세요.');
  if (!state.yangdoDate) errors.push('양도일을 입력하세요.');
  if (!state.acquisitionDate && state.origAcquisitionCause !== 'inheritance') {
    errors.push('취득일을 입력하세요.');
  }

  const yangdoDate = state.yangdoDate ? new Date(state.yangdoDate) : undefined;
  const acqDate = state.acquisitionDate ? new Date(state.acquisitionDate) : undefined;

  if (yangdoDate && acqDate && isBefore(yangdoDate, acqDate)) {
    errors.push('양도일은 취득일보다 이후여야 합니다.');
  }

  if (acqDate && isBefore(acqDate, new Date(TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1985))) {
    state = { ...state, acquisitionDate: TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1985 };
  }

  const paymentDate = state.paymentDate ? new Date(state.paymentDate) : undefined;
  const fixedPayment = paymentDate && yangdoDate && isBefore(paymentDate, yangdoDate)
    ? addMonths(yangdoDate, 2).toISOString().split('T')[0]
    : state.paymentDate;

  const cleaned: TaxState = {
    ...state,
    yangdoPrice: String(safeNumberParse(state.yangdoPrice)),
    basicDeductionInput: String(safeNumberParse(state.basicDeductionInput || TAX_CONSTANTS.BASE_DEDUCTION)),
    paymentDate: fixedPayment || state.paymentDate,
  };

  return { state: cleaned, errors };
}
