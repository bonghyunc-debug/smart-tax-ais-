import { strict as assert } from 'node:assert';
import test from 'node:test';
import { calculatePenaltyDetails } from '../utils/taxCalculations';
import { calculateTax } from '../utils/taxCalculations';
import { INITIAL_STATE } from '../src/hooks/useTaxState';
import { TaxState } from '../types';

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

test('calculateTax는 가산세 감면을 한 번만 적용한다', () => {
  const props: TaxState = {
    ...INITIAL_STATE,
    declarationType: 'after_deadline',
    yangdoDate: '2025-01-15',
    reportDate: '2025-04-15',
    paymentDate: '2025-04-15',
    yangdoPrice: '100000000',
    acquisitionDate: '2020-01-10',
    acqPriceActual: { ...INITIAL_STATE.acqPriceActual, maega: '40000000' },
    expenseActual: { ...INITIAL_STATE.expenseActual, sellBrokerage: '1000000' },
  };

  const taxResult = calculateTax(props);

  const penaltyExpected = calculatePenaltyDetails({
    incomeTaxBase: taxResult.decidedTax + taxResult.constructionPenalty,
    unpaidTax: Math.max(0, taxResult.additionalIncomeTaxBase),
    isUnreported: true,
    isUnderReported: false,
    isFraud: false,
    dueDate: new Date(taxResult.deadline),
    paymentDate: new Date(props.paymentDate),
    filingType: 'late',
    filingDate: new Date(props.reportDate),
  });

  assert.equal(taxResult.incomePenalty.total, penaltyExpected.totalPenaltyAfterRelief);
  assert.equal(taxResult.incomePenalty.report, penaltyExpected.unreportedPenalty + penaltyExpected.underReportedPenalty);
  assert.equal(taxResult.incomePenalty.delay, penaltyExpected.latePaymentPenalty);
});
