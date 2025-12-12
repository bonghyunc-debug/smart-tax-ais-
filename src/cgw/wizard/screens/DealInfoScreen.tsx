import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface DealInfoScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['dealInfo']>) => void;
}

const acquisitionOptions = [
  { value: 'SALE', label: '매매' },
  { value: 'INHERITANCE', label: '상속' },
  { value: 'GIFT', label: '증여' },
  { value: 'CONSTRUCTION', label: '신축' },
  { value: 'OTHER', label: '기타' },
] as const;

const transferOptions = [
  { value: 'SALE', label: '매매(양도)' },
  { value: 'AUCTION', label: '경매' },
  { value: 'EXPROPRIATION', label: '수용' },
  { value: 'OTHER', label: '기타' },
] as const;

export function DealInfoScreen({ draft, onChange }: DealInfoScreenProps) {
  const handleChange = (field: keyof CapitalGainTransaction['dealInfo']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">거래 정보</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span>취득 원인</span>
          <select
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.dealInfo.acquisitionType}
            onChange={(e) => onChange({ acquisitionType: e.target.value as CapitalGainTransaction['dealInfo']['acquisitionType'] })}
          >
            {acquisitionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>양도 원인</span>
          <select
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.dealInfo.transferType}
            onChange={(e) => onChange({ transferType: e.target.value as CapitalGainTransaction['dealInfo']['transferType'] })}
          >
            {transferOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>취득일</span>
          <input
            type="date"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.dealInfo.acquisitionDate}
            onChange={handleChange('acquisitionDate')}
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>양도일</span>
          <input
            type="date"
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.dealInfo.transferDate}
            onChange={handleChange('transferDate')}
          />
        </label>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        신고유형이나 취득/양도 사유에 따라 감면·가산세 규칙이 달라집니다. 이번 스텝에서는 필수 날짜만 채우고 다음으로 진행하세요.
      </div>
    </div>
  );
}
