import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signInWithGoogle, signInWithGithub } = useAuth();

  const handleAuth = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGithub();
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md glass-card-strong p-8 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold gradient-text mb-2">Claim Your History</h2>
            <p className="text-sm text-muted-foreground font-body mb-8">
              Sign in to save your security scans permanently and access advanced tools.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => handleAuth('google')}
                className="w-full py-6 bg-white text-black hover:bg-gray-100 font-display font-bold rounded-xl flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </Button>

              <Button 
                onClick={() => handleAuth('github')}
                className="w-full py-6 bg-[#24292e] text-white hover:bg-[#2b3137] font-display font-bold rounded-xl flex items-center justify-center gap-3"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </Button>
            </div>

            <p className="mt-6 text-[10px] text-muted-foreground font-body">
              By continuing, you agree to SECURESHIELD AI's Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
