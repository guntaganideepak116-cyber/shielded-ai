import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, X, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type HostingPlatform, PLATFORMS, getPlatformCode, getPlatformSteps } from '@/lib/platform-detection';

interface FortressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixed: () => void;
  platform: HostingPlatform;
}

const FortressModal = ({ isOpen, onClose, onFixed, platform }: FortressModalProps) => {
  const [copied, setCopied] = useState(false);
  const info = PLATFORMS[platform];
  const code = getPlatformCode(platform);
  const steps = getPlatformSteps(platform);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = info.fileName;
    a.click();
    URL.revokeObjectURL(url);
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
            className="relative w-full max-w-2xl max-h-[85vh] overflow-auto glass-card-strong p-6 md:p-8"
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
              className="relative rounded-lg overflow-hidden neon-border"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground font-body">{info.fileName}</span>
                <button
                  onClick={handleCopy}
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
                      Copy All
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs text-foreground/80 overflow-x-auto font-mono leading-relaxed max-h-64">
                {code}
              </pre>
            </motion.div>

            {/* WordPress plugin recommendation */}
            {platform === 'wordpress' && (
              <motion.div
                className="mt-4 glass-card p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-display font-semibold text-sm mb-1">🔌 Recommended Plugin:</h3>
                <p className="text-xs text-muted-foreground font-body">
                  Install <span className="text-primary font-semibold">"Security Headers"</span> plugin by SimonW for GUI-based header management alongside .htaccess rules.
                </p>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={handleCopy} className="gradient-btn flex-1 font-display">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'COPIED!' : 'COPY ALL'}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 font-display border-border text-foreground hover:bg-muted">
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD {info.fileName.toUpperCase()}
              </Button>
              <Button onClick={onFixed} className="flex-1 font-display bg-success hover:bg-success/90 text-success-foreground">
                <CheckCircle className="w-4 h-4 mr-2" />
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
