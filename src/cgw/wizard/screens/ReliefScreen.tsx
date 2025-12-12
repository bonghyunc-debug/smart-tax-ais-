import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface ReliefScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['reliefInfo']>) => void;
}

const reliefCandidates = [
  { key: 'LONG_TERM_DEDUCTION', label: '장기보유특별공제' },
  { key: 'ONE_HOUSE_ONE_HOUSEHOLD', label: '1세대1주택 감면' },
  { key: 'SMALL_TOWN', label: '소득세 감면 지역' },
];

const creditCandidates = [
  { key: 'FOREIGN_TAX_CREDIT', label: '외국납부세액공제' },
  { key: 'WITHHOLDING', label: '원천징수세액공제' },
];

export function ReliefScreen({ draft, onChange }: ReliefScreenProps) {
  const handleToggle = (field: 'reliefFlags' | 'creditFlags', key: string) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const current = new Set(draft.reliefInfo[field]);
    if (e.target.checked) current.add(key);
    else current.delete(key);
    onChange({ [field]: Array.from(current) });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">감면 / 공제 (스텁)</h2>
      <p className="text-sm text-slate-600">향후 룰 테이블과 연동될 필드입니다. 필요한 항목만 선택하세요.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">감면 후보</p>
          {reliefCandidates.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.reliefInfo.reliefFlags.includes(item.key)}
                onChange={handleToggle('reliefFlags', item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">공제 후보</p>
          {creditCandidates.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.reliefInfo.creditFlags.includes(item.key)}
                onChange={handleToggle('creditFlags', item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
