import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "EN" | "TE";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<string, string> = {
  "nav.dashboard": "Dashboard",
  "nav.history": "History",
  "nav.docs": "Docs",
  "nav.security": "Security",
  "nav.monitoring": "Monitoring",
  "nav.api": "API Docs",
  "nav.signin": "Sign In",
  "hero.title1": "Secure your web",
  "hero.title2": "By fixing vulnerabilities automatically.",
  "hero.subtitle": "AI-powered security scanner that finds vulnerabilities, generates server configs, and fortifies your site — no security expertise needed.",
  "hero.cta": "Start Free Audit",
  "hero.trusted": "Trusted by digital architects",
  "scanner.title": "WEB PERIMETER",
  "scanner.subtitle": "Deploy AI-driven deep-packet audits. Detect over 50+ vulnerabilities in seconds.",
  "scanner.placeholder": "Enter website URL (e.g., example.com)",
  "scanner.button": "SCAN NOW",
  "scanner.liveDemo": "Try Live Demo",
  "report.certified": "CERTIFIED SECURITY AUDIT",
  "report.verified": "Verified Security Report",
  "report.score": "Security Score",
  "report.recommendations": "Strategic AI Recommendations",
  "report.overview": "Vulnerability Overview",
  "report.share_report": "Share Executive Report",
  "report.status_delivered": "Status: Delivered",
  "report.auto_sent": "Report auto-sent to",
  "report.send_button": "Send Report to My Email",
  "report.delivering": "Delivering Intelligence...",
  "dash.title": "Security Dashboard",
  "dash.total_scans": "Total Audits",
  "dash.avg_score": "Global Health",
  "dash.recent": "Recent Activity",
  "dash.monitoring": "Active Guard",
  "mon.title": "Real-time Monitoring",
  "mon.add": "Add New Monitor",
  "mon.status": "Infrastructure Status",
  "mon.alerts": "Threat Alerts",
  "hist.title": "Scan Archive",
  "hist.empty": "No audit records found",
  "hist.purge": "Purge History",
  "common.secure": "SECURE",
  "common.vulnerable": "VULNERABLE",
  "common.beta": "BETA v1.4 LIVE",
  "common.loading": "Processing..."
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang] = useState<Language>("EN");

  const t = (key: string) => {
    return dictionary[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
