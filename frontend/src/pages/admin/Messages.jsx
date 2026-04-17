
import { useState } from 'react';
import toast from 'react-hot-toast';

const TEMPLATES = {
  critical: {
    subject: '🚨 Critical Security Alert for Your Website',
    body: `We detected a critical security issue on your website.
Your security score is dangerously low. Immediate action required.
Visit secureweb-ai.vercel.app to view the full report and apply fixes.`
  },
  reminder: {
    subject: '⚠️ Your Website Still Has Unresolved Vulnerabilities',
    body: `It has been several days since we detected security issues on your site.
These vulnerabilities remain unresolved and put your users at risk.
Log in to SecureWeb AI to apply the AI-generated fixes.`
  },
  announcement: {
    subject: '🛡️ SecureWeb AI — Platform Update',
    body: `We have added new security checks and features to SecureWeb AI.
Re-scan your website to get a fresh, comprehensive security report
with our latest detection capabilities.`
  },
  upgrade: {
    subject: '🚀 Upgrade to SecureWeb AI Pro',
    body: `You have reached your daily scan limit on the Free plan.
Upgrade to Pro for 200 scans/day, continuous monitoring,
advanced vulnerability detection, and priority support.`
  },
  custom: { subject: '', body: '' }
};

export default function Messages() {
  const [mode, setMode] = useState('individual'); // individual | broadcast | announcement
  const [toEmail, setToEmail] = useState('');
  const [template, setTemplate] = useState('critical');
  const [subject, setSubject] = useState(TEMPLATES.critical.subject);
  const [body, setBody] = useState(TEMPLATES.critical.body);
  const [broadcastFilter, setBroadcastFilter] = useState('score-low');
  const [sending, setSending] = useState(false);

  // Announcement fields
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState('info');
  const [annAudience, setAnnAudience] = useState('all');

  const handleTemplateChange = (t) => {
    setTemplate(t);
    setSubject(TEMPLATES[t].subject);
    setBody(TEMPLATES[t].body);
  };

  const sendIndividual = async () => {
    if (!toEmail.trim() || !subject.trim() || !body.trim()) {
      toast.error('Required fields missing');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'guntaganideepak116@gmail.com'
        },
        body: JSON.stringify({
          toEmail: toEmail.trim(),
          subject: subject.trim(),
          body: body.trim(),
          type: 'admin-direct'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Encrypted transmission delivered to ${toEmail}`);
        setToEmail('');
      } else {
        toast.error(data.error || 'Transmission failure');
      }
    } catch {
      toast.error('Network uplink error');
    } finally {
      setSending(false);
    }
  };

  const publishAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error('Title and message required');
      return;
    }
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'guntaganideepak116@gmail.com'
        },
        body: JSON.stringify({
          title: annTitle.trim(),
          message: annMessage.trim(),
          type: annType,
          audience: annAudience,
          active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Global announcement published to all nodes');
        setAnnTitle('');
        setAnnMessage('');
      } else {
        toast.error(data.error || 'Publishing failed');
      }
    } catch {
      toast.error('Network uplink error');
    }
  };

  return (
    <div className="admin-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          color: 'var(--admin-text-primary)',
          fontSize: 22,
          fontFamily: 'Space Mono, monospace',
          margin: '0 0 6px'
        }}>
          Communications Command Center
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: 14, margin: 0 }}>
          Manage user alerts and platform announcements
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ 
          display: 'flex', 
          gap: 4, 
          background: 'var(--admin-bg-secondary)', 
          padding: 4, 
          borderRadius: 10,
          border: '1px solid var(--admin-border)',
          marginBottom: 24,
          width: 'fit-content'
      }}>
        {[
          { key: 'individual',   label: '📧 Direct Email'    },
          { key: 'broadcast',    label: '📢 Strategic Broadcast' },
          { key: 'announcement', label: '📌 Global Announcement' },
        ].map(m => (
          <button
            key={m.key}
            className={`admin-tab ${mode === m.key ? 'active' : ''}`}
            onClick={() => setMode(m.key)}
            style={{
                padding: '10px 18px',
                borderRadius: 7,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: mode === m.key ? 'var(--admin-cyan)' : 'var(--admin-text-muted)',
                background: mode === m.key ? 'var(--admin-bg-card)' : 'transparent',
                border: 'none',
                fontFamily: 'DM Sans, sans-serif'
              }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* INDIVIDUAL */}
      {mode === 'individual' && (
        <div className="admin-card" style={{ maxWidth: 640 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>RECIPIENT NODE</label>
            <input
              className="admin-input"
              style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
              placeholder="user@gmail.com"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>PRESET TEMPLATE</label>
            <select
              style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
              value={template}
              onChange={e => handleTemplateChange(e.target.value)}
            >
              <option value="critical">🚨 Critical Security Alert</option>
              <option value="reminder">⚠️ Vulnerability Reminder</option>
              <option value="announcement">📢 Platform Announcement</option>
              <option value="upgrade">🚀 Upgrade Offer</option>
              <option value="custom">✏️ Custom Transmission</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>SUBJECT LINE</label>
            <input
              style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>TRANSMISSION CONTENT</label>
            <textarea
              style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%', resize: 'vertical', lineHeight: 1.6 }}
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          <button
            onClick={sendIndividual}
            disabled={sending}
            style={{
              background: 'linear-gradient(135deg, var(--admin-cyan), var(--admin-violet))',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {sending ? 'EXECUTING TRANSMISSION...' : 'SEND ENCRYPTED EMAIL'}
          </button>
        </div>
      )}

      {/* BROADCAST */}
      {mode === 'broadcast' && (
        <div className="admin-card" style={{ maxWidth: 640 }}>
          <div style={{
            background: 'rgba(255,170,0,0.08)',
            border: '1px solid rgba(255,170,0,0.2)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: 'var(--admin-yellow)',
            fontSize: 13
          }}>
            ⚠️ WARNING: Broadcast transmissions target entire user segments. This action is irreversible.
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>TARGET SEGMENT</label>
            <select
              style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
              value={broadcastFilter}
              onChange={e => setBroadcastFilter(e.target.value)}
            >
              <option value="score-low">Nodes with score &lt; 50</option>
              <option value="score-critical">Nodes with score &lt; 30</option>
              <option value="malicious">Nodes with malicious detection</option>
              <option value="free">All FREE tier users</option>
              <option value="all">Global Broadcast (All Nodes)</option>
            </select>
          </div>

          <input
            style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%', marginBottom: 12 }}
            placeholder="Broadcast subject..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <textarea
            style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%', resize: 'vertical' }}
            rows={5}
            placeholder="Broadcast message..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />

          <button
            style={{
              marginTop: 20,
              background: 'var(--admin-red)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            INITIATE MASS BROADCAST
          </button>
        </div>
      )}

      {/* IN-APP ANNOUNCEMENT */}
      {mode === 'announcement' && (
        <div className="admin-card" style={{ maxWidth: 640 }}>
          <div style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: 'var(--admin-cyan)',
            fontSize: 13
          }}>
            📌 This terminal publishes a persistent banner to the main site navigation bar for all nodes.
          </div>

          {/* Preview */}
          {(annTitle || annMessage) && (
            <div style={{
              background: annType === 'critical' ? 'rgba(255, 51, 102, 0.08)' : 
                         annType === 'warning' ? 'rgba(255, 170, 0, 0.08)' : 'rgba(0, 212, 255, 0.08)',
              border: `1px solid ${annType === 'critical' ? 'rgba(255, 51, 102, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`,
              borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{annTitle}</div>
                <div style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{annMessage}</div>
              </div>
              <div style={{ color: 'var(--admin-text-muted)', fontSize: 18 }}>×</div>
            </div>
          )}

          <input
            style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%', marginBottom: 12 }}
            placeholder="Headline (e.g. Critical Update)"
            value={annTitle}
            onChange={e => setAnnTitle(e.target.value)}
          />
          <textarea
             style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%', resize: 'vertical', marginBottom: 12 }}
            rows={3}
            placeholder="Message content..."
            value={annMessage}
            onChange={e => setAnnMessage(e.target.value)}
          />
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <select
              style={{ flex: 1, background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white' }}
              value={annType}
              onChange={e => setAnnType(e.target.value)}
            >
              <option value="info">ℹ️ System Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="critical">🚨 Critical Alert</option>
              <option value="success">✅ Maintenance Done</option>
            </select>
            <select
              style={{ flex: 1, background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white' }}
              value={annAudience}
              onChange={e => setAnnAudience(e.target.value)}
            >
              <option value="all">All Terminal Nodes</option>
              <option value="free">FREE Tier Only</option>
              <option value="pro">PRO Tier Only</option>
            </select>
          </div>

          <button 
            className="btn-primary" 
            onClick={publishAnnouncement}
            style={{
                background: 'linear-gradient(135deg, var(--admin-cyan), var(--admin-violet))',
                color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, cursor: 'pointer', width: '100%'
            }}
          >
            📌 BROADCAST TO MAIN TERMINAL
          </button>
        </div>
      )}
    </div>
  );
}
