# TaxState ↔ CapitalGainTransaction 매핑 (초안)

새 위저드는 기존 `TaxState`를 그대로 활용하기 위해 어댑터 레이어를 둔다. 아래 표는 현재 스캐폴딩 단계에서 매핑한 주요 필드를 요약한다.

| CapitalGainTransaction | TaxState (legacy) | 메모 |
| --- | --- | --- |
| `returnMeta.returnType: ON_TIME` | `declarationType = 'regular'` | 신고 유형 변환 |
| `returnMeta.returnType: LATE` | `declarationType = 'after_deadline'` |  |
| `returnMeta.returnType: AMENDED` | `declarationType = 'amended'` |  |
| `taxpayer.name/ssn/phone` | `transferorInfo.{name, ssn, phone}` | 빈 값은 기본값 유지 |
| `assetInfo.address` | `propertyAddress` | 선택 입력 |
| `assetInfo.assetType = HOUSE` | `assetType = '일반주택'` | 기본값 |
| `assetInfo.assetType = HIGH_PRICE_HOUSE` | `assetType = '1세대1주택_고가주택'` | 비과세+고가주택 시나리오용 |
| `assetInfo.assetType = LAND` | `assetType = '토지'` |  |
| `assetInfo.landArea` | `landArea` | 숫자를 문자열로 변환 |
| `useProfile.isBusinessUse` | `landUseType` | 토지일 때 `business`/`non-business` |
| `dealInfo.transferDate` | `yangdoDate` |  |
| `dealInfo.acquisitionDate` | `acquisitionDate` |  |
| `amountInfo.transferValue` | `yangdoPrice` | 숫자→문자열 |
| `amountInfo.acquisitionValue` | `acqPriceActual.maega` | 숫자→문자열 |
| `amountInfo.necessaryExpenses` | `expenseActual.other` | 단순 이관 |
| `amountInfo.previousTaxPaid` | `priorTaxAmount` | 기납부세액 스텁 |

기타 필드는 `INITIAL_STATE` 값을 유지한다. 추가 정책(예: 장기보유, 증여사례, 비사업용 토지 판정)은 추후 룰 테이블과 함께 확장한다.
