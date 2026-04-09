import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Shield, Zap, Copy, RefreshCw, Terminal, 
  Code2, Check, Globe, Activity, Eye, EyeOff, Play, Loader2, Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LogoRenderer } from '@/components/LogoRenderer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const ApiDocs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'JS' | 'PY' | 'CURL'>('JS');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  
  // API Tester
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testing, setTesting] = useState(false);

  // Usage Stats
  const [usage, setUsage] = useState(0);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch API Key and Usage
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
       if (snapshot.exists()) {
          const data = snapshot.data();
          setApiKey(data.apiKey || null);
          setUsage(data.apiUsageToday || 0);
       } else {
          // Initialize user profile
          setDoc(userRef, { email: user.email, apiKey: generateKey(), apiUsageToday: 0 });
       }
       setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const generateKey = () => {
    return 'sw_' + [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
  };

  const handleRegenerate = async () => {
    if (!user || !window.confirm("Any existing apps using the current key will break. Continue?")) return;
    setRegenerating(true);
    try {
       const userRef = doc(db, 'users', user.uid);
       const newKey = generateKey();
       await updateDoc(userRef, { apiKey: newKey });
       toast.success("New API Key generated!");
    } catch (e) {
       toast.error("Regeneration failed");
    } finally {
       setRegenerating(false);
    }
  };

  const handleTestApi = async () => {
     if (!testUrl) return;
     setTesting(true);
     setTestResult(null);
     try {
        const response = await fetch('/api/scan', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ url: testUrl })
        });
        const data = await response.json();
        setTestResult(data);
        toast.success("API Response Received!");
     } catch (e) {
        toast.error("Test API failed");
     } finally {
        setTesting(false);
     }
  };

  const copyToClipboard = (text: string) => {
     navigator.clipboard.writeText(text);
     toast.success("Copied to clipboard!");
  };

  const jsCode = `const res = await fetch('https://secureweb-ai.vercel.app/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey || 'YOUR_API_KEY'}'
  },
  body: JSON.stringify({ url: '${testUrl || 'https://google.com'}' })
});
const data = await res.json();
console.log(data);`;

  const pyCode = `import requests

url = "https://secureweb-ai.vercel.app/api/scan"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey || 'YOUR_API_KEY'}"
}
payload = {"url": "${testUrl || 'https://google.com'}"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const curlCode = `curl -X POST https://secureweb-ai.vercel.app/api/scan \\
-H "Content-Type: application/json" \\
-H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
-d '{"url":"${testUrl || 'https://google.com'}"}'`;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
      <nav className="flex items-center justify-between p-6 bg-slate-900/50 border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <LogoRenderer className="w-8 h-8" />
          <span className="font-display font-bold text-xl tracking-tighter uppercase gradient-text">SecureWeb AI API</span>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => navigate('/documentation')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white">Full Docs</Button>
           <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white">Dashboard</Button>
           
           {canInstall && (
             <button onClick={handleInstallClick}
               style={{
                 background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                 color: 'white',
                 border: 'none',
                 borderRadius: '6px',
                 padding: '6px 14px',
                 fontSize: '11px',
                 cursor: 'pointer',
                 fontWeight: '600'
               }}>
               📱 Install App
             </button>
           )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: API Console */}
        <div className="lg:col-span-8 space-y-8">
           <div className="space-y-1">
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">Developer Interface</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Build secure-first architectures with our high-speed audit engine</p>
           </div>

           {/* Endpoint Details */}
           <div className="glass-card p-8 border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                 <Terminal className="w-5 h-5 text-primary" />
                 <h2 className="text-sm font-black uppercase tracking-widest italic">Core Endpoint</h2>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 border border-white/5 p-4 rounded-xl">
                 <span className="text-xs font-black bg-primary/20 text-primary px-3 py-1 rounded-md">POST</span>
                 <code className="text-sm font-mono tracking-tight text-slate-300">https://secureweb-ai.vercel.app/api/scan</code>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Request Payload</h3>
                    <div className="p-4 bg-slate-900 rounded-xl border border-white/5 font-mono text-xs text-slate-400">
                       {`{ "url": string }`}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate Limits</h3>
                    <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-slate-300 italic">Free Tier</span>
                          <span className="text-xs font-bold">{usage}/100</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(usage/100)*100}%` }} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Live Tester */}
           <div className="glass-card p-8 border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-success" />
                    <h2 className="text-sm font-black uppercase tracking-widest italic">API Sandbox</h2>
                 </div>
                 <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">Live Test Server</span>
              </div>
              <div className="flex gap-3 mb-6">
                 <Input 
                   placeholder="https://test-site.com" 
                   value={testUrl} onChange={e => setTestUrl(e.target.value)}
                   className="h-12 bg-slate-950 border-white/10 font-bold"
                 />
                 <Button onClick={handleTestApi} disabled={testing || !testUrl} className="h-12 px-8 bg-success text-black font-black uppercase text-[10px] tracking-widest rounded-xl">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXEC_COMMAND'}
                 </Button>
              </div>
              
              <AnimatePresence>
                {testResult && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-950 border border-white/10 rounded-2xl overflow-x-auto">
                      <pre className="text-[11px] font-mono leading-relaxed text-slate-400">
                         {JSON.stringify(testResult, null, 2)}
                      </pre>
                   </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Code Examples */}
           <div className="glass-card p-8 border-white/5 bg-slate-900/50">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-widest italic">Implementation</h2>
                 </div>
                 <div className="flex gap-1.5 p-1 bg-slate-950 border border-white/5 rounded-lg">
                    {['JS', 'PY', 'CURL'].map(tab => (
                       <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)}
                        className={`text-[9px] font-black px-3 py-1 rounded-md transition-all ${activeTab === tab ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                       >
                          {tab}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="relative">
                 <pre className="p-6 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto min-h-[160px]">
                    {activeTab === 'JS' ? jsCode : activeTab === 'PY' ? pyCode : curlCode}
                 </pre>
                 <Button 
                   size="icon" variant="ghost" 
                   onClick={() => copyToClipboard(activeTab === 'JS' ? jsCode : activeTab === 'PY' ? pyCode : curlCode)}
                   className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                 >
                    <Copy className="w-3.5 h-3.5" />
                 </Button>
              </div>
           </div>
        </div>

        {/* Right Column: Key Management */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card p-8 border-primary/20 bg-primary/5 space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <Key className="w-5 h-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Auth System</span>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Production API Key</label>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-12 bg-slate-950 border border-white/10 rounded-xl px-4 flex items-center justify-between overflow-hidden">
                          <span className={`${!showKey ? 'blur-sm select-none' : ''} text-sm font-mono tracking-wider font-bold`}>
                             {apiKey || '••••••••••••••••'}
                          </span>
                          <button onClick={() => setShowKey(!showKey)} className="text-slate-500 hover:text-white transition-colors">
                             {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                       </div>
                       <Button onClick={() => copyToClipboard(apiKey || '')} size="icon" className="h-12 w-12 shrink-0 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800">
                          <Copy className="w-4 h-4 text-slate-400" />
                       </Button>
                    </div>
                 </div>
                 <Button 
                   onClick={handleRegenerate} disabled={regenerating}
                   className="w-full h-12 border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" variant="outline"
                 >
                    {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} REGENERATE_KEY
                 </Button>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 space-y-3">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                    <Info className="w-3.5 h-3.5" /> SECURITY_NOTICE
                 </div>
                 <p className="text-[10px] leading-relaxed text-slate-400 font-medium">Keep your API key private. Exposing it allows others to use your daily scan quota.</p>
              </div>
           </div>

           <div className="glass-card p-8 border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primary" /> Fast Start
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium font-body italic">
                Our API is built for speed. Integrate our scanner into your CI/CD pipelines to prevent vulnerable code from reaching production.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
