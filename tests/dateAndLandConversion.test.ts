import assert from 'node:assert';
import test from 'node:test';

import { getEffectiveAcquisitionDate, DEEMED_ACQ_DATE_1985 } from '../src/utils/dateUtils';
import { calcConvertedAcquisitionValue } from '../src/utils/landConversion';

const iso = (d: Date) => d.toISOString().split('T')[0];

test('1985년 이전 취득일은 1985-01-01로 의제된다', () => {
  const actual = new Date('1978-05-01');
  const effective = getEffectiveAcquisitionDate(actual);
  assert.strictEqual(iso(effective), iso(DEEMED_ACQ_DATE_1985));
});

test('1985년 이후 취득일은 그대로 사용한다', () => {
  const actual = new Date('1999-12-31');
  const effective = getEffectiveAcquisitionDate(actual);
  assert.strictEqual(iso(effective), '1999-12-31');
});

test('1990년 등급가액 환산 공식이 평균 분모를 사용한다', () => {
  const result = calcConvertedAcquisitionValue({
    acqGrade: 120,
    grade1990Aug30: 100,
    gradePrev1990Aug30: 80,
    basePrice1990Jan1: 200_000,
  });
  // denom = 90, expected = floor(200000 * 120 / 90) = 266666
  assert.strictEqual(result, 266666);
});

