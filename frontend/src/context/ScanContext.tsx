import React, { createContext, useContext, useState } from 'react';
import { type Vulnerability } from '../lib/scan-data';

interface FutureRiskData {
  predictedScoreDrop: number;
  timeline: { month: string; score: number }[];
  cves: string[];
  daysUntilExpiry: number;
}

interface ScanData {
  score: number;
  issues: Vulnerability[];
  platform?: string;
  futureRisk?: FutureRiskData;
}

interface ScanContextType {
  scanData: ScanData | null;
  baselineScan: ScanData | null;
  domain: string;
  setScanResults: (domain: string, data: ScanData) => void;
  setBaselineResults: (data: ScanData) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [baselineScan, setBaselineScan] = useState<ScanData | null>(null);
  const [domain, setDomain] = useState('');

  const setScanResults = (newDomain: string, data: ScanData) => {
    setDomain(newDomain);
    setScanData(data);
  };

  const setBaselineResults = (data: ScanData) => {
    setBaselineScan(data);
  };

  return React.createElement(ScanContext.Provider, { 
    value: { scanData, baselineScan, domain, setScanResults, setBaselineResults } 
  }, children);
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
