/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type PrintMode = 'review' | 'final';

interface HighlightContextType {
  printMode: PrintMode;
  setPrintMode: (mode: PrintMode) => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider = ({ children }: { children: ReactNode }) => {
  const [printMode, setPrintMode] = useState<PrintMode>('review');

  return (
    <HighlightContext.Provider value={{ printMode, setPrintMode }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};
