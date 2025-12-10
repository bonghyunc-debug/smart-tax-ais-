import { strict as assert } from 'node:assert';
import test from 'node:test';
import { determineSpecialRatePct } from '../utils/taxCalculations';

test('상가/건물 0.5년 보유 시 50% 단기 세율을 적용한다', () => {
  const result = determineSpecialRatePct('상가/건물', 0.5);
  assert.equal(result.ratePct, 50);
});

test('토지 1.5년 보유 시 40% 단기 세율을 적용한다', () => {
  const result = determineSpecialRatePct('토지', 1.5);
  assert.equal(result.ratePct, 40);
});

test('1세대1주택_고가주택 0.5년 보유 시 70%가 적용된다', () => {
  const result = determineSpecialRatePct('1세대1주택_고가주택', 0.5);
  assert.equal(result.ratePct, 70);
});

test('1세대1주택_고가주택 1.5년 보유 시 60%가 적용된다', () => {
  const result = determineSpecialRatePct('1세대1주택_고가주택', 1.5);
  assert.equal(result.ratePct, 60);
});

test('1세대1주택_고가주택 2.1년 보유 시 누진세율 적용으로 null을 반환한다', () => {
  const result = determineSpecialRatePct('1세대1주택_고가주택', 2.1);
  assert.equal(result.ratePct, null);
});

test('분양권 2.1년 보유 시 60% 정률을 적용한다', () => {
  const result = determineSpecialRatePct('분양권', 2.1);
  assert.equal(result.ratePct, 60);
});

test('미등기 10년 보유 시에도 70% 정률을 적용한다', () => {
  const result = determineSpecialRatePct('미등기', 10);
  assert.equal(result.ratePct, 70);
});
