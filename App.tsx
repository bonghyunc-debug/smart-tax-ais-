
import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import TaxForm from './components/TaxForm';
import TaxResultView from './components/TaxResultView';
import { NongteukseInfoModal, BisatoInfoModal, Pre1990CalcModal, InstallmentInfoModal } from './components/Modals';
import ReportModal from './components/ReportModal';
import FloatingBottomBar from './components/FloatingBottomBar';
import { useTaxState } from './src/hooks/useTaxState';
import { useTaxCalculations } from './src/hooks/useTaxCalculations';

export default function App() {
    const { state, set, setNested, reset } = useTaxState();
    const [showNongTooltip, setShowNongTooltip] = useState(false);
    const [showBisatoTooltip, setShowBisatoTooltip] = useState(false);
    const [showInstallmentTooltip, setShowInstallmentTooltip] = useState(false);
    const [showPre1990CalcModal, setShowPre1990CalcModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const { result, isPre1985 } = useTaxCalculations(state, set);

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
                            onReset={reset}
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
