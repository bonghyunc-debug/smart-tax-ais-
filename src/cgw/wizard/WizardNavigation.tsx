import React from 'react';
import { useWizardStore } from '../store/wizardStore';

export function WizardNavigation() {
  const { step, goBack, goNext, isStepValid, missingFields, resetWizard } = useWizardStore();
  const disableNext = !isStepValid();

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
      <div className="text-xs text-slate-500">
        {missingFields().length > 0 && <span>필수값 누락: {missingFields().join(', ')}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
        >
          이전
        </button>
        {step < 7 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={disableNext}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={resetWizard}
            className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm text-indigo-700 shadow-sm"
          >
            다시 시작
          </button>
        )}
      </div>
    </div>
  );
}
