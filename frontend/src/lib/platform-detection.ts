export type HostingPlatform = 'vercel' | 'netlify' | 'github-pages' | 'wordpress' | 'apache' | 'nginx' | 'cloudflare';

export interface PlatformInfo {
  id: HostingPlatform;
  name: string;
  icon: string;
  fileName: string;
  color: string;
}

export const PLATFORMS: Record<HostingPlatform, PlatformInfo> = {
  vercel:        { id: 'vercel',        name: 'Vercel',         icon: '▲', fileName: 'vercel.json',   color: 'hsl(0, 0%, 100%)' },
  netlify:       { id: 'netlify',       name: 'Netlify',        icon: '◆', fileName: '_headers',      color: 'hsl(172, 100%, 41%)' },
  'github-pages':{ id: 'github-pages',  name: 'GitHub Pages',   icon: '🐙', fileName: '_headers',     color: 'hsl(215, 14%, 60%)' },
  wordpress:     { id: 'wordpress',     name: 'WordPress',      icon: 'W', fileName: '.htaccess',     color: 'hsl(204, 88%, 44%)' },
  apache:        { id: 'apache',        name: 'cPanel / Apache',icon: '🖥', fileName: '.htaccess',    color: 'hsl(0, 67%, 50%)' },
  nginx:         { id: 'nginx',         name: 'NGINX',          icon: '⚡', fileName: 'nginx.conf',   color: 'hsl(120, 100%, 35%)' },
  cloudflare:    { id: 'cloudflare',    name: 'Cloudflare',     icon: '☁', fileName: '_headers',     color: 'hsl(25, 95%, 53%)' },
};

export function detectPlatform(url: string): HostingPlatform {
  const lower = url.toLowerCase();
  if (lower.includes('.vercel.app') || lower.includes('vercel.') || lower.includes('edge.vercel'))
    return 'vercel';
  if (lower.includes('.netlify.app') || lower.includes('netlify.'))
    return 'netlify';
  if (lower.includes('.github.io') || lower.includes('github.com'))
    return 'github-pages';
  if (lower.includes('wp-') || lower.includes('wordpress') || lower.includes('/wp-content') || lower.includes('/wp-admin'))
    return 'wordpress';
  if (lower.includes('cloudflare') || lower.includes('.pages.dev'))
    return 'cloudflare';
  // Default to Apache/cPanel
  return 'apache';
}

export function getPlatformCode(platform: HostingPlatform): string {
  const date = new Date().toISOString().split('T')[0];

  switch (platform) {
    case 'vercel':
      return `{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}`;

    case 'netlify':
    case 'github-pages':
    case 'cloudflare':
      return `# ═══════════════════════════════════════════
# SECUREWEB AI - Security Headers
# Generated: ${date}
# ═══════════════════════════════════════════

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Permissions-Policy: camera=(), microphone=(), geolocation=()`;

    case 'wordpress':
      return `# ═══════════════════════════════════════════
# SECUREWEB AI - WordPress Fortress
# Generated: ${date}
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
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header unset X-Powered-By
  Header unset Server
</IfModule>

# Block wp-config access
<Files wp-config.php>
  Order Allow,Deny
  Deny from all
</Files>

# Block xmlrpc.php (brute force target)
<Files xmlrpc.php>
  Order Allow,Deny
  Deny from all
</Files>

# Disable Directory Listing
Options -Indexes

# Block author enumeration
RewriteRule ^/?author=([0-9]*) - [F,L]`;

    case 'nginx':
      return `# ═══════════════════════════════════════════
# SECUREWEB AI - NGINX Security Config
# Generated: ${date}
# ═══════════════════════════════════════════

# Add to your server {} block:

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Hide server version
server_tokens off;

# Block admin access
location ~* ^/(admin|wp-admin) {
  deny all;
  return 403;
}`;

    case 'apache':
    default:
      return `# ═══════════════════════════════════════════
# SECUREWEB AI - Auto-Generated Fortress
# Generated: ${date}
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
  }
}

export function getPlatformSteps(platform: HostingPlatform): string[] {
  switch (platform) {
    case 'vercel':
      return [
        'Create vercel.json in your project root',
        'Paste the code below into vercel.json',
        'Run: git add . && git commit -m "security headers"',
        'Run: git push (Vercel auto-deploys)',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'netlify':
      return [
        'Create _headers file in your project root (or public/ folder)',
        'Paste the code below into _headers',
        'Run: git add . && git commit -m "security headers"',
        'Run: git push (Netlify auto-deploys)',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'github-pages':
      return [
        'Create _headers file in your repo root',
        'Paste the code below',
        'Commit and push to your gh-pages branch',
        'Wait 1-2 min for GitHub Pages to rebuild',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'wordpress':
      return [
        'Go to yoursite.com/cpanel → File Manager',
        'Navigate to public_html/',
        'Edit .htaccess (create if missing)',
        'Paste the code below ABOVE the WordPress rules',
        'Also install "Security Headers" plugin for extra protection',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'nginx':
      return [
        'SSH into your server',
        'Edit /etc/nginx/sites-available/yoursite.conf',
        'Add the directives inside your server {} block',
        'Test config: sudo nginx -t',
        'Reload: sudo systemctl reload nginx',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'cloudflare':
      return [
        'Create _headers file in your project root',
        'Paste the code below',
        'Deploy to Cloudflare Pages',
        'Or: use Cloudflare Dashboard → Rules → Transform Rules for header injection',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
    case 'apache':
    default:
      return [
        'Go to yoursite.com/cpanel → File Manager',
        'Navigate to public_html/',
        'Edit .htaccess (create if missing)',
        'Paste the code below',
        'Click "I\'VE FIXED IT" to re-scan',
      ];
  }
}
