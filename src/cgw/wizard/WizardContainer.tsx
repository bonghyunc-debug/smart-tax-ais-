import React from 'react';
import { WizardProvider, useWizardStore } from '../store/wizardStore';
import { IntroScreen } from './screens/IntroScreen';
import { ReturnTypeScreen } from './screens/ReturnTypeScreen';
import { TaxpayerScreen } from './screens/TaxpayerScreen';
import { AssetScreen } from './screens/AssetScreen';
import { DealInfoScreen } from './screens/DealInfoScreen';
import { AmountScreen } from './screens/AmountScreen';
import { ReliefScreen } from './screens/ReliefScreen';
import { ResultScreen } from './screens/ResultScreen';
import { WizardNavigation } from './WizardNavigation';

const stepTitles = [
  'Intro',
  '신고유형',
  '납세자',
  '자산',
  '거래정보',
  '금액',
  '감면/공제',
  '결과',
];

function StepRenderer() {
  const { step, draft, updateSection, scenarioKey } = useWizardStore();

  switch (step) {
    case 0:
      return <IntroScreen draft={draft} />;
    case 1:
      return <ReturnTypeScreen draft={draft} onChange={(value) => updateSection('returnMeta', value)} />;
    case 2:
      return <TaxpayerScreen draft={draft} onChange={(value) => updateSection('taxpayer', value)} />;
    case 3:
      return (
        <AssetScreen
          draft={draft}
          onChange={(value) => updateSection('assetInfo', value)}
          scenarioKey={scenarioKey}
          onUseProfileChange={(value) => updateSection('useProfile', value)}
        />
      );
    case 4:
      return <DealInfoScreen draft={draft} onChange={(value) => updateSection('dealInfo', value)} />;
    case 5:
      return <AmountScreen draft={draft} onChange={(value) => updateSection('amountInfo', value)} />;
    case 6:
      return <ReliefScreen draft={draft} onChange={(value) => updateSection('reliefInfo', value)} />;
    case 7:
      return <ResultScreen draft={draft} scenarioKey={scenarioKey} />;
    default:
      return null;
  }
}

function WizardShell() {
  const { step, scenarioKey } = useWizardStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">스마트 양도세 간편신고</p>
            <h1 className="text-2xl font-bold text-slate-800">Capital Gain Wizard</h1>
            <p className="text-sm text-indigo-700">Scenario: {scenarioKey}</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-500">
            {stepTitles.map((title, idx) => (
              <span
                key={title}
                className={`rounded-full px-3 py-1 border ${
                  idx === step
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {idx + 1}. {title}
              </span>
            ))}
          </div>
        </header>

        <div className="rounded-lg bg-white p-6 shadow-md border border-slate-200">
          <StepRenderer />
          <WizardNavigation />
        </div>
      </div>
    </div>
  );
}

export function WizardContainer() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}
