import assert from 'node:assert';
import test from 'node:test';

import { calculatePeriod } from '../utils/taxCalculations';

test('총 일수 기반 2년 10일 계산', () => {
  const result = calculatePeriod('2020-01-01', '2022-01-11');
  assert.strictEqual(result.years, 2);
  assert.strictEqual(result.days, 10);
  assert.strictEqual(result.text, '2년 10일');
});

test('윤년 경계에서 1년 365일 분리', () => {
  const result = calculatePeriod('2019-01-01', '2020-12-31');
  assert.strictEqual(result.years, 1);
  assert.strictEqual(result.days, 365);
  assert.strictEqual(result.text, '1년 365일');
});

test('빈 값 입력 시 기존 처리 유지', () => {
  const result = calculatePeriod('', '');
  assert.strictEqual(result.years, 0);
  assert.strictEqual(result.days, 0);
  assert.strictEqual(result.text, '0년 0일');
});
