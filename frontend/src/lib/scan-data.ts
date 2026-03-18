export interface Vulnerability {
  id: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'failed' | 'fixed';
  fixTime: string;
  description: string;
}

export interface ScanResult {
  id: string;
  url: string;
  score: number;
  grade: string;
  hostingType: string;
  vulnerabilities: Vulnerability[];
  timestamp: Date;
}

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: '1', issue: 'No HTTPS Redirect', severity: 'critical', status: 'failed', fixTime: '30s', description: 'Site accessible over unencrypted HTTP' },
  { id: '2', issue: '/admin Panel Exposed', severity: 'critical', status: 'failed', fixTime: '45s', description: 'Admin panel publicly accessible without protection' },
  { id: '3', issue: 'Missing Security Headers', severity: 'critical', status: 'failed', fixTime: '20s', description: 'X-Frame-Options, CSP, and HSTS headers not set' },
  { id: '4', issue: 'Weak Content-Type Policy', severity: 'high', status: 'failed', fixTime: '15s', description: 'X-Content-Type-Options header missing' },
  { id: '5', issue: 'Clickjacking Vulnerable', severity: 'high', status: 'failed', fixTime: '10s', description: 'No X-Frame-Options or frame-ancestors CSP' },
  { id: '6', issue: 'Directory Listing Enabled', severity: 'high', status: 'failed', fixTime: '20s', description: 'Server directories are browsable' },
  { id: '7', issue: 'Server Info Exposed', severity: 'high', status: 'failed', fixTime: '10s', description: 'Server version information leaked in headers' },
  { id: '8', issue: 'Cookie Without Secure Flag', severity: 'medium', status: 'failed', fixTime: '15s', description: 'Cookies transmitted over insecure connections' },
  { id: '9', issue: 'Missing Referrer Policy', severity: 'medium', status: 'failed', fixTime: '10s', description: 'No Referrer-Policy header configured' },
];

export const FORTRESS_CODE = `# ═══════════════════════════════════════════
# SECURESHIELD AI - Auto-Generated Fortress
# Generated: ${new Date().toISOString().split('T')[0]}
# ═══════════════════════════════════════════

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Content-Security-Policy "default-src 'self'"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header unset X-Powered-By
  Header unset Server
</IfModule>

# Block Admin Access
RewriteRule ^admin(.*)$ - [F,L]

# Disable Directory Listing
Options -Indexes

# Block Server Info
ServerSignature Off`;

export function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function getGradeColor(score: number): string {
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-destructive';
}
