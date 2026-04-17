import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, ShieldOff, Activity } from 'lucide-react';

interface VirusTotalCardProps {
  virusTotal?: {
    malicious?: number;
    suspicious?: number;
    harmless?: number;
  };
}

const VirusTotalCard: React.FC<VirusTotalCardProps> = ({ virusTotal }) => {
  const isMalicious = (virusTotal?.malicious || 0) > 0;
  const isSuspicious = (virusTotal?.suspicious || 0) > 0;

  return (
    <div className="glass-card !p-5 !bg-[#0d1424] !border-[#1a2234] space-y-4">
      <div className="flex items-center justify-between border-bottom pb-3 border-[#1a2234]">
        <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Reputation Audit
        </h3>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${isMalicious ? 'text-red-500 bg-red-500/10' : isSuspicious ? 'text-yellow-500 bg-yellow-500/10' : 'text-success bg-success/10'}`}>
          {isMalicious ? 'THREAT_FOUND' : 'CLEAN_REPUTATION'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center py-2 border-r border-[#1a2234]">
          <span className="text-[7px] font-black text-red-500 uppercase mb-1">Malicious</span>
          <span className="text-xs font-black text-red-500">{virusTotal?.malicious || 0}</span>
        </div>
        <div className="flex flex-col items-center py-2 border-r border-[#1a2234]">
          <span className="text-[7px] font-black text-yellow-500 uppercase mb-1">Suspicious</span>
          <span className="text-xs font-black text-yellow-500">{virusTotal?.suspicious || 0}</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="text-[7px] font-black text-success uppercase mb-1">Harmless</span>
          <span className="text-xs font-black text-success">{virusTotal?.harmless || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default VirusTotalCard;
