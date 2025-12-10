import assert from 'node:assert';
import test from 'node:test';

import { TAX_CONSTANTS } from '../src/constants/taxConstants';
import { calculateTax } from '../utils/taxCalculations';
import { INITIAL_STATE } from '../src/hooks/useTaxState';
import { TaxState } from '../types';

test('BASE_DEDUCTION은 2,500,000원이다', () => {
  assert.strictEqual(TAX_CONSTANTS.BASE_DEDUCTION, 2_500_000);
});

test('미등기 양도는 기본공제를 적용하지 않는다', () => {
  const props: TaxState = {
    ...INITIAL_STATE,
    assetType: '미등기',
    useCustomBasicDeduction: true,
    basicDeductionInput: '5_000_000',
    yangdoPrice: '10000000',
    acqPriceActual: { ...INITIAL_STATE.acqPriceActual, maega: '1000000' },
    expenseActual: { ...INITIAL_STATE.expenseActual },
  };

  const result = calculateTax(props);

  assert.strictEqual(result.basicDed, 0);
  assert.match(result.taxResult.desc, /미등기 양도는 기본공제 미적용/);
});
