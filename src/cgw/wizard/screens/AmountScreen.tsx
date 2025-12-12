import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface AmountScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['amountInfo']>) => void;
}

export function AmountScreen({ draft, onChange }: AmountScreenProps) {
  const handleNumberChange = (field: keyof CapitalGainTransaction['amountInfo']) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">금액 정보</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span>양도가액 *</span>
          <input
            type="number"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.amountInfo.transferValue}
            onChange={handleNumberChange('transferValue')}
            placeholder="예: 500000000"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>취득가액 *</span>
          <input
            type="number"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.amountInfo.acquisitionValue}
            onChange={handleNumberChange('acquisitionValue')}
            placeholder="예: 300000000"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>필요경비 *</span>
          <input
            type="number"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.amountInfo.necessaryExpenses}
            onChange={handleNumberChange('necessaryExpenses')}
            placeholder="예: 10000000"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>기납부 세액(선택)</span>
          <input
            type="number"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.amountInfo.previousTaxPaid ?? 0}
            onChange={handleNumberChange('previousTaxPaid')}
            placeholder="기한후·수정 신고 시 참고"
          />
        </label>
      </div>
      <p className="text-xs text-slate-500">금액은 숫자만 입력해주세요. 미입력 시 0으로 처리됩니다.</p>
    </div>
  );
}
