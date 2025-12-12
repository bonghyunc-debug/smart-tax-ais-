export interface ReturnMeta {
  returnType: 'ON_TIME' | 'LATE' | 'AMENDED';
  taxYear?: number;
}

export interface Taxpayer {
  name: string;
  ssn: string;
  address?: string;
  phone?: string;
}

export interface UseProfile {
  isOneHouseOneHouseholdExempt: boolean;
  isBusinessUse: boolean;
}

export interface AssetInfo {
  assetType: 'HOUSE' | 'HIGH_PRICE_HOUSE' | 'LAND';
  description?: string;
  address?: string;
  landArea?: number;
}

export interface DealInfo {
  acquisitionType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'CONSTRUCTION' | 'OTHER';
  transferType: 'SALE' | 'AUCTION' | 'EXPROPRIATION' | 'OTHER';
  acquisitionDate: string; // YYYY-MM-DD
  transferDate: string; // YYYY-MM-DD
}

export interface AmountInfo {
  transferValue: number;
  acquisitionValue: number;
  necessaryExpenses: number;
  previousTaxPaid?: number;
}

export interface ReliefInfo {
  reliefFlags: string[];
  creditFlags: string[];
}

export interface CapitalGainTransaction {
  returnMeta: ReturnMeta;
  taxpayer: Taxpayer;
  useProfile: UseProfile;
  assetInfo: AssetInfo;
  dealInfo: DealInfo;
  amountInfo: AmountInfo;
  reliefInfo: ReliefInfo;
}

export type CapitalGainTransactionDraft = {
  returnMeta: Partial<ReturnMeta>;
  taxpayer: Partial<Taxpayer>;
  useProfile: Partial<UseProfile>;
  assetInfo: Partial<AssetInfo>;
  dealInfo: Partial<DealInfo>;
  amountInfo: Partial<AmountInfo>;
  reliefInfo: Partial<ReliefInfo>;
};
