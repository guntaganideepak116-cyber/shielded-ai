import React from 'react';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';

interface HeadersGridProps {
  headers: {
    [key: string]: 'present' | 'missing';
  };
}

const HeadersGrid: React.FC<HeadersGridProps> = ({ headers }) => {
  const headerLabels: { [key: string]: string } = {
    'x-frame-options': 'X-Frame-Options',
    'content-security-policy': 'Content-Security-Policy',
    'strict-transport-security': 'Strict-Transport-Security',
    'x-content-type-options': 'X-Content-Type-Options',
    'referrer-policy': 'Referrer-Policy',
    'permissions-policy': 'Permissions-Policy'
  };

  return (
    <div className="glass-card !p-5 !bg-[#0d1424] !border-[#1a2234] space-y-4">
      <div className="flex items-center justify-between border-bottom pb-3 border-[#1a2234]">
        <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Security Header Analysis
        </h3>
        <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full uppercase">Standard</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(headerLabels).map(([key, label]) => {
          const isPresent = headers?.[key] === 'present';
          return (
            <div key={key} className="flex items-center justify-between py-2 border-bottom border-[#1a2234]/50">
              <span className="text-[10px] font-medium text-slate-300">{label}</span>
              {isPresent ? (
                <div className="flex items-center gap-1 text-success text-[8px] font-black uppercase">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Present
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500 text-[8px] font-black uppercase">
                  <XCircle className="w-2.5 h-2.5" /> Missing
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeadersGrid;
