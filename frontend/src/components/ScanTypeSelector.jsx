import { useState } from 'react';
import { motion } from 'framer-motion';

const SCAN_TYPES = {
  basic: {
    id: 'basic',
    name: 'Basic Scan',
    icon: '🔍',
    tagline: 'Quick security audit',
    time: '~15 seconds',
    checkCount: 8,
    plan: 'free',
    planLabel: 'FREE & PRO',
    planColor: '#00ff88',
    accentColor: '#00d4ff',
    checks: [
      { icon: '🔐', label: 'HTTP Security Headers (6 checks)' },
      { icon: '🔒', label: 'SSL Certificate Validity'         },
      { icon: '🦠', label: 'VirusTotal Reputation Scan'       },
      { icon: '🛡️', label: 'OWASP Basic Analysis'            },
      { icon: '🍪', label: 'Cookie Security Flags'            },
      { icon: '🖥️', label: 'Server Version Disclosure'       },
      { icon: '↩️', label: 'HTTP → HTTPS Redirect'           },
      { icon: '⚡', label: 'X-Powered-By Exposure'           },
    ],
    resultType: 'code-snippet',
    resultDescription: 'Copy-paste code fixes for every issue found',
    notIncluded: [
      'Exposed API Keys & Secrets',
      'Open Database Ports',
      'DNS Security (SPF/DMARC/DKIM)',
      'Directory Exposure (.env, .git)',
      'Malware Deep Scan',
    ]
  },

  deep: {
    id: 'deep',
    name: 'Deep Scan',
    icon: '🛡️',
    tagline: 'Comprehensive security audit',
    time: '~45 seconds',
    checkCount: 27,
    plan: 'pro',
    planLabel: 'PRO PLAN',
    planColor: '#7c3aed',
    accentColor: '#7c3aed',
    checks: [
      { icon: '✅', label: 'Everything in Basic Scan'         },
      { icon: '🔑', label: 'Exposed API Keys & Secrets'       },
      { icon: '📄', label: 'Exposed .env / .git Files'        },
      { icon: '🗄️', label: 'Database URI in Source Code'     },
      { icon: '🚪', label: 'Open Database Ports (Shodan)'     },
      { icon: '📧', label: 'DNS Security (SPF/DMARC/DKIM)'    },
      { icon: '🖥️', label: 'SSH Port Exposure'               },
      { icon: '🦠', label: 'Malware Deep Scan'                },
      { icon: '🔒', label: 'Admin Panel Access Check'         },
      { icon: '📋', label: 'phpinfo.php Exposure'            },
      { icon: '📜', label: 'CAA DNS Record'                   },
    ],
    resultType: 'fix-guide',
    resultDescription: 'Interactive step-by-step fix guides per platform',
    notIncluded: []
  }
};

export default function ScanTypeSelector({ selected, onSelect, userPlan }) {
  const [hovering, setHovering] = useState(null);

  return (
    <div className="w-full max-w-[680px] mx-auto mb-5">
      {/* Section label */}
      <div className="text-[#8892a4] text-[11px] font-mono tracking-[0.2em] text-center mb-3 uppercase">
        Choose Scan Intelligence Level
      </div>

      {/* Cards grid */}
      <div className="scan-type-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(SCAN_TYPES).map(type => {
          const isSelected = selected === type.id;
          const isLocked = type.plan === 'pro' && userPlan !== 'pro';
          const isHovered = hovering === type.id;

          return (
            <motion.div
              key={type.id}
              onMouseEnter={() => setHovering(type.id)}
              onMouseLeave={() => setHovering(null)}
              onClick={() => {
                if (isLocked) return;
                onSelect(type.id);
              }}
              whileHover={!isLocked ? { y: -2 } : {}}
              className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 border ${
                isSelected 
                  ? 'bg-white/[0.03] shadow-[0_0_30px_rgba(124,58,237,0.1)]' 
                  : 'bg-[#0d1424] border-[#1a2234] hover:border-white/20'
              } ${isLocked ? 'opacity-70 cursor-default' : ''}`}
              style={{
                borderColor: isSelected ? type.accentColor : undefined
              }}
            >
              {/* Selected indicator glow top bar */}
              {isSelected && (
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px]" 
                  style={{ background: type.accentColor }}
                />
              )}

              {/* PRO locked badge */}
              {isLocked ? (
                <div className="absolute top-3 right-3 bg-primary/20 border border-primary/40 rounded px-2 py-0.5 text-[9px] font-black text-primary font-mono tracking-widest">
                  🔒 PRO ONLY
                </div>
              ) : (
                <div 
                  className="absolute top-3 right-3 border rounded px-2 py-0.5 text-[9px] font-black font-mono tracking-widest"
                  style={{ 
                    background: `${type.planColor}1A`,
                    borderColor: `${type.planColor}33`,
                    color: type.planColor
                  }}
                >
                  {type.planLabel}
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl ${isSelected ? 'drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]' : ''}`}>
                  {type.icon}
                </span>
                <div>
                  <div className={`font-mono font-bold text-sm tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`} style={{ color: isSelected ? type.accentColor : undefined }}>
                    {type.name}
                  </div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    {type.tagline}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 mb-4 pb-3 border-b border-white/5">
                <div>
                  <div className="font-mono font-bold text-lg leading-none" style={{ color: type.accentColor }}>
                    {type.checkCount}
                  </div>
                  <div className="text-slate-500 text-[9px] uppercase font-bold mt-1">checks</div>
                </div>
                <div className="w-[1px] bg-white/5 self-stretch" />
                <div>
                  <div className="text-slate-200 font-bold text-[13px] leading-tight">
                    {type.time}
                  </div>
                  <div className="text-slate-500 text-[9px] uppercase font-bold mt-1">duration</div>
                </div>
                <div className="w-[1px] bg-white/5 self-stretch" />
                <div>
                  <div className="text-slate-200 font-bold text-[11px] leading-tight">
                    {type.resultType === 'code-snippet' ? '</> Snippets' : '📋 Fix Guides'}
                  </div>
                  <div className="text-slate-500 text-[9px] uppercase font-bold mt-1">results</div>
                </div>
              </div>

              {/* Checks list */}
              <div className="flex flex-col gap-1.5 mb-4">
                {type.checks.slice(0, 5).map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] shrink-0 opacity-80">{check.icon}</span>
                    <span className="text-slate-400 text-[11px] font-medium leading-tight">
                      {check.label}
                    </span>
                  </div>
                ))}
                {type.checks.length > 5 && (
                  <div className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: type.accentColor }}>
                    +{type.checks.length - 5} Enterprise checks
                  </div>
                )}
              </div>

              {/* Select button / selected state */}
              {isLocked ? (
                <a
                  href="/pricing"
                  onClick={e => e.stopPropagation()}
                  className="block text-center bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg py-2.5 text-[11px] font-black uppercase tracking-widest no-underline hover:opacity-90 transition-opacity"
                >
                  ⚡ Unlock Deep Scan
                </a>
              ) : isSelected ? (
                <div 
                  className="text-center rounded-lg py-2.5 text-[11px] font-black uppercase tracking-widest border"
                  style={{ 
                    background: `${type.accentColor}10`,
                    borderColor: type.accentColor,
                    color: type.accentColor 
                  }}
                >
                  ✓ Active Protocol
                </div>
              ) : (
                <div className="text-center bg-white/5 border border-white/5 rounded-lg py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
                  Initialize Scan
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
