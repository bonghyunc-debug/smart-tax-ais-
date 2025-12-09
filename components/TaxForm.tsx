
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
        state.isPre1990;
    
    const isBurdenGift = state.yangdoCause === 'burden_gift';
    const isInheritanceOrGift = ['inheritance', 'gift', 'gift_carryover'].includes(state.acquisitionCause);
    const isGiftCarryover = state.acquisitionCause === 'gift_carryover';
    
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
                            {(state.yangdoCause === 'burden_gift' && state.giftEvaluationMethod === 'official' 
                                ? [{id:'official', label:'기준시가'}] 
                                : [{id:'actual', label:'실지거래가액'}, {id:'converted', label:'환산취득가액'}]
                            ).map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={()=>set('acqPriceMethod', m.id)}
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
