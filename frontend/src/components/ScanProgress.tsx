import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASIC_STEPS = [
  { icon: '🔍', text: 'Validating URL architecture...'            },
  { icon: '📡', text: 'Parsing operational security headers...'   },
  { icon: '🔒', text: 'Authenticating SSL certificate chain...'    },
  { icon: '🦠', text: 'Initiating VirusTotal reputation scan...'   },
  { icon: '🤖', text: 'Compiling AI remediation blueprints...'    },
];

const DEEP_STEPS = [
  { icon: '🔍', text: 'Validating & recursive URI crawling...'    },
  { icon: '📡', text: 'Hardening analysis of security headers...' },
  { icon: '🔒', text: 'Authenticating SSL certificate chain...'    },
  { icon: '🦠', text: 'Running VirusTotal deep-vector scan...'    },
  { icon: '🔑', text: 'Scanning for exposed API keys & secrets...' },
  { icon: '📁', text: 'Checking directory traversal exposure...'  },
  { icon: '🚪', text: 'Scanning network ports via Shodan...'      },
  { icon: '📧', text: 'Auditing DNS (SPF/DMARC) records...'       },
  { icon: '🤖', text: 'Generating enterprise-grade fix logic...'  },
];

interface ScanProgressProps {
  scanType: 'basic' | 'deep';
  onComplete?: () => void;
}

export default function ScanProgress({ scanType, onComplete }: ScanProgressProps) {
  const steps = scanType === 'deep' ? DEEP_STEPS : BASIC_STEPS;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const totalTime = scanType === 'deep' ? 45000 : 15000;
    const stepDuration = totalTime / steps.length;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [scanType, steps.length]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020409] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" 
        style={{ 
          background: scanType === 'deep' 
            ? 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' 
            : 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' 
        }} 
      />

      {/* Shield pulse */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[80px] mb-8 relative z-10"
      >
        {scanType === 'deep' ? '🛡️' : '🔍'}
      </motion.div>

      {/* Mode Badge */}
      <div className={`px-4 py-1.5 rounded-full border mb-8 flex items-center gap-2 relative z-10 font-mono text-[10px] font-black tracking-[0.2em] uppercase ${
        scanType === 'deep' 
          ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' 
          : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
      }`}>
        {scanType === 'deep' ? 'Deep Intel Audit — 27 Checkpoints' : 'Basic Security Audit — 8 Checkpoints'}
      </div>

      {/* Step Indicator */}
      <div className="w-full max-w-[420px] px-8 space-y-3 relative z-10">
        <AnimatePresence mode="wait">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: i <= currentStep ? 1 : 0.2,
                x: 0,
                color: i === currentStep ? (scanType === 'deep' ? '#c084fc' : '#22d3ee') : (i < currentStep ? '#94a3b8' : '#475569')
              }}
              className="flex items-center gap-4 py-1"
            >
              <span className={`text-base shrink-0 ${i === currentStep ? 'animate-pulse' : ''}`}>
                {i < currentStep ? '✅' : step.icon}
              </span>
              <span className="font-mono text-[12px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {step.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-[420px] px-8 mt-10 relative z-10">
        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ 
              background: scanType === 'deep' 
                ? 'linear-gradient(90deg, #7c3aed, #c084fc)' 
                : 'linear-gradient(90deg, #00d4ff, #00ff88)' 
            }}
          />
        </div>
        <div className="flex justify-between mt-3 font-mono text-[9px] font-bold text-slate-500 tracking-wider">
          <span>MODULE {currentStep + 1} / {steps.length}</span>
          <span className={scanType === 'deep' ? 'text-purple-400' : 'text-cyan-400'}>
            {Math.round(((currentStep + 1) / steps.length) * 100)}% COMPLETE
          </span>
        </div>
      </div>
    </div>
  );
}
