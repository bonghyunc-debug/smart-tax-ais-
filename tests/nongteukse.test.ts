import assert from 'node:assert';
import test from 'node:test';

import { calculateExemptionLogic } from '../utils/taxCalculations';
import { INITIAL_STATE } from '../src/hooks/useTaxState';
import { TaxState } from '../types';

test('감면세액 1,000,000원일 때 농특세는 20%인 200,000원으로 계산된다', () => {
  const props: TaxState = {
    ...INITIAL_STATE,
    taxExemptionType: 'farm_8y',
    isNongteukseExempt: false,
  };

  const result = calculateExemptionLogic(1_000_000, props);

  assert.strictEqual(result.amount, 1_000_000);
  assert.strictEqual(result.nongteukse, 200_000);
});

test('농특세 면제 대상이면 감면세액이 있어도 농특세는 0원으로 강제된다', () => {
  const props: TaxState = {
    ...INITIAL_STATE,
    taxExemptionType: 'farmland_exchange',
    isNongteukseExempt: true,
  };

  const result = calculateExemptionLogic(2_000_000, props);

  assert.strictEqual(result.amount, 2_000_000);
  assert.strictEqual(result.nongteukse, 0);
});
