
export interface TransferorInfo {
  name: string;
  ssn: string;
  phone: string;
}

export interface TransfereeInfo {
  name: string;
  ssn: string;
}

export interface AcqPriceActual {
  maega: string;        // 매입가액
  acqTax: string;       // 취등록세 등
  other: string;        // 기타비용 (소송비용 등) - was legalFee
  acqBrokerage: string; // 중개수수료(취득)
}

export interface ExpenseActual {
  repair: string;        // 자본적지출액
  sellBrokerage: string; // 중개수수료(양도)
  other: string;         // 기타비용
}

export interface TaxState {
  declarationType: 'regular' | 'after_deadline' | 'amended';
  reportDate: string;
  paymentDate: string;
  installmentInput: string;

  // Amended Declaration Inputs (Correction of SAME asset)
  initialIncomeTax: string;
  initialNongteukse: string;

  // Aggregation Inputs (Prior declaration of DIFFERENT asset in same year)
  hasPriorDeclaration: boolean;
  priorIncomeAmount: string; // 기신고 양도소득금액 (과세표준 아님)
  priorTaxAmount: string;    // 기신고 산출세액

  transferorInfo: TransferorInfo;
  transfereeInfo: TransfereeInfo;
  propertyAddress: string;

  assetType: string;
  landArea: string;
  landUseType: string;
  isBisatoException: boolean;
  
  // 1990/1985 Logic
  isPre1990: boolean;
  price1990Jan1: string;
  gradeAcq: string;
  grade1990Aug30: string;
  gradePrev1990Aug30: string;

  acquisitionCause: string;
  origAcquisitionCause: 'sale' | 'inheritance' | 'gift';
  yangdoCause: string;
  yangdoDate: string;
  acquisitionDate: string;
  origAcquisitionDate: string;
  
  // Burden Gift Inputs
  giftEvaluationMethod: 'market' | 'official'; // 시가 vs 기준시가
  giftValue: string;   // 증여재산 평가액 (Total Value)
  burdenDebtDeposit: string; // 임대보증금
  burdenDebtLoan: string;    // 대출금
  debtAmount: string;  // 채무인수액 (Total Debt)

  yangdoPrice: string;
  acqPriceMethod: 'actual' | 'converted' | 'official'; // 'official' added for burden gift with official eval
  acqPriceActual: AcqPriceActual;
  
  // Official Prices (Total)
  officialPrice: string;
  transferOfficialPrice: string;

  // Land Unit Prices (New)
  unitOfficialPrice: string; 
  unitTransferOfficialPrice: string;

  // Removed expenseMethod as it's no longer used for actual price logic
  expenseMethod: 'actual' | 'deduction'; 
  expenseActual: ExpenseActual;
  deductionInput: string;
  
  // Expense option for Converted Price (New)
  useActualExpenseWithConverted: boolean; 

  // Carryover Taxation Special Expense
  giftTaxPaid: string; // 기납부 증여세

  residenceYears: string;
  useResidenceSpecial: boolean;
  taxExemptionType: string;
  customRate: string; 
  isNongteukseExempt: boolean;

  // Basic Deduction Custom Input
  useCustomBasicDeduction: boolean;
  basicDeductionInput: string;

  // Nongteukse Installment
  nongInstallmentInput: string;
}

export interface TaxResult {
  acqPrice: number;
  acqMethodUsed: string;
  expense: number;
  expenseDesc: string;
  rawGain: number;
  taxableGain: number;
  taxExemptGain: number;
  longTerm: { amount: number; rate: number; desc: string };
  
  // Income Amounts
  currentIncomeAmount: number; // 금회 양도소득금액
  priorIncomeAmount: number;   // 기신고 양도소득금액
  totalIncomeAmount: number;   // 합산 양도소득금액
  
  taxBase: number;
  taxResult: { tax: number; rate: number; desc: string };
  exemption: { amount: number; desc: string; nongteukse: number };
  decidedTax: number;
  
  // Aggregation Info
  isAggregationApplied: boolean;
  priorTaxAmount: number;

  // Amended Logic
  initialIncomeTax: number;
  initialNongteukse: number;
  additionalIncomeTaxBase: number; // 과소신고분(본세)
  additionalNongBase: number;      // 과소신고분(농특세)

  constructionPenalty: number;
  incomePenalty: { 
    total: number; 
    report: number; 
    delay: number; 
    desc: string; 
    delayDays: number;
    reportDesc: string;
    delayDesc: string;
  };
  nongPenalty: { 
    total: number; 
    report: number; 
    delay: number; 
    desc: string; 
    delayDays: number;
    reportDesc: string;
    delayDesc: string;
  };
  nongteukse: number;
  totalIncomeTax: number;
  
  // Main Tax Installment
  installmentMax: number;
  installmentValue: number;
  immediateIncomeTax: number;

  // Nongteukse Installment
  nongInstallmentMax: number;
  nongInstallmentValue: number;
  immediateNongteukse: number;

  totalImmediateBill: number;
  deadline: string;
  holdingForRate: { years: number; days: number; text: string };
  holdingForDed: { years: number; days: number; text: string };
  highPriceLimit: number;
  basicDed: number;
  yangdoPrice: number;
  
  // Burden Gift Info
  isBurdenGift: boolean;
  burdenRatio: number;
  
  // Reference
  localIncomeTax: number;
}
