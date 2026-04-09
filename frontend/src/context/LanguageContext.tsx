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
    "nav.signin": "Sign In",
    "hero.title1": "Improves security",
    "hero.title2": "by fixing common vulnerabilities.",
    "hero.subtitle": "AI-powered security scanner that finds vulnerabilities, generates server configs, and fortifies your site — no security expertise needed.",
    "hero.scanButton": "Scan Your Website Free",
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
    "common.secure": "SECURE",
    "common.vulnerable": "VULNERABLE",
    "common.beta": "BETA v1.4 LIVE"
  },
  TE: {
    "nav.dashboard": "డ్యాష్‌బోర్డ్",
    "nav.history": "చరిత్ర",
    "nav.docs": "డాక్స్",
    "nav.signin": "సైన్ ఇన్",
    "hero.title1": "భద్రతను మెరుగుపరుస్తుంది",
    "hero.title2": "సాధారణ దుర్బలత్వాలను సరిచేయడం ద్వారా.",
    "hero.subtitle": "AI-ఆధారిత భద్రతా స్కానర్, ఇది లోపాలను కనుగొంటుంది, సర్వర్ కాన్ఫిగ్‌లను రూపొందిస్తుంది మరియు మీ సైట్‌ను బలపరుస్తుంది.",
    "hero.scanButton": "మీ వెబ్‌సైట్‌ను ఉచితంగా స్కాన్ చేయండి",
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
    "common.secure": "సురక్షితం",
    "common.vulnerable": "ప్రమాదకరం",
    "common.beta": "బీటా v1.4 లైవ్"
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
