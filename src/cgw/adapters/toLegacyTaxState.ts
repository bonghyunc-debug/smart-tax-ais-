import { TaxState } from '../../../types';
import { INITIAL_STATE } from '../../hooks/useTaxState';
import { CapitalGainTransaction } from '../domain/CapitalGainTransaction';

const declarationTypeMap: Record<CapitalGainTransaction['returnMeta']['returnType'], TaxState['declarationType']> = {
  ON_TIME: 'regular',
  LATE: 'after_deadline',
  AMENDED: 'amended',
};

const assetTypeMap: Record<CapitalGainTransaction['assetInfo']['assetType'], string> = {
  HOUSE: '일반주택',
  HIGH_PRICE_HOUSE: '1세대1주택_고가주택',
  LAND: '토지',
};

export function toLegacyTaxState(tx: CapitalGainTransaction): TaxState {
  const base: TaxState = {
    ...INITIAL_STATE,
    transferorInfo: { ...INITIAL_STATE.transferorInfo },
    transfereeInfo: { ...INITIAL_STATE.transfereeInfo },
    acqPriceActual: { ...INITIAL_STATE.acqPriceActual },
    expenseActual: { ...INITIAL_STATE.expenseActual },
  };

  const isLand = tx.assetInfo.assetType === 'LAND';

  return {
    ...base,
    declarationType: declarationTypeMap[tx.returnMeta.returnType],
    transferorInfo: {
      ...base.transferorInfo,
      name: tx.taxpayer.name ?? base.transferorInfo.name,
      ssn: tx.taxpayer.ssn ?? base.transferorInfo.ssn,
      phone: tx.taxpayer.phone ?? base.transferorInfo.phone,
    },
    propertyAddress: tx.assetInfo.address ?? base.propertyAddress,
    assetType: assetTypeMap[tx.assetInfo.assetType] ?? base.assetType,
    landArea: tx.assetInfo.landArea !== undefined ? String(tx.assetInfo.landArea) : base.landArea,
    landUseType: isLand ? (tx.useProfile.isBusinessUse ? 'business' : 'non-business') : base.landUseType,
    yangdoDate: tx.dealInfo.transferDate || base.yangdoDate,
    acquisitionDate: tx.dealInfo.acquisitionDate || base.acquisitionDate,
    yangdoPrice: tx.amountInfo.transferValue ? String(tx.amountInfo.transferValue) : base.yangdoPrice,
    acqPriceActual: {
      ...base.acqPriceActual,
      maega: tx.amountInfo.acquisitionValue ? String(tx.amountInfo.acquisitionValue) : base.acqPriceActual.maega,
    },
    expenseActual: {
      ...base.expenseActual,
      other:
        tx.amountInfo.necessaryExpenses !== undefined
          ? String(tx.amountInfo.necessaryExpenses)
          : base.expenseActual.other,
    },
    priorTaxAmount:
      tx.amountInfo.previousTaxPaid !== undefined && tx.amountInfo.previousTaxPaid !== null
        ? String(tx.amountInfo.previousTaxPaid)
        : base.priorTaxAmount,
  };
}
