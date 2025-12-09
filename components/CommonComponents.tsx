import React, { useState, useRef, useEffect } from 'react';
import { formatNumber, parseNumber } from '../utils/taxCalculations';
import { HelpCircle, X, Check, Lock } from 'lucide-react';

// Modern Section Header (Step Indicator Style)
export const Section = ({ title, children, number, className = "" }: { title: string, children?: React.ReactNode, number: number, className?: string }) => (
  <div className={`bg-white rounded-3xl shadow-card border border-slate-100 mb-8 overflow-visible transition-all duration-300 hover:shadow-soft group ${className}`}>
    <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 font-bold border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <span className="text-[10px] leading-none opacity-60 uppercase tracking-tighter">Step</span>
            <span className="text-xl leading-none mt-0.5">{number.toString().padStart(2, '0')}</span>
        </div>
        <h2 className="font-bold text-slate-900 text-xl tracking-tight">{title}</h2>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

// Modern Input Styles
export const commonInputClass = "w-full h-12 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium text-slate-800 hover:bg-white hover:border-slate-300";
export const disabledInputClass = "w-full h-12 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-base outline-none text-slate-500 font-medium cursor-not-allowed shadow-none select-none";

export const InputRow = ({ label, value, onChange, suffix, placeholder, className, disabled = false }: any) => (
  <div className={`mb-5 ${className}`}>
    {label && <label className="block text-sm font-semibold text-slate-600 mb-2.5 ml-1">{label}</label>}
    <div className="relative group">
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={`${disabled ? disabledInputClass : commonInputClass} ${suffix || disabled ? 'pr-12' : ''}`}
        placeholder={placeholder}
      />
      {/* Suffix or Lock Icon */}
      {disabled ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={16} />
          </span>
      ) : suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none group-focus-within:text-indigo-500 transition-colors">{suffix}</span>
      ) : null}
    </div>
  </div>
);

// 금액을 한글로 변환하는 함수
function formatHangulMoney(value: number): string {
    if (!value || value === 0) return '';
    const unitWords = ['', '만', '억', '조', '경'];
    let result = '';
    let temp = value;
    let count = 0;

    while (temp > 0) {
        const part = temp % 10000;
        if (part > 0) {
            result = `${formatNumber(part)}${unitWords[count]} ` + result;
        }
        temp = Math.floor(temp / 10000);
        count++;
    }
    return result.trim() + ' 원';
}

export const NumberInput = ({ label, value, onChange, suffix, allowDecimal = false, disabled = false, placeholder, className = '', hideTooltip = false, labelClassName, children }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (allowDecimal) {
            const filtered = raw.replace(/[^0-9.]/g, '');
            onChange(filtered);
        } else {
            const filtered = raw.replace(/[^0-9]/g, '');
            onChange(filtered ? Number(filtered).toLocaleString('ko-KR') : '');
        }
    };
    
    const numericValue = parseNumber(value);
    const hangulValue = (!allowDecimal && numericValue > 0) ? formatHangulMoney(numericValue) : '';

    return (
        <div className={`mb-5 ${className} relative group`}> 
            <div className="flex items-center gap-1 mb-2.5 ml-1">
                {label && <label className={labelClassName || "block text-sm font-semibold text-slate-600"}>{label}</label>}
                {children}
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={!allowDecimal && typeof value === 'number' ? value.toLocaleString('ko-KR') : value} 
                    onChange={handleChange}
                    disabled={disabled}
                    className={`${disabled ? disabledInputClass : commonInputClass} font-mono text-right tabular-nums tracking-tight ${suffix || disabled ? 'pr-12' : ''}`}
                    placeholder={placeholder}
                />
                
                {/* Suffix or Lock Icon */}
                {disabled ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={16} />
                    </span>
                ) : suffix ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none group-focus-within:text-indigo-500 transition-colors">{suffix}</span>
                ) : null}
                
                {!hideTooltip && !disabled && hangulValue && (
                    <div className="absolute top-full right-0 mt-2 text-xs font-semibold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-lg shadow-indigo-500/10 z-20 pointer-events-none transition-all duration-200 opacity-0 group-focus-within:opacity-100 -translate-y-2 group-focus-within:translate-y-0">
                        {hangulValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export const HelpTooltip = ({ content, className = '' }: { content: React.ReactNode, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative inline-block ml-1.5 align-middle ${className} ${isOpen ? 'z-50' : ''}`} ref={tooltipRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`text-slate-400 hover:text-indigo-600 transition-colors duration-200 ${isOpen ? 'text-indigo-600' : ''}`}
            >
                <HelpCircle size={16} />
            </button>
            
            {isOpen && (
                <div className="absolute z-[100] w-96 p-5 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700/50 text-left animate-in zoom-in-95 duration-200 mt-3 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wide">Help Guide</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed space-y-2 break-keep font-medium">
                        {content}
                    </div>
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 sm:left-2 sm:translate-x-0 w-3 h-3 bg-slate-900/95 border-t border-l border-slate-700/50 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

// Visual Selection Card Component
interface SelectionOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
    subLabel?: string;
}

export const SelectionGrid = ({ 
    options, 
    selectedId, 
    onChange, 
    cols = 3,
    disabled = false 
}: { 
    options: SelectionOption[], 
    selectedId: string, 
    onChange: (id: string) => void,
    cols?: number,
    disabled?: boolean
}) => {
    return (
        <div 
            className="grid gap-3 w-full" 
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
            {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(opt.id)}
                        className={`
                            relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center h-full w-full
                            ${isSelected 
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md shadow-indigo-100' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-[0.98]'}
                        `}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full p-0.5 shadow-sm">
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                        {opt.icon && (
                            <div className={`mb-3 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {opt.icon}
                            </div>
                        )}
                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {opt.label}
                        </span>
                        {opt.subLabel && (
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">{opt.subLabel}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};