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
    riskExplanation: string;
    priority: number;
    fixCode: {
      nodejs: string;
      apache: string;
      nginx: string;
      vercel: string;
    };
  };
}

const FixRecommendation: React.FC<FixRecommendationProps> = ({ fix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Security patch copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityLabel = fix.priority === 1 ? "FIX FIRST" : fix.priority === 2 ? "FIX NEXT" : "FIX LATER";
  const priorityColor = fix.priority === 1 ? "bg-red-500/20 text-red-500 border-red-500/30" : fix.priority === 2 ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" : "bg-primary/20 text-primary border-primary/30";

  return (
    <div className="space-y-6 pt-4 border-t border-white/5 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Terminal className="w-4 h-4" /> AI RECOMMENDED PATCH
        </h4>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${priorityColor}`}>
          {priorityLabel}
        </span>
      </div>

      <div className="space-y-4">
         <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
           <p className="text-xs text-muted-foreground leading-relaxed font-body">
             {fix.riskExplanation}
           </p>
         </div>

         <Tabs defaultValue="nodejs" className="w-full">
            <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl w-full grid grid-cols-4 h-11">
              <TabsTrigger value="nodejs" className="rounded-lg text-[10px] font-bold uppercase"><Box className="w-3.5 h-3.5 mr-1.5" /> Node</TabsTrigger>
              <TabsTrigger value="apache" className="rounded-lg text-[10px] font-bold uppercase"><Globe className="w-3.5 h-3.5 mr-1.5" /> Apache</TabsTrigger>
              <TabsTrigger value="nginx" className="rounded-lg text-[10px] font-bold uppercase"><Server className="w-3.5 h-3.5 mr-1.5" /> Nginx</TabsTrigger>
              <TabsTrigger value="vercel" className="rounded-lg text-[10px] font-bold uppercase"><Box className="w-3.5 h-3.5 mr-1.5" /> Vercel</TabsTrigger>
            </TabsList>

            {(['nodejs', 'apache', 'nginx', 'vercel'] as const).map((platform) => (
              <TabsContent key={platform} value={platform} className="mt-4 relative group">
                <div className="p-4 bg-slate-950 rounded-xl border border-white/10 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed text-blue-300">
                  {fix.fixCode[platform] || "// Patch not available for this platform"}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleCopy(fix.fixCode[platform])}
                  className="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all h-8"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </TabsContent>
            ))}
         </Tabs>
      </div>
    </div>
  );
};

export default FixRecommendation;
