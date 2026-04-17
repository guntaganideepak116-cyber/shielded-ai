/* eslint-disable */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Terminal, Server, Globe, Box, Check } from "lucide-react";
import { toast } from "sonner";

interface FixRecommendationProps {
  vulnerabilityId: string;
  fix: {
    vulnerabilityId: string;
    vulnerability: string;
    riskExplanation: string;
    priority: number;
    platformFixes: {
      [key: string]: { code: string; instructions: string };
    };
  };
}

const FixRecommendation: React.FC<FixRecommendationProps> = ({ fix }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('vercel');

  const platforms = [
    { id: 'vercel', name: 'Vercel', icon: Box },
    { id: 'netlify', name: 'Netlify', icon: Globe },
    { id: 'github', name: 'GitHub', icon: Terminal },
    { id: 'apache', name: 'Apache', icon: Globe },
    { id: 'nginx', name: 'Nginx', icon: Server },
    { id: 'nodejs', name: 'Node.js', icon: Box },
    { id: 'cloudflare', name: 'Cloudflare', icon: Globe }
  ];

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Security patch copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityLabel = fix.priority <= 3 ? "CRITICAL FIX" : fix.priority <= 6 ? "STRENGTHEN" : "OPTIMIZE";
  const priorityColor = fix.priority <= 3 ? "bg-red-500/20 text-red-500 border-red-500/30" : fix.priority <= 6 ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" : "bg-primary/20 text-primary border-primary/30";

  return (
    <div className="space-y-6 pt-4 border-t border-white/5 mt-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Terminal className="w-4 h-4" /> SECURE_ENGINE_OUTPUT
        </h4>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${priorityColor}`}>
          {priorityLabel}
        </span>
      </div>

      <div className="space-y-4">
         <div className="p-4 bg-primary/[0.03] rounded-xl border border-primary/10">
            <p className="text-[11px] text-slate-400 leading-relaxed font-body">
              <span className="text-primary font-bold mr-2">ANALYSIS:</span>
              {fix.riskExplanation}
            </p>
         </div>

         <Tabs defaultValue="vercel" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl flex gap-1 h-11 w-max">
                {platforms.map((p) => (
                  <TabsTrigger 
                    key={p.id} 
                    value={p.id} 
                    className="rounded-lg text-[9px] font-black uppercase px-4 h-9 data-[state=active]:bg-primary/[0.08] data-[state=active]:text-primary"
                  >
                    <p.icon className="w-3 h-3 mr-2" /> {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {platforms.map((p) => {
              const platformData = fix.platformFixes?.[p.id];
              const hasCode = !!platformData?.code;
              const hasInstructions = !!platformData?.instructions;

              return (
                <TabsContent key={p.id} value={p.id} className="mt-4 space-y-3 relative group">
                  {hasInstructions && (
                    <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-[10px] text-yellow-200/80 leading-relaxed italic">
                      💡 {platformData.instructions}
                    </div>
                  )}
                  
                  {hasCode ? (
                    <div className="relative group/code">
                      <div className="p-5 bg-slate-950 rounded-2xl border border-white/10 font-mono text-[10px] overflow-x-auto whitespace-pre leading-loose text-blue-300 shadow-inner">
                        {platformData.code}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopy(platformData.code)}
                        className="absolute top-3 right-3 text-white/30 hover:text-white hover:bg-white/10 h-8 rounded-lg"
                      >
                        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  ) : (
                    !hasInstructions && (
                      <div className="p-10 text-center glass-card border-dashed border-white/5 rounded-2xl">
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Patch not required for this node</span>
                      </div>
                    )
                  )}
                </TabsContent>
              );
            })}
         </Tabs>
      </div>
    </div>
  );
};

export default FixRecommendation;
