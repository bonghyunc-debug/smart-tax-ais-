import assert from 'node:assert';
import test from 'node:test';

import { calculateDeadline } from '../utils/taxCalculations';

test('일반 양도는 말일 + 2개월', () => {
  const result = calculateDeadline('2025-01-15');
  assert.strictEqual(result, '2025-03-31');
});

test('부담부증여는 말일 + 3개월', () => {
  const result = calculateDeadline('2025-01-15', [], { yangdoCause: 'burden_gift' });
  assert.strictEqual(result, '2025-04-30');
});

test('주말이면 다음 영업일로 이월', () => {
  const result = calculateDeadline('2025-03-10');
  assert.strictEqual(result, '2025-06-02');
});
