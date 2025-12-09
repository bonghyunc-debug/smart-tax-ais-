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

                    {state.assetType === '1세대1주택_고가주택' && (
                        <div className="flex items-start gap-2 text-[12px] text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2 mb-3">
                            <Info size={14} className="text-slate-400 mt-0.5" />
                            <span className="leading-relaxed">이 도구는 1세대1주택 여부(주택 수, 조정대상지역 여부, 일시적 2주택 특례 등)를 판정하지 않고, 사용자가 직접 선택한 결과에 따라 계산만 수행합니다.</span>
                        </div>
                    )}

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