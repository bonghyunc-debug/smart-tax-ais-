import React from 'react';
import { X, Printer } from 'lucide-react';
import { TaxResult, TaxState } from '../types';
import { formatNumber } from '../utils/taxCalculations';

interface ReportModalProps {
    result: TaxResult;
    state: TaxState;
    onClose: () => void;
}

export default function ReportModal({ result, state, onClose }: ReportModalProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:p-0 print:block print:static">
             {/* Modal Container */}
             <div className="bg-white w-full max-w-4xl h-[90vh] overflow-y-auto rounded-xl shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">
                
                {/* Header (Hidden in Print) */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Printer size={20}/> 양도소득세 간편신고서 미리보기
                    </h2>
                    <div className="flex gap-3">
                         <button 
                            onClick={handlePrint}
                            className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Printer size={16}/> 인쇄하기
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-8 print:p-0 print:m-0 font-serif text-slate-900">
                    
                    {/* Title */}
                    <div className="text-center mb-8 pb-4 border-b-2 border-black">
                        <h1 className="text-2xl font-bold mb-2">양도소득세 간편신고서 (소명자료용)</h1>
                        <p className="text-sm text-gray-600">
                            귀속년도: {state.yangdoDate.split('-')[0]}년 | 신고유형: {state.declarationType === 'regular' ? '예정신고' : state.declarationType === 'after_deadline' ? '기한후신고' : '수정신고'}
                        </p>
                    </div>

                    {/* Section 1: Infor */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">1. 기본사항</h3>
                        <table className="w-full text-xs border-collapse border border-gray-400">
                            <tbody>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">양도인(매도자)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">성명: {state.transferorInfo.name}<br/>주민번호: {state.transferorInfo.ssn}</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">양수인(매수자)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">성명: {state.transfereeInfo.name}<br/>주민번호: {state.transfereeInfo.ssn}</td>
                                </tr>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">부동산 소재지</th>
                                    <td colSpan={3} className="border border-gray-300 p-2">{state.propertyAddress}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 2: Asset Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">2. 자산정보</h3>
                         <table className="w-full text-xs border-collapse border border-gray-400">
                            <tbody>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">자산종류</th>
                                    <td className="border border-gray-300 p-2 w-1/3">{state.assetType}</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 w-1/6 text-left">면적(㎡)</th>
                                    <td className="border border-gray-300 p-2 w-1/3">{state.landArea} ㎡</td>
                                </tr>
                                <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">취득일</th>
                                    <td className="border border-gray-300 p-2">{state.acquisitionDate} ({state.acquisitionCause === 'sale' ? '매매' : state.acquisitionCause})</td>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left">양도일</th>
                                    <td className="border border-gray-300 p-2">{state.yangdoDate} ({state.yangdoCause === 'sale' ? '매매' : state.yangdoCause})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                     {/* Section 3: Calculation */}
                     <div className="mb-6">
                        <h3 className="text-sm font-bold border-l-4 border-black pl-2 mb-2 bg-gray-100 py-1">3. 세액계산내역</h3>
                        <table className="w-full text-xs border-collapse border border-gray-400 table-fixed">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 p-2 w-1/12">번호</th>
                                    <th className="border border-gray-300 p-2 w-4/12">구분</th>
                                    <th className="border border-gray-300 p-2 w-4/12">상세내역</th>
                                    <th className="border border-gray-300 p-2 w-3/12 text-right">금액 (원)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">1</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도가액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">실지거래가액</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.yangdoPrice)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">2</td>
                                    <td className="border border-gray-300 p-1 font-bold">취득가액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.acqMethodUsed}</td>
                                    <td className="border border-gray-300 p-1 text-right">{formatNumber(result.acqPrice)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">3</td>
                                    <td className="border border-gray-300 p-1 font-bold">필요경비</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.expenseDesc}</td>
                                    <td className="border border-gray-300 p-1 text-right">{formatNumber(result.expense)}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-1 text-center">4</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도차익 (1-2-3)</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.rawGain)}</td>
                                </tr>
                                {result.taxExemptGain > 0 && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">-</td>
                                        <td className="border border-gray-300 p-1">비과세분 차익</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">고가주택 초과분 외 제외</td>
                                        <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.taxExemptGain)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">5</td>
                                    <td className="border border-gray-300 p-1">장기보유특별공제</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.longTerm.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.longTerm.amount)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">6</td>
                                    <td className="border border-gray-300 p-1 font-bold">양도소득금액 (4-5)</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.currentIncomeAmount)}</td>
                                </tr>
                                {result.isAggregationApplied && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">+</td>
                                        <td className="border border-gray-300 p-1">기신고 양도소득금액 합산</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">동일 과세기간 합산</td>
                                        <td className="border border-gray-300 p-1 text-right text-blue-600">(+) {formatNumber(result.priorIncomeAmount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">7</td>
                                    <td className="border border-gray-300 p-1">양도소득기본공제</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">연 250만원 한도</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.basicDed)}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-1 text-center">8</td>
                                    <td className="border border-gray-300 p-1 font-bold">과세표준</td>
                                    <td className="border border-gray-300 p-1 text-gray-500"></td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.taxBase)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">9</td>
                                    <td className="border border-gray-300 p-1 font-bold">산출세액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.taxResult.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(result.taxResult.tax)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 text-center">10</td>
                                    <td className="border border-gray-300 p-1">공제/감면세액</td>
                                    <td className="border border-gray-300 p-1 text-gray-500">{result.exemption.desc}</td>
                                    <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.exemption.amount)}</td>
                                </tr>
                                {(result.incomePenalty.total > 0 || result.constructionPenalty > 0) && (
                                    <tr>
                                        <td className="border border-gray-300 p-1 text-center">11</td>
                                        <td className="border border-gray-300 p-1">가산세</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">{result.incomePenalty.desc} {result.constructionPenalty > 0 ? '(신축가산세 포함)' : ''}</td>
                                        <td className="border border-gray-300 p-1 text-right text-blue-600">(+) {formatNumber(result.incomePenalty.total + result.constructionPenalty)}</td>
                                    </tr>
                                )}
                                {(result.initialIncomeTax > 0 || result.isAggregationApplied) && (
                                     <tr>
                                        <td className="border border-gray-300 p-1 text-center">12</td>
                                        <td className="border border-gray-300 p-1">기신고/기납부 세액</td>
                                        <td className="border border-gray-300 p-1 text-gray-500">{result.isAggregationApplied ? '합산대상 기결정세액' : '당초 신고세액'}</td>
                                        <td className="border border-gray-300 p-1 text-right text-red-600">(-) {formatNumber(result.isAggregationApplied ? result.priorTaxAmount : result.initialIncomeTax)}</td>
                                    </tr>
                                )}
                                <tr className="bg-gray-100 border-t-2 border-black">
                                    <td className="border border-gray-300 p-2 text-center font-bold">13</td>
                                    <td className="border border-gray-300 p-2 font-bold text-base">양도소득세 납부할세액</td>
                                    <td className="border border-gray-300 p-2 text-gray-500">지방소득세 별도</td>
                                    <td className="border border-gray-300 p-2 text-right font-bold text-lg">{formatNumber(result.totalIncomeTax)}</td>
                                </tr>
                                {result.nongteukse > 0 && (
                                    <tr>
                                        <td className="border border-gray-300 p-2 text-center font-bold">14</td>
                                        <td className="border border-gray-300 p-2 font-bold">농어촌특별세</td>
                                        <td className="border border-gray-300 p-2 text-gray-500">감면세액의 20% 등</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{formatNumber(result.nongteukse)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                     
                     {/* Footer */}
                     <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-2">위와 같이 양도소득세 간편신고서를 제출합니다.</p>
                        <p className="text-lg font-bold mb-8">{new Date().getFullYear()}년 {new Date().getMonth()+1}월 {new Date().getDate()}일</p>
                        <p className="text-sm text-gray-400">본 신고서는 모의계산 참고용이며, 실제 신고 시에는 국세청 홈택스를 이용하거나 세무 전문가의 확인이 필요합니다.</p>
                     </div>

                </div>
             </div>
        </div>
    );
}