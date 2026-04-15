import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "EN" | "TE";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  EN: {
    "nav.dashboard": "Dashboard",
    "nav.history": "History",
    "nav.docs": "Docs",
    "nav.security": "Security",
    "nav.monitoring": "Monitoring",
    "nav.api": "API Docs",
    "nav.signin": "Sign In",
    "hero.title1": "Improves security",
    "hero.title2": "by fixing common vulnerabilities.",
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
  },
  TE: {
    "nav.dashboard": "డ్యాష్‌బోర్డ్",
    "nav.history": "చరిత్ర",
    "nav.docs": "డాక్స్",
    "nav.security": "భద్రత",
    "nav.monitoring": "పర్యవేక్షణ",
    "nav.api": "API డాక్స్",
    "nav.signin": "సైన్ ఇన్",
    "hero.title1": "భద్రతను మెరుగుపరుస్తుంది",
    "hero.title2": "సాధారణ దుర్బలత్వాలను సరిచేయడం ద్వారా.",
    "hero.subtitle": "AI-ఆధారిత భద్రతా స్కానర్, ఇది లోపాలను కనుగొంటుంది, సర్వర్ కాన్ఫిగ్‌లను రూపొందిస్తుంది మరియు మీ సైట్‌ను బలపరుస్తుంది.",
    "hero.cta": "ఉచిత ఆడిట్ ప్రారంభించండి",
    "hero.trusted": "డిజిటల్ ఆర్కిటెక్ట్స్ ద్వారా విశ్వసించబడింది",
    "scanner.title": "వెబ్ పెరిమీటర్",
    "scanner.subtitle": "AI-ఆధారిత డీప్-పాకెట్ ఆడిట్‌లను అమలు చేయండి. సెకన్లలో 50+ లోపాలను గుర్తించండి.",
    "scanner.placeholder": "వెబ్‌సైట్ URLని నమోదు చేయండి (ఉదా. example.com)",
    "scanner.button": "ఇప్పుడే స్కాన్ చేయండి",
    "scanner.liveDemo": "లైవ్ డెమో ప్రయత్నించండి",
    "report.certified": "ధృవీకరించబడిన భద్రతా ఆడిట్",
    "report.verified": "ధృవీకరించబడిన భద్రతా నివేదిక",
    "report.score": "భద్రతా స్కోరు",
    "report.recommendations": "స్ట్రాటజిక్ AI సిఫార్సులు",
    "report.overview": "దుర్బలత్వ అవలోకనం",
    "report.share_report": "ఎగ్జిక్యూటివ్ నివేదికను పంచుకోండి",
    "report.status_delivered": "స్థితి: పంపబడింది",
    "report.auto_sent": "నివేదిక పంపబడింది:",
    "report.send_button": "నా ఈమెయిల్ కి పంపండి",
    "report.delivering": "పంపుతోంది...",
    "dash.title": "భద్రతా డ్యాష్‌బోర్డ్",
    "dash.total_scans": "మొత్తం ఆడిట్‌లు",
    "dash.avg_score": "గ్లోబల్ హెల్త్",
    "dash.recent": "ఇటీవలి కార్యకలాపాలు",
    "dash.monitoring": "యాక్టివ్ గార్డ్",
    "mon.title": "రియల్ టైమ్ పర్యవేక్షణ",
    "mon.add": "కొత్త మానిటర్‌ని జోడించండి",
    "mon.status": "ఇన్ఫ్రాస్ట్రక్చర్ స్థితి",
    "mon.alerts": "ముప్పు హెచ్చరికలు",
    "hist.title": "స్కాన్ ఆర్కైవ్",
    "hist.empty": "ఆడిట్ రికార్డులు కనుగొనబడలేదు",
    "hist.purge": "చరిత్రను తొలగించు",
    "common.secure": "సురక్షితం",
    "common.vulnerable": "ప్రమాదకరం",
    "common.beta": "బీటా v1.4 లైవ్",
    "common.loading": "లోడ్ అవుతోంది..."
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("preferredLanguage") as Language) || "EN";
  });

  useEffect(() => {
    localStorage.setItem("preferredLanguage", lang);
  }, [lang]);

  const t = (key: string) => {
    return dictionary[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
