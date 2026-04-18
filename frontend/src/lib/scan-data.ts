import { Timestamp } from 'firebase/firestore';

export interface Vulnerability {
  id: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'failed' | 'fixed';
  fixTime: string;
  description: string;
  title?: string; // Some API returns title instead of issue
  header?: string; // Used in CompareResults
  category?: string; // Used for Deep Scan categorical filtering
}

export interface SSLInfo {
  valid: boolean;
  issuer: string;
  valid_to: string;
  grade: string;
  serialNumber?: string;
  thumbprint?: string;
  daysUntilExpiry?: number;
}

export interface VirusTotalInfo {
  positives: number;
  total: number;
  scan_id: string;
  permalink: string;
  malicious?: number;
  suspicious?: number;
  harmless?: number;
}

export interface SecurityHeaders {
  [key: string]: {
    status: 'secure' | 'vulnerable';
    value: string;
    desc: string;
  };
}

export interface OWASPData {
  name: string;
  status: 'pass' | 'warn' | 'fail';
}

export interface ScanResult {
  id: string;
  url: string;
  score: number;
  grade: string;
  status: string; // added to match api-client return
  message?: string; // added to match api-client return
  hostingType?: string;
  vulnerabilities: Vulnerability[];
  headers?: SecurityHeaders;
  ssl?: SSLInfo;
  virusTotal?: VirusTotalInfo;
  timestamp?: Date | string;
  scannedAt?: string; // added for persistence and header
  suggestions?: string[]; // added for error reporting
  afterScore?: number; // added for score comparison in history/reports
  created_at?: string;
  createdAt?: string | Timestamp | any; // allow any for now but try to use Timestamp
  issues?: Vulnerability[]; // sometimes returned as issues
  enabled?: boolean;
  lastScore?: number;
  lastChecked?: string | Date;
  previousScore?: number;
  uptime?: string;
  owasp?: Record<string, OWASPData>;
  scanType?: 'basic' | 'deep';
  checksRun?: number;
}

export interface AiFix {
  vulnerabilityId: string;
  vulnerability?: string;
  riskExplanation: string;
  priority: number;
  platformFixes: {
    [key: string]: {
      code: string;
      instructions: string;
    };
  };
}

export interface AiFixResponse {
  fixes: AiFix[];
  insights: string;
}

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'hsts', issue: 'Strict Transport Security', severity: 'critical', status: 'failed', fixTime: '30s', description: 'Enforces secure HTTPS connections' },
  { id: 'csp', issue: 'Content Security Policy', severity: 'high', status: 'failed', fixTime: '1m', description: 'Prevents XSS and data injection attacks' },
  { id: 'xfo', issue: 'X-Frame-Options', severity: 'medium', status: 'failed', fixTime: '15s', description: 'Prevents clickjacking' },
  { id: 'cto', issue: 'X-Content-Type-Options', severity: 'medium', status: 'failed', fixTime: '10s', description: 'Prevents MIME type sniffing' },
  { id: 'admin', issue: 'Admin Panel Access', severity: 'critical', status: 'failed', fixTime: '45s', description: 'Publicly accessible /admin directory' },
  { id: 'robots', issue: 'Robots.txt Exposure', severity: 'medium', status: 'failed', fixTime: '10s', description: 'Sensitive path leakage in robots.txt' },
  { id: 'https', issue: 'SSL/TLS Encryption', severity: 'critical', status: 'failed', fixTime: '5m', description: 'Secure connection via HTTPS' }
];

export const FORTRESS_CODE = `# ═══════════════════════════════════════════
# SECUREWEB AI - Auto-Generated Fortress
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
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function getGradeColor(score: number): string {
  if (score >= 80) return 'text-success'; // Green
  if (score >= 50) return 'text-yellow-500'; // Yellow
  return 'text-destructive'; // Red
}
