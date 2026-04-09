import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

const OWASPCard = ({ owasp }: { owasp: any }) => {
  if (!owasp) return null;

  return (
    <div className="glass-card !p-5 border-white/5 space-y-4 !bg-[#0d1424] !border-[#1a2234]">
      <div className="flex items-center justify-between border-bottom pb-3 border-[#1a2234]">
        <h3 className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> OWASP Top 10 Audit
        </h3>
        <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full uppercase">Standard</span>
      </div>

      <div className="owasp-compact-list space-y-0.5">
        {Object.entries(owasp).map(([id, data]: [string, any]) => (
          <div key={id} className="owasp-compact-item">
              <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                <span className="text-[9px] font-black text-slate-600 uppercase w-6 shrink-0">
                  {id}
                </span>
                <span className="text-[10px] font-medium text-slate-300 truncate">{data.name}</span>
              </div>
            
            <div className="flex items-center gap-2">
              {data.status === 'pass' ? (
                <div className="flex items-center gap-1 text-success text-[8px] font-black uppercase tracking-tighter">
                  <CheckCircle2 className="w-2.5 h-2.5" /> PASS
                </div>
              ) : data.status === 'warn' ? (
                <div className="flex items-center gap-1 text-yellow-500 text-[8px] font-black uppercase tracking-tighter">
                  <AlertTriangle className="w-2.5 h-2.5" /> WARN
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500 text-[8px] font-black uppercase tracking-tighter">
                  <AlertCircle className="w-2.5 h-2.5" /> FAIL
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[8px] text-slate-600 italic text-center font-bold uppercase tracking-tighter">
        Verifying compliance against OWASP 2021 framework
      </p>
    </div>
  );
};

export default OWASPCard;
