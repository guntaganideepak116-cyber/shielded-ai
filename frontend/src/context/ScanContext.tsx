import React, { createContext, useContext, useState } from 'react';

interface ScanData {
  score: number;
  issues: any[];
}

interface ScanContextType {
  scanData: ScanData | null;
  domain: string;
  setScanResults: (domain: string, data: ScanData) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [domain, setDomain] = useState('');

  const setScanResults = (domain: string, data: ScanData) => {
    setDomain(domain);
    setScanData(data);
  };

  return React.createElement(ScanContext.Provider, { 
    value: { scanData, domain, setScanResults } 
  }, children);
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
