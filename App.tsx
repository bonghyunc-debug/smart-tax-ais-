
import React, { useEffect, useReducer, useMemo, useState } from 'react';
import { Calculator, Scale, ArrowRight } from 'lucide-react';
import { TaxState } from './types';
import { TAX_LAW, LAND_GRADE_TABLE, parseNumber, isLandLike, calculateDeadline, calculateTax } from './utils/taxCalculations';
import TaxForm from './components/TaxForm';
import TaxResultView from './components/TaxResultView';
import { NongteukseInfoModal, BisatoInfoModal, Pre1990CalcModal, InstallmentInfoModal } from './components/Modals';
import ReportModal from './components/ReportModal';
import FloatingBottomBar from './components/FloatingBottomBar';

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
    origAcquisitionCause: 'sale', // Set default
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

    giftTaxPaid: '',

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
        const targetDate = (['inheritance', 'gift_carryover'].includes(state.acquisitionCause) && state.origAcquisitionDate)
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
        const targetDate = (['inheritance', 'gift_carryover'].includes(state.acquisitionCause) && state.origAcquisitionDate)
            ? state.origAcquisitionDate
            : state.acquisitionDate;

        const refDate = new Date(TAX_LAW.LAND_CONVERSION_GRADE_DATE);
        const isBeforeGradeCutoff = targetDate ? new Date(targetDate) < refDate : false;
        set('isPre1990', isBeforeGradeCutoff);
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
        <div className="min-h-screen pb-32 font-sans text-slate-800 bg-[#F8F9FB]">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
            <div className="fixed top-20 right-20 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -z-10"></div>
            <div className="fixed top-40 left-20 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>

            {showNongTooltip && <NongteukseInfoModal onClose={()=>setShowNongTooltip(false)} />}
            {showBisatoTooltip && <BisatoInfoModal onClose={()=>setShowBisatoTooltip(false)} />}
            {showPre1990CalcModal && <Pre1990CalcModal onClose={()=>setShowPre1990CalcModal(false)} state={state} onChange={handlePre1990ModalChange} />}
            {showInstallmentTooltip && <InstallmentInfoModal onClose={()=>setShowInstallmentTooltip(false)} />}
            {showReportModal && <ReportModal onClose={()=>setShowReportModal(false)} result={result} state={state} />}

            {/* Desktop Optimized Floating Bar */}
            <FloatingBottomBar result={result} onViewDetail={() => setShowReportModal(true)} />

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
