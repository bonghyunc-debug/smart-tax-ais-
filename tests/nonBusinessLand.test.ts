import assert from 'node:assert';
import test from 'node:test';

import { calcNonBusinessLandTax, calculateTaxRate } from '../utils/taxCalculations';
import { INITIAL_STATE } from '../src/hooks/useTaxState';
import { TaxState } from '../types';

test('비사업용 토지 중과: 2023년 과표 1,000만원이면 1,600,000원', () => {
  assert.strictEqual(calcNonBusinessLandTax(10_000_000, 2023), 1_600_000);
});

test('비사업용 토지 중과: 2023년 과표 2,000만원이면 3,740,000원', () => {
  assert.strictEqual(calcNonBusinessLandTax(20_000_000, 2023), 3_740_000);
});

test('비사업용 토지 예외이면 중과 후보가 배제된다', () => {
  const props: TaxState = {
    ...INITIAL_STATE,
    assetType: '토지',
    landUseType: 'non-business',
    isBisatoException: true,
    yangdoDate: '2023-06-01',
  };

  const result = calculateTaxRate(10_000_000, 3, props);

  assert.strictEqual(result.tax, 600_000);
  assert.match(result.desc, /비사업용 중과 제외/);
});
