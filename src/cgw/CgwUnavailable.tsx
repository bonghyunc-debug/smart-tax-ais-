import React from 'react';

export default function CgwUnavailable() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 px-6">
            <div className="max-w-lg w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em]">Feature Flag Off</p>
                <h1 className="text-2xl font-extrabold">CGW 위저드가 비활성화되어 있습니다.</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                    기본 설정에서는 기존 서비스 영향 없이 안정적으로 배포하기 위해 CGW 진입점이 닫혀 있습니다.
                    필요 시 환경변수 <code>FEATURE_CGW=true</code>를 설정하여 위저드를 확인할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
