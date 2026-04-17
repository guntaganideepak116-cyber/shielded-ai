import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Copy, CheckCircle, PartyPopper, MousePointer, Monitor, FolderOpen, FileEdit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type HostingPlatform, PLATFORMS, getPlatformCode } from '@/lib/platform-detection';

interface NewbieGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  platform: HostingPlatform;
  url: string;
}

interface GuideStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  illustration: React.ReactNode;
  hint: string;
  copyText?: string;
}

function usePlatformSteps(platform: HostingPlatform, url: string): GuideStep[] {
  const code = getPlatformCode(platform);
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  switch (platform) {
    case 'vercel':
      return [
        {
          title: 'Open your project in VS Code',
          subtitle: 'Navigate to the root folder of your Vercel project',
          icon: <Monitor className="w-6 h-6" />,
          illustration: <StepIllustration icon="📁" label="my-project/" sublabel="Open terminal: Ctrl + `" color="hsl(0, 0%, 100%)" />,
          hint: 'Can\'t find it? Check your GitHub/GitLab repos.',
        },
        {
          title: 'Create vercel.json',
          subtitle: 'Create a new file called vercel.json in your project root',
          icon: <FileEdit className="w-6 h-6" />,
          illustration: <StepIllustration icon="📄" label="vercel.json" sublabel="Right-click → New File → vercel.json" color="hsl(0, 0%, 100%)" />,
          hint: 'The file must be in the ROOT folder, same level as package.json.',
          copyText: code,
        },
        {
          title: 'Paste the security code',
          subtitle: 'Copy the code below and paste it into vercel.json',
          icon: <Copy className="w-6 h-6" />,
          illustration: <CodePreview code={code} fileName="vercel.json" />,
          hint: 'Replace any existing content in vercel.json.',
          copyText: code,
        },
        {
          title: 'Deploy with git push',
          subtitle: 'Commit and push — Vercel auto-deploys!',
          icon: <Save className="w-6 h-6" />,
          illustration: <StepIllustration icon="🚀" label="git add . && git commit -m 'security' && git push" sublabel="Vercel deploys automatically!" color="hsl(160, 84%, 39%)" isTerminal />,
          hint: 'Wait 30-60 seconds for deployment to complete.',
          copyText: 'git add . && git commit -m "add security headers" && git push',
        },
      ];

    case 'netlify':
      return [
        {
          title: 'Open your Netlify project',
          subtitle: 'Navigate to your project folder in VS Code or file manager',
          icon: <Monitor className="w-6 h-6" />,
          illustration: <StepIllustration icon="📁" label="my-site/" sublabel="Open in VS Code or terminal" color="hsl(172, 100%, 41%)" />,
          hint: 'Your project root — where index.html or package.json lives.',
        },
        {
          title: 'Create _headers file',
          subtitle: 'Create a file called _headers (no extension!) in public/ or root',
          icon: <FileEdit className="w-6 h-6" />,
          illustration: <StepIllustration icon="📄" label="_headers" sublabel="No file extension! Just _headers" color="hsl(172, 100%, 41%)" />,
          hint: 'For React/Vue apps, put it in the public/ folder.',
          copyText: code,
        },
        {
          title: 'Paste & Deploy',
          subtitle: 'Paste the security rules, commit, and push',
          icon: <Save className="w-6 h-6" />,
          illustration: <CodePreview code={code} fileName="_headers" />,
          hint: 'Netlify auto-deploys on git push. Wait ~30 seconds.',
          copyText: code,
        },
      ];

    case 'wordpress':
      return [
        {
          title: 'Install Security Headers Plugin',
          subtitle: 'Go to WordPress Dashboard → Plugins → Add New',
          icon: <Monitor className="w-6 h-6" />,
          illustration: <StepIllustration icon="🔌" label={`${cleanUrl}/wp-admin/plugin-install.php`} sublabel='Search: "Security Headers" by SimonW → Install → Activate' color="hsl(204, 88%, 44%)" />,
          hint: 'This plugin adds headers without editing code!',
          copyText: `${cleanUrl}/wp-admin/plugin-install.php`,
        },
        {
          title: 'Add .htaccess rules',
          subtitle: 'Open File Manager → public_html → .htaccess → Edit',
          icon: <FileEdit className="w-6 h-6" />,
          illustration: <CodePreview code={code} fileName=".htaccess" />,
          hint: 'Paste ABOVE the # BEGIN WordPress line. Don\'t touch WP rules!',
          copyText: code,
        },
      ];

    case 'github-pages':
    case 'cloudflare':
      return [
        {
          title: 'Open your repository',
          subtitle: `Open your ${platform === 'github-pages' ? 'GitHub' : 'Cloudflare'} project locally`,
          icon: <Monitor className="w-6 h-6" />,
          illustration: <StepIllustration icon="📁" label="my-repo/" sublabel="git clone if you haven't already" color={PLATFORMS[platform].color} />,
          hint: 'Make sure you\'re on the correct branch.',
        },
        {
          title: 'Create _headers file',
          subtitle: 'Add _headers file to your project root',
          icon: <FileEdit className="w-6 h-6" />,
          illustration: <CodePreview code={code} fileName="_headers" />,
          hint: 'No file extension needed — just _headers.',
          copyText: code,
        },
        {
          title: 'Commit & Push',
          subtitle: 'Deploy your changes',
          icon: <Save className="w-6 h-6" />,
          illustration: <StepIllustration icon="🚀" label='git add _headers && git commit -m "security" && git push' sublabel="Changes deploy automatically!" color="hsl(160, 84%, 39%)" isTerminal />,
          hint: 'Give it 1-2 minutes to rebuild.',
          copyText: 'git add _headers && git commit -m "add security headers" && git push',
        },
      ];

    case 'apache':
    default:
      return [
        {
          title: 'Open cPanel',
          subtitle: `Go to ${cleanUrl}/cpanel in your browser`,
          icon: <Monitor className="w-6 h-6" />,
          illustration: <StepIllustration icon="🖥" label={`${cleanUrl}/cpanel`} sublabel="Enter your hosting email & password" color="hsl(0, 67%, 50%)" />,
          hint: 'Check your hosting provider email for login details.',
          copyText: `${cleanUrl}/cpanel`,
        },
        {
          title: 'Open File Manager',
          subtitle: 'Find "File Manager" in the cPanel dashboard',
          icon: <FolderOpen className="w-6 h-6" />,
          illustration: <StepIllustration icon="📂" label="File Manager" sublabel="Click the File Manager icon on dashboard" color="hsl(40, 96%, 53%)" />,
          hint: 'It\'s usually under the "Files" section at the top.',
        },
        {
          title: 'Navigate to public_html',
          subtitle: 'Click public_html in the left sidebar',
          icon: <MousePointer className="w-6 h-6" />,
          illustration: <StepIllustration icon="📁" label="public_html/" sublabel="← Click in left sidebar folder tree" color="hsl(40, 96%, 53%)" hasArrow />,
          hint: 'This is your website\'s root folder.',
        },
        {
          title: 'Edit .htaccess',
          subtitle: 'Find .htaccess → Right-click → Edit',
          icon: <FileEdit className="w-6 h-6" />,
          illustration: <StepIllustration icon="⚙️" label=".htaccess" sublabel="If missing: + File → name it .htaccess" color="hsl(231, 84%, 66%)" hasArrow />,
          hint: 'Enable "Show Hidden Files" if you can\'t see it (Settings gear icon).',
        },
        {
          title: 'Paste code & Save',
          subtitle: 'Paste the SECUREWEB code → Click Save Changes',
          icon: <Save className="w-6 h-6" />,
          illustration: <CodePreview code={code} fileName=".htaccess" />,
          hint: 'Select all existing content first (Ctrl+A), then paste.',
          copyText: code,
        },
      ];
  }
}

// -- Sub-components --

function StepIllustration({ icon, label, sublabel, color, hasArrow, isTerminal }: {
  icon: string; label: string; sublabel: string; color: string; hasArrow?: boolean; isTerminal?: boolean;
}) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border" style={{ background: 'hsl(var(--card))' }}>
      {/* Fake window bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(40, 96%, 53%, 0.6)' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-[10px] text-muted-foreground font-mono truncate">{isTerminal ? 'Terminal' : label}</span>
      </div>
      <div className="p-6 flex flex-col items-center gap-3 min-h-[120px] justify-center">
        <span className="text-4xl">{icon}</span>
        <p className={`text-sm font-mono text-center ${isTerminal ? 'bg-muted/50 px-3 py-1.5 rounded' : ''}`} style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground text-center font-body">{sublabel}</p>
        {hasArrow && (
          <motion.div
            className="absolute left-6 top-1/2 text-destructive text-2xl"
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            👉
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CodePreview({ code, fileName }: { code: string; fileName: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden neon-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="text-[10px] text-muted-foreground font-mono">{fileName}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors">
          {copied ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-3 text-[10px] text-foreground/80 overflow-x-auto font-mono leading-relaxed max-h-32">
        {code}
      </pre>
    </div>
  );
}

// -- Main wizard --

const NewbieGuide = ({ isOpen, onClose, onComplete, platform, url }: NewbieGuideProps) => {
  const steps = usePlatformSteps(platform, url);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedStep, setCopiedStep] = useState(false);
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(s => s + 1);
      setCopiedStep(false);
    }
  }, [isLastStep, onComplete]);

  const handleBack = () => {
    setCurrentStep(s => Math.max(0, s - 1));
    setCopiedStep(false);
  };

  const handleCopyStep = async () => {
    if (step.copyText) {
      await navigator.clipboard.writeText(step.copyText);
      setCopiedStep(true);
      setTimeout(() => setCopiedStep(false), 2000);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const platformInfo = PLATFORMS[platform];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-auto glass-card-strong"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 pt-5 pb-3" style={{ background: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(12px)' }}>
              <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🧙‍♂️</span>
                <span className="font-display font-bold text-sm gradient-text">NEWBIE GUIDE</span>
                <span className="ml-auto text-xs text-muted-foreground font-body px-2 py-0.5 rounded-full bg-muted/50 border border-border">
                  {platformInfo.icon} {platformInfo.name}
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentStep(i); setCopiedStep(false); }}
                    className="relative flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: i <= currentStep
                        ? 'var(--gradient-primary)'
                        : 'hsl(var(--muted))',
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1.5">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>

            {/* Step content */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-2"
                >
                  {/* Step header */}
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>

                  {/* Illustration */}
                  <div className="w-full">
                    {step.illustration}
                  </div>

                  {/* Hint */}
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-xs text-muted-foreground font-body">{step.hint}</p>
                  </div>

                  {/* Copy button for this step */}
                  {step.copyText && (
                    <Button
                      onClick={handleCopyStep}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-body border-primary/30 text-primary hover:bg-primary/10"
                    >
                      {copiedStep ? (
                        <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Copied to clipboard!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy code for this step</>
                      )}
                    </Button>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="font-display border-border text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  BACK
                </Button>
                <Button
                  onClick={handleNext}
                  className={`flex-1 font-display font-bold ${isLastStep ? 'bg-success hover:bg-success/90 text-success-foreground' : 'gradient-btn'}`}
                >
                  {isLastStep ? (
                    <><PartyPopper className="w-4 h-4 mr-2" /> DONE — RE-SCAN NOW!</>
                  ) : (
                    <>NEXT <ArrowRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewbieGuide;
