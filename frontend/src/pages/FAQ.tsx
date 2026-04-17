import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Shield, Zap, Lock, Globe, Mail } from 'lucide-react';
import Footer from '@/components/Footer';

const faqs = [
  {
    question: "How does the AI Security Scanner work?",
    answer: "Our engine uses a multi-layered approach: first, it performs a real-time protocol audit of your server's headers. Then, it uses deep-learning patterns to detect exposed API keys, environment files, and database URIs in your frontend source code. Finally, it uses the VirusTotal and Shodan APIs to check global reputation and network vulnerabilities.",
    icon: Shield
  },
  {
    question: "What is the 'Fortress' Code Snippet?",
    answer: "It is a highly optimized configuration block designed to secure the '6 Basic Headers' (CSP, HSTS, XFO, etc.) in a single copy-paste operation. It is dynamically generated based on whether you are using Vercel, Nginx, or Apache.",
    icon: Zap
  },
  {
    question: "Is my data stored during a scan?",
    answer: "We only store the results of the scan (URL and found vulnerabilities) in your private dashboard for history tracking. We NEVER store the actual source code of your website. All sensitive patterns found are identified on-the-fly and only the locations are logged.",
    icon: Lock
  },
  {
    question: "Why do I need a 27-point security audit?",
    answer: "Traditional scanners often focus on high-level vulnerabilities only. Our 27-check registry covers everything from DNS records (SPF/DMARC) to server version disclosure and cookie flags, ensuring a comprehensive 360-degree hardening of your digital perimeter.",
    icon: Globe
  },
  {
    question: "How do I use the 'Smart Fix' guides?",
    answer: "For complex issues like '.env exposure' or 'missing DKIM records,' we provide interactive guides in your Mission Control dashboard. These guides walk you through exactly which settings to change on your host provider (Cloudflare, AWS, etc.) and let you verify the fix with a real-time re-scan.",
    icon: HelpCircle
  },
  {
    question: "Can I get email reports for my scans?",
    answer: "Yes! Pro users can enable automatic reporting. After every scan, a detailed PDF report is generated and can be broadcasted via email to your security team automatically.",
    icon: Mail
  }
];

const FAQItem = ({ faq, index }: { faq: typeof faqs[0], index: number }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card mb-4 overflow-hidden border-border/50 transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/30' : ''}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
            <faq.icon size={20} />
          </div>
          <span className="font-display font-bold text-sm text-foreground tracking-tight">
            {faq.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0 text-xs text-muted-foreground leading-relaxed font-body border-t border-border/10 mt-2">
              <div className="pt-4 pl-4 border-l-2 border-primary/20">
                {faq.answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <HelpCircle size={12} /> Support Center
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-6 tracking-tighter">
              Common <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
              Everything you need to know about SecureWeb AI's 27-check audit engine and our automated remediation workflow.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center"
          >
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Still have questions?</h3>
            <p className="text-xs text-muted-foreground mb-6">Our security experts are here to help you harden your perimeter.</p>
            <button className="gradient-btn px-6 py-3 rounded-xl text-xs font-bold font-display">
              Contact Security Team
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
