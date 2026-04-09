import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, Building2, Lock } from 'lucide-react';

interface SSLCardProps {
  ssl: {
    valid: boolean;
    daysUntilExpiry: number;
    issuer: string;
  };
}

const SSLCard: React.FC<SSLCardProps> = ({ ssl }) => {
  const isHealthy = ssl?.valid && ssl?.daysUntilExpiry > 30;
  const isWarning = ssl?.valid && ssl?.daysUntilExpiry <= 30;

  return (
    <div className="glass-card !p-5 !bg-[#0d1424] !border-[#1a2234] space-y-4">
      <div className="flex items-center justify-between border-bottom pb-3 border-[#1a2234]">
        <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> SSL Encryption
        </h3>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${ssl?.valid ? 'text-success bg-success/10' : 'text-red-500 bg-red-500/10'}`}>
          {ssl?.valid ? 'PROTECTED' : 'UNSECURED'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between py-2 border-bottom border-[#1a2234]/50">
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" /> VESTIGE_REMAINING
          </div>
          <span className={`text-[8px] font-black uppercase ${isHealthy ? 'text-success' : isWarning ? 'text-yellow-500' : 'text-red-500'}`}>
            {ssl?.valid ? `${ssl.daysUntilExpiry} DAYS` : 'EXPIRED / MISSING'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300">
            <Building2 className="w-3 h-3 text-slate-500" /> ISSUANCE_NODE
          </div>
          <span className="text-[8px] font-black uppercase truncate max-w-[120px] text-slate-400">{ssl?.issuer || 'ANONYMOUS'}</span>
        </div>
      </div>
    </div>
  );
};

export default SSLCard;
