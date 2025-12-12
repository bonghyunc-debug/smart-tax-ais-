import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface ReturnTypeScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['returnMeta']>) => void;
}

const options = [
  { value: 'ON_TIME', label: '정상 신고 (ON_TIME)' },
  { value: 'LATE', label: '기한후 신고 (LATE)' },
  { value: 'AMENDED', label: '수정 신고 (AMENDED)' },
] as const;

export function ReturnTypeScreen({ draft, onChange }: ReturnTypeScreenProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">신고 유형 선택</h2>
      <p className="text-sm text-slate-600">신고 성격에 따라 가산세 계산 등이 달라집니다.</p>
      <div className="grid gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <input
              type="radio"
              name="returnType"
              value={opt.value}
              checked={draft.returnMeta.returnType === opt.value}
              onChange={() => onChange({ returnType: opt.value })}
              className="h-4 w-4"
            />
            <span className="text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
