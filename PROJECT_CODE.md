# Smart Tax Calculator - Project Source Code

## index.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## metadata.json
```json
{
  "name": "Smart Tax Calculator",
  "description": "A comprehensive Korean Capital Gains Tax calculator for post-2022 transfers.",
  "requestFramePermissions": []
}
```

## index.html
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Tax Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            keyframes: {
              "fade-in": {
                "0%": { opacity: "0" },
                "100%": { opacity: "1" },
              },
              "zoom-in": {
                "0%": { transform: "scale(0.95)", opacity: "0" },
                "100%": { transform: "scale(1)", opacity: "1" },
              },
              "slide-up": {
                "0%": { transform: "translateY(10px)", opacity: "0" },
                "100%": { transform: "translateY(0)", opacity: "1" }
              }
            },
            animation: {
              "in": "fade-in 0.3s ease-out, slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              "zoom": "zoom-in 0.2s ease-out",
            },
            boxShadow: {
              'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
              'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
              'glow': '0 0 0 1px rgba(99, 102, 241, 0.1), 0 4px 20px rgba(99, 102, 241, 0.1)',
            }
          },
        },
      }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', sans-serif;
        min-width: 1280px; /* Enforce desktop width */
        overflow-x: auto;  /* Allow horizontal scroll if window is smaller */
        background-color: #F8F9FB; /* Softer background */
        color: #1e293b;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      /* Custom Scrollbar - Minimalist */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* Input autofill style fix */
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus, 
      input:-webkit-autofill:active{
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          transition: background-color 5000s ease-in-out 0s;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react/": "https://aistudiocdn.com/react@^19.2.0/"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## App.tsx
```tsx
import React, { useEffect, useReducer, useMemo, useState } from 'react';
import { Calculator, Scale, ArrowRight } from 'lucide-react';
import { TaxState } from './types';
import { TAX_LAW, LAND_GRADE_TABLE, parseNumber, isLandLike, calculateDeadline, calculateTax } from './utils/taxCalculations';
import TaxForm from './components/TaxForm';
import TaxResultView from './components/TaxResultView';
import { NongteukseInfoModal, BisatoInfoModal, Pre1990CalcModal, InstallmentInfoModal } from './components/Modals';
import ReportModal from './components/ReportModal';

const INITIAL_STATE: TaxState = {
    declarationType: 'regular',
    reportDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    installmentInput: '',
    
    initialIncomeTax: '',
    initialNongteukse: '',

    hasPriorDeclaration: false,
    priorIncomeAmount: '', 
    priorTaxAmount: '',    

    transferorInfo: { name: '', ssn: '', phone: '' },
    transfereeInfo: { name: '', ssn: '' },
    propertyAddress: '', 

    assetType: '일반주택', // Set default
    landArea: '',
    landUseType: 'business',
    isBisatoException: false,
    
    isPre1990: false,
    price1990Jan1: '',
    gradeAcq: '',
    grade1990Aug30: '',
    gradePrev1990Aug30: '',

    acquisitionCause: 'sale', // Set default
    yangdoCause: 'sale', // Set default
    yangdoDate: new Date().toISOString().split('T')[0],
    acquisitionDate: '',
    origAcquisitionDate: '', 

    giftEvaluationMethod: 'market',
    giftValue: '',
    burdenDebtDeposit: '',
    burdenDebtLoan: '',
    debtAmount: '',

    yangdoPrice: '',
    acqPriceMethod: 'actual',
    acqPriceActual: { maega: '', acqTax: '', other: '', acqBrokerage: '' },
    
    officialPrice: '',
    transferOfficialPrice: '',
    unitOfficialPrice: '',
    unitTransferOfficialPrice: '',

    expenseMethod: 'actual',
    expenseActual: { repair: '', sellBrokerage: '', other: '' },
    deductionInput: '',
    useActualExpenseWithConverted: false,

    residenceYears: '',
    useResidenceSpecial: false, 
    taxExemptionType: 'none',
    customRate: '', 
    isNongteukseExempt: false,
    
    useCustomBasicDeduction: false,
    basicDeductionInput: '2500000',

    nongInstallmentInput: ''
};

function reducer(state: TaxState, action: any): TaxState {
    if (action.type === 'SET') return { ...state, [action.field]: action.value };
    if (action.type === 'SET_NESTED') {
        return { 
            ...state, 
            [action.field]: { 
                ...(state[action.field as keyof TaxState] as object), 
                [action.subField]: action.value 
            } 
        };
    }
    if (action.type === 'RESET') return INITIAL_STATE;
    return state;
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [showNongTooltip, setShowNongTooltip] = useState(false); 
    const [showBisatoTooltip, setShowBisatoTooltip] = useState(false);
    const [showInstallmentTooltip, setShowInstallmentTooltip] = useState(false);
    const [showPre1990CalcModal, setShowPre1990CalcModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const set = (field: string, value: any) => dispatch({ type: 'SET', field, value });
    const setNested = (field: string, subField: string, value: any) => dispatch({ type: 'SET_NESTED', field, subField, value });

    const isPre1985 = useMemo(() => {
        const targetDate = (state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate)
            ? state.origAcquisitionDate 
            : state.acquisitionDate;

        if (!targetDate) return false;
        return new Date(targetDate) < new Date(TAX_LAW.LAND_CONVERSION_PRE_1985_DEEMED_ACQ_DATE);
    }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause]);

    const result = useMemo(() => calculateTax(state), [state]);

    // Side Effects
    useEffect(() => {
        if (['자경/대토 농지', '분양권', '미등기'].includes(state.assetType)) {
             if (state.assetType === '자경/대토 농지') {
                 set('taxExemptionType', 'farm_8y');
             } else {
                 if (state.taxExemptionType === 'public_cash_standard') set('taxExemptionType', 'none');
             }
        } else if (state.yangdoCause !== 'expropriation' && state.taxExemptionType === 'public_cash_standard') {
            set('taxExemptionType', 'none');
        }
    }, [state.assetType, state.yangdoCause]);

    useEffect(() => {
        if (state.taxExemptionType === 'farm_8y') {
            set('isNongteukseExempt', true);
        } else if (state.taxExemptionType === 'none') {
            set('isNongteukseExempt', false);
        }
    }, [state.taxExemptionType]);

    useEffect(() => {
        if (state.hasPriorDeclaration) {
            set('useCustomBasicDeduction', true);
            set('basicDeductionInput', '2500000');
        } else {
            if (state.basicDeductionInput === '2500000') {
                 set('useCustomBasicDeduction', false);
            }
        }
    }, [state.hasPriorDeclaration]);

    useEffect(() => {
        const targetDate = (state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate)
            ? state.origAcquisitionDate 
            : state.acquisitionDate;

        if (targetDate) {
            const acq = new Date(targetDate);
            const refDate = new Date(TAX_LAW.LAND_CONVERSION_GRADE_DATE);
            set('isPre1990', acq < refDate);
        } else {
            set('isPre1990', false);
        }
    }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause]);
    
    useEffect(() => {
        if (isLandLike(state.assetType) && state.isPre1990 && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
            const p90_1_1_unit = parseNumber(state.price1990Jan1);
            const v_acq_input = parseNumber(state.gradeAcq);
            const v_90 = parseNumber(state.grade1990Aug30);
            const v_prev = parseNumber(state.gradePrev1990Aug30);
            
            if (p90_1_1_unit > 0 && v_acq_input > 0 && v_90 > 0 && v_prev > 0) {
                 const val_90 = LAND_GRADE_TABLE.get(v_90);
                 const val_prev = LAND_GRADE_TABLE.get(v_prev);
                 const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
                 const denominator = (val_90 + val_prev) / 2;
                 if (denominator > 0) {
                     const calcUnitPrice = Math.floor((p90_1_1_unit * val_acq) / denominator);
                     set('unitOfficialPrice', calcUnitPrice);
                 }
            }
        }
    }, [state.price1990Jan1, state.gradeAcq, state.grade1990Aug30, state.gradePrev1990Aug30, state.assetType, state.isPre1990, state.acqPriceMethod]);

    useEffect(() => {
        if (['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause)) {
            if (state.acqPriceMethod !== 'actual' && state.yangdoCause !== 'burden_gift') {
                set('acqPriceMethod', 'actual');
            }
        }
    }, [state.acquisitionCause]);

    useEffect(() => {
        if (state.yangdoCause === 'burden_gift') {
            if (state.giftEvaluationMethod === 'official') {
                set('acqPriceMethod', 'official');
                set('useActualExpenseWithConverted', false);
            } else {
                if (state.acqPriceMethod === 'official') {
                    set('acqPriceMethod', 'actual');
                }
            }
        }
    }, [state.yangdoCause, state.giftEvaluationMethod]);

    useEffect(() => {
        if (isLandLike(state.assetType) && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
            const area = parseNumber(state.landArea);
            const unitAcq = parseNumber(state.unitOfficialPrice);
            const unitTransfer = parseNumber(state.unitTransferOfficialPrice);

            if (area > 0 && unitAcq > 0) {
                set('officialPrice', Math.floor(area * unitAcq));
            }
            if (area > 0 && unitTransfer > 0) {
                set('transferOfficialPrice', Math.floor(area * unitTransfer));
            }
        }
    }, [state.landArea, state.unitOfficialPrice, state.unitTransferOfficialPrice, state.assetType, state.acqPriceMethod]);

    useEffect(() => {
        if (state.declarationType === 'regular' && state.yangdoDate) {
            set('paymentDate', calculateDeadline(state.yangdoDate));
        }
    }, [state.yangdoDate, state.declarationType]);

    useEffect(() => {
        if (state.yangdoCause === 'burden_gift') {
            const deposit = parseNumber(state.burdenDebtDeposit);
            const loan = parseNumber(state.burdenDebtLoan);
            const totalDebt = deposit + loan;
            
            if (state.burdenDebtDeposit || state.burdenDebtLoan) {
                set('debtAmount', totalDebt);
            }
            set('yangdoPrice', state.debtAmount);
        }
    }, [state.yangdoCause, state.debtAmount, state.burdenDebtDeposit, state.burdenDebtLoan]);

    const handlePre1990ModalChange = (field: string, value: any) => {
        if (field === 'maega') setNested('acqPriceActual', 'maega', value);
        else set(field, value);
    };
    
    return (
        <div className="min-h-screen pb-20 font-sans text-slate-800 bg-[#F8F9FB]">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
            <div className="fixed top-20 right-20 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -z-10"></div>
            <div className="fixed top-40 left-20 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>

            {showNongTooltip && <NongteukseInfoModal onClose={()=>setShowNongTooltip(false)} />}
            {showBisatoTooltip && <BisatoInfoModal onClose={()=>setShowBisatoTooltip(false)} />}
            {showPre1990CalcModal && <Pre1990CalcModal onClose={()=>setShowPre1990CalcModal(false)} state={state} onChange={handlePre1990ModalChange} />}
            {showInstallmentTooltip && <InstallmentInfoModal onClose={()=>setShowInstallmentTooltip(false)} />}
            {showReportModal && <ReportModal onClose={()=>setShowReportModal(false)} result={result} state={state} />}

            <header className="sticky top-0 z-40 mb-10 border-b border-white/50 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 ring-4 ring-white">
                            <Scale className="text-white w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                             <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none mb-1 flex items-center gap-2">
                                Smart Tax Calculator
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 uppercase tracking-wide">Beta</span>
                            </h1>
                            <span className="text-xs text-slate-500 font-medium tracking-wide">양도소득세 간편 신고 도우미 (2022년 이후)</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8">
                <main className="grid grid-cols-12 gap-10 items-start">
                    <div className="col-span-7 space-y-8">
                        <TaxForm 
                            state={state} 
                            result={result} 
                            set={set} 
                            setNested={setNested} 
                            isPre1985={isPre1985}
                            handlers={{
                                onOpenNongTooltip: () => setShowNongTooltip(true),
                                onOpenBisatoTooltip: () => setShowBisatoTooltip(true),
                                onOpenPre1990Modal: () => setShowPre1990CalcModal(true),
                                onOpenInstallmentTooltip: () => setShowInstallmentTooltip(true),
                            }}
                        />
                    </div>

                    <div className="col-span-5 relative">
                        <TaxResultView 
                            result={result} 
                            state={state} 
                            onReset={() => dispatch({type: 'RESET'})}
                            onPrint={() => setShowReportModal(true)}
                        />
                    </div>
                </main>
            </div>

            <footer className="max-w-7xl mx-auto px-8 py-12 mt-12 border-t border-slate-200">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Scale size={24}/>
                    </div>
                    <p className="text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
                        본 서비스는 모의 계산용으로 법적 효력이 없습니다.<br/> 
                        정확한 세액 산출 및 신고는 반드시 세무 전문가와 상담하시기 바랍니다.
                    </p>
                    <p className="text-slate-300 text-xs mt-2">© 2024 Smart Tax Service. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
```

## types.ts
```ts
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
```

## components/TaxCalculator.tsx
```tsx
import React, { useEffect, useReducer, useMemo, useState } from 'react';
import { TaxState } from '../types';
import { TAX_LAW, LAND_GRADE_TABLE, parseNumber, isLandLike, calculateDeadline, calculateTax } from '../utils/taxCalculations';
import TaxForm from './TaxForm';
import TaxResultView from './TaxResultView';
import { NongteukseInfoModal, BisatoInfoModal, Pre1990CalcModal, InstallmentInfoModal } from './Modals';

const INITIAL_STATE: TaxState = {
    declarationType: 'regular',
    reportDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    installmentInput: '',
    
    initialIncomeTax: '',
    initialNongteukse: '',

    hasPriorDeclaration: false,
    priorIncomeAmount: '', // 기신고 양도소득금액
    priorTaxAmount: '',    // 기신고 산출세액

    transferorInfo: { name: '', ssn: '', phone: '' },
    transfereeInfo: { name: '', ssn: '' },
    propertyAddress: '', 

    assetType: '', 
    landArea: '',
    landUseType: 'business',
    isBisatoException: false,
    
    isPre1990: false,
    price1990Jan1: '',
    gradeAcq: '',
    grade1990Aug30: '',
    gradePrev1990Aug30: '',

    acquisitionCause: '',
    yangdoCause: '',
    yangdoDate: new Date().toISOString().split('T')[0],
    acquisitionDate: '',
    origAcquisitionDate: '', 

    giftEvaluationMethod: 'market',
    giftValue: '',
    burdenDebtDeposit: '',
    burdenDebtLoan: '',
    debtAmount: '',

    yangdoPrice: '',
    acqPriceMethod: 'actual',
    acqPriceActual: { maega: '', acqTax: '', other: '', acqBrokerage: '' },
    
    officialPrice: '',
    transferOfficialPrice: '',
    unitOfficialPrice: '',
    unitTransferOfficialPrice: '',

    expenseMethod: 'actual',
    expenseActual: { repair: '', sellBrokerage: '', other: '' },
    deductionInput: '',
    useActualExpenseWithConverted: false,

    residenceYears: '',
    useResidenceSpecial: false, 
    taxExemptionType: 'none',
    customRate: '', 
    isNongteukseExempt: false,
    
    useCustomBasicDeduction: false,
    basicDeductionInput: '2500000',

    nongInstallmentInput: ''
};

function reducer(state: TaxState, action: any): TaxState {
    if (action.type === 'SET') return { ...state, [action.field]: action.value };
    if (action.type === 'SET_NESTED') {
        return { 
            ...state, 
            [action.field]: { 
                ...(state[action.field as keyof TaxState] as object), 
                [action.subField]: action.value 
            } 
        };
    }
    if (action.type === 'RESET') return INITIAL_STATE;
    return state;
}

export default function TaxCalculator() {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [showNongTooltip, setShowNongTooltip] = useState(false); 
    const [showBisatoTooltip, setShowBisatoTooltip] = useState(false);
    const [showInstallmentTooltip, setShowInstallmentTooltip] = useState(false);
    const [showPre1990CalcModal, setShowPre1990CalcModal] = useState(false);

    const set = (field: string, value: any) => dispatch({ type: 'SET', field, value });
    const setNested = (field: string, subField: string, value: any) => dispatch({ type: 'SET_NESTED', field, subField, value });

    const isPre1985 = useMemo(() => {
        const targetDate = (state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate)
            ? state.origAcquisitionDate 
            : state.acquisitionDate;

        if (!targetDate) return false;
        return new Date(targetDate) < new Date(TAX_LAW.LAND_CONVERSION_PRE_1985_DEEMED_ACQ_DATE);
    }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause]);

    const result = useMemo(() => calculateTax(state), [state]);

    // Side Effects
    useEffect(() => {
        if (['자경/대토 농지', '분양권', '미등기'].includes(state.assetType)) {
             if (state.assetType === '자경/대토 농지') {
                 set('taxExemptionType', 'farm_8y');
             } else {
                 if (state.taxExemptionType === 'public_cash_standard') set('taxExemptionType', 'none');
             }
        } else if (state.yangdoCause !== 'expropriation' && state.taxExemptionType === 'public_cash_standard') {
            set('taxExemptionType', 'none');
        }
    }, [state.assetType, state.yangdoCause]);

    useEffect(() => {
        if (state.taxExemptionType === 'farm_8y') {
            set('isNongteukseExempt', true);
        } else if (state.taxExemptionType === 'none') {
            set('isNongteukseExempt', false);
        }
    }, [state.taxExemptionType]);

    // 합산신고 선택 시 기본공제 250만원 고정 (로직 요구사항)
    useEffect(() => {
        if (state.hasPriorDeclaration) {
            set('useCustomBasicDeduction', true);
            set('basicDeductionInput', '2500000');
        } else {
             // 해제 시 기본값 복원 (사용자가 직접 입력 모드였다면 유지할 수도 있으나, 안전하게 리셋)
            if (state.basicDeductionInput === '2500000') {
                 set('useCustomBasicDeduction', false);
            }
        }
    }, [state.hasPriorDeclaration]);

    useEffect(() => {
        const targetDate = (state.acquisitionCause === 'gift_carryover' && state.origAcquisitionDate)
            ? state.origAcquisitionDate 
            : state.acquisitionDate;

        if (targetDate) {
            const acq = new Date(targetDate);
            const refDate = new Date(TAX_LAW.LAND_CONVERSION_GRADE_DATE);
            set('isPre1990', acq < refDate);
        } else {
            set('isPre1990', false);
        }
    }, [state.acquisitionDate, state.origAcquisitionDate, state.acquisitionCause]);
    
    useEffect(() => {
        if (isLandLike(state.assetType) && state.isPre1990 && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
            const p90_1_1_unit = parseNumber(state.price1990Jan1);
            const v_acq_input = parseNumber(state.gradeAcq);
            const v_90 = parseNumber(state.grade1990Aug30);
            const v_prev = parseNumber(state.gradePrev1990Aug30);
            
            if (p90_1_1_unit > 0 && v_acq_input > 0 && v_90 > 0 && v_prev > 0) {
                 const val_90 = LAND_GRADE_TABLE.get(v_90);
                 const val_prev = LAND_GRADE_TABLE.get(v_prev);
                 const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
                 const denominator = (val_90 + val_prev) / 2;
                 if (denominator > 0) {
                     const calcUnitPrice = Math.floor((p90_1_1_unit * val_acq) / denominator);
                     set('unitOfficialPrice', calcUnitPrice);
                 }
            }
        }
    }, [state.price1990Jan1, state.gradeAcq, state.grade1990Aug30, state.gradePrev1990Aug30, state.assetType, state.isPre1990, state.acqPriceMethod]);

    useEffect(() => {
        if (['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause)) {
            // 상속, 증여, 이월과세는 원칙적으로 실지거래가(평가액) 기준
            // 단, 부담부증여 로직에 의해 덮어씌워질 수 있음
            if (state.acqPriceMethod !== 'actual' && state.yangdoCause !== 'burden_gift') {
                set('acqPriceMethod', 'actual');
            }
        }
    }, [state.acquisitionCause]);

    // Burden Gift Logic: Force Acquisition Method based on Gift Eval Method
    useEffect(() => {
        if (state.yangdoCause === 'burden_gift') {
            if (state.giftEvaluationMethod === 'official') {
                // 기준시가 평가 시: 취득가액도 기준시가 방식 강제 (환산 불가)
                set('acqPriceMethod', 'official');
                set('useActualExpenseWithConverted', false); // 실비 적용 불가
            } else {
                // 시가 평가 시: 실지거래가 원칙, 없으면 환산 가능
                if (state.acqPriceMethod === 'official') {
                    set('acqPriceMethod', 'actual');
                }
            }
        }
    }, [state.yangdoCause, state.giftEvaluationMethod]);

    useEffect(() => {
        if (isLandLike(state.assetType) && (state.acqPriceMethod === 'converted' || state.acqPriceMethod === 'official')) {
            const area = parseNumber(state.landArea);
            const unitAcq = parseNumber(state.unitOfficialPrice);
            const unitTransfer = parseNumber(state.unitTransferOfficialPrice);

            if (area > 0 && unitAcq > 0) {
                set('officialPrice', Math.floor(area * unitAcq));
            }
            if (area > 0 && unitTransfer > 0) {
                set('transferOfficialPrice', Math.floor(area * unitTransfer));
            }
        }
    }, [state.landArea, state.unitOfficialPrice, state.unitTransferOfficialPrice, state.assetType, state.acqPriceMethod]);

    useEffect(() => {
        if (state.declarationType === 'regular' && state.yangdoDate) {
            set('paymentDate', calculateDeadline(state.yangdoDate));
        }
    }, [state.yangdoDate, state.declarationType]);

    // Burden Gift: Sync debtAmount to yangdoPrice
    useEffect(() => {
        if (state.yangdoCause === 'burden_gift') {
            const deposit = parseNumber(state.burdenDebtDeposit);
            const loan = parseNumber(state.burdenDebtLoan);
            const totalDebt = deposit + loan;
            
            // If user inputs specific fields, update total. 
            // Also allow direct editing of debtAmount if fields are empty to keep flexibility.
            if (state.burdenDebtDeposit || state.burdenDebtLoan) {
                set('debtAmount', totalDebt);
            }
            
            set('yangdoPrice', state.debtAmount);
        }
    }, [state.yangdoCause, state.debtAmount, state.burdenDebtDeposit, state.burdenDebtLoan]);

    const handlePre1990ModalChange = (field: string, value: any) => {
        if (field === 'maega') setNested('acqPriceActual', 'maega', value);
        else set(field, value);
    };
    
    const handlePrintDeclaration = () => { alert("출력 기능 준비 중"); };
    
    return (
        <div className="min-h-screen pb-20 font-sans text-slate-900">
            {showNongTooltip && <NongteukseInfoModal onClose={()=>setShowNongTooltip(false)} />}
            {showBisatoTooltip && <BisatoInfoModal onClose={()=>setShowBisatoTooltip(false)} />}
            {showPre1990CalcModal && <Pre1990CalcModal onClose={()=>setShowPre1990CalcModal(false)} state={state} onChange={handlePre1990ModalChange} />}
            {showInstallmentTooltip && <InstallmentInfoModal onClose={()=>setShowInstallmentTooltip(false)} />}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-8">
                    <TaxForm 
                        state={state} 
                        result={result} 
                        set={set} 
                        setNested={setNested} 
                        isPre1985={isPre1985}
                        handlers={{
                            onOpenNongTooltip: () => setShowNongTooltip(true),
                            onOpenBisatoTooltip: () => setShowBisatoTooltip(true),
                            onOpenPre1990Modal: () => setShowPre1990CalcModal(true),
                            onOpenInstallmentTooltip: () => setShowInstallmentTooltip(true),
                        }}
                    />
                </div>

                <div className="lg:col-span-5">
                    <TaxResultView 
                        result={result} 
                        state={state} 
                        onReset={() => dispatch({type: 'RESET'})}
                        onPrint={handlePrintDeclaration}
                    />
                </div>
            </div>
        </div>
    );
}
```

## utils/taxCalculations.ts
```ts
import { TaxState, TaxResult } from '../types';

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
  BASIC_DEDUCTION: 2_500_000,
  LATE_INTEREST_RATE: 0.00022, // 납부지연가산세 1일 0.022%
  PUBLIC_CASH_RATE_CHANGE_DATE: '2025-01-01',
  LAND_CONVERSION_PRE_1985_DEEMED_ACQ_DATE: '1985-01-01',
  LAND_CONVERSION_GRADE_DATE: '1990-08-30'
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
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return { years: Math.max(0, years), days: diffDays, text: `${Math.max(0, years)}년 ${diffDays % 365}일` };
};

export const calculateDeadline = (yangdoDateStr: string) => {
  if (!yangdoDateStr) return '';
  const date = new Date(yangdoDateStr);
  if (isNaN(date.getTime())) return '';

  const targetMonth = date.getMonth() + 2; 
  const year = date.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12; 
  const lastDay = new Date(year, month + 1, 0);
  
  let deadline = lastDay;
  while (true) {
    const day = deadline.getDay();
    const isWeekend = day === 0 || day === 6; 
    const isLaborDay = deadline.getMonth() === 4 && deadline.getDate() === 1;

    if (isWeekend || isLaborDay) {
      deadline.setDate(deadline.getDate() + 1);
    } else {
      break;
    }
  }
  return deadline.toISOString().split('T')[0];
};

function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    const targetMonth = d.getMonth() + months;
    const year = d.getFullYear() + Math.floor(targetMonth / 12);
    const month = targetMonth % 12;
    const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
    const day = Math.min(d.getDate(), lastDayOfTargetMonth);
    return new Date(year, month, day);
}

export function calculatePenaltyDetails(
    taxAmount: number, 
    paidAmount: number, 
    deadlineStr: string, 
    reportDateStr: string, 
    paymentDateStr: string, 
    type: string, 
    isNongteukse = false
) {
  const targetAmount = Math.max(0, taxAmount - paidAmount);

  if (targetAmount <= 0 || !deadlineStr || !reportDateStr || !paymentDateStr) {
      return { total: 0, report: 0, delay: 0, desc: '가산세 없음', delayDays: 0, reportDesc: '', delayDesc: '' };
  }

  const deadline = new Date(deadlineStr);
  const report = new Date(reportDateStr);
  const payment = new Date(paymentDateStr);
  
  let delayDays = 0;
  let delayPenalty = 0;
  if (payment > deadline) {
    const diffTime = payment.getTime() - deadline.getTime();
    delayDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    delayPenalty = Math.floor(targetAmount * delayDays * TAX_LAW.LATE_INTEREST_RATE);
  }

  let reportPenaltyRate = 0;
  let reductionRate = 0;
  let reportDesc = '';

  if (isNongteukse) {
      reportPenaltyRate = 0;
      reportDesc = '면제(농어촌특별세법)';
  } else {
      const d1Month = addMonths(deadline, 1);
      const d3Months = addMonths(deadline, 3);
      const d6Months = addMonths(deadline, 6);
      const d1Year = addMonths(deadline, 12);
      const d1_5Year = addMonths(deadline, 18);
      const d2Year = addMonths(deadline, 24);

      if (type === 'after_deadline') {
        reportPenaltyRate = 0.2; 
        if (report <= d1Month) { reductionRate = 0.5; reportDesc = '기한후 1개월내(50%감면)'; }
        else if (report <= d3Months) { reductionRate = 0.3; reportDesc = '기한후 3개월내(30%감면)'; }
        else if (report <= d6Months) { reductionRate = 0.2; reportDesc = '기한후 6개월내(20%감면)'; }
        else { reportDesc = '기한후 신고(감면없음)'; }

      } else if (type === 'amended') {
        reportPenaltyRate = 0.1;
        if (report <= d1Month) { reductionRate = 0.9; reportDesc = '수정신고 1개월내(90%감면)'; }
        else if (report <= d3Months) { reductionRate = 0.75; reportDesc = '수정신고 3개월내(75%감면)'; }
        else if (report <= d6Months) { reductionRate = 0.5; reportDesc = '수정신고 6개월내(50%감면)'; }
        else if (report <= d1Year) { reductionRate = 0.3; reportDesc = '수정신고 1년내(30%감면)'; }
        else if (report <= d1_5Year) { reductionRate = 0.2; reportDesc = '수정신고 1.5년내(20%감면)'; }
        else if (report <= d2Year) { reductionRate = 0.1; reportDesc = '수정신고 2년내(10%감면)'; }
        else { reportDesc = '수정신고(감면없음)'; }
      } else if (type === 'regular' && report > deadline) {
          reportDesc = '기한 경과(20%)';
          reportPenaltyRate = 0.2;
      }
  }

  const reportPenalty = Math.floor(targetAmount * reportPenaltyRate * (1 - reductionRate));
  const total = reportPenalty + delayPenalty;
  
  let fullDesc = reportDesc;
  if (delayDays > 0) fullDesc += (fullDesc ? ', ' : '') + `납부지연 ${delayDays}일`;
  if (total === 0) fullDesc = '가산세 없음';

  const delayDesc = delayDays > 0 ? `납부지연 ${delayDays}일 × 0.022%` : '';

  return { total, report: reportPenalty, delay: delayPenalty, desc: fullDesc, delayDays, reportDesc, delayDesc };
}

export function calculateAcquisitionPrice(props: TaxState) {
    const yangdo = parseNumber(props.yangdoPrice);
    const acqUnit = parseNumber(props.officialPrice);
    const landArea = parseNumber(props.landArea);
    
    let basePriceForExpense = acqUnit;

    if (props.acqPriceMethod === 'actual') {
        const p = parseNumber(props.acqPriceActual.maega) + 
                  parseNumber(props.acqPriceActual.acqTax) + 
                  parseNumber(props.acqPriceActual.other) + // Updated: use 'other'
                  parseNumber(props.acqPriceActual.acqBrokerage);
        return { price: p, basePriceForExpense, methodDesc: '실지취득가액' };
    }

    if (props.acqPriceMethod === 'official') {
        return { price: acqUnit, basePriceForExpense, methodDesc: '기준시가(안분전)' };
    }

    const transferUnit = parseNumber(props.transferOfficialPrice);
    
    if (isLandLike(props.assetType) && props.isPre1990) {
        const p90_1_1_unit = parseNumber(props.price1990Jan1);
        const v_acq_input = parseNumber(props.gradeAcq);
        const v_90_val = parseNumber(props.grade1990Aug30);
        const v_prev = parseNumber(props.gradePrev1990Aug30);

        const acqDateObj = new Date(props.acquisitionDate);
        const date85 = new Date('1985-01-01');
        const isBefore85 = acqDateObj < date85;

        if (p90_1_1_unit > 0 && v_acq_input > 0 && v_90_val > 0 && v_prev > 0) {
            const val_90 = LAND_GRADE_TABLE.get(v_90_val);
            const val_prev = LAND_GRADE_TABLE.get(v_prev);
            const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
            const denominator = (val_90 + val_prev) / 2;

            if (denominator > 0) {
                const acq_calc_unit_price = (p90_1_1_unit * val_acq) / denominator;
                const total_acq_base = Math.floor(acq_calc_unit_price * landArea);
                
                basePriceForExpense = total_acq_base; 

                const totalTransferOfficial = transferUnit; 
                
                const price = totalTransferOfficial > 0 ? Math.floor(yangdo * (total_acq_base / totalTransferOfficial)) : 0;
                let desc = isBefore85 ? '환산(85.1.1 의제등급)' : '환산(토지등급)';
                return { price, basePriceForExpense, methodDesc: desc };
            }
        }
    }

    const price = transferUnit > 0 ? Math.floor(yangdo * (acqUnit / transferUnit)) : 0;
    return { price, basePriceForExpense: acqUnit, methodDesc: '환산취득가액(기준시가비율)' };
}

export function calculateLongTermDeduction(gain: number, years: number, props: TaxState) {
    if (props.assetType === '미등기' || props.assetType === '분양권' || years < 3) return { amount: 0, rate: 0, desc: '공제대상 아님' };

    if (props.assetType === '1세대1주택_고가주택') {
        const rawResYears = parseNumber(props.residenceYears);
        const resFullYears = Math.floor(rawResYears); 

        const isResidenceSatisfied = resFullYears >= 2 || props.useResidenceSpecial;

        if (isResidenceSatisfied) {
            const holdRate = Math.min(0.4, years * 0.04);
            const resRate = Math.min(0.4, resFullYears * 0.04);
            const totalRate = holdRate + resRate;
            
            return { 
                amount: Math.floor(gain * totalRate), 
                rate: totalRate, 
                desc: `표2 (보유${(holdRate*100).toFixed(0)}%+거주${(resRate*100).toFixed(0)}%)` 
            };
        } else {
            const rate = Math.min(0.3, years * 0.02);
            return { amount: Math.floor(gain * rate), rate, desc: '표1 (거주 2년 미만)' };
        }
    }

    const rate = Math.min(0.3, years * 0.02);
    return { amount: Math.floor(gain * rate), rate, desc: `일반 공제(${(rate*100).toFixed(0)}%)` };
}

// 순수 누진세율 계산기 (과세표준 -> 세액)
function calculateGeneralTaxOnly(base: number, dateStr: string) {
    if (base <= 0) return 0;
    const brackets = (dateStr >= '2023-01-01') ? TAX_BRACKETS_2023 : TAX_BRACKETS_2022;
    const bracket = brackets.find(b => base <= b.upTo) || brackets[brackets.length - 1];
    return Math.floor(base * (bracket.rate / 100) - bracket.deduction);
}

export function calculateTaxRate(base: number, years: number, props: TaxState) {
    const yangdoDateStr = props.yangdoDate || new Date().toISOString().split('T')[0];
    const brackets = (yangdoDateStr >= '2023-01-01') ? TAX_BRACKETS_2023 : TAX_BRACKETS_2022;

    // 1. 미등기 (70%) - 비교과세 불필요 (가장 높음)
    if (props.assetType === '미등기') return { tax: Math.floor(base * 0.70), rate: 70, desc: '미등기 70%' };

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
            return { tax: shortTermTax, rate: shortTermRate, desc: `${shortTermDesc} (비사업용 중과보다 큼)` };
        } else {
            return { tax: bisatoTax, rate: bracket.rate + 10, desc: `${bisatoDesc} (비교과세 적용)` };
        }
    }

    // Case B: 일반 자산 (토지, 상가, 주택 등)
    if (shortTermTax > 0) {
        // 비교 대상: [기본세율] vs [단기세율]
        if (shortTermTax > basicTax) {
            return { tax: shortTermTax, rate: shortTermRate, desc: shortTermDesc };
        } else {
            return { tax: basicTax, rate: bracket.rate, desc: `${basicDesc} (단기세율보다 큼)` };
        }
    }

    // Case C: 그 외 (2년 이상 일반 자산)
    return { tax: basicTax, rate: bracket.rate, desc: basicDesc };
}

export function calculateExemptionLogic(tax: number, props: TaxState) {
    let amount = 0;
    let desc = '';
    let nongteukse = 0;
    switch (props.taxExemptionType) {
        case 'farm_8y':
            amount = Math.min(tax, TAX_LAW.FARM_YEARLY_LIMIT);
            desc = '8년 자경/대토 감면';
            break;
        case 'public_cash_standard': {
            const yangdoDate = props.yangdoDate || '1900-01-01';
            const isPost2025 = yangdoDate >= TAX_LAW.PUBLIC_CASH_RATE_CHANGE_DATE;
            const rate = isPost2025 ? 0.15 : 0.10;
            amount = Math.floor(tax * rate);
            desc = `공익사업 수용(현금) (${rate*100}%)`;
            if (!props.isNongteukseExempt) nongteukse = Math.floor(amount * 0.20);
            break;
        }
        case 'custom':
            const r = parseNumber(props.customRate);
            amount = Math.floor(tax * (r / 100));
            desc = `직접입력 감면 (${r}%)`;
            if (!props.isNongteukseExempt) nongteukse = Math.floor(amount * 0.20);
            break;
    }
    return { amount, desc, nongteukse };
}

export function calculateTax(props: TaxState): TaxResult {
  // 1. 세율 적용을 위한 보유기간 (상속, 이월과세 모두 피상속인/증여자 당초 취득일 합산)
  let startDateForRate = props.acquisitionDate;
  if ((['inheritance', 'gift_carryover'].includes(props.acquisitionCause)) && props.origAcquisitionDate) {
      startDateForRate = props.origAcquisitionDate;
  }
  const holdingForRate = calculatePeriod(startDateForRate, props.yangdoDate);

  // 2. 장기보유특별공제를 위한 보유기간 (상속은 상속개시일, 이월과세는 당초취득일 기준)
  let startDateForDed = props.acquisitionDate; 
  if (props.acquisitionCause === 'gift_carryover' && props.origAcquisitionDate) {
      startDateForDed = props.origAcquisitionDate;
  }
  
  const holdingForDed = calculatePeriod(startDateForDed, props.yangdoDate);

  // Burden Gift Logic
  const isBurdenGift = props.yangdoCause === 'burden_gift';
  const giftValue = parseNumber(props.giftValue);
  const debtAmount = parseNumber(props.debtAmount);
  
  let burdenRatio = 1;
  if (isBurdenGift && giftValue > 0) {
      burdenRatio = Math.min(1, debtAmount / giftValue);
  }

  const acqData = calculateAcquisitionPrice(props);
  const autoDeduction = Math.floor(acqData.basePriceForExpense * 0.03 * burdenRatio);
  
  let expense = 0;
  let expenseDesc = '';
  let appliedAcqPrice = acqData.price;
  let appliedAcqMethodDesc = acqData.methodDesc;
  
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
      appliedAcqPrice = Math.floor(acqData.price * burdenRatio);
      appliedAcqMethodDesc = '기준시가';
  } else {
      expense = Math.floor(actualExpenseSum * burdenRatio);
      expenseDesc = '실제 필요경비';
      appliedAcqPrice = Math.floor(acqData.price * burdenRatio);
  }

  if (isBurdenGift) {
      expenseDesc += ` (안분율 ${(burdenRatio * 100).toFixed(2)}% 적용)`;
      if (props.acqPriceMethod === 'actual' || props.acqPriceMethod === 'official') {
          appliedAcqMethodDesc += ` (안분율 ${(burdenRatio * 100).toFixed(2)}%)`;
      }
  }

  const yangdoPrice = parseNumber(props.yangdoPrice);
  const rawGain = Math.max(0, yangdoPrice - appliedAcqPrice - expense);
  
  let taxableGain = rawGain;
  let taxExemptGain = 0;
  let highPriceLimit = TAX_LAW.HIGH_PRICE_LIMIT;

  if (props.assetType === '1세대1주택_고가주택') {
      // 고가주택 비과세 계산 (9억->12억 초과분만 과세)
      if (isBurdenGift) {
          if (giftValue <= highPriceLimit) {
              taxableGain = 0; 
          } else if (giftValue > 0) {
              taxableGain = Math.floor(rawGain * ((giftValue - highPriceLimit) / giftValue));
          }
      } else {
          if (yangdoPrice <= highPriceLimit) {
              taxableGain = 0; 
          } else if (yangdoPrice > 0) {
              taxableGain = Math.floor(rawGain * ((yangdoPrice - highPriceLimit) / yangdoPrice));
          }
      }
      taxExemptGain = rawGain - taxableGain;
  }

  const longTerm = calculateLongTermDeduction(taxableGain, holdingForDed.years, props);
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

  const taxResult = { tax: finalTaxAmount, rate: finalRate, desc: finalDesc };
  // ----------------------------------------------------------------

  // 감면 세액 계산 (합산신고 시에도 산출세액에서 감면 공제)
  const exemption = calculateExemptionLogic(taxResult.tax, props);
  const decidedTax = Math.max(0, taxResult.tax - exemption.amount);

  // Construction Penalty Auto-Calculation
  // Logic: Building Type + Construction Cause + Under 5 Years + Converted Price
  let constructionPenalty = 0;
  const isBuilding = ['일반주택', '1세대1주택_고가주택', '상가/건물'].includes(props.assetType);
  const isConstruction = props.acquisitionCause === 'construction';
  const isConverted = props.acqPriceMethod === 'converted';
  const isUnder5Years = holdingForRate.years < 5;

  if (isBuilding && isConstruction && isConverted && isUnder5Years) {
      constructionPenalty = Math.floor(acqData.price * 0.05);
  }

  const deadline = calculateDeadline(props.yangdoDate);
  
  const initialIncomeTax = parseNumber(props.initialIncomeTax);
  const incomePenalty = calculatePenaltyDetails(
      decidedTax + constructionPenalty, 
      initialIncomeTax, 
      deadline, props.reportDate, props.paymentDate, props.declarationType, false
  );
  
  const initialNongteukse = parseNumber(props.initialNongteukse);
  const nongPenalty = calculatePenaltyDetails(
      exemption.nongteukse, 
      initialNongteukse, 
      deadline, props.reportDate, props.paymentDate, props.declarationType, true
  );

  const additionalIncomeTaxBase = decidedTax + constructionPenalty - initialIncomeTax;
  
  // 합산신고 시: [ (산출세액 - 감면) + 가산세 ] - 기신고납부세액
  let totalIncomeTaxBeforePrior = Math.max(0, additionalIncomeTaxBase) + incomePenalty.total;
  
  let totalIncomeTax = totalIncomeTaxBeforePrior;
  if (isAggregationApplied) {
      // 기신고 결정세액 차감
      totalIncomeTax = Math.max(0, totalIncomeTaxBeforePrior - priorTaxAmount);
  }
  
  let installmentMax = 0;
  if (totalIncomeTax > 20000000) installmentMax = Math.floor(totalIncomeTax * 0.5);
  else if (totalIncomeTax > 10000000) installmentMax = totalIncomeTax - 10000000;

  const installmentValue = Math.min(parseNumber(props.installmentInput), installmentMax);
  const immediateIncomeTax = totalIncomeTax - installmentValue;

  const additionalNongBase = exemption.nongteukse - initialNongteukse;
  const totalNongteukse = Math.max(0, additionalNongBase) + nongPenalty.total;

  let nongInstallmentMax = 0;
  if (totalNongteukse > 10000000) {
      nongInstallmentMax = Math.floor(totalNongteukse * 0.5);
  } else if (totalNongteukse > 5000000) {
      nongInstallmentMax = totalNongteukse - 5000000;
  }

  const nongInstallmentValue = Math.min(parseNumber(props.nongInstallmentInput), nongInstallmentMax);
  const immediateNongteukse = totalNongteukse - nongInstallmentValue;

  const totalImmediateBill = immediateIncomeTax + immediateNongteukse;
  const localIncomeTax = Math.floor(totalIncomeTax * 0.1);

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
```

## components/CommonComponents.tsx
```tsx
import React, { useState, useRef, useEffect } from 'react';
import { formatNumber, parseNumber } from '../utils/taxCalculations';
import { HelpCircle, X, Check, Lock } from 'lucide-react';

// Modern Section Header (Step Indicator Style)
export const Section = ({ title, children, number, className = "" }: { title: string, children?: React.ReactNode, number: number, className?: string }) => (
  <div className={`bg-white rounded-3xl shadow-card border border-slate-100 mb-8 overflow-visible transition-all duration-300 hover:shadow-soft group ${className}`}>
    <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <span className="text-[10px] leading-none opacity-60 uppercase tracking-tighter">Step</span>
            <span className="text-xl leading-none mt-0.5">{number.toString().padStart(2, '0')}</span>
        </div>
        <h2 className="font-bold text-slate-900 text-xl tracking-tight">{title}</h2>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

// Modern Input Styles
export const commonInputClass = "w-full h-12 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium text-slate-800 hover:bg-white hover:border-slate-300";
export const disabledInputClass = "w-full h-12 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-base outline-none text-slate-500 font-medium cursor-not-allowed shadow-none select-none";

export const InputRow = ({ label, value, onChange, suffix, placeholder, className, disabled = false }: any) => (
  <div className={`mb-5 ${className}`}>
    {label && <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">{label}</label>}
    <div className="relative group">
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={`${disabled ? disabledInputClass : commonInputClass} ${suffix || disabled ? 'pr-12' : ''}`}
        placeholder={placeholder}
      />
      {/* Suffix or Lock Icon */}
      {disabled ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={16} />
          </span>
      ) : suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none group-focus-within:text-indigo-500 transition-colors">{suffix}</span>
      ) : null}
    </div>
  </div>
);

// 금액을 한글로 변환하는 함수
function formatHangulMoney(value: number): string {
    if (!value || value === 0) return '';
    const unitWords = ['', '만', '억', '조', '경'];
    let result = '';
    let temp = value;
    let count = 0;

    while (temp > 0) {
        const part = temp % 10000;
        if (part > 0) {
            result = `${formatNumber(part)}${unitWords[count]} ` + result;
        }
        temp = Math.floor(temp / 10000);
        count++;
    }
    return result.trim() + ' 원';
}

export const NumberInput = ({ label, value, onChange, suffix, allowDecimal = false, disabled = false, placeholder, className = '', hideTooltip = false, labelClassName, children }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (allowDecimal) {
            const filtered = raw.replace(/[^0-9.]/g, '');
            onChange(filtered);
        } else {
            const filtered = raw.replace(/[^0-9]/g, '');
            onChange(filtered ? Number(filtered).toLocaleString('ko-KR') : '');
        }
    };
    
    const numericValue = parseNumber(value);
    const hangulValue = (!allowDecimal && numericValue > 0) ? formatHangulMoney(numericValue) : '';

    return (
        <div className={`mb-5 ${className} relative group`}> 
            <div className="flex items-center gap-1 mb-2.5 ml-1">
                {label && <label className={labelClassName || "block text-sm font-semibold text-slate-600"}>{label}</label>}
                {children}
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={!allowDecimal && typeof value === 'number' ? value.toLocaleString('ko-KR') : value} 
                    onChange={handleChange}
                    disabled={disabled}
                    className={`${disabled ? disabledInputClass : commonInputClass} font-mono text-right tabular-nums tracking-tight ${suffix || disabled ? 'pr-12' : ''}`}
                    placeholder={placeholder}
                />
                
                {/* Suffix or Lock Icon */}
                {disabled ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={16} />
                    </span>
                ) : suffix ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none group-focus-within:text-indigo-500 transition-colors">{suffix}</span>
                ) : null}
                
                {!hideTooltip && !disabled && hangulValue && (
                    <div className="absolute top-full right-0 mt-2 text-xs font-semibold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-lg shadow-indigo-500/10 z-20 pointer-events-none transition-all duration-200 opacity-0 group-focus-within:opacity-100 -translate-y-2 group-focus-within:translate-y-0">
                        {hangulValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export const HelpTooltip = ({ content, className = '' }: { content: React.ReactNode, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative inline-block ml-1.5 align-middle ${className} ${isOpen ? 'z-50' : ''}`} ref={tooltipRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`text-slate-400 hover:text-indigo-600 transition-colors duration-200 ${isOpen ? 'text-indigo-600' : ''}`}
            >
                <HelpCircle size={16} />
            </button>
            
            {isOpen && (
                <div className="absolute z-[100] w-96 p-5 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700/50 text-left animate-in zoom-in-95 duration-200 mt-3 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wide">Help Guide</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed space-y-2 break-keep font-medium">
                        {content}
                    </div>
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 sm:left-2 sm:translate-x-0 w-3 h-3 bg-slate-900/95 border-t border-l border-slate-700/50 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

// Visual Selection Card Component
interface SelectionOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
    subLabel?: string;
}

export const SelectionGrid = ({ 
    options, 
    selectedId, 
    onChange, 
    cols = 3,
    disabled = false 
}: { 
    options: SelectionOption[], 
    selectedId: string, 
    onChange: (id: string) => void,
    cols?: number,
    disabled?: boolean
}) => {
    return (
        <div 
            className="grid gap-3 w-full" 
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
            {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(opt.id)}
                        className={`
                            relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center h-full w-full
                            ${isSelected 
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md shadow-indigo-100' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-[0.98]'}
                        `}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full p-0.5 shadow-sm">
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                        {opt.icon && (
                            <div className={`mb-3 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {opt.icon}
                            </div>
                        )}
                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {opt.label}
                        </span>
                        {opt.subLabel && (
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">{opt.subLabel}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
```

## components/Modals.tsx
```tsx
import React, { useState } from 'react';
import { X, HelpCircle, Calculator, Info, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TaxState } from '../types';
import { LAND_GRADE_TABLE, formatNumber, parseNumber } from '../utils/taxCalculations';
import { NumberInput } from './CommonComponents';

export const Pre1990CalcModal = ({ onClose, state, onChange }: { onClose: () => void, state: TaxState, onChange: (field: string, value: any) => void }) => {
    // Local state for live calculation in modal (syncs with parent via onChange, but we need derived values)
    
    const landArea = parseNumber(state.landArea);
    const unitTransfer = parseNumber(state.unitTransferOfficialPrice);
    
    // Transfer Price Calculation
    const totalTransfer = Math.floor(landArea * unitTransfer);

    // Acq Price Calculation Inputs
    const p90_1_1_unit = parseNumber(state.price1990Jan1);
    const v_acq_input = parseNumber(state.gradeAcq);
    const v_90_input = parseNumber(state.grade1990Aug30);
    const v_prev_input = parseNumber(state.gradePrev1990Aug30);

    // Derived Values
    const val_acq = LAND_GRADE_TABLE.get(v_acq_input);
    const val_90 = LAND_GRADE_TABLE.get(v_90_input);
    const val_prev = LAND_GRADE_TABLE.get(v_prev_input);
    const denominator = (val_90 + val_prev) / 2;

    let acqUnitPrice = 0;
    if (denominator > 0 && p90_1_1_unit > 0) {
        acqUnitPrice = Math.floor((p90_1_1_unit * val_acq) / denominator);
    }
    const totalAcq = Math.floor(landArea * acqUnitPrice);

    const applyResult = () => {
        // Apply Transfer Side
        onChange('unitTransferOfficialPrice', unitTransfer);
        onChange('transferOfficialPrice', totalTransfer);

        // Apply Acq Side
        onChange('unitOfficialPrice', acqUnitPrice);
        onChange('officialPrice', totalAcq);
        
        // 매입가액(실지거래가란)에도 자동 입력 요청 반영
        onChange('maega', totalAcq);

        onClose();
    };

    // Helper component for grade inputs
    const GradeInput = ({ label, value, field }: any) => {
        const gradeVal = LAND_GRADE_TABLE.get(parseNumber(value));
        return (
            <div>
                <NumberInput 
                    label={label} 
                    value={value} 
                    onChange={(v:any)=>onChange(field, v)} 
                    className="!mb-1"
                    hideTooltip={true}
                />
                <div className="text-right text-sm font-bold text-indigo-600 min-h-[1.5rem]">
                    {value && gradeVal > 0 ? `등급가액: ${formatNumber(gradeVal)}원` : ''}
                </div>
            </div>
        );
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-[800px] overflow-hidden animate-in zoom-in duration-200 my-8">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><Calculator size={20}/> 1990.8.30. 이전 취득 토지 환산</h3>
                    <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded transition-colors"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-8 bg-slate-50/50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* 1. 기본 정보 및 양도시 기준시가 */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">1</span> 
                            양도시 기준시가 계산
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <NumberInput 
                                label="토지면적" 
                                value={state.landArea} 
                                onChange={(v:any)=>onChange('landArea', v)} 
                                suffix="㎡" 
                                allowDecimal
                            />
                            <NumberInput 
                                label="양도시 공시지가 (㎡당)" 
                                value={state.unitTransferOfficialPrice} 
                                onChange={(v:any)=>onChange('unitTransferOfficialPrice', v)} 
                                suffix="원"
                            />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">양도시 기준시가 총액</span>
                            <span className="text-lg font-bold text-slate-900">{formatNumber(totalTransfer)}원</span>
                        </div>
                    </div>

                    {/* 2. 취득시 기준시가 (환산) */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                             <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">2</span>
                             취득시 기준시가 상세 계산 (의제취득일 적용)
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 items-start">
                            <NumberInput label="1990.1.1. 기준시가(㎡)" value={state.price1990Jan1} onChange={(v:any)=>onChange('price1990Jan1', v)} suffix="원" />
                            <GradeInput label="취득당시 등급" value={state.gradeAcq} field="gradeAcq" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 items-start">
                            <GradeInput label="1990.8.30. 등급" value={state.grade1990Aug30} field="grade1990Aug30" />
                            <GradeInput label="1990.8.30. 직전등급" value={state.gradePrev1990Aug30} field="gradePrev1990Aug30" />
                        </div>

                        {/* 상세 계산 내역 디스플레이 */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                            <div className="text-xs text-indigo-800 font-medium mb-1 flex items-center gap-1">
                                <Info size={12}/> 계산 상세 내역
                            </div>
                            
                            {/* 수식 표현 */}
                            <div className="bg-white p-3 rounded border border-indigo-100 text-center space-y-2">
                                <div className="text-xs text-slate-400 mb-1">취득당시 기준시가(단가) 산출식</div>
                                <div className="font-mono text-sm text-slate-700">
                                    {`(${formatNumber(p90_1_1_unit)} × ${formatNumber(val_acq)})`}
                                    <div className="h-px bg-slate-300 w-full my-1"></div>
                                    {`(${formatNumber(val_90)} + ${formatNumber(val_prev)}) ÷ 2`}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <span className="block text-xs text-indigo-500 mb-1">계산된 ㎡당 단가</span>
                                    <span className="block text-base font-bold text-indigo-700">{formatNumber(acqUnitPrice)}원</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-indigo-500 mb-1">총 취득가액 ({state.landArea}㎡)</span>
                                    <span className="block text-xl font-extrabold text-indigo-700">{formatNumber(totalAcq)}원</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                    <button onClick={onClose} className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">닫기</button>
                    <button 
                        onClick={applyResult} 
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        계산 결과 적용하기 <ChevronRight size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const InstallmentInfoModal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<'income' | 'nong'>('income');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><HelpCircle size={20}/> 분납 제도 안내</h3>
                    <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded"><X size={20}/></button>
                </div>
                
                <div className="flex border-b border-slate-200">
                    <button onClick={()=>setTab('income')} className={`flex-1 py-3 text-sm font-bold ${tab==='income' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>양도소득세</button>
                    <button onClick={()=>setTab('nong')} className={`flex-1 py-3 text-sm font-bold ${tab==='nong' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>농어촌특별세</button>
                </div>

                <div className="p-6 text-sm text-slate-700 space-y-4 max-h-[70vh] overflow-y-auto">
                    {tab === 'income' ? (
                        <>
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <p className="font-bold text-indigo-900 mb-1">근거 법령: 소득세법 제118조</p>
                                <p>납부할 세액이 <span className="font-bold text-indigo-700">1천만원을 초과</span>하는 경우, 2개월 이내 분할 납부 가능.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="border border-slate-200 rounded-lg p-3">
                                    <strong className="block text-slate-900 mb-2 border-b pb-1">1. 납부세액 2천만원 이하</strong>
                                    <p className="mb-1">1천만원 초과금액 분납 가능</p>
                                    <p className="text-xs text-slate-500">예) 1,500만원 → 1,000만원(기한내) + 500만원(분납)</p>
                                </div>
                                <div className="border border-slate-200 rounded-lg p-3">
                                    <strong className="block text-slate-900 mb-2 border-b pb-1">2. 납부세액 2천만원 초과</strong>
                                    <p className="mb-1">세액의 50% 이하 금액 분납 가능</p>
                                    <p className="text-xs text-slate-500">예) 3,600만원 → 1,800만원(기한내) + 1,800만원(분납)</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <p className="font-bold text-indigo-900 mb-1">근거 법령: 농어촌특별세법 제10조</p>
                                <p>농어촌특별세액이 <span className="font-bold text-indigo-700">500만원을 초과</span>하는 경우, 2개월 이내 분할 납부 가능.</p>
                            </div>
                             <div className="space-y-3">
                                <div className="border border-slate-200 rounded-lg p-3">
                                    <strong className="block text-slate-900 mb-2 border-b pb-1">1. 납부세액 1천만원 이하</strong>
                                    <p className="mb-1">500만원 초과금액 분납 가능</p>
                                    <p className="text-xs text-slate-500">예) 800만원 → 500만원(기한내) + 300만원(분납)</p>
                                </div>
                                <div className="border border-slate-200 rounded-lg p-3">
                                    <strong className="block text-slate-900 mb-2 border-b pb-1">2. 납부세액 1천만원 초과</strong>
                                    <p className="mb-1">세액의 50% 이하 금액 분납 가능</p>
                                    <p className="text-xs text-slate-500">예) 1,400만원 → 700만원(기한내) + 700만원(분납)</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="bg-slate-50 px-6 py-3 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700">닫기</button>
                </div>
            </div>
        </div>
    );
};

export const NongteukseInfoModal = ({ onClose }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-[450px] animate-in zoom-in duration-200 overflow-hidden">
            <div className="bg-slate-800 px-5 py-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Info size={18}/> 농어촌특별세 비과세 대상</h3>
                <button onClick={onClose}><X size={18}/></button>
            </div>
            <div className="p-6 text-sm text-slate-700 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">농어촌특별세란?</p>
                    <p className="leading-relaxed">조세특례제한법 등에 의해 소득세를 감면받는 경우, 그 <span className="text-rose-600 font-bold">감면세액의 20%</span>를 농어촌특별세로 납부해야 합니다.</p>
                </div>

                <div>
                    <strong className="block text-indigo-700 mb-2 border-b border-indigo-100 pb-1">비과세 (납부 면제) 대상</strong>
                    <ul className="space-y-2">
                        <li className="flex gap-2 items-start">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0"/>
                            <span><b>8년 자경 농지 감면</b> (조특법 제133조)</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0"/>
                            <span><b>서민주택</b> (국민주택규모 85㎡ 이하)</span>
                        </li>
                    </ul>
                </div>

                 <div>
                    <strong className="block text-rose-700 mb-2 border-b border-rose-100 pb-1">과세 (20% 납부) 대상</strong>
                    <ul className="space-y-2">
                         <li className="flex gap-2 items-start">
                            <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0"/>
                            <span>공익사업용 토지 감면 (현금/채권 보상)</span>
                        </li>
                        <li className="flex gap-2 items-start">
                            <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0"/>
                            <span>대토보상 감면, 개발제한구역 지정 감면 등</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 text-right">
                <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700">확인</button>
            </div>
        </div>
    </div>
);

export const BisatoInfoModal = ({ onClose }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-[500px] animate-in zoom-in duration-200 overflow-hidden">
            <div className="bg-slate-800 px-5 py-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Info size={18}/> 비사업용 토지 판단 기준</h3>
                <button onClick={onClose}><X size={18}/></button>
            </div>
            <div className="p-6 text-sm text-slate-700 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                    <p className="font-bold text-slate-900 border-l-4 border-indigo-500 pl-3">비사업용 토지란?</p>
                    <p className="leading-relaxed pl-3 text-slate-600">
                        나대지, 부재지주 소유 임야 등 토지를 본래 용도에 사용하지 않는 것을 말합니다.
                        <br/><span className="text-rose-600 font-bold">→ 기본세율 + 10%p 중과세</span> (장기보유특별공제는 적용 가능)
                    </p>
                </div>

                <div className="space-y-3">
                    <strong className="block text-indigo-700 border-b border-indigo-100 pb-1">주요 사업용 인정 (제외) 대상</strong>
                    
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <strong className="block text-slate-800 mb-1">1. 농지 (전, 답, 과수원)</strong>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                            <li>소유자가 농지 소재지에 거주하며 자경(재촌·자경)</li>
                            <li>시 이상 주거/상업/공업 지역 내의 농지는 비사업용으로 봄 (일부 예외 있음)</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <strong className="block text-slate-800 mb-1">2. 임야</strong>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                            <li>임야 소재지에 거주하는 자가 소유한 임야 (재촌)</li>
                            <li>공익상 필요한 임야 (보안림, 산림보호구역 등)</li>
                        </ul>
                    </div>
                     <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <strong className="block text-slate-800 mb-1">3. 주택 부수토지</strong>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                            <li>수도권 주거·상업·공업지역: 주택 정착면적의 <b>3배</b></li>
                            <li>수도권 녹지·기타 및 도시지역 밖: <b>5배 ~ 10배</b></li>
                            <li>위 배율을 초과하는 토지는 비사업용으로 간주</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <strong className="block text-slate-800 mb-1">4. 무조건 사업용 의제 (기간 요건 배제)</strong>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                            <li>직계존속이 <b>8년 이상 자경</b>한 농지를 상속/증여받은 경우</li>
                            <li>상속받은 농지로서 상속개시일로부터 <b>5년 이내</b> 양도하는 경우</li>
                            <li>종중 소유 농지 (2005.12.31 이전 취득분) 등</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-rose-50 p-3 rounded border border-rose-100 text-xs text-rose-800">
                    <strong>※ 기간 기준 요건</strong><br/>
                    양도일 직전 3년 중 2년, 5년 중 3년, 또는 전체 보유기간의 60% 이상을 사업용으로 사용해야 사업용 토지로 인정받습니다.
                </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 text-right">
                <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700">확인</button>
            </div>
        </div>
    </div>
);
```

## components/TaxForm.tsx
```tsx
import React, { useEffect } from 'react';
import { 
    FileText, HelpCircle, Building2, Info, Gift, 
    Home, Building, TreePine, FileCheck, Tractor, Stamp,
    Briefcase, Calendar, Gavel, Scale, AlertTriangle, Layers, Wallet, CheckCircle2, Calculator, RefreshCw, X,
    UserMinus, UserPlus, Lock
} from 'lucide-react';
import { TaxState, TaxResult } from '../types';
import { Section, InputRow, NumberInput, commonInputClass, HelpTooltip, SelectionGrid } from './CommonComponents';
import { formatNumber, parseNumber, isLandLike } from '../utils/taxCalculations';

interface TaxFormProps {
    state: TaxState;
    result: TaxResult;
    set: (field: string, value: any) => void;
    setNested: (field: string, subField: string, value: any) => void;
    handlers: {
        onOpenNongTooltip: () => void;
        onOpenBisatoTooltip: () => void;
        onOpenPre1990Modal: () => void;
        onOpenInstallmentTooltip: () => void;
    };
    isPre1985: boolean;
}

export default function TaxForm({ state, result, set, setNested, handlers, isPre1985 }: TaxFormProps) {
    // 2009.3.16 ~ 2012.12.31 취득 토지는 사업용으로 의제됨 (비사업용 예외)
    const isBusinessLandFixed = 
        isLandLike(state.assetType) && 
        state.acquisitionDate >= '2009-03-16' && 
        state.acquisitionDate <= '2012-12-31';

    // 자동 사업용 토지 적용
    useEffect(() => {
        if (isBusinessLandFixed) {
            if (state.landUseType !== 'business') {
                set('landUseType', 'business');
            }
        }
    }, [isBusinessLandFixed, state.landUseType, set]);

    const showConstructionPenaltyAlert = result.constructionPenalty > 0;
    
    const showPre1990CalcButton = 
        isLandLike(state.assetType) && 
        state.isPre1990 && 
        ['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause);
    
    const isBurdenGift = state.yangdoCause === 'burden_gift';
    const isInheritanceOrGift = ['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause);
    
    // 상속이거나 이월과세 증여인 경우 당초취득일 입력 필요
    const showOrigDateInput = ['gift_carryover', 'inheritance'].includes(state.acquisitionCause);

    const handleAcqDateChange = (val: string) => {
        if (val && val < '1985-01-01') {
            alert("1985년 1월 1일 이전에 취득한 부동산은 소득세법 시행령 제162조 제6항에 따라 1985년 1월 1일을 취득일로 간주합니다.");
            set('acquisitionDate', '1985-01-01');
        } else {
            set('acquisitionDate', val);
        }
    };

    return (
        <div className="space-y-8 animate-in">
            <Section title="신고 유형 및 기한" number={1}>
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-600 mb-3 ml-1">신고 유형 선택</label>
                    <SelectionGrid
                        cols={3}
                        selectedId={state.declarationType}
                        onChange={(id) => set('declarationType', id)}
                        options={[
                            { id: 'regular', label: '예정신고', subLabel: '양도일 2개월 이내', icon: <Calendar size={20}/> },
                            { id: 'after_deadline', label: '기한후신고', subLabel: '기한 경과 후', icon: <AlertTriangle size={20}/> },
                            { id: 'amended', label: '수정신고', subLabel: '내용 수정/보완', icon: <FileText size={20}/> },
                        ]}
                    />
                </div>
                
                {state.declarationType === 'amended' && (
                    <div className="mb-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in">
                        <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <FileText size={16}/> 당초 신고세액 (기납부 세액)
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <NumberInput 
                                label="당초 신고세액 (양도소득세)" 
                                value={state.initialIncomeTax} 
                                onChange={(v:any)=>set('initialIncomeTax', v)} 
                                placeholder="0"
                                suffix="원" 
                            />
                            <NumberInput 
                                label="당초 신고세액 (농어촌특별세)" 
                                value={state.initialNongteukse} 
                                onChange={(v:any)=>set('initialNongteukse', v)} 
                                placeholder="0"
                                suffix="원" 
                            />
                        </div>
                        <p className="text-xs text-indigo-600 mt-2 ml-1 font-medium">※ 수정신고 시 가산세는 (산출세액 - 기납부세액)을 기준으로 계산됩니다.</p>
                    </div>
                )}

                {state.declarationType !== 'amended' && (
                    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex flex-row items-center justify-between gap-4 mb-4">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Layers size={18} className="text-slate-500"/> 금년 중 다른 부동산 등을 양도한 사실이 있습니까?
                            </h3>
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                                <button 
                                    onClick={() => set('hasPriorDeclaration', false)}
                                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${!state.hasPriorDeclaration ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    없음 (최초)
                                </button>
                                <button 
                                    onClick={() => set('hasPriorDeclaration', true)}
                                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${state.hasPriorDeclaration ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    있음 (합산)
                                </button>
                            </div>
                        </div>

                        {state.hasPriorDeclaration && (
                            <div className="animate-in pt-4 border-t border-slate-200">
                                <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                                    <div className="leading-relaxed">
                                        <span className="font-bold block mb-0.5 text-rose-800">합산신고 주의사항</span>
                                        본 계산기는 <b>감면대상 소득이 포함된 기신고 내역과의 합산은 지원하지 않습니다.</b><br/>
                                        <span className="opacity-80">이전 양도 건에 감면 신청 내역(조특법 감면 등)이 있다면 세무 전문가와 상담하세요.</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <NumberInput 
                                        label="기신고 양도소득금액 (과세표준 아님)" 
                                        value={state.priorIncomeAmount} 
                                        onChange={(v:any)=>set('priorIncomeAmount', v)} 
                                        placeholder="0"
                                        suffix="원" 
                                    />
                                    <NumberInput 
                                        label="기신고 결정세액 (기납부세액)" 
                                        value={state.priorTaxAmount} 
                                        onChange={(v:any)=>set('priorTaxAmount', v)} 
                                        placeholder="0"
                                        suffix="원" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">실제신고일자</label>
                        <input type="date" value={state.reportDate} onChange={e=>set('reportDate', e.target.value)} className={commonInputClass}/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">{state.declarationType === 'regular' ? '납부기한(자동)' : '납부예정일자'}</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={state.paymentDate} 
                                onChange={e=>set('paymentDate', e.target.value)} 
                                readOnly={state.declarationType === 'regular'}
                                disabled={state.declarationType === 'regular'}
                                className={state.declarationType === 'regular' ? `${commonInputClass} bg-slate-100 text-slate-500 cursor-not-allowed` : commonInputClass}
                            />
                            {state.declarationType === 'regular' && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="인적사항 및 소재지" number={2}>
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Seller Card */}
                    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group h-full">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                        <h4 className="font-bold text-indigo-900 mb-5 flex items-center gap-2.5 text-base border-b border-indigo-50 pb-3">
                            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                                <UserMinus size={18} />
                            </div>
                            양도인 (파는 분)
                            <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-widest ml-auto bg-indigo-50 px-2 py-1 rounded">Transferor</span>
                        </h4>
                        <div className="space-y-3">
                            <InputRow label="양도인 성명" value={state.transferorInfo.name} onChange={(v:any)=>setNested('transferorInfo','name',v)} className="!mb-0"/>
                            <InputRow label="양도인 주민등록번호" value={state.transferorInfo.ssn} onChange={(v:any)=>setNested('transferorInfo','ssn',v)} placeholder="123456-1234567" className="!mb-0"/>
                            <InputRow label="양도인 전화번호" value={state.transferorInfo.phone} onChange={(v:any)=>setNested('transferorInfo','phone',v)} placeholder="010-1234-5678" className="!mb-0"/>
                        </div>
                    </div>

                    {/* Buyer Card */}
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group h-full">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <h4 className="font-bold text-emerald-900 mb-5 flex items-center gap-2.5 text-base border-b border-emerald-50 pb-3">
                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                                <UserPlus size={18} />
                            </div>
                            양수인 (사는 분)
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest ml-auto bg-emerald-50 px-2 py-1 rounded">Transferee</span>
                        </h4>
                        <div className="space-y-3">
                            <InputRow label="양수인 성명" value={state.transfereeInfo.name} onChange={(v:any)=>setNested('transfereeInfo','name',v)} className="!mb-0"/>
                            <InputRow label="양수인 주민등록번호" value={state.transfereeInfo.ssn} onChange={(v:any)=>setNested('transfereeInfo','ssn',v)} placeholder="123456-1234567" className="!mb-0"/>
                        </div>
                    </div>
                </div>
                <InputRow label="부동산 소재지 (전체 주소)" value={state.propertyAddress} onChange={(v:any)=>set('propertyAddress', v)} placeholder="예: 서울특별시 강남구 테헤란로 123"/>
            </Section>

            <Section title="자산 정보" number={3}>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-600 mb-3 ml-1">자산 종류 선택</label>
                    <SelectionGrid
                        cols={4}
                        selectedId={state.assetType}
                        onChange={(id) => set('assetType', id)}
                        options={[
                            { id: '일반주택', label: '일반주택', icon: <Home size={22}/> },
                            { id: '1세대1주택_고가주택', label: '1세대 1주택', subLabel: '고가주택(비과세)', icon: <CheckCircle2 size={22}/> },
                            { id: '상가/건물', label: '상가/건물', icon: <Building size={22}/> },
                            { id: '토지', label: '토지', subLabel: '나대지/잡종지', icon: <TreePine size={22}/> },
                            { id: '분양권', label: '아파트분양권', icon: <FileCheck size={22}/> },
                            { id: '조합원입주권', label: '입주권', icon: <Building2 size={22}/> },
                            { id: '자경/대토 농지', label: '농지', subLabel: '자경/대토', icon: <Tractor size={22}/> },
                            { id: '미등기', label: '미등기 자산', icon: <Stamp size={22}/> },
                        ]}
                    />
                </div>

                {isLandLike(state.assetType) && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 animate-in">
                        <NumberInput label="토지면적" value={state.landArea} onChange={(v:any)=>set('landArea', v)} suffix="㎡" allowDecimal />
                        
                        <div className="mt-6 pt-6 border-t border-slate-200">
                             <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-slate-700">비사업용 토지 여부</label>
                                <button type="button" onClick={handlers.onOpenBisatoTooltip} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm transition-colors">
                                    <HelpCircle size={14}/> 판단기준 보기
                                </button>
                            </div>
                            
                            <SelectionGrid
                                cols={2}
                                selectedId={state.landUseType}
                                onChange={(id) => set('landUseType', id)}
                                disabled={isBusinessLandFixed}
                                options={[
                                    { id: 'business', label: '사업용 토지', subLabel: '일반 세율 적용', icon: <CheckCircle2 size={20}/> },
                                    { id: 'non-business', label: '비사업용 토지', subLabel: '중과세율(+10%) 적용', icon: <AlertTriangle size={20}/> },
                                ]}
                            />

                            {state.landUseType === 'non-business' && (
                                <div className="mt-4 p-4 rounded-xl border border-indigo-200 bg-white shadow-sm flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={state.isBisatoException} 
                                        onChange={e=>set('isBisatoException', e.target.checked)} 
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-slate-800">비사업용 중과배제 (일반세율 적용)</span>
                                        <p className="text-xs text-slate-500 mt-0.5">8년 자경 농지 상속 등 무조건 사업용으로 의제되는 경우 체크</p>
                                    </div>
                                    <HelpTooltip content={
                                        <div>
                                            <strong className="block mb-1 text-white">무조건 사업용 의제 (중과 배제)</strong>
                                            <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                                <li>직계존속이 <b>8년 이상 재촌·자경</b>한 농지를 상속·증여받은 경우</li>
                                                <li>상속받은 농지를 상속개시일로부터 <b>5년 이내</b> 양도하는 경우</li>
                                                <li>2009.3.16 ~ 2012.12.31 기간 중 취득한 토지</li>
                                            </ul>
                                        </div>
                                    }/>
                                </div>
                            )}

                             {isBusinessLandFixed && (
                                <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1.5 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <CheckCircle2 size={14}/> 2009.3.16~2012.12.31 취득분은 법령에 따라 사업용 토지로 간주됩니다.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {showConstructionPenaltyAlert && (
                    <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 animate-in shadow-sm">
                        <div className="p-3 bg-white rounded-xl text-amber-500 shadow-sm border border-amber-100"><Building2 size={24}/></div>
                        <div className="flex-1 pt-1">
                            <h5 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                                건물 신축 후 5년 이내 양도 (가산세 적용)
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded border border-amber-200 uppercase font-bold tracking-wide">Auto Detect</span>
                            </h5>
                            <p className="text-sm text-amber-800/80 mb-3 leading-relaxed">
                                환산취득가액 적용 시, 신축 후 5년 이내 양도하는 경우 <b>환산취득가액의 5%</b>가 가산세로 부과됩니다.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-white px-3 py-1.5 rounded-lg border border-amber-100/50 shadow-sm inline-block">
                                <span>예상 가산세액: {formatNumber(result.constructionPenalty)}원</span>
                                <HelpTooltip content={
                                    <div>
                                        <strong className="block mb-1 text-white">신축가산세 (소득세법 제114조의2)</strong>
                                        <p className="text-slate-300 mb-2">건물을 신축(증축 포함)하고 취득일로부터 5년 이내에 양도하는 경우로서, 취득가액을 환산가액 또는 감정가액으로 하는 경우 해당 건물 환산취득가액의 5%를 결정세액에 더합니다.</p>
                                    </div>
                                }/>
                            </div>
                        </div>
                    </div>
                )}
            </Section>

            <Section title="양도 및 취득시기" number={4}>
                <div className="space-y-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-3 ml-1">양도원인</label>
                        <SelectionGrid
                            cols={5}
                            selectedId={state.yangdoCause}
                            onChange={(id) => set('yangdoCause', id)}
                            options={[
                                { id: 'sale', label: '매매', icon: <Briefcase size={18}/> },
                                { id: 'expropriation', label: '수용', icon: <Gavel size={18}/> },
                                { id: 'auction', label: '경매/공매', icon: <Scale size={18}/> },
                                { id: 'burden_gift', label: '부담부증여', icon: <Gift size={18}/> },
                                { id: 'exchange', label: '교환', icon: <RefreshCw size={18}/> },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-3 ml-1">취득원인</label>
                        <SelectionGrid
                            cols={3}
                            selectedId={state.acquisitionCause}
                            onChange={(id) => set('acquisitionCause', id)}
                            options={[
                                { id: 'sale', label: '매매', icon: <Briefcase size={18}/> },
                                { id: 'construction', label: '신축', icon: <Building2 size={18}/> },
                                { id: 'auction', label: '경매/공매', icon: <Scale size={18}/> },
                                { id: 'inheritance', label: '상속', icon: <FileText size={18}/> },
                                { id: 'gift', label: '증여', icon: <Gift size={18}/> },
                                { id: 'gift_carryover', label: '증여(이월)', subLabel: '이월과세 적용', icon: <Layers size={18}/> },
                            ]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">양도일자 (잔금일)</label>
                        <input type="date" value={state.yangdoDate} onChange={e=>set('yangdoDate', e.target.value)} className={commonInputClass}/>
                    </div>

                    <div>
                         <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">
                            {state.acquisitionCause === 'inheritance' ? '상속개시일 (사망일)' : 
                             state.acquisitionCause === 'gift' || state.acquisitionCause === 'gift_carryover' ? '증여일 (등기접수일)' : 
                             '취득일자'}
                             <HelpTooltip content={
                                <div>
                                    <strong className="block mb-1 text-white">취득시기 판정 기준</strong>
                                    <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                        <li>일반 매매: 잔금청산일과 등기접수일 중 빠른 날</li>
                                        <li>신축: 사용승인일과 실제 사용일 중 빠른 날</li>
                                        <li>상속: 상속개시일 (피상속인 사망일)</li>
                                        <li>증여: 증여등기 접수일</li>
                                        <li>경매: 경락대금 완납일</li>
                                    </ul>
                                </div>
                             }/>
                         </label>
                         <input type="date" value={state.acquisitionDate} onChange={e=>handleAcqDateChange(e.target.value)} className={commonInputClass}/>
                         {state.acquisitionDate && state.acquisitionDate < '1985-01-01' && (
                            <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 inline-block px-2 py-1 rounded">※ 1985.1.1. 의제취득일 적용</p>
                         )}
                    </div>
                </div>

                {showOrigDateInput && (
                    <div className="mt-6 pt-6 border-t border-slate-200 animate-in">
                        <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">
                            {state.acquisitionCause === 'inheritance' ? '피상속인 당초 취득일 (세율 산정용)' : '당초 증여자 취득일 (이월과세 적용)'}
                            <HelpTooltip content={
                                <div>
                                    <strong className="block mb-1 text-white">당초 취득일 적용 기준</strong>
                                    <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                        {state.acquisitionCause === 'inheritance' ? (
                                            <>
                                                <li><b>세율 적용:</b> 피상속인의 취득일부터 기산 (소득세법 제104조제2항제1호)</li>
                                                <li><b>장기보유특별공제:</b> 상속개시일(취득일)부터 기산 (소득세법 제95조제4항)</li>
                                            </>
                                        ) : (
                                            <li><b>이월과세:</b> 취득가액 및 보유기간(세율·장특공제) 모두 증여자의 당초 취득일 기준으로 판단 (소득세법 제97조의2제1항)</li>
                                        )}
                                    </ul>
                                </div>
                            }/>
                        </label>
                        <input type="date" value={state.origAcquisitionDate} onChange={e=>set('origAcquisitionDate', e.target.value)} className={commonInputClass}/>
                    </div>
                )}

                {isBurdenGift && (
                    <div className="mt-8 p-6 bg-purple-50 border border-purple-100 rounded-2xl animate-in shadow-sm">
                        <h4 className="font-bold text-purple-900 mb-5 flex items-center gap-2 text-lg">
                            <Gift size={20}/> 부담부증여 상세 정보
                        </h4>
                        
                        <div className="mb-6">
                             <label className="block text-sm font-semibold text-purple-900 mb-3 ml-1">증여재산 평가방법 (전체금액)</label>
                             <div className="flex bg-white rounded-xl p-1.5 border border-purple-100 shadow-sm w-fit">
                                {[
                                    {id:'market', label:'시가 (매매사례가)'},
                                    {id:'official', label:'기준시가'}
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={()=>set('giftEvaluationMethod', opt.id)}
                                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${state.giftEvaluationMethod===opt.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-purple-50'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <NumberInput 
                                label="증여재산 평가액 (전체)" 
                                value={state.giftValue} 
                                onChange={(v:any)=>set('giftValue', v)} 
                                suffix="원"
                                placeholder="증여세 신고된 자산가액"
                            />
                            <div className="col-span-2 border-t border-purple-200/50"></div>
                            
                            <NumberInput 
                                label="임대보증금 (인수채무)" 
                                value={state.burdenDebtDeposit} 
                                onChange={(v:any)=>set('burdenDebtDeposit', v)} 
                                suffix="원"
                            />
                            <NumberInput 
                                label="금융기관 대출금 (인수채무)" 
                                value={state.burdenDebtLoan} 
                                onChange={(v:any)=>set('burdenDebtLoan', v)} 
                                suffix="원"
                            />
                        </div>
                        <div className="mt-4 bg-white p-4 rounded-xl border border-purple-100 flex justify-between items-center shadow-sm">
                            <span className="text-sm font-bold text-purple-700">총 인수채무액 (양도가액)</span>
                            <span className="text-xl font-black text-purple-900 tracking-tight">{formatNumber(state.debtAmount)}원</span>
                        </div>
                    </div>
                )}
            </Section>

            <Section title="양도가액 및 취득가액" number={5}>
                <div className="mb-8">
                    <NumberInput 
                        label={isBurdenGift ? "양도가액 (인수채무액 자동반영)" : "양도가액 (실지거래가액)"}
                        value={state.yangdoPrice} 
                        onChange={(v:any)=>set('yangdoPrice', v)} 
                        suffix="원" 
                        disabled={isBurdenGift}
                    >
                        <HelpTooltip content={
                            <div>
                                <strong className="block mb-1 text-white">양도원인별 실지거래가액 기준</strong>
                                <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                    <li>매매: 거래 당사자 간 실제 거래된 가액</li>
                                    <li>수용: 보상금액 총액</li>
                                    <li>부담부증여: 수증자가 인수하는 채무액 전액</li>
                                    <li>경매: 경락가액</li>
                                </ul>
                            </div>
                        } className="mt-0.5" />
                    </NumberInput>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-200 pb-5">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-lg">취득가액 산정방법</h4>
                             {isInheritanceOrGift && !isBurdenGift && (
                                <HelpTooltip content={
                                    <div>
                                        <strong className="block mb-1 text-white">상속·증여 재산의 평가</strong>
                                        <p className="text-slate-300 mb-2">취득가액은 상속개시일(증여일) 현재의 '시가'를 원칙으로 합니다.</p>
                                    </div>
                                } />
                            )}
                        </div>
                        
                        <div className="flex bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm w-full sm:w-auto">
                            {[
                                {id:'actual', label:'실지거래가액'}, 
                                {id:'converted', label:'환산취득가액'},
                                {id:'official', label:'기준시가'}
                            ].map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={()=>set('acqPriceMethod', m.id)}
                                    disabled={state.yangdoCause === 'burden_gift' && state.giftEvaluationMethod === 'official' && m.id !== 'official'}
                                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                                        state.acqPriceMethod===m.id 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {state.acqPriceMethod === 'actual' ? (
                        <div className="grid grid-cols-2 gap-6 animate-in">
                            <NumberInput label="매입가액 (건물분 부가세 제외)" value={state.acqPriceActual.maega} onChange={(v:any)=>setNested('acqPriceActual','maega',v)} suffix="원" />
                            <NumberInput label="취등록세 등 (법무사 비용 포함)" value={state.acqPriceActual.acqTax} onChange={(v:any)=>setNested('acqPriceActual','acqTax',v)} suffix="원" />
                            <NumberInput 
                                label="기타비용 (소송비용 등)" 
                                value={state.acqPriceActual.other} 
                                onChange={(v:any)=>setNested('acqPriceActual','other',v)} 
                                suffix="원" 
                            >
                                <HelpTooltip content={
                                    <div>
                                        <strong className="block mb-1 text-white">기타 필요경비</strong>
                                        <p className="text-slate-300">소유권 확보를 위한 소송비용, 화해비용 등</p>
                                    </div>
                                } className="mt-0.5" />
                            </NumberInput>
                            <NumberInput label="중개수수료 (취득시)" value={state.acqPriceActual.acqBrokerage} onChange={(v:any)=>setNested('acqPriceActual','acqBrokerage',v)} suffix="원" />
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in">
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-800 shadow-sm">
                                <Info size={18} className="text-indigo-600"/>
                                {state.acqPriceMethod === 'converted' 
                                    ? "환산가액 = 양도가액 × (취득시 기준시가 ÷ 양도시 기준시가)"
                                    : "기준시가 = 취득당시 공시가격 (안분율 적용)"}
                            </div>
                            
                            {showPre1990CalcButton && (
                                <button 
                                    onClick={handlers.onOpenPre1990Modal}
                                    className="w-full py-4 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 text-sm group"
                                >
                                    <Calculator size={18} className="group-hover:scale-110 transition-transform"/> 1990.8.30 이전 취득 토지 환산 계산기 열기
                                </button>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <NumberInput label="취득시 기준시가 (전체)" value={state.officialPrice} onChange={(v:any)=>set('officialPrice', v)} suffix="원" />
                                {state.acqPriceMethod === 'converted' && (
                                    <NumberInput label="양도시 기준시가 (전체)" value={state.transferOfficialPrice} onChange={(v:any)=>set('transferOfficialPrice', v)} suffix="원" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="필요경비" number={6}>
                 <div className="grid grid-cols-2 gap-6">
                    {state.acqPriceMethod === 'converted' ? (
                        <div className="col-span-2 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-slate-600 ml-1">경비 공제 방식 선택</span>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                     <button 
                                        onClick={()=>set('useActualExpenseWithConverted', false)}
                                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${!state.useActualExpenseWithConverted ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        개산공제 (3%)
                                    </button>
                                    <button 
                                        onClick={()=>set('useActualExpenseWithConverted', true)}
                                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${state.useActualExpenseWithConverted ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        실제 필요경비 입증
                                    </button>
                                </div>
                            </div>

                            {state.useActualExpenseWithConverted ? (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in">
                                    <div className="mb-6 text-sm text-indigo-800 flex gap-3 items-start bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <Info size={16} className="shrink-0 mt-0.5 text-indigo-600"/>
                                        <span className="leading-relaxed">
                                            <b>자본적지출액 특례 적용 중</b><br/>
                                            실제 지출한 [자본적지출액 + 양도중개수수료] 합계액이 개산공제액보다 큰 경우 유리합니다.<br/>
                                            <span className="text-xs opacity-70 mt-1 block">※ 이 경우 환산취득가액은 0원으로 간주되며 오직 입증된 경비만 공제됩니다.</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                         <NumberInput 
                                            label="자본적지출액 (발코니확장, 샷시 등)" 
                                            value={state.expenseActual.repair} 
                                            onChange={(v:any)=>setNested('expenseActual','repair',v)} 
                                            suffix="원" 
                                        />
                                        <NumberInput 
                                            label="중개수수료 (양도시)" 
                                            value={state.expenseActual.sellBrokerage} 
                                            onChange={(v:any)=>setNested('expenseActual','sellBrokerage',v)} 
                                            suffix="원" 
                                        />
                                        <NumberInput 
                                            label="기타비용 (공증비용 등)" 
                                            value={state.expenseActual.other} 
                                            onChange={(v:any)=>setNested('expenseActual','other',v)} 
                                            suffix="원" 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between animate-in">
                                    <div>
                                        <h5 className="font-bold text-slate-800 mb-1">개산공제 자동 적용</h5>
                                        <p className="text-sm text-slate-500">취득당시 기준시가(환산취득 시 기준시가)의 3% 적용</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs text-slate-500 mb-1">예상 공제액</span>
                                        <span className="text-lg font-bold text-slate-900">{formatNumber(result.expense)}원</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                             <NumberInput 
                                label="자본적지출액 (발코니확장, 샷시 등)" 
                                value={state.expenseActual.repair} 
                                onChange={(v:any)=>setNested('expenseActual','repair',v)} 
                                suffix="원" 
                            >
                                <HelpTooltip content={
                                    <div>
                                        <strong className="block mb-1 text-white">자본적 지출액</strong>
                                        <p className="text-slate-300">자산의 가치를 증가시키거나 내용연수를 연장시키는 지출 (예: 샷시 설치, 발코니 확장, 보일러 교체 등)</p>
                                        <p className="text-slate-400 text-xs mt-2">※ 단순 수리비(도배, 장판, 싱크대 교체 등)는 제외됩니다.</p>
                                    </div>
                                } className="mt-0.5" />
                            </NumberInput>
                            <NumberInput label="중개수수료 (양도시)" value={state.expenseActual.sellBrokerage} onChange={(v:any)=>setNested('expenseActual','sellBrokerage',v)} suffix="원" />
                            <NumberInput 
                                label="기타비용 (공증비용 등)" 
                                value={state.expenseActual.other} 
                                onChange={(v:any)=>setNested('expenseActual','other',v)} 
                                suffix="원" 
                            />
                        </>
                    )}
                 </div>
            </Section>

            <Section title="세액감면 및 공제" number={7}>
                 <div className="grid grid-cols-2 gap-6 mb-6">
                    {state.assetType === '1세대1주택_고가주택' && (
                        <div className="col-span-2 mb-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in">
                            <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                <Home size={18}/> 1세대 1주택 보유/거주 기간 입력
                            </h4>
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <NumberInput 
                                    label="보유기간 (년) - 자동계산" 
                                    value={result.holdingForDed.years + "년"} 
                                    onChange={()=>{}} 
                                    disabled 
                                    className="!mb-0"
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-800 mb-2.5 ml-1">실거주 기간 (년)</label>
                                    <input 
                                        type="number" 
                                        value={state.residenceYears} 
                                        onChange={e => set('residenceYears', e.target.value)}
                                        className={commonInputClass}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-200/50">
                                <input 
                                    type="checkbox" 
                                    id="useResidenceSpecial"
                                    checked={state.useResidenceSpecial} 
                                    onChange={e=>set('useResidenceSpecial', e.target.checked)} 
                                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                />
                                <label htmlFor="useResidenceSpecial" className="text-sm font-bold text-emerald-800 cursor-pointer select-none flex-1">
                                    상생임대주택 등 거주요건 특례 적용 (실거주 2년 인정)
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="col-span-2 mb-6">
                         <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-slate-600 ml-1">세액 감면 신청</label>
                            <button type="button" onClick={handlers.onOpenNongTooltip} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm transition-colors">
                                <HelpCircle size={14}/> 농특세 비과세 대상?
                            </button>
                        </div>
                        <SelectionGrid
                            cols={2}
                            selectedId={state.taxExemptionType}
                            onChange={(id) => set('taxExemptionType', id)}
                            options={[
                                { id: 'none', label: '해당 없음', icon: <X size={18}/> },
                                { id: 'farm_8y', label: '8년 자경 농지', subLabel: '100% 감면 (한도 1억)', icon: <Tractor size={18}/> },
                                { id: 'public_cash_standard', label: '공익사업 수용', subLabel: '현금보상 (10%~15%)', icon: <Briefcase size={18}/> },
                                { id: 'custom', label: '기타 감면', subLabel: '직접 입력', icon: <Calculator size={18}/> },
                            ]}
                        />
                    </div>

                    {state.taxExemptionType === 'custom' && (
                        <div className="col-span-2 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in">
                             <NumberInput 
                                label="감면율 (%)" 
                                value={state.customRate} 
                                onChange={(v:any)=>set('customRate', v)} 
                                suffix="%" 
                                allowDecimal
                            />
                        </div>
                    )}

                    {state.taxExemptionType !== 'none' && (
                         <div className="col-span-2 p-4 rounded-xl border border-indigo-200 bg-white shadow-sm flex items-center gap-3 mb-6">
                            <input 
                                type="checkbox" 
                                id="isNongteukseExempt"
                                checked={state.isNongteukseExempt} 
                                onChange={e=>set('isNongteukseExempt', e.target.checked)} 
                                disabled={state.taxExemptionType === 'farm_8y'} // Farm 8y implies exempt
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                            />
                            <div className="flex-1">
                                <label htmlFor="isNongteukseExempt" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                                    농어촌특별세 비과세 신청
                                </label>
                                <p className="text-xs text-slate-500 mt-0.5">서민주택(85㎡이하) 또는 8년 자경 농지 감면 등은 비과세됩니다.</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="col-span-2 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <input 
                                type="checkbox" 
                                id="useCustomBasicDeduction"
                                checked={state.useCustomBasicDeduction} 
                                onChange={e=>set('useCustomBasicDeduction', e.target.checked)} 
                                disabled={state.hasPriorDeclaration}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                            />
                            <div>
                                <label htmlFor="useCustomBasicDeduction" className={`text-sm font-bold cursor-pointer select-none ${state.hasPriorDeclaration ? 'text-slate-400' : 'text-slate-800'}`}>
                                    양도소득기본공제 금액 직접 입력
                                </label>
                                {state.hasPriorDeclaration && <span className="text-xs text-indigo-600 block">※ 합산신고 시 연 250만원 한도가 자동 적용됩니다.</span>}
                            </div>
                        </div>
                        
                        {state.useCustomBasicDeduction && (
                            <div className="animate-in">
                                <NumberInput 
                                    label="기본공제 금액" 
                                    value={state.basicDeductionInput} 
                                    onChange={(v:any)=>set('basicDeductionInput', v)} 
                                    suffix="원" 
                                    disabled={state.hasPriorDeclaration}
                                />
                            </div>
                        )}
                    </div>
                 </div>
            </Section>

            <Section title="분할 납부 신청" number={8}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">납부할 세액이 일정 금액을 초과하는 경우 분할 납부를 신청할 수 있습니다.</p>
                    <button type="button" onClick={handlers.onOpenInstallmentTooltip} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm transition-colors">
                        <HelpCircle size={14}/> 분납 기준 안내
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className={`p-5 rounded-2xl border transition-all ${result.installmentMax > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <label className="block text-sm font-bold text-slate-800">양도소득세 분납</label>
                            {result.installmentMax > 0 ? (
                                <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">가능</span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">대상 아님</span>
                            )}
                        </div>
                        <NumberInput 
                            value={state.installmentInput} 
                            onChange={(v:any)=>set('installmentInput', v)} 
                            placeholder={result.installmentMax > 0 ? `최대 ${formatNumber(result.installmentMax)}원` : '납부세액 1천만원 초과 시'}
                            suffix="원" 
                            disabled={result.installmentMax <= 0}
                            className="!mb-0"
                            labelClassName="hidden"
                        />
                        {result.installmentMax > 0 && (
                            <p className="text-xs text-indigo-600 mt-2 text-right font-medium">
                                최대 분납가능금액: {formatNumber(result.installmentMax)}원
                            </p>
                        )}
                    </div>

                    <div className={`p-5 rounded-2xl border transition-all ${result.nongInstallmentMax > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <label className="block text-sm font-bold text-slate-800">농어촌특별세 분납</label>
                            {result.nongInstallmentMax > 0 ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100">가능</span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">대상 아님</span>
                            )}
                        </div>
                        <NumberInput 
                            value={state.nongInstallmentInput} 
                            onChange={(v:any)=>set('nongInstallmentInput', v)} 
                            placeholder={result.nongInstallmentMax > 0 ? `최대 ${formatNumber(result.nongInstallmentMax)}원` : '농특세 5백만원 초과 시'}
                            suffix="원" 
                            disabled={result.nongInstallmentMax <= 0}
                            className="!mb-0"
                            labelClassName="hidden"
                        />
                         {result.nongInstallmentMax > 0 && (
                            <p className="text-xs text-emerald-600 mt-2 text-right font-medium">
                                최대 분납가능금액: {formatNumber(result.nongInstallmentMax)}원
                            </p>
                        )}
                    </div>
                </div>
            </Section>
        </div>
    );
}
```

## components/TaxResultView.tsx
```tsx
import React from 'react';
import { Home, CheckCircle2, AlertCircle, Building2, ListChecks, FileText, RefreshCw, Printer, Layers, Info } from 'lucide-react';
import { TaxState, TaxResult } from '../types';
import { formatNumber } from '../utils/taxCalculations';

const SummaryCard = ({ result, state }: { result: TaxResult, state: TaxState }) => {
    const items = [];
    items.push({ icon: <Home size={14}/>, text: state.assetType, color: 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-1 ring-indigo-500/10' });
    if (state.assetType === '1세대1주택_고가주택') items.push({ icon: <CheckCircle2 size={14}/>, text: '1세대1주택(고가)', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-500/10' });
    if (result.longTerm.rate > 0) items.push({ icon: <CheckCircle2 size={14}/>, text: `장특공제 ${result.longTerm.desc}`, color: 'bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-500/10' });
    if (result.taxResult.rate > 45) items.push({ icon: <AlertCircle size={14}/>, text: '중과세율', color: 'bg-rose-50 text-rose-700 border-rose-100 ring-1 ring-rose-500/10' });
    if (result.constructionPenalty > 0) items.push({ icon: <Building2 size={14}/>, text: '신축가산세', color: 'bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-500/10' });
    if (result.incomePenalty.total > 0) items.push({ icon: <AlertCircle size={14}/>, text: `가산세 포함`, color: 'bg-rose-50 text-rose-700 border-rose-100 ring-1 ring-rose-500/10' });
    if (result.isAggregationApplied) items.push({ icon: <Layers size={14}/>, text: '합산과세', color: 'bg-purple-50 text-purple-700 border-purple-100 ring-1 ring-purple-500/10' });

    return (
        <div className="mb-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <ListChecks size={14}/> Applied Logic
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${item.color}`}>
                        {item.icon} {item.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

const ResultTableItem = ({ label, value, depth = 0, bold = false, colorClass = 'text-slate-800', subText, minus = false, plus = false, isLast = false }: any) => (
    <div className={`flex justify-between items-start py-3 border-b border-slate-50 relative group ${isLast ? 'border-none' : ''}`}>
        {depth > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 my-2 group-hover:bg-slate-200 transition-colors"></div> 
        )}
        <div className={`flex flex-col ${depth > 0 ? 'pl-4' : ''}`}>
            <span className={`${depth === 0 ? 'font-semibold text-[15px]' : 'text-sm font-medium'} ${colorClass} ${bold ? 'font-bold' : ''}`}>
                {label}
            </span>
            {subText && <span className="text-[11px] text-slate-400 mt-0.5 whitespace-pre-line font-medium">{subText}</span>}
        </div>
        <span className={`font-mono tabular-nums tracking-tight ${bold ? 'font-bold text-lg' : 'text-[15px] font-medium'} ${colorClass}`}>
            {minus ? '-' : ''}{plus ? '+' : ''}{typeof value === 'number' ? formatNumber(value) : value}
        </span>
    </div>
);

interface TaxResultViewProps {
    result: TaxResult;
    state: TaxState;
    onReset: () => void;
    onPrint: () => void;
}

export default function TaxResultView({ result, state, onReset, onPrint }: TaxResultViewProps) {
    return (
        <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur-xl bg-white/80 transition-all duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Tax</span>
                        <h2 className="font-bold text-xl flex items-center gap-2">세액 계산 결과</h2>
                    </div>
                    <FileText size={24} className="text-slate-400 opacity-50"/>
                </div>
            </div>
            
            <div className="p-8 bg-white">
                <SummaryCard result={result} state={state} />

                {/* 1. 양도차익 */}
                <div className="bg-slate-50/50 rounded-2xl p-6 mb-6 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 text-xs text-slate-600 font-bold">1</span> 
                        양도차익
                    </div>
                    <ResultTableItem label="양도가액" value={result.yangdoPrice} bold />
                    <ResultTableItem label="취득가액" value={result.acqPrice} depth={1} colorClass="text-rose-600" subText={result.acqMethodUsed} minus />
                    <ResultTableItem label="필요경비" value={result.expense} depth={1} colorClass="text-rose-600" subText={result.expenseDesc} minus isLast/>
                    <div className="my-3 border-t border-slate-200"></div>
                    <ResultTableItem label="양도차익" value={result.rawGain ?? 0} bold />
                </div>

                {/* 2. 과세표준 */}
                <div className="bg-slate-50/50 rounded-2xl p-6 mb-6 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 text-xs text-slate-600 font-bold">2</span> 
                        과세표준
                    </div>
                    
                    {result.taxExemptGain > 0 && (
                        <ResultTableItem label="비과세분 차익" value={result.taxExemptGain} depth={1} colorClass="text-slate-500" subText="고가주택 초과분 제외" minus />
                    )}

                    <ResultTableItem 
                        label="장기보유특별공제" 
                        value={result.longTerm.amount} 
                        depth={0} 
                        colorClass="text-indigo-600" 
                        subText={result.longTerm.desc} 
                        minus 
                    />

                    <div className="my-2 border-t border-slate-100"></div>
                    <ResultTableItem label="양도소득금액" value={result.currentIncomeAmount} bold colorClass="text-slate-800" />

                    {result.isAggregationApplied && (
                        <>
                            <ResultTableItem label="양도소득합산" value={result.priorIncomeAmount} depth={0} colorClass="text-purple-600" plus />
                            <div className="my-2 border-t border-dashed border-slate-200"></div>
                            <ResultTableItem label="총 양도소득금액" value={result.totalIncomeAmount} bold colorClass="text-purple-800" />
                        </>
                    )}

                    <div className="my-2"></div>
                    <ResultTableItem 
                        label="양도소득기본공제" 
                        value={result.basicDed} 
                        depth={0} 
                        colorClass="text-indigo-600" 
                        subText={result.isAggregationApplied ? "연간 합계액 공제" : ""} 
                        minus 
                        isLast
                    />
                    
                    <div className="my-3 border-t-2 border-slate-200"></div>
                    <ResultTableItem label="과세표준" value={result.taxBase} bold colorClass="text-slate-900" />
                </div>

                {/* 3. 납부세액 */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 text-xs text-slate-600 font-bold">3</span> 
                        최종 세액 산출
                    </div>
                    
                    <ResultTableItem 
                        label="산출세액" 
                        value={result.taxResult.tax} 
                        subText={result.taxResult.desc} 
                    />
                    
                    <ResultTableItem 
                        label="감면세액" 
                        value={result.exemption.amount} 
                        colorClass="text-emerald-600" 
                        subText={result.exemption.desc} 
                        minus 
                    />

                    {(result.incomePenalty.total > 0 || result.constructionPenalty > 0) && (
                        <div className="bg-rose-50 rounded-lg px-3 -mx-3 my-1">
                            <ResultTableItem 
                                label="가산세 (계)" 
                                value={result.incomePenalty.total + result.constructionPenalty} 
                                colorClass="text-rose-600" 
                                subText={`${result.incomePenalty.desc}${result.constructionPenalty > 0 ? `\n(신축가산세 ${formatNumber(result.constructionPenalty)}원 포함)` : ''}`}
                                plus
                            />
                        </div>
                    )}
                    
                    {/* Pre-paid Tax */}
                    {(result.isAggregationApplied || result.initialIncomeTax > 0) && (
                        <ResultTableItem 
                            label="기납부세액" 
                            value={result.isAggregationApplied ? result.priorTaxAmount : result.initialIncomeTax} 
                            colorClass="text-slate-500" 
                            subText={result.isAggregationApplied ? "기신고 결정세액 차감" : "당초 신고세액 차감"}
                            minus 
                        />
                    )}

                    {/* Final Tax Bill Area */}
                    <div className="mt-6 pt-6 border-t-2 border-slate-900">
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-900 text-lg">양도소득세 결정세액</span>
                            <span className="font-mono font-bold text-xl tabular-nums text-slate-900">{formatNumber(result.totalIncomeTax)}</span>
                        </div>
                        
                        {result.installmentValue > 0 && (
                            <div className="flex justify-between items-center text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg mb-4">
                                <span>└ 분납 신청액 (2개월 후 납부)</span>
                                <span className="font-mono tabular-nums font-bold">-{formatNumber(result.installmentValue)}</span>
                            </div>
                        )}

                        <div className="my-4 border-t border-dashed border-slate-300"></div>

                        <div className="flex justify-between items-end mb-2">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900">농어촌특별세</span>
                                {(result.initialNongteukse > 0 || result.nongPenalty.total > 0) && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                        (기납부/가산세 반영됨)
                                    </span>
                                )}
                             </div>
                             <span className="font-mono tabular-nums text-slate-900">{formatNumber(result.nongteukse)}</span>
                        </div>

                        {result.nongInstallmentValue > 0 && (
                             <div className="flex justify-between items-center text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                <span>└ 분납 신청액 (2개월 후 납부)</span>
                                <span className="font-mono tabular-nums font-bold">-{formatNumber(result.nongInstallmentValue)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Total Payment Card */}
                <div className="mt-8 bg-slate-900 p-8 rounded-3xl text-center shadow-glow relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <span className="relative block text-xs text-slate-400 mb-3 font-bold tracking-widest uppercase">Total Payable Amount</span>
                    <div className="relative flex items-center justify-center gap-1 text-white">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums">{formatNumber(result.totalImmediateBill)}</span>
                        <span className="text-xl font-normal text-slate-500 mt-3">원</span>
                    </div>
                    
                    <div className="relative mt-6 pt-5 border-t border-slate-800 flex flex-col gap-2">
                       <div className="flex justify-between items-center text-sm text-slate-400">
                            <span className="flex items-center gap-1.5"><Info size={14}/> 지방소득세 별도 (10%)</span>
                            <span className="text-slate-300 font-bold font-mono">{formatNumber(result.localIncomeTax)}원</span>
                       </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button onClick={onReset} className="flex-1 py-4 border border-slate-200 bg-white rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]">
                        <RefreshCw size={18}/> 초기화
                    </button>
                    <button onClick={onPrint} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 flex justify-center gap-2 transition-all shadow-md active:scale-[0.98]">
                        <Printer size={18}/> 간편신고서 출력
                    </button>
                </div>
            </div>
        </div>
    );
}
```

## components/ReportModal.tsx
```tsx
import React from 'react';
import { X, Printer } from 'lucide-react';
import { TaxResult, TaxState } from '../types';
import { formatNumber } from '../utils/taxCalculations';

interface ReportModalProps {
    result: TaxResult;
    state: TaxState;
    onClose: () => void;
}

export default function ReportModal({ result, state, onClose }: ReportModalProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:p-0 print:block print:static">
             {/* Modal Container */}
             <div className="bg-white w-full max-w-4xl h-[90vh] overflow-y-auto rounded-xl shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">
                
                {/* Header (Hidden in Print) */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Printer size={20}/> 양도소득세 간편신고서 미리보기
                    </h2>
                    <div className="flex gap-3">
                         <button 
                            onClick={handlePrint}
                            className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Printer size={16}/> 인쇄하기
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-8 print:p-0 print:m-0 font-serif text-slate-900">
                    
                    {/* Title */}
                    <div className="text-center mb-8 pb-4 border-b-2 border-black">
                        <h1 className="text-2xl font-bold mb-2">양도소득세 간편신고서 (소명자료용)</h1>
                        <p className="text-sm text-gray-600">
                            귀속년도: {state.yangdoDate.split('-')[0]}년 | 신고유형: {state.declarationType === 'regular' ? '예정신고' : state.declarationType === 'after_deadline' ? '기한후신고' : '수정신고'}
                        </p>
                    </div>

                    {/* Section 1: Infor */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">1. 기본사항</h3>
                        <table className="w-full text-xs border-collapse border border-gray-400">
                            <tbody>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">양도인(매도자)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">성명: {state.transferorInfo.name}<br/>주민번호: {state.transferorInfo.ssn}</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">양수인(매수자)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">성명: {state.transfereeInfo.name}<br/>주민번호: {state.transfereeInfo.ssn}</td>
                                </tr>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">부동산 소재지</th>
                                    <td colSpan={3} className="border border-gray-300 p-2">{state.propertyAddress}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 2: Asset Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">2. 자산정보</h3>
                         <table className="w-full text-xs border-collapse border border-gray-400">
                            <tbody>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">자산종류</th>
                                    <td className="border border-gray-300 p-2 w-1/3">{state.assetType}</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">면적(㎡)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">{state.landArea} ㎡</td>
                                </tr>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">취득일</th>
                                    <td className="border border-gray-300 p-2">{state.acquisitionDate} ({state.acquisitionCause === 'sale' ? '매매' : state.acquisitionCause})</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">양도일</th>
                                    <td className="border border-gray-300 p-2">{state.yangdoDate} ({state.yangdoCause === 'sale' ? '매매' : state.yangdoCause})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                     {/* Section 3: Calculation */}
                     <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">3. 세액계산내역</h3>
                        <table className="w-full text-xs border-collapse border border-gray-400 table-fixed">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 p-2 w-1/12">번호</th>
                                    <th className="border border-gray-300 p-2 w-4/12">구분</th>
                                    <th className="border border-gray-300 p-2 w-4/12">상세내역</th>
                                    <th className="border border-gray-300 p-2 w-3/12 text-right">금액 (원)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">1</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도가액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">실지거래가액</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.yangdoPrice)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">2</td>
                                    <td className="border border-gray-300 p-1 font-bold">취득가액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.acqMethodUsed}</td>
                                    <td className="border border-gray-300 p-1 text-right">{formatNumber(result.acqPrice)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">3</td>
                                    <td className="border border-gray-300 p-1 font-bold">필요경비</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.expenseDesc}</td>
                                    <td className="border border-gray-300 p-1 text-right">{formatNumber(result.expense)}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-1 text-center">4</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도차익 (1-2-3)</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.rawGain)}</td>
                                </tr>
                                {result.taxExemptGain > 0 && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">-</td>
                                        <td className="border border-gray-300 p-1">비과세분 차익</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">고가주택 초과분 외 제외</td>
                                        <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.taxExemptGain)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">5</td>
                                    <td className="border border-gray-300 p-1">장기보유특별공제</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.longTerm.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.longTerm.amount)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">6</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도소득금액 (4-5)</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.currentIncomeAmount)}</td>
                                </tr>
                                {result.isAggregationApplied && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">+</td>
                                        <td className="border border-gray-300 p-1">기신고 양도소득금액 합산</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">동일 과세기간 합산</td>
                                        <td className="border border-gray-300 p-1 text-right text-blue-600">(+) {formatNumber(result.priorIncomeAmount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">7</td>
                                    <td className="border border-gray-300 p-1">양도소득기본공제</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">연 250만원 한도</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.basicDed)}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-1 text-center">8</td>
                                    <td className="border border-gray-300 p-1 font-bold">과세표준</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.taxBase)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">9</td>
                                    <td className="border border-gray-300 p-1 font-bold">산출세액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.taxResult.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.taxResult.tax)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">10</td>
                                    <td className="border border-gray-300 p-1">공제/감면세액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.exemption.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.exemption.amount)}</td>
                                </tr>
                                {(result.incomePenalty.total > 0 || result.constructionPenalty > 0) && (
                                    <tr>
                                        <td className="border border-gray-300 p-1 text-center">11</td>
                                        <td className="border border-gray-300 p-1">가산세</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">{result.incomePenalty.desc} {result.constructionPenalty > 0 ? '(신축가산세 포함)' : ''}</td>
                                        <td className="border border-gray-300 p-1 text-right text-blue-600">(+) {formatNumber(result.incomePenalty.total + result.constructionPenalty)}</td>
                                    </tr>
                                )}
                                {(result.initialIncomeTax > 0 || result.isAggregationApplied) && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">12</td>
                                        <td className="border border-gray-300 p-1">기신고/기납부 세액</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">{result.isAggregationApplied ? '합산대상 기결정세액' : '당초 신고세액'}</td>
                                        <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.isAggregationApplied ? result.priorTaxAmount : result.initialIncomeTax)}</td>
                                    </tr>
                                )}
                                <tr className="bg-gray-100 border-t-2 border-black">
                                    <td className="border border-gray-300 p-2 text-center font-bold">13</td>
                                    <td className="border border-gray-300 p-2 font-bold text-base">양도소득세 납부할세액</td>
                                    <td className="border border-gray-300 p-2 text-gray-500">지방소득세 별도</td>
                                    <td className="border border-gray-300 p-2 text-right font-bold text-lg">{formatNumber(result.totalIncomeTax)}</td>
                                </tr>
                                {result.nongteukse > 0 && (
                                    <tr>
                                        <td className="border border-gray-300 p-2 text-center font-bold">14</td>
                                        <td className="border border-gray-300 p-2 font-bold">농어촌특별세</td>
                                        <td className="border border-gray-300 p-2 text-gray-500">감면세액의 20% 등</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{formatNumber(result.nongteukse)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                     
                     {/* Footer */}
                     <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-2">위와 같이 양도소득세 간편신고서를 제출합니다.</p>
                        <p className="text-lg font-bold mb-8">{new Date().getFullYear()}년 {new Date().getMonth()+1}월 {new Date().getDate()}일</p>
                        <p className="text-sm text-gray-400">본 신고서는 모의계산 참고용이며, 실제 신고 시에는 국세청 홈택스를 이용하거나 세무 전문가의 확인이 필요합니다.</p>
                     </div>

                </div>
             </div>
        </div>
    );
}
```
