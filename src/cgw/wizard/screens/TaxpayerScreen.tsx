import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface TaxpayerScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['taxpayer']>) => void;
}

export function TaxpayerScreen({ draft, onChange }: TaxpayerScreenProps) {
  const handleChange = (field: keyof CapitalGainTransaction['taxpayer']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">납세자 정보</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span>성명 *</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.taxpayer.name}
            onChange={handleChange('name')}
            placeholder="홍길동"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>주민등록번호 *</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.taxpayer.ssn}
            onChange={handleChange('ssn')}
            placeholder="000000-0000000"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>주소</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.taxpayer.address ?? ''}
            onChange={handleChange('address')}
            placeholder="서울특별시 ..."
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>연락처 *</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.taxpayer.phone ?? ''}
            onChange={handleChange('phone')}
            placeholder="010-0000-0000"
          />
        </label>
      </div>
      <p className="text-xs text-slate-500">필수값 부족 시 다음 단계 버튼이 비활성화됩니다.</p>
    </div>
  );
}
