import { ScenarioKey } from './scenarioKey';

export type FieldPolicy = {
  show?: string[];
  required?: string[];
};

export type StepPolicy = Record<string, FieldPolicy>;

export const uiPolicy: Record<ScenarioKey, StepPolicy> = {
  HOUSE_GENERAL: {
    assetInfo: { required: ['assetType'] },
    dealInfo: { required: ['acquisitionDate', 'transferDate', 'acquisitionType', 'transferType'] },
  },
  HOUSE_EXEMPT_EVIDENCE: {
    assetInfo: { required: ['assetType'] },
    dealInfo: { required: ['acquisitionDate', 'transferDate', 'acquisitionType', 'transferType'] },
  },
  HIGH_PRICE_HOUSE_EXEMPT: {
    assetInfo: { required: ['assetType'] },
    dealInfo: { required: ['acquisitionDate', 'transferDate', 'acquisitionType', 'transferType'] },
  },
  LAND_GENERAL: {
    assetInfo: { required: ['assetType', 'landArea'], show: ['landArea'] },
    dealInfo: { required: ['acquisitionDate', 'transferDate', 'acquisitionType', 'transferType'] },
  },
};
