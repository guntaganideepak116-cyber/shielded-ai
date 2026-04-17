import { useState } from 'react';
import { FIX_GUIDES } from '../lib/fixGuides';
import { toast } from 'react-hot-toast';

interface SmartFixCardProps {
  vulnerabilityId: string;
  scanResult: any;
  onRescan: () => Promise<void>;
}

export default function SmartFixCard({
  vulnerabilityId,
  scanResult,
  onRescan
}: SmartFixCardProps) {
  const guide = (FIX_GUIDES as any)[vulnerabilityId];
  if (!guide) return null;

  const [selectedPlatform, setSelectedPlatform] = useState(
    guide.platforms[scanResult?.platform]
      ? scanResult.platform
      : Object.keys(guide.platforms)[0]
  );
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [rescanning, setRescanning] = useState(false);
  const [fixed, setFixed] = useState(false);

  const platform = guide.platforms[selectedPlatform];
  const realSteps = platform.steps.filter((s: string) => s !== '');
  const totalSteps = realSteps.filter((s: string) =>
    !s.startsWith('STEP') && !s.startsWith('OPTION') &&
    !s.startsWith('Method') && !s.startsWith('(') && !s.startsWith('IMMEDIATE')
  ).length;
  const checkedCount = Object.values(checkedSteps)
    .filter(Boolean).length;
  const progress = totalSteps > 0
    ? Math.round((checkedCount / totalSteps) * 100) : 0;

  const severityColors: any = {
    critical: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444',
                text: '#ef4444', label: 'CRITICAL' },
    high:     { bg: 'rgba(255,51,102,0.1)', border: '#ff3366',
                text: '#ff3366', label: 'HIGH' },
    medium:   { bg: 'rgba(255,170,0,0.1)',  border: '#ffaa00',
                text: '#ffaa00', label: 'MEDIUM' },
    low:      { bg: 'rgba(136,146,164,0.1)',border: '#8892a4',
                text: '#8892a4', label: 'LOW' },
  };
  const sc = severityColors[guide.severity] || severityColors.low;

  const handleRescan = async () => {
    setRescanning(true);
    try {
      await onRescan();
    } finally {
      setRescanning(false);
    }
  };

  if (fixed) {
    return (
      <div className="animate-in fade-in duration-500" style={{
        background: 'rgba(0,255,136,0.08)',
        border: '1px solid rgba(0,255,136,0.3)',
        borderRadius: 12, padding: '32px 24px',
        textAlign: 'center',
        marginTop: '16px'
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <div style={{
          color: '#00ff88', fontWeight: 800,
          fontSize: 18, marginBottom: 4,
          letterSpacing: '-0.02em'
        }}>
          MARK_AS_RESOLVED
        </div>
        <div style={{
          color: '#8892a4', fontSize: 13, marginBottom: 24,
          maxWidth: '300px', margin: '0 auto 24px'
        }}>
          Configuration cached. Initiate re-scan to confirm the perimeter is now secure.
        </div>
        <button
          onClick={handleRescan}
          disabled={rescanning}
          className="hover:scale-105 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px 32px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
          }}
        >
          {rescanning ? '⟳ RE-SCANNING...' : '🔄 INITIATE VERIFICATION'}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500" style={{
      background: '#0d1424',
      border: `1px solid ${sc.border}44`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px',
        background: `${sc.bg}`,
        borderBottom: `1px solid ${sc.border}33`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div className="flex-1 min-w-[200px]">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8
          }}>
            <span style={{ fontSize: 24 }}>{guide.icon}</span>
            <span style={{
              color: '#f0f4ff',
              fontWeight: 800,
              fontSize: 18,
              fontFamily: 'inherit',
              letterSpacing: '-0.03em'
            }}>
              {guide.title}
            </span>
            <span style={{
              background: sc.bg,
              border: `1px solid ${sc.border}66`,
              color: sc.text,
              padding: '2px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              fontFamily: 'monospace'
            }}>
              {sc.label}
            </span>
          </div>
          <div style={{
            color: '#f0f4ff',
            fontSize: 14,
            opacity: 0.7,
            fontFamily: 'inherit',
            lineHeight: 1.6
          }}>
            {guide.description}
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: 20,
          flexShrink: 0,
          background: 'rgba(0,0,0,0.2)',
          padding: '12px 20px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#00d4ff',
              fontSize: 9,
              fontWeight: 900,
              fontFamily: 'monospace',
              marginBottom: 4,
              letterSpacing: 1
            }}>TIME</div>
            <div style={{ color: '#f0f4ff', fontSize: 13, fontWeight: 700 }}>
              {guide.estimatedTime}
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 20 }}>
            <div style={{
              color: '#00d4ff',
              fontSize: 9,
              fontWeight: 900,
              fontFamily: 'monospace',
              marginBottom: 4,
              letterSpacing: 1
            }}>LEVEL</div>
            <div style={{ color: '#f0f4ff', fontSize: 13, fontWeight: 700 }}>
              {guide.difficulty}
            </div>
          </div>
        </div>
      </div>

      {/* Impact warning */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(255,170,0,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <div style={{
          color: '#ffaa00',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          lineHeight: 1.5
        }}>
          <span className="font-black mr-2">THREAT:</span> {guide.impact}
        </div>
      </div>

      {/* Platform selector */}
      {Object.keys(guide.platforms).length > 1 && (
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{
            color: '#8892a4',
            fontSize: 10,
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: 2,
            marginRight: 6
          }}>
            STACK:
          </span>
          {Object.entries(guide.platforms).map(([key, plat]: any) => (
            <button
              key={key}
              onClick={() => setSelectedPlatform(key)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: selectedPlatform === key
                  ? 'rgba(0,212,255,0.15)'
                  : 'rgba(255,255,255,0.02)',
                border: selectedPlatform === key
                  ? '1px solid rgba(0,212,255,0.4)'
                  : '1px solid rgba(255,255,255,0.05)',
                color: selectedPlatform === key
                  ? '#00d4ff' : '#8892a4',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {plat.name}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <span style={{
              color: '#8892a4',
              fontSize: 10,
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: 1.5
            }}>
              REMEDIATION_STATUS
            </span>
            <span style={{
              color: progress === 100 ? '#00ff88' : '#00d4ff',
              fontSize: 11,
              fontWeight: 900,
              fontFamily: 'monospace'
            }}>
              {progress}%
            </span>
          </div>
          <div style={{
            height: 6,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: progress === 100
                ? '#00ff88'
                : 'linear-gradient(90deg,#00d4ff,#7c3aed)',
              borderRadius: 10,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: progress === 100 ? '0 0 10px rgba(0,255,136,0.3)' : 'none'
            }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{ padding: '24px 24px' }}>
        <div style={{
          color: '#8892a4',
          fontSize: 10,
          fontWeight: 900,
          fontFamily: 'monospace',
          letterSpacing: 2,
          marginBottom: 16
        }}>
          OPERATIONAL_GUIDE // {platform.name.toUpperCase()}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {platform.steps.map((step: string, i: number) => {
            if (step === '') return (
              <div key={i} style={{ height: 12 }} />
            );

            const isHeader =
              step.startsWith('STEP ') ||
              step.startsWith('OPTION ') ||
              step.startsWith('Method ') ||
              step.startsWith('IMMEDIATE') ||
              step.startsWith('For ');

            const isCode =
              step.startsWith('sudo ') ||
              step.startsWith('npm ') ||
              step.startsWith('apt ') ||
              step.startsWith('<') ||
              step.startsWith('{') ||
              step.startsWith('  ') ||
              step.match(/^[a-z_]+\s*[:=]\s*/) ||
              step.includes('://') ||
              step.startsWith('#') ||
              step.startsWith('Rewrite');

            if (isHeader) {
              return (
                <div key={i} style={{
                  color: '#00d4ff',
                  fontSize: 13,
                  fontWeight: 800,
                  marginTop: 8,
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {step}
                </div>
              );
            }

            if (isCode) {
              return (
                <div key={i} className="group relative" style={{
                  background: '#020409',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#00ff88',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  position: 'relative'
                }}>
                  {step}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(step);
                      toast.success("Command copied");
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-1.5 rounded"
                  >
                    📋
                  </button>
                </div>
              );
            }

            // Regular step with checkbox
            return (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '10px 14px',
                  borderRadius: 10,
                  transition: 'all 0.2s',
                  background: checkedSteps[i]
                    ? 'rgba(0,255,136,0.03)' : 'rgba(255,255,255,0.01)',
                  border: checkedSteps[i]
                    ? '1px solid rgba(0,255,136,0.1)' : '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps[i]}
                  onChange={e => setCheckedSteps(prev => ({
                    ...prev,
                    [i]: e.target.checked
                  }))}
                  style={{
                    marginTop: 4,
                    accentColor: '#00ff88',
                    width: 16,
                    height: 16,
                    flexShrink: 0
                  }}
                />
                <span style={{
                  color: checkedSteps[i] ? '#8892a4' : '#f0f4ff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  textDecoration: checkedSteps[i]
                    ? 'line-through' : 'none',
                  opacity: checkedSteps[i] ? 0.6 : 1,
                  transition: 'all 0.3s'
                }}>
                  {step}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      {guide.resources.length > 0 && (
        <div style={{
          padding: '14px 24px',
          background: 'rgba(0,0,0,0.15)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{
            color: '#8892a4',
            fontSize: 10,
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: 2
          }}>
            RESOURCES:
          </span>
          {guide.resources.map((r: any, i: number) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#00d4ff',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'inherit',
                textDecoration: 'none',
                padding: '4px 12px',
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 6,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.05)'}
            >
              {r.label} ↗
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <button
          onClick={() => {
            setFixed(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={progress < 50}
          className={`${progress < 50 ? 'opacity-50 grayscale' : 'hover:scale-105 active:scale-95'} transition-all`}
          style={{
            background: 'linear-gradient(135deg,#00ff88,#00d4ff)',
            color: '#020409',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 800,
            cursor: progress < 50 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            boxShadow: progress >= 50 ? '0 4px 15px rgba(0,255,136,0.2)' : 'none'
          }}
        >
          ✅ MARK AS FIXED
        </button>
        <button
          onClick={handleRescan}
          disabled={rescanning}
          className="hover:bg-primary/20 transition-all"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {rescanning ? '⟳ SCANN_IN_PROGRESS...' : '🔄 VERIFY_BY_RESCAN'}
        </button>
      </div>
    </div>
  );
}
