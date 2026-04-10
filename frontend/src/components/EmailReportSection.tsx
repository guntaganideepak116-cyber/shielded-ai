import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface EmailReportSectionProps {
  user: any;
  emailInput: string;
  setEmailInput: (val: string) => void;
  emailStatus: 'sending' | 'success' | 'error' | null;
  emailMessage: string;
  setEmailStatus: (status: 'sending' | 'success' | 'error' | null) => void;
  setEmailMessage: (msg: string) => void;
  handleSendEmail: () => void;
}

export const EmailReportSection: React.FC<EmailReportSectionProps> = ({
  user,
  emailInput,
  setEmailInput,
  emailStatus,
  emailMessage,
  setEmailStatus,
  setEmailMessage,
  handleSendEmail
}) => {
  const { t } = useLanguage();

  return (
    <div className="email-report-section glass-card !bg-[#0d1424] !border-[#1a2234] !p-8 shadow-none space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t('report.share_report') || 'Share Executive Report'}
        </h4>
      </div>

      {user ? (
        /* Logged in → Auto-sent status */
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 text-primary group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-[0.2em] text-[8px] opacity-70 mb-0.5 whitespace-nowrap">Status: Delivered</span>
            <span className="text-[11px] font-medium leading-relaxed">
              Report auto-sent to <span className="text-white font-bold">{user.email}</span>
            </span>
          </div>
        </div>
      ) : (
        /* Guest → Email Input */
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (emailStatus === 'error') {
                  setEmailStatus(null);
                  setEmailMessage('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendEmail();
              }}
              placeholder="security-lead@company.com"
              disabled={emailStatus === 'sending'}
              className={`w-full bg-slate-950/80 pl-12 pr-4 py-4 rounded-xl border transition-all text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-slate-700 ${
                emailStatus === 'error' ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 focus:border-primary/50'
              }`}
            />
          </div>
          <Button 
            onClick={handleSendEmail}
            disabled={emailStatus === 'sending'}
            className="w-full h-14 bg-primary text-black hover:bg-white transition-all font-black uppercase text-[10px] tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/20"
          >
            {emailStatus === 'sending' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Delivering Intelligence...
              </>
            ) : (
              'Send Report to My Email'
            )}
          </Button>

          <AnimatePresence>
            {emailMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl text-[10px] font-bold flex items-center gap-3 border ${
                  emailStatus === 'success' 
                    ? 'bg-success/10 border-success/30 text-success' 
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}
              >
                {emailStatus === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span className="uppercase tracking-widest leading-relaxed">{emailMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
