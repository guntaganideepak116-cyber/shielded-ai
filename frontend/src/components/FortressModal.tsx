import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, X, Download, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type HostingPlatform, PLATFORMS, getPlatformCode, getPlatformSteps } from '@/lib/platform-detection';
import { toast } from 'react-hot-toast';

interface FortressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixed: () => void;
  platform: HostingPlatform;
  vulnerabilities?: any[];
  aiFixes?: any;
  scanResult?: any;
  setScanResult?: (result: any) => void;
  setIsRescanning?: (val: boolean) => void;
  setPreviousScore?: (score: number | null) => void;
}

const FortressModal = ({ 
  isOpen, 
  onClose, 
  onFixed, 
  platform: initialPlatform,
  vulnerabilities = [],
  aiFixes = null,
  scanResult,
  setScanResult,
  setIsRescanning,
  setPreviousScore
}: FortressModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<HostingPlatform>(initialPlatform);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyText, setCopyText] = useState('COPY ALL');
  const [localIsRescanning, setLocalIsRescanning] = useState(false);
  
  const info = PLATFORMS[selectedPlatform];
  const code = getPlatformCode(selectedPlatform);
  const steps = getPlatformSteps(selectedPlatform);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyText('Copied! ✓');
      toast.success("Code copied to clipboard!", { id: 'copy-fix' });
      setTimeout(() => {
        setCopied(false);
        setCopyText('COPY ALL');
      }, 2000);
    } catch (e) {
      toast.error("Failed to copy code");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = info.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${info.fileName} ✓`);
    } catch (e) {
      toast.error("Download failed");
    }
  };

  const handleFixedIt = async () => {
    if (!scanResult || !setScanResult || !setIsRescanning || !setPreviousScore) {
       // Fallback to simple close if props missing
       onFixed();
       return;
    }

    // 1. Save current score as "before"
    setPreviousScore(scanResult.score);

    // 2. Close fix panel immediately
    onClose();

    // 3. Start re-scan
    setIsRescanning(true);
    setLocalIsRescanning(true);

    try {
      toast.loading("Verifying your fix...", { id: 'rescan-status' });
      
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanResult.url })
      });
      
      if (!response.ok) throw new Error("Scan failed");
      
      const newResult = await response.json();

      // 4. Update results with new scan
      setScanResult(newResult);
      setIsRescanning(false);
      setLocalIsRescanning(false);

      // 5. Show score comparison toast
      const diff = (newResult.score || 0) - (scanResult.score || 0);
      if (diff > 0) {
        toast.success(`Score improved by +${diff} points!`, { id: 'rescan-status', duration: 5000 });
      } else if (diff === 0) {
        toast.error('Score unchanged. Check your deployment.', { id: 'rescan-status', duration: 5000 });
      } else {
        toast.error(`Score dropped by ${Math.abs(diff)} points.`, { id: 'rescan-status', duration: 5000 });
      }

    } catch (err) {
      setIsRescanning(false);
      setLocalIsRescanning(false);
      toast.error('Re-scan failed. Check connection.', { id: 'rescan-status' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full h-[100dvh] md:h-auto md:max-h-[85vh] max-w-2xl overflow-y-auto no-scrollbar glass-card-strong md:rounded-3xl p-6 pb-24 md:p-8 rounded-none md:my-8 safe-padding-top safe-padding-bottom"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Platform badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                  style={{ background: `${info.color}15`, border: `1px solid ${info.color}40` }}>
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-sm font-display font-bold" style={{ color: info.color }}>
                    {info.name.toUpperCase()} DETECTED
                  </span>
                </div>

                <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: '#667eea' }} />
                <h2 className="font-display text-2xl font-bold gradient-text">
                  YOUR FORTRESS CODE IS READY!
                </h2>
                <p className="text-muted-foreground text-sm mt-2 font-body">
                  Platform: <span className="text-primary font-semibold">{info.name}</span> → File: <span className="font-mono text-primary">{info.fileName}</span>
                </p>
              </motion.div>
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2 px-1">SELECT YOUR PLATFORM:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(PLATFORMS) as HostingPlatform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-display font-bold transition-all ${
                      selectedPlatform === p 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <span>{PLATFORMS[p].icon}</span>
                    <span>{PLATFORMS[p].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Steps */}
            <motion.div
              className="glass-card p-4 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="font-display font-semibold text-sm mb-3">📍 Step-by-step:</h3>
              <ol className="space-y-1.5">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-body">
                    <span className="font-display font-bold text-primary shrink-0 w-5">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Code block */}
            <motion.div
              className={`relative rounded-lg overflow-hidden neon-border transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-64'}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">{info.fileName}</span>
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary transition-colors"
                  >
                    [{isExpanded ? 'Collapse' : 'Expand'}]
                  </button>
                </div>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {copyText}
                    </>
                  )}
                </button>
              </div>
              <pre className={`p-4 text-xs text-foreground/80 overflow-x-auto font-mono leading-relaxed ${isExpanded ? '' : 'overflow-hidden'}`}>
                {code}
              </pre>
              {!isExpanded && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none cursor-pointer" 
                  onClick={() => setIsExpanded(true)}
                />
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={handleCopyAll} className="gradient-btn flex-1 font-display">
                <Copy className="w-4 h-4 mr-2" />
                {copyText}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 font-display border-border text-foreground hover:bg-muted">
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD {info.fileName.toUpperCase()}
              </Button>
              <Button 
                onClick={handleFixedIt} 
                className="flex-1 font-display bg-success hover:bg-success/90 text-success-foreground"
                disabled={localIsRescanning}
              >
                {localIsRescanning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                I'VE FIXED IT
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FortressModal;
