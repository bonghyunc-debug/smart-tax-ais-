import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateScenario } from '../scenario/evaluateScenario';
import { CapitalGainTransactionDraft } from '../domain/CapitalGainTransaction';

const baseDraft: CapitalGainTransactionDraft = {
  returnMeta: {},
  taxpayer: {},
  useProfile: { isOneHouseOneHouseholdExempt: false },
  assetInfo: { assetType: 'HOUSE' },
  dealInfo: {},
  amountInfo: {},
  reliefInfo: {},
};

describe('evaluateScenario', () => {
  it('고가주택 + 비과세 플래그 시 HIGH_PRICE_HOUSE_EXEMPT', () => {
    const draft: CapitalGainTransactionDraft = {
      ...baseDraft,
      useProfile: { isOneHouseOneHouseholdExempt: true },
      assetInfo: { assetType: 'HIGH_PRICE_HOUSE' },
    };
    assert.equal(evaluateScenario(draft), 'HIGH_PRICE_HOUSE_EXEMPT');
  });

  it('비과세 플래그만 있을 때 HOUSE_EXEMPT_EVIDENCE', () => {
    const draft: CapitalGainTransactionDraft = {
      ...baseDraft,
      useProfile: { isOneHouseOneHouseholdExempt: true },
      assetInfo: { assetType: 'HOUSE' },
    };
    assert.equal(evaluateScenario(draft), 'HOUSE_EXEMPT_EVIDENCE');
  });

  it('토지면 LAND_GENERAL', () => {
    const draft: CapitalGainTransactionDraft = {
      ...baseDraft,
      assetInfo: { assetType: 'LAND' },
    };
    assert.equal(evaluateScenario(draft), 'LAND_GENERAL');
  });

  it('기본값은 HOUSE_GENERAL', () => {
    assert.equal(evaluateScenario(baseDraft), 'HOUSE_GENERAL');
  });
});
