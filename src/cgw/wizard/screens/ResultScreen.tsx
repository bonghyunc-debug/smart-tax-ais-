import React, { useState } from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';
import { ScenarioKey } from '../../scenario/scenarioKey';
import { toLegacyTaxState } from '../../adapters/toLegacyTaxState';
import { calculateTax } from '../../../../utils/taxCalculations';
import { TaxResult } from '../../../../types';

interface ResultScreenProps {
  draft: CapitalGainTransaction;
  scenarioKey: ScenarioKey;
}

export function ResultScreen({ draft, scenarioKey }: ResultScreenProps) {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    try {
      setIsCalculating(true);
      const legacyState = toLegacyTaxState(draft);
      const calculated = calculateTax(legacyState);
      setResult(calculated);
      setError(null);
    } catch (err) {
      setError('계산 중 오류가 발생했습니다. 입력값을 다시 확인해주세요.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">결과 요약</h2>
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <p className="text-sm text-slate-600">시나리오 키: {scenarioKey}</p>
        <p className="text-sm text-slate-600">신고 유형: {draft.returnMeta.returnType}</p>
        <p className="text-sm text-slate-600">자산 유형: {draft.assetInfo.assetType}</p>
        <p className="text-sm text-slate-600">양도일: {draft.dealInfo.transferDate || '-'}</p>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={isCalculating}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
      >
        {isCalculating ? '계산 중...' : '계산하기'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4 shadow-sm space-y-2">
          <h3 className="text-lg font-semibold text-indigo-900">세액 계산 결과</h3>
          <p className="text-sm text-indigo-900">과세표준: {result.taxBase.toLocaleString()}원</p>
          <p className="text-sm text-indigo-900">산출세액: {result.taxResult.tax.toLocaleString()}원</p>
          <p className="text-sm text-indigo-900">농특세: {result.nongteukse.toLocaleString()}원</p>
          <p className="text-sm text-indigo-900">총 납부세액: {result.totalIncomeTax.toLocaleString()}원</p>
          <p className="text-sm text-indigo-900">신고기한: {result.deadline}</p>
          <p className="text-sm text-indigo-900">장기보유공제: {result.longTerm.amount.toLocaleString()}원 ({result.longTerm.rate}%)</p>
        </div>
      )}
    </div>
  );
}
