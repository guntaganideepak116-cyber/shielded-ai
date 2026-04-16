import { motion } from 'framer-motion';
import { Share2, Download, Search, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScoreDisplay from '@/components/ScoreDisplay';

interface SuccessScreenProps {
  oldScore: number;
  newScore: number;
  onScanAnother: () => void;
}

const SuccessScreen = ({ oldScore, newScore, onScanAnother }: SuccessScreenProps) => {
  return (
    <motion.div
      className="text-center space-y-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      >
        <ShieldCheck className="w-20 h-20 mx-auto text-success" />
      </motion.div>

      <div>
        <h2 className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
          YOUR WEBSITE IS FORTIFIED!
        </h2>
        <p className="text-muted-foreground font-body">
          All critical vulnerabilities have been resolved
        </p>
      </div>

      <ScoreDisplay score={newScore} />

      {/* Before/After */}
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-sm text-muted-foreground font-body mb-1">Before</div>
          <div className="font-display text-2xl font-bold text-destructive">{oldScore}/100</div>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="text-2xl"
        >
          →
        </motion.div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground font-body mb-1">After</div>
          <div className="font-display text-2xl font-bold text-success">{newScore}/100</div>
        </div>
      </div>

      {/* Benefits */}
      <div className="flex flex-col items-center gap-2">
        {['Hackers Blocked', 'Google Loves You', 'Customers Trust You'].map((text, i) => (
          <motion.div
            key={text}
            className="flex items-center gap-2 text-sm font-body"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
          >
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-foreground">{text}</span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button className="gradient-btn font-display" onClick={onScanAnother}>
          <Search className="w-4 h-4 mr-2" />
          Scan Another Site
        </Button>
        <Button variant="outline" className="font-display border-border text-foreground hover:bg-muted">
          <Download className="w-4 h-4 mr-2" />
          PDF Report
        </Button>
        <Button variant="outline" className="font-display border-border text-foreground hover:bg-muted">
          <Share2 className="w-4 h-4 mr-2" />
          Share Score
        </Button>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;
