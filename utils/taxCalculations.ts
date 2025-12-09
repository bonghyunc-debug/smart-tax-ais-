
import { TaxState, TaxResult } from '../types';
import { TAX_CONSTANTS } from '../src/constants/taxConstants';
import { getEffectiveAcquisitionDate } from '../src/utils/dateUtils';
import { calcConvertedAcquisitionValue } from '../src/utils/landConversion';

export const TAX_BRACKETS_2022 = [
  { upTo: 12_000_000, rate: 6, deduction: 0 },
  { upTo: 46_000_000, rate: 15, deduction: 1_080_000 },
  { upTo: 88_000_000, rate: 24, deduction: 5_220_000 },
  { upTo: 150_000_000, rate: 35, deduction: 14_900_000 },
  { upTo: 300_000_000, rate: 38, deduction: 19_400_000 },
  { upTo: 500_000_000, rate: 40, deduction: 25_400_000 },
  { upTo: 1_000_000_000, rate: 42, deduction: 35_400_000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 45, deduction: 65_400_000 }
];

export const TAX_BRACKETS_2023 = [
  { upTo: 14_000_000, rate: 6, deduction: 0 },
  { upTo: 50_000_000, rate: 15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 40, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 42, deduction: 35_940_000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 45, deduction: 65_940_000 }
];

export const TAX_LAW = {
  HIGH_PRICE_LIMIT: 1_200_000_000, // 2021.12.08 이후 양도분 12억원
  FARM_YEARLY_LIMIT: 100_000_000,
  BASIC_DEDUCTION: TAX_CONSTANTS.BASE_DEDUCTION,
  LATE_INTEREST_RATE: 0.00022, // 납부지연가산세 1일 0.022%
  PUBLIC_CASH_RATE_CHANGE_DATE: '2025-01-01',
  LAND_CONVERSION_PRE_1985_DEEMED_ACQ_DATE: TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1985,
  LAND_CONVERSION_GRADE_DATE: '1990-08-30'
};

const LTTD_GENERAL_TABLE = [
  { minYears: 3, maxYears: 3, rate: 0.06 },
  { minYears: 4, maxYears: 4, rate: 0.08 },
  { minYears: 5, maxYears: 5, rate: 0.10 },
  { minYears: 6, maxYears: 6, rate: 0.12 },
  { minYears: 7, maxYears: 7, rate: 0.14 },
  { minYears: 8, maxYears: 8, rate: 0.16 },
  { minYears: 9, maxYears: 9, rate: 0.18 },
  { minYears: 10, maxYears: 10, rate: 0.20 },
  { minYears: 11, maxYears: 11, rate: 0.22 },
  { minYears: 12, maxYears: 12, rate: 0.24 },
  { minYears: 13, maxYears: 13, rate: 0.26 },
  { minYears: 14, maxYears: 14, rate: 0.28 },
  { minYears: 15, maxYears: Number.POSITIVE_INFINITY, rate: 0.30 }
];

const LTTD_ONE_HOUSE_TABLE = [
  { minYears: 0, maxYears: 1, rate: 0 },
  { minYears: 2, maxYears: 2, rate: 0.08 },
  { minYears: 3, maxYears: 3, rate: 0.12 },
  { minYears: 4, maxYears: 4, rate: 0.16 },
  { minYears: 5, maxYears: 5, rate: 0.20 },
  { minYears: 6, maxYears: 6, rate: 0.24 },
  { minYears: 7, maxYears: 7, rate: 0.28 },
  { minYears: 8, maxYears: 8, rate: 0.32 },
  { minYears: 9, maxYears: 9, rate: 0.36 },
  { minYears: 10, maxYears: Number.POSITIVE_INFINITY, rate: 0.40 }
];

const getLTTDRateFromTable = (years: number, table: { minYears: number; maxYears: number; rate: number }[]) => {
  const entry = table.find((row) => years >= row.minYears && years <= row.maxYears);
  return entry ? entry.rate : 0;
};

// 무신고/과소신고/납부불성실 가산세율 (국세기본법 기준)
const PENALTY_RATE_UNFILED = 0.2;
const PENALTY_RATE_UNFILED_AGGR = 0.4;
const PENALTY_RATE_UNDERFILED = 0.1;
const PENALTY_RATE_UNDERFILED_AGGR = 0.4;
const DAILY_LATE_PAYMENT_RATE = 0.00022; // 1일 0.022%

type PenaltyInput = {
  incomeTaxBase: number;
  unpaidTax: number;
  isUnreported: boolean;
  isUnderReported: boolean;
  isFraud: boolean;
  dueDate: Date;
  paymentDate: Date;
  filingType: 'on_time' | 'late' | 'amended';
  filingDate?: Date | null;
};

type PenaltyResult = {
  unreportedPenalty: number;
  underReportedPenalty: number;
  latePaymentPenalty: number;
  totalPenaltyBeforeRelief: number;
  totalPenaltyAfterRelief: number;
  daysLate: number;
};

type InstallmentPlan = {
  canInstall: boolean;
  totalTax: number;
  firstPayment: number;
  secondPayment: number;
  secondDueDate: Date;
};

type NongTeukseInstallmentPlan = {
  canInstall: boolean;
  totalTax: number;
  firstPayment: number;
  secondPayment: number;
  secondDueDate: Date;
};

type ReliefType =
  | 'none'
  | 'self_farming_farmland'
  | 'farmland_exchange'
  | 'public_project_cash'
  | 'public_project_replacement';

// 양도소득세 법정 신고·납부기한 계산 시 고려할 국내 공휴일(고정일자 기반)
const FIXED_PUBLIC_HOLIDAYS = [
  '01-01', // 신정
  '03-01', // 삼일절
  '05-01', // 근로자의 날 (비공휴일이지만 관행적으로 납부기한 연장 반영)
  '05-05', // 어린이날
  '06-06', // 현충일
  '08-15', // 광복절
  '10-03', // 개천절
  '10-09', // 한글날
  '12-25'  // 성탄절
];

// 음력 기반 설/추석의 양력 일자를 연도별로 수동 반영 (주요 신고 연도 범위)
const LUNAR_HOLIDAY_MAP: Record<number, string[]> = {
  2023: ['2023-01-21', '2023-01-22', '2023-01-23', '2023-09-28', '2023-09-29', '2023-09-30'],
  2024: ['2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', '2024-09-16', '2024-09-17', '2024-09-18'],
  2025: ['2025-01-28', '2025-01-29', '2025-01-30', '2025-10-06', '2025-10-07', '2025-10-08']
};

const buildHolidaySet = (year: number, customHolidays: string[]) => {
    const set = new Set<string>();
    FIXED_PUBLIC_HOLIDAYS.forEach(md => set.add(`${year}-${md}`));
    (LUNAR_HOLIDAY_MAP[year] || []).forEach(d => set.add(d));
    customHolidays.forEach(d => set.add(d));
    return set;
};

// DO NOT MODIFY THIS TABLE - STRICTLY FIXED BY USER REQUEST
// 토지등급가액표 (등급 1 ~ 365) - 절대 수정 금지
export const LAND_GRADE_DB = [
  0, // Index 0 (Not used)
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  42, 44, 46, 48, 50, 52, 54, 56, 58, 60,
  63, 66, 69, 72, 75, 78, 81, 85, 89, 93,
  97, 101, 106, 111, 116, 121, 127, 133, 139, 145,
  152, 159, 166, 174, 182, 191, 200, 210, 220, 231,
  242, 254, 266, 279, 292, 306, 321, 337, 353, 370,
  388, 407, 427, 448, 470, 493, 517, 542, 569, 597,
  626, 657, 689, 723, 759, 796, 835, 876, 919, 964,
  1010, 1060, 1110, 1170, 1220, 1280, 1350, 1420, 1490, 1560,
  1640, 1720, 1810, 1900, 1990, 2090, 2190, 2300, 2420, 2540,
  2670, 2800, 2940, 3090, 3240, 3400, 3570, 3750, 3940, 4130,
  4340, 4560, 4790, 5020, 5280, 5540, 5820, 6110, 6410, 6730,
  7070, 7420, 7790, 8180, 8590, 9020, 9470, 9940, 10400, 10900,
  11500, 12000, 12600, 13300, 13900, 14600, 15400, 16100, 17000, 17800,
  18700, 19600, 20600, 21700, 22700, 23900, 25100, 26300, 27600, 29000,
  30500, 32000, 33600, 35300, 37100, 38900, 40900, 42900, 45100, 47300,
  49700, 52200, 54800, 57500, 60400, 63400, 66600, 69900, 73400, 77100,
  81000, 85000, 89300, 93700, 98400, 103000, 108000, 113000, 119000, 125000,
  131000, 138000, 145000, 152000, 160000, 168000, 176000, 185000, 194000, 204000,
  214000, 225000, 236000, 248000, 261000, 274000, 287000, 302000, 317000, 333000,
  350000, 367000, 385000, 405000, 425000, 446000, 469000, 492000, 517000, 543000,
  570000, 598000, 628000, 660000, 693000, 727000, 764000, 802000, 842000, 884000,
  928000, 975000, 1023000, 1075000, 1128000, 1185000, 1244000, 1306000, 1372000, 1440000,
  1512000, 1588000, 1667000, 1751000, 1838000, 1930000, 2027000, 2128000, 2235000, 2346000,
  2464000, 2587000, 2716000, 2852000, 2995000, 3145000, 3302000, 3467000, 3640000, 3822000,
  4014000, 4214000, 4425000, 4646000, 4879000, 5123000, 5379000, 5648000, 5930000, 6227000,
  6538000, 6865000, 7208000, 7569000, 7947000, 8345000, 8762000, 9200000, 9660000, 10143000,
  10650000, 11183000, 11742000, 12329000, 12945000, 13593000, 14272000, 14986000, 15735000, 16522000,
  17348000, 18216000, 19127000, 20083000, 21087000, 22141000, 23249000, 24411000, 25632000, 26913000,
  28259000, 29672000, 31155000, 32713000, 34349000, 36066000, 37870000, 39763000, 41751000, 43839000,
  46031000, 48883000, 50749000, 53287000, 55951000, 58749000, 61686000, 64771000, 68009000, 71410000,
  74980000, 78729000, 82666000, 86799000, 91139000, 95696000, 100481000, 105505000, 110781000, 116320000,
  121860000, 127400000, 132950000, 138000000, 144050000, 149600000, 155150000, 160000000, 166250000, 171800000,
  177350000, 182900000, 188450000, 194000000, 200000000
];

export const LAND_GRADE_TABLE = {
  get: (grade: any) => {
    const g = Math.round(Number(grade));
    if (isNaN(g) || g < 1) return 0;
    if (g >= LAND_GRADE_DB.length) return LAND_GRADE_DB[LAND_GRADE_DB.length - 1];
    return LAND_GRADE_DB[g];
  }
};

export const formatNumber = (num: any) => Number(num || 0).toLocaleString('ko-KR');

export const parseNumber = (str: any) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

export const isLandLike = (type: string) => ['토지', '자경/대토 농지'].includes(type);

// 매매/상속/증여/이월과세별 취득가액 계산을 분리하는 헬퍼
function getBaseAcquisitionAmountByOrigin(props: TaxState): number {
  const origin =
    props.acquisitionOrigin ??
    (props.acquisitionCause === 'gift_carryover'
      ? 'gift_rollover'
      : props.acquisitionCause === 'inheritance'
      ? 'inheritance'
      : props.acquisitionCause === 'gift'
      ? 'gift'
      : 'purchase');

  const actualTotal =
    parseNumber(props.acqPriceActual?.maega) +
    parseNumber(props.acqPriceActual?.acqTax) +
    parseNumber(props.acqPriceActual?.other) +
    parseNumber(props.acqPriceActual?.acqBrokerage);
  const officialTotal = parseNumber(props.officialPrice);
  const giftEval = parseNumber(props.giftValue);

  switch (origin) {
    case 'inheritance':
    case 'gift':
      if (giftEval > 0) return giftEval;
      if (officialTotal > 0) return officialTotal;
      return actualTotal;
    case 'gift_rollover':
      if (actualTotal > 0) return actualTotal;
      if (giftEval > 0) return giftEval;
      return officialTotal;
    case 'purchase':
    default:
      if (actualTotal > 0) return actualTotal;
      return officialTotal;
  }
}

// 토지 기준시가(전체 금액) 계산 헬퍼
// - 1990.8.30 이전 취득 토지는 기존 환산로직(LAND_GRADE_TABLE 등)을 그대로 사용한다.
// - 그 이후 취득 토지는 "공시지가(단가) × 면적"으로 기준시가를 계산한다.
function getLandStandardPriceTotal(
  props: TaxState,
  kind: 'acquisition' | 'transfer',
  convertedFromOldLogic?: number
): number | null {
  const isAcq = kind === 'acquisition';
  const unitPrice = isAcq ? props.acquisitionLandOfficialUnitPrice : props.transferLandOfficialUnitPrice;
  const area = isAcq ? props.acquisitionLandArea : props.transferLandArea;

  const acqDate = new Date(props.acquisitionDate);
  const referenceDate = new Date(TAX_LAW.LAND_CONVERSION_GRADE_DATE);

  if (acqDate < referenceDate) {
    if (typeof convertedFromOldLogic === 'number') {
      return convertedFromOldLogic;
    }
    return null;
  }

  if (unitPrice != null && area != null) {
    return unitPrice * area;
  }

  return null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const calcYearLengthFrom = (date: Date) => {
  const nextYear = new Date(date);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return Math.round((nextYear.getTime() - date.getTime()) / MS_PER_DAY);
};

export const calculatePeriod = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return { years: 0, days: 0, text: '0년 0일' };
  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { years: 0, days: 0, text: '날짜 오류' };

  let years = end.getFullYear() - start.getFullYear();
  const isBeforeBirthday =
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate());
  if (isBeforeBirthday) years--;

  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / MS_PER_DAY);

  const targetYears = Math.max(0, years);
  let remainingDays = diffDays;
  let computedYears = 0;
  let cursor = new Date(start);

  while (computedYears < targetYears) {
    const yearLength = calcYearLengthFrom(cursor);
    if (remainingDays < yearLength) break;
    remainingDays -= yearLength;
    cursor = new Date(cursor);
    cursor.setFullYear(cursor.getFullYear() + 1);
    computedYears++;
  }

  if (computedYears !== targetYears) {
    remainingDays = diffDays;
    computedYears = targetYears;
    cursor = new Date(start);
    for (let i = 0; i < computedYears; i++) {
      const yearLength = calcYearLengthFrom(cursor);
      remainingDays = Math.max(0, remainingDays - yearLength);
      cursor = new Date(cursor);
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
  }

  return { years: computedYears, days: remainingDays, text: `${computedYears}년 ${remainingDays}일` };
};

export const calculateDeadline = (yangdoDateStr: string, customHolidays: string[] = []) => {
  if (!yangdoDateStr) return '';
  const date = new Date(yangdoDateStr);
  if (isNaN(date.getTime())) return '';

  // 원칙: 양도일이 속하는 달의 말일부터 2개월 뒤 말일까지 신고·납부 (소득세법 §105, 국세기본법 §26의3)
  const targetMonth = date.getMonth() + 2;
  const year = date.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;
  const lastDay = new Date(year, month + 1, 0);

  let deadline = lastDay;
  while (true) {
    const holidays = buildHolidaySet(deadline.getFullYear(), customHolidays);
    const iso = deadline.toISOString().split('T')[0];
    const day = deadline.getDay();
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);

    if (isWeekend || isHoliday) {
      deadline.setDate(deadline.getDate() + 1);
    } else {
      break;
    }
  }
  return deadline.toISOString().split('T')[0];
};

function getMonthsDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const days = to.getDate() - from.getDate();
  const total = years * 12 + months + (days >= 0 ? 0 : -1);
  return total < 0 ? 0 : total;
}

function getAmendedReliefRate(monthsLate: number): number {
  if (monthsLate <= 1) return 0.9;
  if (monthsLate <= 3) return 0.75;
  if (monthsLate <= 6) return 0.5;
  if (monthsLate <= 12) return 0.3;
  if (monthsLate <= 18) return 0.2;
  if (monthsLate <= 24) return 0.1;
  return 0;
}

function getLateReturnReliefRate(monthsLate: number): number {
  if (monthsLate <= 1) return 0.5;
  if (monthsLate <= 3) return 0.3;
  if (monthsLate <= 6) return 0.2;
  return 0;
}

export function calculatePenaltyDetails(input: PenaltyInput): PenaltyResult {
  const unpaidTax = Math.max(0, input.unpaidTax);

  if (unpaidTax <= 0) {
    return {
      unreportedPenalty: 0,
      underReportedPenalty: 0,
      latePaymentPenalty: 0,
      totalPenaltyBeforeRelief: 0,
      totalPenaltyAfterRelief: 0,
      daysLate: 0
    };
  }

  const dueDate = input.dueDate;
  const paymentDate = input.paymentDate;
  const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

  const latePaymentPenalty = Math.floor(unpaidTax * daysLate * DAILY_LATE_PAYMENT_RATE);
  const unreportedPenalty = input.isUnreported
    ? Math.floor(unpaidTax * (input.isFraud ? PENALTY_RATE_UNFILED_AGGR : PENALTY_RATE_UNFILED))
    : 0;

  const underReportedBase = input.isUnderReported ? unpaidTax : 0;
  const underReportedPenalty = Math.floor(
    underReportedBase * (input.isFraud ? PENALTY_RATE_UNDERFILED_AGGR : PENALTY_RATE_UNDERFILED)
  );

  const totalPenaltyBeforeRelief = unreportedPenalty + underReportedPenalty + latePaymentPenalty;

  return {
    unreportedPenalty,
    underReportedPenalty,
    latePaymentPenalty,
    totalPenaltyBeforeRelief,
    totalPenaltyAfterRelief: totalPenaltyBeforeRelief,
    daysLate
  };
}

function applyPenaltyRelief(base: PenaltyResult, input: PenaltyInput): PenaltyResult {
  const filingDate = input.filingDate ?? input.paymentDate;
  const monthsLate = getMonthsDiff(input.dueDate, filingDate);

  let unreported = base.unreportedPenalty;
  let underReported = base.underReportedPenalty;

  if (input.filingType === 'amended' && underReported > 0) {
    const reliefRate = getAmendedReliefRate(monthsLate);
    underReported = underReported * (1 - reliefRate);
  }

  if (input.filingType === 'late' && unreported > 0) {
    const reliefRate = getLateReturnReliefRate(monthsLate);
    unreported = unreported * (1 - reliefRate);
  }

  const latePayment = base.latePaymentPenalty;

  const totalBefore = base.totalPenaltyBeforeRelief;
  const totalAfter = unreported + underReported + latePayment;

  return {
    ...base,
    unreportedPenalty: unreported,
    underReportedPenalty: underReported,
    totalPenaltyBeforeRelief: totalBefore,
    totalPenaltyAfterRelief: totalAfter
  };
}

function calculateIncomeTaxInstallment(totalTax: number, dueDate: Date): InstallmentPlan {
  if (totalTax <= 10_000_000) {
    return {
      canInstall: false,
      totalTax,
      firstPayment: totalTax,
      secondPayment: 0,
      secondDueDate: dueDate
    };
  }

  let secondPayment: number;
  if (totalTax <= 20_000_000) {
    secondPayment = totalTax - 10_000_000;
  } else {
    secondPayment = Math.floor(totalTax / 2);
  }

  const firstPayment = totalTax - secondPayment;
  const secondDueDate = new Date(dueDate);
  secondDueDate.setMonth(secondDueDate.getMonth() + 2);

  return {
    canInstall: true,
    totalTax,
    firstPayment,
    secondPayment,
    secondDueDate
  };
}

function calculateNongTeukseInstallment(
  nongTax: number,
  incomeInstall: InstallmentPlan | null,
  baseDueDate: Date
): NongTeukseInstallmentPlan {
  if (nongTax <= 0) {
    return {
      canInstall: false,
      totalTax: 0,
      firstPayment: 0,
      secondPayment: 0,
      secondDueDate: baseDueDate
    };
  }

  if (incomeInstall && incomeInstall.canInstall) {
    const ratio = incomeInstall.secondPayment / incomeInstall.totalTax;
    const secondPayment = Math.round(nongTax * ratio);
    const firstPayment = nongTax - secondPayment;

    return {
      canInstall: secondPayment > 0,
      totalTax: nongTax,
      firstPayment,
      secondPayment,
      secondDueDate: incomeInstall.secondDueDate
    };
  }

  if (nongTax <= 5_000_000) {
    return {
      canInstall: false,
      totalTax: nongTax,
      firstPayment: nongTax,
      secondPayment: 0,
      secondDueDate: baseDueDate
    };
  }

  let secondPayment: number;
  if (nongTax <= 10_000_000) {
    secondPayment = nongTax - 5_000_000;
  } else {
    secondPayment = Math.floor(nongTax / 2);
  }

  const firstPayment = nongTax - secondPayment;
  const secondDueDate = new Date(baseDueDate);
  secondDueDate.setMonth(secondDueDate.getMonth() + 2);

  return {
    canInstall: true,
    totalTax: nongTax,
    firstPayment,
    secondPayment,
    secondDueDate
  };
}

export function calculateAcquisitionPrice(props: TaxState, burdenRatio = 1) {
    const yangdo = parseNumber(props.yangdoPrice);
    const acqUnit = parseNumber(props.officialPrice);
    const landArea = parseNumber(props.landArea);
    const safeBurdenRatio = Math.min(1, Math.max(0, Number.isFinite(burdenRatio) ? burdenRatio : 0));
    const baseAcquisitionAmount = getBaseAcquisitionAmountByOrigin(props);
    const isLand = isLandLike(props.assetType);

    let basePriceForExpense = baseAcquisitionAmount;

    let convertedLandStandard: number | null = null;
    let convertedDesc = '';

    const transferUnit = parseNumber(props.transferOfficialPrice);

    if (isLand && props.isPre1990) {
        const p90_1_1_unit = parseNumber(props.price1990Jan1);
        const v_acq_input = parseNumber(props.gradeAcq);
        const v_90_val = parseNumber(props.grade1990Aug30);
        const v_prev = parseNumber(props.gradePrev1990Aug30);

        const acqDateObj = new Date(props.acquisitionDate);
        const date85 = new Date(TAX_CONSTANTS.OLD_ASSET_CONVERSION.PRE_1985);
        const isBefore85 = acqDateObj < date85;

        if (p90_1_1_unit > 0 && v_acq_input > 0 && v_90_val > 0 && v_prev > 0) {
            const val_90 = LAND_GRADE_TABLE.get(v_90_val);
            const val_prev = LAND_GRADE_TABLE.get(v_prev);
            const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
            const convertedUnit = calcConvertedAcquisitionValue({
                acqGrade: val_acq,
                grade1990Aug30: val_90,
                gradePrev1990Aug30: val_prev,
                basePrice1990Jan1: p90_1_1_unit,
            });

            if (convertedUnit > 0) {
                convertedLandStandard = Math.floor(convertedUnit * landArea);
                convertedDesc = '1990년 토지 등급가액과 개별공시지가를 반영한 환산취득가액';
                if (isBefore85) {
                    convertedDesc += '(85.1.1 의제등급 반영)';
                }
            }
        }
    }

    const landStandardPrice = isLand
        ? getLandStandardPriceTotal(props, 'acquisition', convertedLandStandard === null ? undefined : convertedLandStandard)
        : null;
    const landTransferStandard = isLand ? getLandStandardPriceTotal(props, 'transfer') : null;

    const officialAcqTotal = isLand ? landStandardPrice ?? acqUnit : acqUnit;
    const officialTransferTotal = isLand ? landTransferStandard ?? transferUnit : transferUnit;

    if (props.acqPriceMethod === 'actual') {
        const basePrice = baseAcquisitionAmount > 0 ? baseAcquisitionAmount : basePriceForExpense;
        const p = Math.floor(basePrice * safeBurdenRatio);
        return { price: p, basePriceForExpense: basePrice, methodDesc: '실지취득가액' };
    }

    if (props.acqPriceMethod === 'official') {
        const priceBase = officialAcqTotal > 0 ? officialAcqTotal : baseAcquisitionAmount;
        const price = Math.floor(priceBase * safeBurdenRatio);

        let methodDesc = '취득 시 기준시가(전체금액) 입력값 사용';
        if (isLand) {
            if (convertedLandStandard != null && props.isPre1990) {
                methodDesc = convertedDesc || '1990년 토지 등급가액과 개별공시지가를 반영한 환산취득가액';
            } else if (landStandardPrice != null && props.acquisitionLandOfficialUnitPrice != null && props.acquisitionLandArea != null) {
                methodDesc = `토지 기준시가 = 공시지가(단가) × 면적 (공시지가: ${formatNumber(props.acquisitionLandOfficialUnitPrice)}, 면적: ${formatNumber(props.acquisitionLandArea)}, 기준시가: ${formatNumber(landStandardPrice)})`;
            }
        }

        return { price, basePriceForExpense: priceBase, methodDesc };
    }

    let convertedBase = officialAcqTotal > 0 ? officialAcqTotal : baseAcquisitionAmount;
    let convertedPriceDesc = '환산취득가액(기준시가비율)';

    let rawPrice = 0;

    if (isLand && props.isPre1990 && convertedLandStandard != null) {
        convertedBase = convertedLandStandard;
        convertedPriceDesc = convertedDesc || convertedPriceDesc;
        rawPrice = officialTransferTotal > 0 ? Math.floor(yangdo * (convertedLandStandard / officialTransferTotal)) : 0;
    } else {
        if (isLand && landStandardPrice != null && landTransferStandard != null && props.acquisitionLandOfficialUnitPrice != null && props.acquisitionLandArea != null) {
            convertedPriceDesc = `토지 기준시가 = 공시지가(단가) × 면적 (공시지가: ${formatNumber(props.acquisitionLandOfficialUnitPrice)}, 면적: ${formatNumber(props.acquisitionLandArea)}, 기준시가: ${formatNumber(landStandardPrice)})`;
        } else if (isLand) {
            convertedPriceDesc = '취득 시 기준시가(전체금액) 입력값 사용';
        }

        rawPrice = officialTransferTotal > 0 && convertedBase > 0 ? Math.floor(yangdo * (convertedBase / officialTransferTotal)) : 0;
    }

    const price = Math.floor(rawPrice * safeBurdenRatio);
    return { price, basePriceForExpense: convertedBase, methodDesc: convertedPriceDesc };
}

export function calculateLongTermDeduction(gain: number, years: number, props: TaxState) {
    if (props.assetType === '미등기' || props.assetType === '분양권' || years < 3) return { amount: 0, rate: 0, desc: '공제대상 아님' };

    if (props.assetType === '1세대1주택_고가주택') {
        const rawResYears = parseNumber(props.residenceYears);
        const resFullYears = Math.floor(rawResYears);

        const isResidenceSatisfied = resFullYears >= 2 || props.useResidenceSpecial;

        if (isResidenceSatisfied) {
            const holdRate = getLTTDRateFromTable(years, LTTD_ONE_HOUSE_TABLE);
            const resRate = getLTTDRateFromTable(resFullYears, LTTD_ONE_HOUSE_TABLE);
            const totalRate = Math.min(0.8, holdRate + resRate);

            return {
                amount: Math.floor(gain * totalRate),
                rate: totalRate,
                desc: `표2 (보유${(holdRate*100).toFixed(0)}%+거주${(resRate*100).toFixed(0)}%)`
            };
        } else {
            const rate = getLTTDRateFromTable(years, LTTD_GENERAL_TABLE);
            return { amount: Math.floor(gain * rate), rate, desc: '표1 (거주 2년 미만)' };
        }
    }

    const rate = getLTTDRateFromTable(years, LTTD_GENERAL_TABLE);
    return { amount: Math.floor(gain * rate), rate, desc: `일반 공제(${(rate*100).toFixed(0)}%)` };
}

// 순수 누진세율 계산기 (과세표준 -> 세액)
function calculateGeneralTaxOnly(base: number, dateStr: string) {
    if (base <= 0) return 0;
    const brackets = (dateStr >= '2023-01-01') ? TAX_BRACKETS_2023 : TAX_BRACKETS_2022;
    const bracket = brackets.find(b => base <= b.upTo) || brackets[brackets.length - 1];
    return Math.floor(base * (bracket.rate / 100) - bracket.deduction);
}

const isHeavyTaxedCase = (props: TaxState, years: number) => {
    const isBisato = isLandLike(props.assetType) && props.landUseType === 'non-business' && !props.isBisatoException;
    if (props.assetType === '미등기') return true;
    if (isBisato) return true;

    if (props.assetType === '분양권') {
        if (years < 1) return true;
    }

    return false;
};

export function calculateTaxRate(base: number, years: number, props: TaxState) {
    const yangdoDateStr = props.yangdoDate || new Date().toISOString().split('T')[0];
    const brackets = (yangdoDateStr >= '2023-01-01') ? TAX_BRACKETS_2023 : TAX_BRACKETS_2022;
    const baseHeavyFlag = isHeavyTaxedCase(props, years);

    // 1. 미등기 (70%) - 비교과세 불필요 (가장 높음)
    if (props.assetType === '미등기') return { tax: Math.floor(base * 0.70), rate: 70, desc: '미등기 70%', isHeavyTaxed: true };

    // 2. 기본 세액 계산 (General Tax)
    const bracket = brackets.find(b => base <= b.upTo) || brackets[brackets.length - 1];
    const basicTax = Math.floor(base * (bracket.rate / 100) - bracket.deduction);
    const basicDesc = `기본세율 (${bracket.rate}%)`;

    // 3. 비사업용 토지 중과세액 (Bisato Tax)
    const isBisato = isLandLike(props.assetType) && props.landUseType === 'non-business' && !props.isBisatoException;
    let bisatoTax = 0;
    let bisatoDesc = '';

    if (isBisato) {
        const bisatoRate = bracket.rate + 10;
        bisatoTax = Math.floor(base * (bisatoRate / 100) - bracket.deduction);
        bisatoDesc = `기본(${bracket.rate}%)+10%중과`;
    }

    // 4. 단기 양도 세액 (Short-term Tax)
    let shortTermTax = 0;
    let shortTermRate = 0;
    let shortTermDesc = '';

    if (props.assetType === '분양권') {
        if (years < 1) { shortTermRate = 70; shortTermDesc = '분양권 1년미만 70%'; }
        else { shortTermRate = 60; shortTermDesc = '분양권 60%'; }
    } 
    else if (props.assetType === '일반주택') {
        if (years < 1) { shortTermRate = 70; shortTermDesc = '주택 1년미만 70%'; }
        else if (years < 2) { shortTermRate = 60; shortTermDesc = '주택 2년미만 60%'; }
    }
    else if (props.assetType === '1세대1주택_고가주택') {
        shortTermRate = 0; 
        shortTermDesc = '1세대1주택(기본세율 적용)';
    }
    else {
        // 토지, 상가 등 일반 자산
        if (years < 1) { shortTermRate = 50; shortTermDesc = '1년미만 50%'; }
        else if (years < 2) { shortTermRate = 40; shortTermDesc = '2년미만 40%'; }
    }

    if (shortTermRate > 0) {
        shortTermTax = Math.floor(base * (shortTermRate / 100));
    }

    // 5. 비교 과세 (Comparative Taxation) - MAX 적용
    
    // Case A: 비사업용 토지
    if (isBisato) {
        // 비교 대상: [기본+10%] vs [단기세율(50% or 40%)]
        // 단, 2년 이상 보유시 단기세율은 0이므로 자연스럽게 [기본+10%]가 선택됨
        if (shortTermTax > bisatoTax) {
            return { tax: shortTermTax, rate: shortTermRate, desc: `${shortTermDesc} (비사업용 중과보다 큼)`, isHeavyTaxed: true };
        } else {
            return { tax: bisatoTax, rate: bracket.rate + 10, desc: `${bisatoDesc} (비교과세 적용)`, isHeavyTaxed: true };
        }
    }

    // Case B: 일반 자산 (토지, 상가, 주택 등)
    if (shortTermTax > 0) {
        // 비교 대상: [기본세율] vs [단기세율]
        if (shortTermTax > basicTax) {
            return { tax: shortTermTax, rate: shortTermRate, desc: shortTermDesc, isHeavyTaxed: baseHeavyFlag };
        } else {
            return { tax: basicTax, rate: bracket.rate, desc: `${basicDesc} (단기세율보다 큼)`, isHeavyTaxed: baseHeavyFlag };
        }
    }

    // Case C: 그 외 (2년 이상 일반 자산)
    return { tax: basicTax, rate: bracket.rate, desc: basicDesc, isHeavyTaxed: baseHeavyFlag };
}

const resolveReliefType = (props: TaxState): ReliefType => {
    switch (props.taxExemptionType) {
        case 'farm_8y':
            return 'self_farming_farmland';
        case 'farmland_exchange':
            return 'farmland_exchange';
        case 'public_cash_standard':
            return 'public_project_cash';
        case 'public_project_replacement':
        case 'public_replacement':
            return 'public_project_replacement';
        default:
            return 'none';
    }
};

export function calculateExemptionLogic(tax: number, props: TaxState) {
    let amount = 0;
    let desc = '';
    let nongteukse = 0;
    // 1세대1주택 여부는 주택 수, 조정대상지역 여부 등 세법상 요건을 이 코드에서 검증하지 않고
    // 사용자가 입력/선택한 값(props.assetType 등)을 그대로 신뢰한다는 전제하에 계산만 수행한다.

    const reliefType = resolveReliefType(props);
    const isCustomRate = props.taxExemptionType === 'custom';

    if (isCustomRate) {
        const r = parseNumber(props.customRate);
        amount = Math.floor(tax * (r / 100));
        desc = `직접입력 감면 (${r}%)`;
        if (!props.isNongteukseExempt) nongteukse = Math.floor(amount * 0.20);
        return { amount, desc, nongteukse };
    }

    switch (reliefType) {
        case 'self_farming_farmland':
            amount = Math.min(tax, TAX_LAW.FARM_YEARLY_LIMIT);
            desc = '8년 자경농지 감면';
            break;
        case 'farmland_exchange':
            amount = Math.min(tax, TAX_LAW.FARM_YEARLY_LIMIT);
            desc = '농지대토 감면';
            break;
        case 'public_project_cash': {
            const yangdoDate = props.yangdoDate || '1900-01-01';
            const isPost2025 = yangdoDate >= TAX_LAW.PUBLIC_CASH_RATE_CHANGE_DATE;
            const rate = isPost2025 ? 0.15 : 0.10;
            // 공익사업 수용(현금 보상) 감면율: 2024.12.31.까지 10%, 2025.01.01. 이후 15% (소득세법 §104의3 및 부칙)
            amount = Math.floor(tax * rate);
            desc = `공익사업 수용(현금) (${rate*100}%)`;
            if (!props.isNongteukseExempt) nongteukse = Math.floor(amount * 0.20);
            break;
        }
        case 'public_project_replacement': {
            const yangdoDate = props.yangdoDate || '1900-01-01';
            const isPost2025 = yangdoDate >= TAX_LAW.PUBLIC_CASH_RATE_CHANGE_DATE;
            const rate = isPost2025 ? 0.15 : 0.10;
            amount = Math.floor(tax * rate);
            desc = `공익사업 수용(대토) (${rate*100}%)`;
            if (!props.isNongteukseExempt) nongteukse = Math.floor(amount * 0.20);
            break;
        }
        case 'none':
        default:
            break;
    }

    return { amount, desc, nongteukse };
}

// 세율·장특공·1세대1주택 판정에 사용할 보유기간 기산일을
// 취득원인별로 분리해서 반환하는 헬퍼
function getEffectiveAcquisitionDates(props: TaxState, transferDate: Date) {
  const acqDate = new Date(props.acquisitionDate);
  const origin = props.acquisitionOrigin ?? (props.acquisitionCause === 'gift_carryover' ? 'gift_rollover' : props.acquisitionCause === 'inheritance' ? 'inheritance' : props.acquisitionCause === 'gift' ? 'gift' : 'purchase');

  // 기본값: 일반 매매
  let forRate = acqDate;
  let forLTTD = acqDate;
  let forOneHouseHold = acqDate;
  let forOneHouseRes = acqDate;

  switch (origin) {
    case 'inheritance': {
      // TODO: 상속 개시일, 피상속인 취득일 필드가 프로젝트에 존재한다면
      //       여기에서 사용하고, 없다면 우선 acqDate를 그대로 사용한다.
      //       (이후 단계에서 상속 관련 추가 필드를 도입하여 보완)
      // 세율(단기/장기, 중과 등) 보유기간: 피상속인 취득일부터 기산 예정
      // 장특공: 상속개시일부터 기산 예정
      // 1세대1주택: 동일세대 여부에 따라 통산 예정
      if (props.origAcquisitionDate) {
        forRate = new Date(props.origAcquisitionDate);
        forOneHouseHold = new Date(props.origAcquisitionDate);
        forOneHouseRes = new Date(props.origAcquisitionDate);
      }
      break;
    }
    case 'gift':
      // 일반 증여는 현재는 증여일(acqDate) 기준으로 모두 동일 처리
      break;
    case 'gift_rollover':
      if (props.origAcquisitionDate) {
        forRate = new Date(props.origAcquisitionDate);
        forLTTD = new Date(props.origAcquisitionDate);
        forOneHouseHold = new Date(props.origAcquisitionDate);
        forOneHouseRes = new Date(props.origAcquisitionDate);
      }
      // TODO: 이월과세의 경우, 증여자 취득일부터 기산할 수 있도록
      //       이후 단계에서 donor 취득일 필드를 도입하여 보완한다.
      break;
    case 'purchase':
    default:
      break;
  }

  return {
    forRate,
    forLTTD,
    forOneHouseHold,
    forOneHouseRes,
  };
}

export function calculateTax(props: TaxState): TaxResult {
  const applyDeemedDate = (dateStr?: string) => {
      if (!dateStr) return dateStr;
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return getEffectiveAcquisitionDate(parsed).toISOString().split('T')[0];
  };

  const toDateString = (date: Date) => {
      if (!date || isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
  };

  const transferDate = props.yangdoDate ? new Date(props.yangdoDate) : new Date(NaN);
  const { forRate, forLTTD, forOneHouseHold, forOneHouseRes } = getEffectiveAcquisitionDates(props, transferDate);

  const holdingForRate = calculatePeriod(applyDeemedDate(toDateString(forRate)) || '', props.yangdoDate);

  const holdingForDed = calculatePeriod(applyDeemedDate(toDateString(forLTTD)) || '', props.yangdoDate);

  const shouldExcludeLTTD = isHeavyTaxedCase(props, holdingForRate.years);

  // Burden Gift Logic
  const isBurdenGift = props.yangdoCause === 'burden_gift';
  const giftValue = parseNumber(props.giftValue);
  const debtAmount = parseNumber(props.debtAmount);
  
  let burdenRatio = 1;
  if (isBurdenGift && giftValue > 0) {
      burdenRatio = Math.min(1, debtAmount / giftValue);
  }

  const acqData = calculateAcquisitionPrice(props, burdenRatio);
  const autoDeduction = Math.floor(acqData.basePriceForExpense * 0.03 * burdenRatio);
  
  let expense = 0;
  let expenseDesc = '';
  let appliedAcqPrice = acqData.price;
  let appliedAcqMethodDesc = acqData.methodDesc;

  const giftTaxPaid = parseNumber(props.giftTaxPaid);
  const isGiftAcquisition = ['gift', 'gift_carryover'].includes(props.acquisitionCause);
  
  const actualExpenseSum = parseNumber(props.expenseActual.repair) + 
                           parseNumber(props.expenseActual.sellBrokerage) + 
                           parseNumber(props.expenseActual.other);

  if (props.acqPriceMethod === 'converted') {
      if (props.useActualExpenseWithConverted) {
          expense = Math.floor(actualExpenseSum * burdenRatio);
          expenseDesc = '실제 필요경비 (취득가액 대체)';
          appliedAcqPrice = 0;
          appliedAcqMethodDesc = '적용 배제 (실비 대체)';
      } else {
          expense = autoDeduction;
          expenseDesc = '개산공제 (취득당시 기준시가의 3%)';
      }
  } else if (props.acqPriceMethod === 'official') {
      expense = autoDeduction;
      expenseDesc = '개산공제 (취득당시 기준시가의 3%)';
      appliedAcqPrice = acqData.price;
      appliedAcqMethodDesc = '기준시가';
  } else {
      expense = Math.floor(actualExpenseSum * burdenRatio);
      expenseDesc = '실제 필요경비';
      appliedAcqPrice = acqData.price;
  }

  if (isGiftAcquisition && giftTaxPaid > 0) {
      // 소득세법 시행령 제97조 제1항 제2호: 증여재산의 가액 산정 시 납부한 증여세를 필요경비로 가산
      expense += giftTaxPaid;
      expenseDesc += `${expenseDesc ? '; ' : ''}증여세 납부액 가산`;
  }

  if (isBurdenGift) {
      expenseDesc += ` (안분율 ${(burdenRatio * 100).toFixed(2)}% 적용)`;
      appliedAcqMethodDesc += ` (안분율 ${(burdenRatio * 100).toFixed(2)}% 적용)`;
  }

  const yangdoPrice = parseNumber(props.yangdoPrice);
  const rawGain = Math.max(0, yangdoPrice - appliedAcqPrice - expense);

  let taxableGain = rawGain;
  let taxExemptGain = 0;
  let highPriceLimit = TAX_LAW.HIGH_PRICE_LIMIT;

  if (props.assetType === '1세대1주택_고가주택') {
      // 고가주택 비과세 계산 (12억원 이하 안분): 양도가액 대비 비과세 한도(12억)의 비율만큼 양도차익을 안분하여 비과세
      // 소득세법 §89 제1항 제3호 가목: 실제 양도가액(시가)을 기준으로 12억원 초과분만 과세
      // 부담부증여라고 하더라도 과세대상 gain 안분은 실제 양도가액(채무인수 포함) 기준으로 계산
      const transferAmount = Math.max(0, yangdoPrice);

      if (transferAmount > 0) {
          const nonTaxableRatio = Math.min(1, highPriceLimit / transferAmount);
          const nonTaxableGain = Math.floor(rawGain * nonTaxableRatio);
          taxExemptGain = nonTaxableGain;
          taxableGain = Math.max(0, rawGain - nonTaxableGain);
      }
  }

  const longTerm = shouldExcludeLTTD
    ? { amount: 0, rate: 0, desc: '중과 대상 장특공 배제' }
    : calculateLongTermDeduction(taxableGain, holdingForDed.years, props);
  const currentIncomeAmount = taxableGain - longTerm.amount; // 금회 양도소득금액
  
  // ----------------------------------------------------------------
  // Aggregation Logic (합산 과세)
  // ----------------------------------------------------------------
  const priorIncomeAmount = parseNumber(props.priorIncomeAmount); // 기신고 양도소득금액 (과세표준 아님)
  const priorTaxAmount = parseNumber(props.priorTaxAmount);       // 기신고 결정세액 (기납부세액)
  const isAggregationApplied = props.hasPriorDeclaration;

  let totalIncomeAmount = currentIncomeAmount;
  let basicDed = TAX_LAW.BASIC_DEDUCTION;

  // Basic Deduction Logic
  if (props.assetType === '미등기') {
      basicDed = 0;
  } else {
      if (isAggregationApplied) {
           // 합산신고 시에는 연간 250만원 공제 고정
           basicDed = 2500000;
           totalIncomeAmount += priorIncomeAmount;
      } else if (props.useCustomBasicDeduction) {
          const customVal = parseNumber(props.basicDeductionInput);
          basicDed = Math.min(customVal, TAX_LAW.BASIC_DEDUCTION);
      }
  }

  const taxBase = Math.max(0, totalIncomeAmount - basicDed);
  
  const singleAssetResult = calculateTaxRate(taxBase, holdingForRate.years, props);

  let finalTaxAmount = 0;
  let finalRate = singleAssetResult.rate;
  let finalDesc = singleAssetResult.desc;

  if (isAggregationApplied) {
      const yangdoDateStr = props.yangdoDate || new Date().toISOString().split('T')[0];
      
      // A. 합산 과세표준에 대한 기본 누진세액 (Total Calculated Tax)
      // 기납부세액은 감면 및 가산세 적용 후 마지막에 차감해야 하므로 여기서는 순수 산출세액만 구함
      finalTaxAmount = calculateGeneralTaxOnly(taxBase, yangdoDateStr);
      finalRate = 0; // 누진세율
      finalDesc = `합산누진세율 적용 (합산 과세표준 기준)`;

  } else {
      finalTaxAmount = singleAssetResult.tax;
  }

  const taxResult = { tax: finalTaxAmount, rate: finalRate, desc: finalDesc, isHeavyTaxed: singleAssetResult.isHeavyTaxed };
  // ----------------------------------------------------------------

  // 감면 세액 계산 (합산신고 시에도 산출세액에서 감면 공제)
  const exemption = calculateExemptionLogic(taxResult.tax, props);
  const decidedTax = Math.max(0, taxResult.tax - exemption.amount);

  const deadline = calculateDeadline(props.yangdoDate);
  const deadlineDate = deadline ? new Date(deadline) : new Date();

  const safeDate = (value: string | null | undefined, fallback: Date) => {
    if (!value) return fallback;
    const d = new Date(value);
    return isNaN(d.getTime()) ? fallback : d;
  };

  const mapFilingType = (type: string): 'on_time' | 'late' | 'amended' => {
    if (type === 'after_deadline') return 'late';
    if (type === 'amended') return 'amended';
    return 'on_time';
  };

  // Construction Penalty Auto-Calculation
  // Logic: 건축물 신축 후 5년 이내 환산가액 사용 시 가산세(취득가액의 5%) 부과
  // 근거: 소득세법 시행령 제162조 제6항(건축물 신축 후 5년 이내 환산가액 사용 제한) 해석 기준 예시
  let constructionPenalty = 0;
  const isBuilding = ['일반주택', '1세대1주택_고가주택', '상가/건물'].includes(props.assetType);
  const isConstruction = props.acquisitionCause === 'construction';
  const isConverted = props.acqPriceMethod === 'converted';

  // 정확한 날짜 계산을 통한 5년 이내 여부 판정 (단순 연도 뺄셈인 holdingForRate.years < 5 대체)
  let isUnder5Years = false;
  if (props.acquisitionDate && props.yangdoDate) {
      const acqD = new Date(props.acquisitionDate);
      const yangdoD = new Date(props.yangdoDate);
      const limitD = new Date(acqD);
      limitD.setFullYear(limitD.getFullYear() + 5);

      // 양도일이 5년 되는 날 이전까지만 가산세 대상 (소득세법 시행령 제162조제6항 해석)
      isUnder5Years = yangdoD < limitD;
  }

  if (isBuilding && isConstruction && isConverted && isUnder5Years) {
      constructionPenalty = Math.floor(acqData.price * 0.05);
  }

  const initialIncomeTax = parseNumber(props.initialIncomeTax);
  const initialNongteukse = parseNumber(props.initialNongteukse);
  const additionalIncomeTaxBase = decidedTax + constructionPenalty - initialIncomeTax;
  const additionalNongBase = exemption.nongteukse - initialNongteukse;

  const filingType = mapFilingType(props.declarationType);
  const paymentDate = safeDate(props.paymentDate, deadlineDate);
  const filingDate = safeDate(props.reportDate, paymentDate);
  const isUnreported = filingType === 'late';
  const isUnderReportedIncome = filingType === 'amended' || (!isUnreported && additionalIncomeTaxBase > 0);
  const isUnderReportedNong = filingType === 'amended' || (!isUnreported && additionalNongBase > 0);

  const incomePenaltyBase = calculatePenaltyDetails({
    incomeTaxBase: decidedTax + constructionPenalty,
    unpaidTax: Math.max(0, additionalIncomeTaxBase),
    isUnreported,
    isUnderReported: isUnderReportedIncome,
    isFraud: false,
    dueDate: deadlineDate,
    paymentDate,
    filingType,
    filingDate
  });

  const incomePenaltyCalc = applyPenaltyRelief(incomePenaltyBase, {
    incomeTaxBase: decidedTax + constructionPenalty,
    unpaidTax: Math.max(0, additionalIncomeTaxBase),
    isUnreported,
    isUnderReported: isUnderReportedIncome,
    isFraud: false,
    dueDate: deadlineDate,
    paymentDate,
    filingType,
    filingDate
  });

  const nongPenaltyBase = calculatePenaltyDetails({
    incomeTaxBase: exemption.nongteukse,
    unpaidTax: Math.max(0, additionalNongBase),
    isUnreported,
    isUnderReported: isUnderReportedNong,
    isFraud: false,
    dueDate: deadlineDate,
    paymentDate,
    filingType,
    filingDate
  });

  const nongPenaltyCalc = applyPenaltyRelief(nongPenaltyBase, {
    incomeTaxBase: exemption.nongteukse,
    unpaidTax: Math.max(0, additionalNongBase),
    isUnreported,
    isUnderReported: isUnderReportedNong,
    isFraud: false,
    dueDate: deadlineDate,
    paymentDate,
    filingType,
    filingDate
  });

  const buildPenaltyDesc = (calc: PenaltyResult, filing: 'on_time' | 'late' | 'amended') => {
    const parts: string[] = [];
    if (calc.unreportedPenalty + calc.underReportedPenalty > 0) {
      parts.push(filing === 'late' ? '무신고 가산세' : '신고불성실 가산세');
    }
    if (calc.daysLate > 0) {
      parts.push(`납부지연 ${calc.daysLate}일 × 0.022%`);
    }
    if (calc.totalPenaltyAfterRelief < calc.totalPenaltyBeforeRelief) {
      parts.push('감면 적용');
    }
    return parts.length ? parts.join(', ') : '가산세 없음';
  };

  const incomePenalty = {
    total: Math.floor(incomePenaltyCalc.totalPenaltyAfterRelief),
    report: Math.floor(incomePenaltyCalc.unreportedPenalty + incomePenaltyCalc.underReportedPenalty),
    delay: Math.floor(incomePenaltyCalc.latePaymentPenalty),
    desc: buildPenaltyDesc(incomePenaltyCalc, filingType),
    delayDays: incomePenaltyCalc.daysLate,
    reportDesc: '',
    delayDesc: incomePenaltyCalc.daysLate > 0 ? `납부지연 ${incomePenaltyCalc.daysLate}일 × 0.022%` : ''
  };

  const nongPenalty = {
    total: Math.floor(nongPenaltyCalc.totalPenaltyAfterRelief),
    report: Math.floor(nongPenaltyCalc.unreportedPenalty + nongPenaltyCalc.underReportedPenalty),
    delay: Math.floor(nongPenaltyCalc.latePaymentPenalty),
    desc: buildPenaltyDesc(nongPenaltyCalc, filingType),
    delayDays: nongPenaltyCalc.daysLate,
    reportDesc: '',
    delayDesc: nongPenaltyCalc.daysLate > 0 ? `납부지연 ${nongPenaltyCalc.daysLate}일 × 0.022%` : ''
  };

  const totalNongteukse = Math.max(0, additionalNongBase) + nongPenaltyCalc.totalPenaltyAfterRelief;

  // 합산신고 시: [ (산출세액 - 감면) + 가산세 ] - 기신고납부세액
  let totalIncomeTaxBeforePrior = Math.max(0, additionalIncomeTaxBase) + incomePenaltyCalc.totalPenaltyAfterRelief;

  let totalIncomeTax = totalIncomeTaxBeforePrior;
  if (isAggregationApplied) {
      // 기신고 결정세액 차감
      totalIncomeTax = Math.max(0, totalIncomeTaxBeforePrior - priorTaxAmount);
  }

  const incomeInstallment = calculateIncomeTaxInstallment(totalIncomeTax, deadlineDate);
  const installmentValue = incomeInstallment.canInstall ? incomeInstallment.secondPayment : 0;
  const immediateIncomeTax = incomeInstallment.firstPayment;

  const nongInstallment = calculateNongTeukseInstallment(totalNongteukse, incomeInstallment, deadlineDate);
  const nongInstallmentValue = nongInstallment.canInstall ? nongInstallment.secondPayment : 0;
  const immediateNongteukse = nongInstallment.firstPayment;

  const totalImmediateBill = immediateIncomeTax + immediateNongteukse;
  const localIncomeTax = Math.floor(totalIncomeTax * 0.1);
  const installmentMax = incomeInstallment.canInstall ? incomeInstallment.secondPayment : 0;
  const nongInstallmentMax = nongInstallment.canInstall ? nongInstallment.secondPayment : 0;

  return {
    acqPrice: appliedAcqPrice,
    acqMethodUsed: appliedAcqMethodDesc,
    expense, expenseDesc,
    rawGain, taxableGain, taxExemptGain,
    longTerm, 
    
    // Income Amount Details
    currentIncomeAmount,
    priorIncomeAmount,
    totalIncomeAmount,

    taxBase, 
    taxResult,
    exemption,
    decidedTax,
    initialIncomeTax,
    initialNongteukse,
    additionalIncomeTaxBase,
    additionalNongBase,
    constructionPenalty,
    incomePenalty, nongPenalty,
    nongteukse: totalNongteukse,
    totalIncomeTax,
    installmentMax, installmentValue, immediateIncomeTax,
    nongInstallmentMax, nongInstallmentValue, immediateNongteukse,
    incomeTaxInstallment: incomeInstallment,
    nongTeukseInstallment: nongInstallment,
    totalImmediateBill,
    deadline,
    holdingForRate,
    holdingForDed,
    highPriceLimit,
    basicDed,
    yangdoPrice: parseNumber(props.yangdoPrice),
    isBurdenGift,
    burdenRatio,
    localIncomeTax,
    isAggregationApplied,
    priorTaxAmount
  };
}
