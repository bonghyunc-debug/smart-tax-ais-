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
    origAcquisitionCause: 'sale',
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