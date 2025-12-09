import React, { useState } from 'react';
import TaxForm from './TaxForm';
import TaxResultView from './TaxResultView';
import { NongteukseInfoModal, BisatoInfoModal, Pre1990CalcModal, InstallmentInfoModal } from './Modals';
import { useTaxState } from '../src/hooks/useTaxState';
import { useTaxCalculations } from '../src/hooks/useTaxCalculations';

export default function TaxCalculator() {
  const { state, set, setNested, reset } = useTaxState();
  const [showNongTooltip, setShowNongTooltip] = useState(false);
  const [showBisatoTooltip, setShowBisatoTooltip] = useState(false);
  const [showInstallmentTooltip, setShowInstallmentTooltip] = useState(false);
  const [showPre1990CalcModal, setShowPre1990CalcModal] = useState(false);

  const { result, isPre1985 } = useTaxCalculations(state, set);

  const handlePre1990ModalChange = (field: string, value: any) => {
    if (field === 'maega') setNested('acqPriceActual', 'maega', value);
    else set(field, value);
  };

  return (
    <div className="min-h-screen pb-32 font-sans text-slate-800 bg-[#F8F9FB]">
      {showNongTooltip && <NongteukseInfoModal onClose={() => setShowNongTooltip(false)} />}
      {showBisatoTooltip && <BisatoInfoModal onClose={() => setShowBisatoTooltip(false)} />}
      {showPre1990CalcModal && <Pre1990CalcModal onClose={() => setShowPre1990CalcModal(false)} state={state} onChange={handlePre1990ModalChange} />}
      {showInstallmentTooltip && <InstallmentInfoModal onClose={() => setShowInstallmentTooltip(false)} />}

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
            <TaxResultView result={result} state={state} onReset={reset} onPrint={() => setShowPre1990CalcModal(true)} />
          </div>
        </main>
      </div>
    </div>
  );
}
