
import React from 'react';
import { TaxResult } from '../types';
import { formatNumber } from '../utils/taxCalculations';
import { ChevronUp, FileText } from 'lucide-react';

interface FloatingBottomBarProps {
    result: TaxResult;
    onViewDetail: () => void;
}

export default function FloatingBottomBar({ result, onViewDetail }: FloatingBottomBarProps) {
    // 세액이 0원이면 노출하지 않음 (입력 초기 단계)
    if (result.totalImmediateBill <= 0 && result.localIncomeTax <= 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 lg:hidden">
            <div className="flex items-center gap-8 pl-8 pr-3 py-3 bg-slate-900/95 backdrop-blur-xl rounded-full shadow-2xl shadow-indigo-500/20 border border-slate-700/50 text-white min-w-[700px] justify-between ring-1 ring-white/10">
                
                {/* Main Total */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Estimated Tax</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold tracking-tight tabular-nums text-white drop-shadow-sm">
                            {formatNumber(result.totalImmediateBill)}
                        </span>
                        <span className="text-sm font-medium text-slate-400">원</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-700/50"></div>

                {/* Breakdown */}
                <div className="flex items-center gap-8 text-sm">
                     <div className="flex flex-col items-end group cursor-default">
                        <span className="text-[10px] text-slate-400 font-semibold group-hover:text-indigo-300 transition-colors">양도소득세</span>
                        <span className="font-mono font-bold text-indigo-100 tabular-nums">{formatNumber(result.totalIncomeTax)}</span>
                    </div>
                    <div className="flex flex-col items-end group cursor-default">
                        <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-200 transition-colors">지방소득세 (10%)</span>
                        <span className="font-mono font-bold text-slate-300 tabular-nums">{formatNumber(result.localIncomeTax)}</span>
                    </div>
                     <div className="flex flex-col items-end group cursor-default">
                        <span className="text-[10px] text-slate-400 font-semibold group-hover:text-emerald-300 transition-colors">농어촌특별세</span>
                        <span className="font-mono font-bold text-emerald-100 tabular-nums">{formatNumber(result.nongteukse)}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    onClick={onViewDetail}
                    className="ml-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center gap-2 group"
                >
                    <FileText size={16} className="text-indigo-200 group-hover:text-white transition-colors"/>
                    상세보기
                </button>
            </div>
        </div>
    );
}
