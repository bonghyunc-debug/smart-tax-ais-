import React from 'react';

const steps = [
    { title: '기본 정보', description: '양도 대상 및 거래 정보를 입력합니다.' },
    { title: '세액 계산', description: '입력한 정보를 기반으로 세액을 산출합니다.' },
    { title: '신고 준비', description: '제출 서류 및 신고 절차를 안내합니다.' }
];

export default function CgwWizardApp() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em]">Smart Tax</p>
                        <h1 className="text-2xl font-extrabold mt-1">양도소득 Wizard (CGW)</h1>
                        <p className="text-sm text-slate-500">새로운 위저드 경험을 실험 중입니다.</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">Experimental</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
                <section className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold mb-2">위저드 진행 단계</h2>
                    <p className="text-sm text-slate-500 mb-6">각 단계를 차근히 따라가며 필요한 정보를 입력해 주세요.</p>
                    <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {steps.map((step, index) => (
                            <li key={step.title} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60">
                                <p className="text-xs font-semibold text-indigo-600">STEP {index + 1}</p>
                                <h3 className="mt-1 font-bold text-slate-900">{step.title}</h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="p-6 bg-white border border-dashed border-slate-300 rounded-2xl text-center text-slate-500">
                    <p className="font-semibold text-slate-700 mb-2">스캐폴딩 상태</p>
                    <p className="text-sm leading-relaxed">단계별 입력/계산 로직은 이후 스프린트에서 채워질 예정입니다. 베타 기능 검증을 위해 기본 동작과 UI 프레임만 제공합니다.</p>
                </section>
            </main>
        </div>
    );
}
