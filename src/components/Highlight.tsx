import { useHighlight } from '../contexts/HighlightContext';
import type { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
  className?: string;
}

export const Highlight = ({ children, className = '' }: HighlightProps) => {
  const { printMode } = useHighlight();
  const baseClass = printMode === 'review'
    ? 'bg-yellow-100 print:bg-transparent print:text-blue-400 print:font-bold'
    : 'bg-yellow-100 print:bg-transparent print:text-black print:font-normal';
  
  return (
    <span className={`${baseClass} rounded inline break-words ${className}`}>
      {children || '\u00A0'}
    </span>
  );
};

export const GreenHighlight = ({ children, className = '' }: HighlightProps) => {
  const { printMode } = useHighlight();
  const baseClass = printMode === 'review'
    ? 'bg-green-100/50 font-bold print:bg-transparent print:text-green-500 print:font-bold'
    : 'bg-green-100/50 font-bold print:bg-transparent print:text-black print:font-normal';
  
  return (
    <span className={`${baseClass} px-1 rounded inline break-words ${className}`}>
      {children || '\u00A0'}
    </span>
  );
};
