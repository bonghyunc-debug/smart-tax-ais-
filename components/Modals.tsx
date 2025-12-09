import React, { useState } from 'react';
import { X, HelpCircle, Calculator, Info, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TaxState } from '../types';
import { LAND_GRADE_TABLE, formatNumber, parseNumber } from '../utils/taxCalculations';
import { NumberInput } from './CommonComponents';

export const Pre1990CalcModal = ({ onClose, state, onChange }: { onClose: () => void, state: TaxState, onChange: (field: string, value: any) => void }) => {
    // Local state for live calculation in modal (syncs with parent via onChange, but we need derived values)
    
    // Determine Effective Mode
    const effCause = (state.acquisitionCause === 'gift_carryover') ? state.origAcquisitionCause : state.acquisitionCause;
    const isInheritanceOrGift = ['inheritance', 'gift'].includes(effCause);

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
        // Apply Acq Side
        onChange('unitOfficialPrice', acqUnitPrice);
        onChange('officialPrice', totalAcq);

        if (isInheritanceOrGift) {
            // For Inheritance/Gift, we only need the official price.
            // Force method to official so calculation uses this value.
            onChange('acqPriceMethod', 'official');
            // Clear transfer side values to avoid confusion, or leave them as they don't impact calculation if logic is correct
            onChange('unitTransferOfficialPrice', '');
            onChange('transferOfficialPrice', '');
            
            // Also set 'maega' to reflect this is the value being used, for UX consistency if they switch tabs
            onChange('maega', totalAcq);
        } else {
            // Apply Transfer Side for Converted Price
            onChange('unitTransferOfficialPrice', unitTransfer);
            onChange('transferOfficialPrice', totalTransfer);
            onChange('acqPriceMethod', 'converted');
            onChange('maega', totalAcq);
        }

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
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Calculator size={20}/> 
                        {isInheritanceOrGift ? '취득당시 기준시가 계산 (1990.8.30 이전)' : '1990.8.30. 이전 취득 토지 환산'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded transition-colors"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-8 bg-slate-50/50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* 1. 기본 정보 및 양도시 기준시가 (Hide for Inheritance/Gift) */}
                    {!isInheritanceOrGift && (
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
                    )}

                    {/* 2. 취득시 기준시가 (환산) */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                             <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">{isInheritanceOrGift ? '1' : '2'}</span>
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
                        {isInheritanceOrGift ? '기준시가 적용' : '계산 결과 적용'} <ChevronRight size={16}/>
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