
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [config, setConfig] = useState({
    maintenanceMode: false,
    freeScanLimit: 3,
    proScanLimit: 200,
    aiModel: 'llama-3-70b',
    allowAnonymous: true
  });

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key} configuration updated`);
  };

  return (
    <div className="admin-fade-in" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--admin-text-primary)', fontSize: 24, fontFamily: 'Space Mono, monospace', margin: '0 0 8px' }}>
          Platform Configuration
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: 14, margin: 0 }}>
           Global system toggles and API rate limits
        </p>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--admin-border)' }}>
            <div>
               <div style={{ color: 'var(--admin-text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Maintenance Mode</div>
               <div style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>Redirect all traffic to a "Down for Maintenance" page</div>
            </div>
            <button 
              onClick={() => handleToggle('maintenanceMode')}
              style={{
                width: 50, height: 26, borderRadius: 13, padding: 3, cursor: 'pointer',
                background: config.maintenanceMode ? 'var(--admin-green)' : 'rgba(255,255,255,0.1)',
                border: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.3s',
                justifyContent: config.maintenanceMode ? 'flex-end' : 'flex-start'
              }}
            >
               <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </button>
         </div>

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--admin-border)' }}>
            <div>
               <div style={{ color: 'var(--admin-text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Allow Anonymous Scans</div>
               <div style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>Let users run audits without creating an account</div>
            </div>
            <button 
              onClick={() => handleToggle('allowAnonymous')}
              style={{
                width: 50, height: 26, borderRadius: 13, padding: 3, cursor: 'pointer',
                background: config.allowAnonymous ? 'var(--admin-cyan)' : 'rgba(255,255,255,0.1)',
                border: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.3s',
                justifyContent: config.allowAnonymous ? 'flex-end' : 'flex-start'
              }}
            >
               <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </button>
         </div>

         <div style={{ padding: '24px 0' }}>
            <div style={{ color: 'var(--admin-text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>API Rate Limiting</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
               <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', display: 'block', marginBottom: 8 }}>FREE TIER LIMIT</label>
                  <input 
                    type="number" className="admin-input" 
                    value={config.freeScanLimit} 
                    onChange={e => setConfig({...config, freeScanLimit: e.target.value})}
                    style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
                  />
               </div>
               <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: 11, letterSpacing: 1, fontFamily: 'Space Mono, monospace', display: 'block', marginBottom: 8 }}>PRO TIER LIMIT</label>
                  <input 
                    type="number" className="admin-input" 
                    value={config.proScanLimit} 
                    onChange={e => setConfig({...config, proScanLimit: e.target.value})}
                    style={{ background: 'var(--admin-bg-primary)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', color: 'white', width: '100%' }}
                  />
               </div>
            </div>
         </div>
      </div>

      <div className="admin-card" style={{ border: '1px solid var(--admin-danger)', background: 'rgba(220, 38, 38, 0.03)' }}>
         <div style={{ color: 'var(--admin-red)', fontSize: 13, fontWeight: 700, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>☣️ DANGER ZONE</div>
         <p style={{ color: 'var(--admin-text-muted)', fontSize: 12, marginBottom: 16 }}>This action will permanently purge all scan logs older than 90 days from the primary database shard. This is irreversible.</p>
         <button style={{ background: 'transparent', border: '1px solid var(--admin-red)', color: 'var(--admin-red)', padding: '8px 16px', borderRadius: '6px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            PURGE LEGACY LOGS
         </button>
      </div>
    </div>
  );
}
