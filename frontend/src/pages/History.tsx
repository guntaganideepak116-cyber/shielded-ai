import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHistory, clearHistory } from '@/lib/scan-history';
import { fetchUserScans, type ScanItem } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { getGrade, getGradeColor, type Vulnerability } from '@/lib/scan-data';

interface ScanItem {
  id: string;
  url: string;
  score: number;
  grade: string;
  vulnerabilities: any[];
  created_at?: string;
  timestamp?: Date | string;
}

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      setLoading(true);
      if (user) {
        const dbScans = await fetchUserScans();
        if (dbScans.length > 0) {
          setScans(dbScans.map(s => ({ ...s, vulnerabilities: (s.vulnerabilities as any[] | null) || [] })));
          setLoading(false);
          return;
        }
      }
      // Fallback to localStorage
      const local = getHistory();
      setScans(local.map(s => ({
        id: s.id,
        url: s.url,
        score: s.score,
        grade: s.grade || getGrade(s.score),
        vulnerabilities: s.vulnerabilities,
        timestamp: s.timestamp,
      })));
      setLoading(false);
    };
    loadScans();
  }, [user]);

  const handleClear = () => {
    clearHistory();
    setScans([]);
  };

  const formatDate = (ts: string | Date | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg gradient-text">SECURESHIELD AI</span>
          </button>
        </nav>

        <main className="container mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <Clock className="w-7 h-7 text-primary" />
                Scan History
              </h1>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {scans.length} scan{scans.length !== 1 ? 's' : ''} recorded
                {user && !user.is_anonymous && <span className="text-primary ml-1">• Synced</span>}
              </p>
            </div>
            {scans.length > 0 && (
              <Button
                variant="outline" size="sm" onClick={handleClear}
                className="text-xs font-body border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && scans.length === 0 && (
            <motion.div className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="font-display text-xl font-semibold text-muted-foreground mb-2">No Scans Yet</h2>
              <p className="text-sm text-muted-foreground/60 font-body mb-6">Run your first scan to see results here</p>
              <Button onClick={() => navigate('/')} className="gradient-btn font-display">Start Scanning</Button>
            </motion.div>
          )}

          <div className="relative max-w-2xl mx-auto">
            {scans.length > 0 && <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />}
            <AnimatePresence>
              {scans.map((scan, index) => {
                const colorClass = getGradeColor(scan.score);
                const vulns = scan.vulnerabilities || [];
                const critCount = vulns.filter(v => v.severity === 'critical').length;
                const highCount = vulns.filter(v => v.severity === 'high').length;
                const fixedCount = vulns.filter(v => v.status === 'fixed').length;
                const totalCount = vulns.length;

                return (
                  <motion.div key={scan.id} className="relative pl-14 pb-6"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div className={`absolute left-[18px] top-4 w-4 h-4 rounded-full border-2 border-background ${
                      scan.score >= 80 ? 'bg-success' : scan.score >= 50 ? 'bg-yellow-400' : 'bg-destructive'
                    }`} />
                    <div className="glass-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="font-display font-semibold text-sm text-foreground truncate">{scan.url}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-body">
                            {formatDate(scan.created_at || scan.timestamp)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`font-display text-2xl font-bold ${colorClass}`}>{scan.score}</div>
                          <div className={`text-xs font-semibold ${colorClass}`}>{scan.grade}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {critCount > 0 && <span className="severity-critical text-[10px] font-semibold px-2 py-0.5 rounded">{critCount} Critical</span>}
                        {highCount > 0 && <span className="severity-high text-[10px] font-semibold px-2 py-0.5 rounded">{highCount} High</span>}
                        {fixedCount > 0 && <span className="severity-medium text-[10px] font-semibold px-2 py-0.5 rounded">{fixedCount}/{totalCount} Fixed</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default History;
