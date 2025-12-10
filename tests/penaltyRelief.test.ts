import { strict as assert } from 'node:assert';
import test from 'node:test';
import { calculatePenaltyDetails } from '../utils/taxCalculations';

test('late filing 무신고 가산세 감면이 적용되어 절반으로 감소한다', () => {
  const unpaidTax = 1_000_000;
  const dueDate = new Date('2025-01-31');
  const filingDate = new Date('2025-02-15');

  const baseUnreportedPenalty = Math.floor(unpaidTax * 0.2); // PENALTY_RATE_UNFILED
  const expectedReliefRate = 0.5; // getLateReturnReliefRate(0)
  const expectedUnreportedAfter = Math.floor(baseUnreportedPenalty * (1 - expectedReliefRate));

  const result = calculatePenaltyDetails({
    incomeTaxBase: 0,
    unpaidTax,
    isUnreported: true,
    isUnderReported: false,
    isFraud: false,
    dueDate,
    paymentDate: filingDate,
    filingType: 'late',
    filingDate
  });

  assert.equal(result.unreportedPenalty, expectedUnreportedAfter);
  assert.ok(result.unreportedPenalty < baseUnreportedPenalty);
  assert.equal(result.totalPenaltyBeforeRelief, baseUnreportedPenalty + result.latePaymentPenalty);
  assert.equal(result.totalPenaltyAfterRelief, expectedUnreportedAfter + result.latePaymentPenalty);
});

test('경정 청구 시 과소신고 가산세 감면율이 적용된다', () => {
  const unpaidTax = 800_000;
  const dueDate = new Date('2025-01-31');
  const filingDate = new Date('2025-04-05');

  const baseUnderReportedPenalty = Math.floor(unpaidTax * 0.1); // PENALTY_RATE_UNDERFILED
  const expectedReliefRate = 0.75; // getAmendedReliefRate(2)
  const expectedUnderReportedAfter = Math.floor(baseUnderReportedPenalty * (1 - expectedReliefRate));

  const result = calculatePenaltyDetails({
    incomeTaxBase: 0,
    unpaidTax,
    isUnreported: false,
    isUnderReported: true,
    isFraud: false,
    dueDate,
    paymentDate: filingDate,
    filingType: 'amended',
    filingDate
  });

  assert.equal(result.underReportedPenalty, expectedUnderReportedAfter);
  assert.ok(result.underReportedPenalty < baseUnderReportedPenalty);
  assert.equal(result.totalPenaltyBeforeRelief, baseUnderReportedPenalty + result.latePaymentPenalty);
  assert.equal(result.totalPenaltyAfterRelief, expectedUnderReportedAfter + result.latePaymentPenalty);
});
