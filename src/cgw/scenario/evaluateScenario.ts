import { CapitalGainTransactionDraft } from '../domain/CapitalGainTransaction';
import { ScenarioKey } from './scenarioKey';

export function evaluateScenario(draft: CapitalGainTransactionDraft): ScenarioKey {
  const assetType = draft.assetInfo?.assetType;
  const isExempt = !!draft.useProfile?.isOneHouseOneHouseholdExempt;

  if (isExempt && assetType === 'HIGH_PRICE_HOUSE') {
    return 'HIGH_PRICE_HOUSE_EXEMPT';
  }

  if (isExempt) {
    return 'HOUSE_EXEMPT_EVIDENCE';
  }

  if (assetType === 'LAND') {
    return 'LAND_GENERAL';
  }

  return 'HOUSE_GENERAL';
}
