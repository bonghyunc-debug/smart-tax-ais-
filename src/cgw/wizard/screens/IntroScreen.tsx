import React from 'react';
import { CapitalGainTransaction } from '../../domain/CapitalGainTransaction';

interface IntroScreenProps {
  draft: CapitalGainTransaction;
}

export function IntroScreen({ draft }: IntroScreenProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">스마트 양도세 간편신고 위저드</h2>
      <p className="text-slate-600 leading-relaxed">
        새 위저드는 기존 계산 엔진을 재사용하여 신고 유형, 납세자 정보, 자산/거래 정보를 단계별로 입력하고 결과를 요약으로
        확인할 수 있도록 설계되었습니다. 현재는 뼈대 단계로 기본 필수 입력과 이동만 제공합니다.
      </p>
      <div className="rounded-lg border border-indigo-100 bg-white p-4 text-sm text-indigo-700 shadow-sm">
        <p className="font-semibold">지원 범위 (초안)</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>주택/고가주택/토지 위주의 기본 입력 흐름</li>
          <li>신고 유형: 정상, 기한후, 수정신고</li>
          <li>필수 필드 검증 및 단계 이동 제어</li>
          <li>계산하기 버튼으로 기존 Tax Engine 실행</li>
        </ul>
      </div>
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs text-slate-500">미리 채워진 오늘 날짜</p>
        <p className="text-slate-700 font-mono">양도일 기본값: {draft.dealInfo.transferDate}</p>
      </div>
    </div>
  );
}
