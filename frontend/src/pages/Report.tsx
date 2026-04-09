import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle2, AlertTriangle, Clock, Globe, 
  Download, Share2, ArrowLeft, Activity, Lock, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { LogoRenderer } from '@/components/LogoRenderer';
import { getGrade, getGradeColor, type ScanResult } from '@/lib/scan-data';
import ScoreDisplay from '@/components/ScoreDisplay';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import HeadersGrid from '@/components/HeadersGrid';
import SSLCard from '@/components/SSLCard';
import VirusTotalCard from '@/components/VirusTotalCard';
import OWASPCard from '@/components/OWASPCard';
import { generatePDFReport } from '@/lib/report-generator';

const Report = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a dedicated GET /api/report/:id
        // For now, we'll fetch from our history logic or a mock if not found
        const response = await fetch(`/api/history`);
        if (response.ok) {
           const history = await response.json();
           const found = history.find((h: ScanResult) => h.id === scanId);
           if (found) {
              setReport({
                 ...found,
                 score: found.afterScore ?? found.score,
                 vulnerabilities: found.vulnerabilities || found.issues || []
              });
           } else {
              toast.error("Report not found in database");
           }
        }
      } catch (err) {
        console.error("Report Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [scanId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Audit Report...</p>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
       <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
       <h1 className="text-4xl font-display font-black uppercase italic mb-4">Access Denied</h1>
       <p className="text-slate-400 mb-8 max-w-md">This security report may have been purged or you do not have permission to view it.</p>
       <Button onClick={() => navigate('/scan')} className="h-12 px-8 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest">Back to Scanner</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body pb-20">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <LogoRenderer className="w-8 h-8" />
              <span className="font-display font-bold text-xl tracking-tighter gradient-text uppercase">SecureReport</span>
           </div>
           <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/scan')} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Active Scanner</Button>
           </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl hover:bg-primary/20 hover:text-primary transition-all">
                    <ArrowLeft className="w-4 h-4" />
                 </button>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">CERTIFIED AUDIT REPORT</span>
                    <h1 className="text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter break-all">{report.url}</h1>
                 </div>
              </div>
              <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-12 md:pl-16">
                 <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(report.timestamp || report.created_at).toLocaleString()}</div>
                 <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Trace ID: {scanId?.slice(0, 8)}</div>
              </div>
           </div>

           <div className="flex gap-3 w-full md:w-auto">
              <Button onClick={() => generatePDFReport(report)} className="flex-1 md:flex-none h-14 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest">
                 <Download className="w-4 h-4 mr-3" /> PDF Export
              </Button>
              <Button onClick={() => navigate('/scan', { state: { reScanUrl: report.url } })} className="flex-1 md:flex-none h-14 px-8 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest shadow-xl">
                 <RefreshCcw className="w-4 h-4 mr-3" /> Re-Scan
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <ScoreDisplay score={report.score} />
                 <div className="glass-card p-10 border-white/5 flex flex-col justify-center space-y-6 bg-slate-900/30">
                    <h3 className="text-xl font-display font-black uppercase italic tracking-tighter text-primary">Executive Summary</h3>
                    <p className="text-sm font-medium leading-relaxed italic text-slate-400">
                       The audited domain shows a status of <span className={`${getGradeColor(report.score)} font-black uppercase`}>{getGrade(report.score)} compliance</span>. 
                       Infrastructure is currently operating with documented vulnerability vectors. Immediate remediation is recommended for all critical flags.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 border-t border-white/5">
                       <Activity className="w-4 h-4" /> Audited by SecureLabs Engine v5.0
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                   <Lock className="w-5 h-5 text-destructive" /> Active Vulnerability Vectors
                 </h3>
                 <div className="space-y-4">
                    {report.vulnerabilities.map((v: any, i: number) => (
                       <VulnerabilityCard key={v.id || i} vuln={v} index={i} />
                    ))}
                    {report.vulnerabilities.length === 0 && (
                       <div className="p-20 text-center glass-card border-success/20 bg-success/5">
                          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-success" />
                          <h4 className="text-2xl font-display font-black uppercase italic">Full Perimeter Security</h4>
                          <p className="text-sm text-slate-500 font-medium italic">This domain has passed all 50+ points of the security audit handshake.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-12">
              <HeadersGrid headers={report.headers} />
              <SSLCard ssl={report.ssl} />
              <VirusTotalCard virusTotal={report.virusTotal} />
              <OWASPCard owasp={report.owasp} />
           </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
