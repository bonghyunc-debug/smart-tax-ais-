import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';
import { ScenarioKey } from '../../scenario/scenarioKey';
import { uiPolicy } from '../../scenario/uiPolicy';

interface AssetScreenProps {
  draft: CapitalGainTransaction;
  onChange: (value: Partial<CapitalGainTransaction['assetInfo']>) => void;
  scenarioKey: ScenarioKey;
  onUseProfileChange: (value: Partial<CapitalGainTransaction['useProfile']>) => void;
}

const assetOptions = [
  { value: 'HOUSE', label: '주택' },
  { value: 'HIGH_PRICE_HOUSE', label: '고가주택' },
  { value: 'LAND', label: '토지' },
] as const;

export function AssetScreen({ draft, onChange, scenarioKey, onUseProfileChange }: AssetScreenProps) {
  const policy = uiPolicy[scenarioKey];
  const showLandArea = policy?.assetInfo?.show?.includes('landArea');

  const handleChange = (field: keyof CapitalGainTransaction['assetInfo']) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = field === 'landArea' ? Number(e.target.value || 0) : e.target.value;
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">자산 정보</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {assetOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <input
                type="radio"
                name="assetType"
                value={opt.value}
                checked={draft.assetInfo.assetType === opt.value}
                onChange={() => onChange({ assetType: opt.value })}
                className="h-4 w-4"
              />
              <span className="text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        <label className="space-y-1 text-sm text-slate-700">
          <span>자산 설명</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.assetInfo.description ?? ''}
            onChange={handleChange('description')}
            placeholder="예: ○○동 ○○아파트 101동 1001호"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span>소재지</span>
          <input
            className="w-full rounded-md border border-slate-200 p-2"
            value={draft.assetInfo.address ?? ''}
            onChange={handleChange('address')}
            placeholder="주소 입력"
          />
        </label>
        {showLandArea && (
          <label className="space-y-1 text-sm text-slate-700">
            <span>토지 면적 (㎡)</span>
            <input
              type="number"
              className="w-full rounded-md border border-slate-200 p-2"
              value={draft.assetInfo.landArea ?? ''}
              onChange={handleChange('landArea')}
              placeholder="예: 85"
            />
          </label>
        )}
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={draft.useProfile.isOneHouseOneHouseholdExempt}
            onChange={(e) => onUseProfileChange({ isOneHouseOneHouseholdExempt: e.target.checked })}
          />
          <span>1세대 1주택 비과세(증빙 제출) 여부</span>
        </label>
        {draft.assetInfo.assetType === 'LAND' && (
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.useProfile.isBusinessUse}
              onChange={(e) => onUseProfileChange({ isBusinessUse: e.target.checked })}
            />
            <span>사업용 토지 여부</span>
          </label>
        )}
      </div>
    </div>
  );
}
