export const FIX_GUIDES = {

  // ─── 1. SSL CERTIFICATE ───────────────────────────────────
  'ssl-invalid': {
    id: 'ssl-invalid',
    title: 'Fix SSL Certificate',
    severity: 'critical',
    icon: '🔒',
    estimatedTime: '15 mins',
    difficulty: 'Easy',
    description:
      'Your site has no valid SSL. All data between users and your server is unencrypted.',
    impact: 'Users see "Not Secure" warning. Google penalizes your SEO ranking.',
    platforms: {
      cloudflare: {
        name: 'Cloudflare',
        steps: [
          'Log in to dash.cloudflare.com',
          'Select your domain',
          'Go to SSL/TLS → Overview',
          'Set encryption mode to "Full (Strict)"',
          'Go to Edge Certificates',
          'Enable "Always Use HTTPS"',
          'Enable "HTTP Strict Transport Security (HSTS)"',
          'Wait 24 hours for propagation',
          'Re-scan to verify'
        ]
      },
      cpanel: {
        name: 'cPanel / Apache',
        steps: [
          'Log in to your cPanel',
          'Go to Security → SSL/TLS',
          'Click "Let\'s Encrypt SSL"',
          'Select your domain and click Install',
          'Wait 5-10 minutes for installation',
          'Verify at https://yoursite.com',
          'Add redirect in .htaccess:',
          'RewriteEngine On',
          'RewriteCond %{HTTPS} off',
          'RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
          'Re-scan to verify'
        ]
      },
      vercel: {
        name: 'Vercel',
        steps: [
          'Vercel auto-provides SSL for all deployments',
          'Go to your Vercel Dashboard',
          'Select your project → Settings → Domains',
          'Add your custom domain if not added',
          'Vercel auto-issues SSL within 60 seconds',
          'Enable "Force HTTPS" in domain settings',
          'Re-scan to verify'
        ]
      },
      nginx: {
        name: 'Nginx',
        steps: [
          'Install Certbot: sudo apt install certbot',
          'Install Nginx plugin: sudo apt install python3-certbot-nginx',
          'Run: sudo certbot --nginx -d yourdomain.com',
          'Follow the interactive prompts',
          'Select option 2 to force HTTPS redirect',
          'Test auto-renewal: sudo certbot renew --dry-run',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: "Let's Encrypt Free SSL", url: 'https://letsencrypt.org' },
      { label: 'SSL Labs Test', url: 'https://ssllabs.com/ssltest' }
    ],
    verifyCheck: 'ssl'
  },

  // ─── 2. VIRUS / MALWARE ──────────────────────────────────
  'vt-malicious': {
    id: 'vt-malicious',
    title: 'Remove Malware & Clear Blacklist',
    severity: 'critical',
    icon: '🦠',
    estimatedTime: '1-3 days',
    difficulty: 'Hard',
    description:
      'VirusTotal flagged your site as malicious. Immediate action required.',
    impact: 'Chrome shows "Dangerous Site" warning. Google Search removes your site.',
    platforms: {
      all: {
        name: 'All Platforms',
        steps: [
          'STEP 1 — Find the malware:',
          'Scan your server files with Malwarebytes or Wordfence',
          'Check for unauthorized PHP files in your root directory',
          'Look for obfuscated JavaScript in your HTML files',
          'Check recently modified files: find / -newer /etc/passwd -type f',
          '',
          'STEP 2 — Remove the malware:',
          'Delete all suspicious files found',
          'Restore clean backups if available',
          'Update ALL passwords (FTP, database, cPanel, CMS)',
          'Update all CMS plugins and themes to latest versions',
          '',
          'STEP 3 — Request review after cleaning:',
          'Go to Google Search Console → Security Issues',
          'Click "Request Review" after fixing all issues',
          'Go to virustotal.com and submit your URL for reanalysis',
          'Submit to Google Safe Browsing:',
          'https://safebrowsing.google.com/safebrowsing/report_error/',
          '',
          'STEP 4 — Prevent reinfection:',
          'Enable Web Application Firewall (WAF)',
          'Set file permissions: chmod 644 for files, 755 for folders',
          'Remove unused plugins, themes, and user accounts',
          'Re-scan after 24-48 hours'
        ]
      }
    },
    resources: [
      { label: 'Google Search Console', url: 'https://search.google.com/search-console' },
      { label: 'Safe Browsing Report', url: 'https://safebrowsing.google.com/safebrowsing/report_error/' },
      { label: 'VirusTotal Reanalysis', url: 'https://virustotal.com' }
    ],
    verifyCheck: 'virusTotal'
  },

  // ─── 3. EXPOSED API KEYS ─────────────────────────────────
  'exposed-api-key': {
    id: 'exposed-api-key',
    title: 'Remove & Rotate Exposed API Keys',
    severity: 'critical',
    icon: '🔑',
    estimatedTime: '30 mins',
    difficulty: 'Medium',
    description:
      'API keys found in your page source. Anyone can steal and abuse them.',
    impact: 'Financial charges on your account. Service abuse. Data breach risk.',
    platforms: {
      all: {
        name: 'All Platforms',
        steps: [
          'IMMEDIATE — Revoke the exposed key RIGHT NOW:',
          'AWS: Go to IAM Console → Delete the exposed access key',
          'Google: Go to console.cloud.google.com → APIs → Credentials → Delete key',
          'GitHub: Settings → Developer settings → Personal access tokens → Revoke',
          'OpenAI: platform.openai.com → API keys → Delete',
          '',
          'Generate a new key on each platform',
          '',
          'Move keys to environment variables:',
          'Create a .env file in your project root',
          'Add: API_KEY=your_new_key_here',
          'Add .env to your .gitignore file',
          'In your code, use: process.env.API_KEY',
          '',
          'If using Vercel: Dashboard → Settings → Environment Variables',
          'If using Netlify: Site Settings → Environment Variables',
          'If using cPanel: use a config file outside web root',
          '',
          'Scan your Git history for old leaked keys:',
          'Use: git log --all --full-history -- "*.env"',
          'If found in Git history, rotate the key again',
          'Consider using git-filter-repo to clean history',
          '',
          'Re-scan to verify keys are no longer exposed'
        ]
      }
    },
    resources: [
      { label: 'GitHub Secret Scanning', url: 'https://docs.github.com/en/code-security/secret-scanning' },
      { label: 'GitGuardian (Free)', url: 'https://www.gitguardian.com' }
    ],
    verifyCheck: 'sensitiveData'
  },

  // ─── 4. EXPOSED .ENV FILE ────────────────────────────────
  'exposed-env': {
    id: 'exposed-env',
    title: 'Block .env File Access',
    severity: 'critical',
    icon: '📄',
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    description:
      'Your .env file is publicly accessible. It contains secret credentials.',
    impact: 'All your API keys, database passwords, and secrets are exposed.',
    platforms: {
      apache: {
        name: 'Apache / cPanel',
        steps: [
          'Open your .htaccess file in the root directory',
          'Add these lines at the top:',
          '<Files ".env">',
          '  Order allow,deny',
          '  Deny from all',
          '</Files>',
          '',
          'Also block other sensitive files:',
          '<FilesMatch "^\\.(env|git|gitignore|htaccess)">',
          '  Order allow,deny',
          '  Deny from all',
          '</FilesMatch>',
          '',
          'Save the file',
          'Test: visit yoursite.com/.env — should return 403',
          'Re-scan to verify'
        ]
      },
      nginx: {
        name: 'Nginx',
        steps: [
          'Open your Nginx config file',
          'Usually at: /etc/nginx/sites-available/yoursite',
          'Inside your server block, add:',
          'location ~ /\\. {',
          '  deny all;',
          '  return 403;',
          '}',
          '',
          'Save and reload Nginx:',
          'sudo nginx -t',
          'sudo systemctl reload nginx',
          'Test: visit yoursite.com/.env — should return 403',
          'Re-scan to verify'
        ]
      },
      cloudflare: {
        name: 'Cloudflare',
        steps: [
          'Log in to dash.cloudflare.com',
          'Go to Security → WAF → Custom Rules',
          'Click Create Rule',
          'Name: Block Sensitive Files',
          'Expression: (http.request.uri.path contains "/.env")',
          'or (http.request.uri.path contains "/.git")',
          'or (http.request.uri.path contains "/phpinfo")',
          'Action: Block',
          'Deploy the rule',
          'Re-scan to verify'
        ]
      },
      vercel: {
        name: 'Vercel',
        steps: [
          'Vercel does NOT serve .env files by default',
          'Your .env should be in .gitignore',
          'Verify: cat .gitignore | grep .env',
          'If not there, add: echo ".env" >> .gitignore',
          'Add your secrets in Vercel Dashboard:',
          'Project → Settings → Environment Variables',
          'Never commit .env to your Git repository',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: 'dotenv Best Practices', url: 'https://www.npmjs.com/package/dotenv' }
    ],
    verifyCheck: 'paths'
  },

  // ─── 5. DATABASE URI IN SOURCE ───────────────────────────
  'db-uri-exposed': {
    id: 'db-uri-exposed',
    title: 'Remove Database URI from Source Code',
    severity: 'critical',
    icon: '🗄️',
    estimatedTime: '20 mins',
    difficulty: 'Medium',
    description:
      'Database connection string found in page source. Full database access exposed.',
    impact: 'Anyone can connect to your database and read/delete/modify all data.',
    platforms: {
      all: {
        name: 'All Platforms',
        steps: [
          'IMMEDIATELY change your database password',
          '',
          'Remove the URI from your code:',
          'Find all occurrences: grep -r "mongodb://" . --include="*.js"',
          'Remove any hardcoded connection strings',
          '',
          'Move it to environment variable:',
          'In .env file: DATABASE_URL=mongodb://user:pass@host/db',
          'In code: mongoose.connect(process.env.DATABASE_URL)',
          '',
          'For MongoDB Atlas:',
          'Go to Atlas → Database Access → Edit user',
          'Click "Generate new password"',
          'Update your .env with new connection string',
          '',
          'For MySQL/PostgreSQL:',
          'Log in to phpMyAdmin or database panel',
          'Change the user password',
          'Update your .env with new credentials',
          '',
          'Restrict database access by IP:',
          'MongoDB Atlas: Network Access → Add IP → Your server IP only',
          'MySQL: GRANT privileges only from specific IP',
          '',
          'Deploy with new environment variables',
          'Re-scan to verify URI no longer in source'
        ]
      }
    },
    resources: [
      { label: 'MongoDB Atlas Security', url: 'https://www.mongodb.com/docs/atlas/security/' }
    ],
    verifyCheck: 'sensitiveData'
  },

  // ─── 6. OPEN DATABASE PORTS ──────────────────────────────
  'open-db-port': {
    id: 'open-db-port',
    title: 'Close Exposed Database Ports',
    severity: 'critical',
    icon: '🚪',
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    description:
      'Database port (3306/27017/5432/6379) is publicly accessible on internet.',
    impact: 'Attackers can directly connect to your database from anywhere in the world.',
    platforms: {
      aws: {
        name: 'AWS EC2',
        steps: [
          'Go to AWS Console → EC2 → Security Groups',
          'Find the security group for your server',
          'Click Inbound Rules → Edit',
          'Find the rule for port 3306 (MySQL) or 27017 (MongoDB)',
          'Change Source from "0.0.0.0/0" to your app server IP only',
          'Or delete the inbound rule completely',
          'If database is on same server: Source = "127.0.0.1/32"',
          'Save the rules',
          'Re-scan to verify port is closed'
        ]
      },
      vps: {
        name: 'VPS / Linux Server',
        steps: [
          'Connect to your server via SSH',
          '',
          'For UFW firewall (Ubuntu/Debian):',
          'sudo ufw deny 3306   ← MySQL',
          'sudo ufw deny 27017  ← MongoDB',
          'sudo ufw deny 5432   ← PostgreSQL',
          'sudo ufw deny 6379   ← Redis',
          'sudo ufw enable',
          'sudo ufw status',
          '',
          'For iptables:',
          'sudo iptables -A INPUT -p tcp --dport 3306 -j DROP',
          'sudo iptables-save',
          '',
          'Bind database to localhost only:',
          'MySQL: Edit /etc/mysql/mysql.conf.d/mysqld.cnf',
          'Set: bind-address = 127.0.0.1',
          'MongoDB: Edit /etc/mongod.conf',
          'Set: net.bindIp: 127.0.0.1',
          'Restart: sudo systemctl restart mongod',
          'Re-scan to verify'
        ]
      },
      digitalocean: {
        name: 'DigitalOcean',
        steps: [
          'Go to Cloud.DigitalOcean.com',
          'Go to Networking → Firewalls',
          'Create or edit your firewall',
          'In Inbound Rules, remove port 3306/27017',
          'Or restrict to your droplet IP only',
          'Apply firewall to your droplet',
          'Re-scan to verify port is closed'
        ]
      }
    },
    resources: [
      { label: 'UFW Guide', url: 'https://help.ubuntu.com/community/UFW' }
    ],
    verifyCheck: 'ports'
  },

  // ─── 7. MISSING SPF RECORD ───────────────────────────────
  'dns-no-spf': {
    id: 'dns-no-spf',
    title: 'Add SPF DNS Record',
    severity: 'medium',
    icon: '📧',
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    description:
      'No SPF record found. Attackers can send emails pretending to be from your domain.',
    impact: 'Your domain can be used for phishing emails that fool spam filters.',
    platforms: {
      cloudflare: {
        name: 'Cloudflare DNS',
        steps: [
          'Log in to dash.cloudflare.com',
          'Select your domain → DNS → Records',
          'Click "Add Record"',
          'Type: TXT',
          'Name: @ (root domain)',
          'Content: v=spf1 include:_spf.google.com ~all',
          '(Replace with your email provider:)',
          'Gmail: include:_spf.google.com',
          'Outlook: include:spf.protection.outlook.com',
          'Custom server: ip4:YOUR.SERVER.IP',
          'TTL: Auto',
          'Click Save',
          'Verify at: mxtoolbox.com/spf.aspx',
          'Re-scan after 24hrs'
        ]
      },
      godaddy: {
        name: 'GoDaddy DNS',
        steps: [
          'Log in to GoDaddy → My Products → DNS',
          'Select your domain',
          'Click "Add" under DNS Records',
          'Type: TXT',
          'Host: @',
          'TXT Value: v=spf1 include:_spf.google.com ~all',
          'TTL: 1 Hour',
          'Click Save',
          'Wait up to 48 hours for propagation',
          'Verify at: mxtoolbox.com/spf.aspx'
        ]
      },
      namecheap: {
        name: 'Namecheap DNS',
        steps: [
          'Log in to Namecheap → Domain List',
          'Click Manage → Advanced DNS',
          'Click Add New Record',
          'Type: TXT Record',
          'Host: @',
          'Value: v=spf1 include:_spf.google.com ~all',
          'TTL: Automatic',
          'Click the checkmark to save',
          'Verify at: mxtoolbox.com/spf.aspx'
        ]
      }
    },
    resources: [
      { label: 'SPF Record Checker', url: 'https://mxtoolbox.com/spf.aspx' },
      { label: 'SPF Generator', url: 'https://www.spfwizard.net' }
    ],
    verifyCheck: 'dns'
  },

  // ─── 8. MISSING DMARC RECORD ─────────────────────────────
  'dns-no-dmarc': {
    id: 'dns-no-dmarc',
    title: 'Add DMARC DNS Record',
    severity: 'medium',
    icon: '🛡️',
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    description:
      'No DMARC record. Your domain can be impersonated in phishing campaigns.',
    impact: 'Phishing emails from your domain reach victim inboxes without warning.',
    platforms: {
      any_dns: {
        name: 'Any DNS Provider',
        steps: [
          'Go to your DNS provider (Cloudflare/GoDaddy/Namecheap)',
          'Add a new TXT record:',
          'Name/Host: _dmarc',
          'Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com',
          '',
          'Explanation of the value:',
          'p=none     → Monitor only (start here, safe)',
          'p=quarantine → Move suspicious emails to spam',
          'p=reject   → Block all unauthenticated emails (most secure)',
          '',
          'Start with p=none to monitor for 1-2 weeks',
          'Then change to p=quarantine',
          'Then change to p=reject',
          '',
          'Save the DNS record',
          'Verify at: mxtoolbox.com/dmarc.aspx',
          'Wait 24-48 hours for propagation',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: 'DMARC Checker', url: 'https://mxtoolbox.com/dmarc.aspx' },
      { label: 'DMARC Guide', url: 'https://dmarc.org/overview/' }
    ],
    verifyCheck: 'dns'
  },

  // ─── 9. OPEN SSH PORT ────────────────────────────────────
  'open-ssh-port': {
    id: 'open-ssh-port',
    title: 'Secure SSH Port 22',
    severity: 'medium',
    icon: '🖥️',
    estimatedTime: '20 mins',
    difficulty: 'Medium',
    description:
      'SSH port 22 is open to the internet. Brute force attacks are likely happening right now.',
    impact: 'Attackers run automated scripts 24/7 trying to brute force your server login.',
    platforms: {
      linux: {
        name: 'Linux Server',
        steps: [
          'OPTION 1 — Restrict SSH to your IP only:',
          'sudo ufw allow from YOUR.HOME.IP to any port 22',
          'sudo ufw deny 22',
          'sudo ufw enable',
          '',
          'OPTION 2 — Change SSH port from 22:',
          'sudo nano /etc/ssh/sshd_config',
          'Find line: #Port 22',
          'Change to: Port 2222 (or any port 1024-65535)',
          'Save file, then:',
          'sudo ufw allow 2222/tcp',
          'sudo ufw deny 22',
          'sudo systemctl restart sshd',
          '',
          'OPTION 3 — Disable password login (use SSH keys only):',
          'sudo nano /etc/ssh/sshd_config',
          'Set: PasswordAuthentication no',
          'Set: PubkeyAuthentication yes',
          'sudo systemctl restart sshd',
          '',
          'OPTION 4 — Install Fail2Ban:',
          'sudo apt install fail2ban',
          'sudo systemctl enable fail2ban',
          'This auto-bans IPs after failed login attempts',
          '',
          'Re-scan to verify'
        ]
      },
      aws: {
        name: 'AWS EC2',
        steps: [
          'Go to EC2 → Security Groups',
          'Find your instance security group',
          'Edit Inbound Rules',
          'Find SSH rule (port 22)',
          'Change Source from "0.0.0.0/0" to "My IP"',
          'This allows only your current IP to SSH',
          'Click Save',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: 'Fail2Ban Guide', url: 'https://www.fail2ban.org' }
    ],
    verifyCheck: 'ports'
  },

  // ─── 10. HARDCODED PASSWORD ──────────────────────────────
  'hardcoded-password': {
    id: 'hardcoded-password',
    title: 'Remove Hardcoded Passwords from Source',
    severity: 'medium',
    icon: '🔐',
    estimatedTime: '30 mins',
    difficulty: 'Medium',
    description:
      'A password was found in your page source code or HTML.',
    impact: 'Anyone viewing your source can access your systems with these credentials.',
    platforms: {
      all: {
        name: 'All Platforms',
        steps: [
          'STEP 1 — Change the exposed password IMMEDIATELY',
          'Log in to wherever that password is used',
          'Change to a strong random password',
          '',
          'STEP 2 — Find all occurrences in code:',
          'grep -r "password" . --include="*.js" --include="*.php"',
          'grep -r "pass" . --include="*.env" --include="*.config"',
          '',
          'STEP 3 — Remove from code:',
          'Delete any hardcoded passwords from source files',
          'Replace with: process.env.DB_PASSWORD',
          '',
          'STEP 4 — Add to environment variable:',
          'In .env: DB_PASSWORD=your_secure_password_here',
          'Add .env to .gitignore',
          '',
          'STEP 5 — Check Git history:',
          'git log --all -p | grep -i password',
          'If found: rotate the password again',
          'Consider cleaning Git history with git-filter-repo',
          '',
          'Re-scan to verify password no longer in source'
        ]
      }
    },
    resources: [
      { label: 'Git History Cleaner', url: 'https://github.com/newren/git-filter-repo' }
    ],
    verifyCheck: 'sensitiveData'
  },

  // ─── 11. SERVER VERSION DISCLOSURE ──────────────────────
  'server-disclosure': {
    id: 'server-disclosure',
    title: 'Hide Server Version from Headers',
    severity: 'low',
    icon: '🔍',
    estimatedTime: '5 mins',
    difficulty: 'Easy',
    description:
      'Server header reveals exact version number (e.g. Apache/2.4.41).',
    impact: 'Attackers know exactly which exploits work against your server version.',
    platforms: {
      apache: {
        name: 'Apache',
        steps: [
          'Open: sudo nano /etc/apache2/apache2.conf',
          'Add or update these lines:',
          'ServerSignature Off',
          'ServerTokens Prod',
          'Save the file',
          'sudo systemctl restart apache2',
          'Verify: curl -I yoursite.com | grep Server',
          'Should now show just "Server: Apache" without version'
        ]
      },
      nginx: {
        name: 'Nginx',
        steps: [
          'Open: sudo nano /etc/nginx/nginx.conf',
          'Inside the http block, add:',
          'server_tokens off;',
          'Save the file',
          'sudo nginx -t',
          'sudo systemctl reload nginx',
          'Verify: curl -I yoursite.com | grep Server',
          'Should show "Server: nginx" without version'
        ]
      },
      nodejs: {
        name: 'Node.js / Express',
        steps: [
          'In your Express app, add:',
          'app.disable("x-powered-by");',
          'app.use((req, res, next) => {',
          '  res.removeHeader("Server");',
          '  res.removeHeader("X-Powered-By");',
          '  next();',
          '});',
          'Redeploy your application',
          'Re-scan to verify'
        ]
      },
      vercel: {
        name: 'Vercel',
        steps: [
          'Vercel manages headers automatically',
          'Add to vercel.json:',
          '{',
          '  "headers": [{',
          '    "source": "/(.*)",',
          '    "headers": [',
          '      { "key": "Server", "value": "SecureWeb" }',
          '    ]',
          '  }]',
          '}',
          'Redeploy to apply'
        ]
      }
    },
    resources: [],
    verifyCheck: 'headers'
  },

  // ─── 12. X-POWERED-BY EXPOSURE ──────────────────────────
  'powered-by-disclosure': {
    id: 'powered-by-disclosure',
    title: 'Remove X-Powered-By Header',
    severity: 'low',
    icon: '⚡',
    estimatedTime: '5 mins',
    difficulty: 'Easy',
    description:
      'X-Powered-By header reveals your tech stack (e.g. PHP/8.1, Express).',
    impact: 'Attackers know which framework/version to target with known exploits.',
    platforms: {
      nodejs: {
        name: 'Node.js / Express',
        steps: [
          'Add this line early in your Express app:',
          'app.disable("x-powered-by");',
          '',
          'Or use Helmet.js (recommended):',
          'npm install helmet',
          'const helmet = require("helmet");',
          'app.use(helmet());',
          'This removes X-Powered-By and adds security headers',
          'Redeploy and re-scan to verify'
        ]
      },
      php: {
        name: 'PHP / cPanel',
        steps: [
          'Open your php.ini file',
          'cPanel: go to PHP Settings in cPanel',
          'Find: expose_php = On',
          'Change to: expose_php = Off',
          'Save and restart PHP-FPM:',
          'sudo systemctl restart php8.1-fpm',
          'Re-scan to verify header is gone'
        ]
      },
      apache: {
        name: 'Apache',
        steps: [
          'Open .htaccess or apache2.conf',
          'Add: Header unset X-Powered-By',
          'Also add: Header always unset X-Powered-By',
          'sudo systemctl restart apache2',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: 'Helmet.js (Node Security Headers)', url: 'https://helmetjs.github.io' }
    ],
    verifyCheck: 'headers'
  },

  // ─── 13. PHPINFO.PHP ACCESSIBLE ─────────────────────────
  'phpinfo-exposed': {
    id: 'phpinfo-exposed',
    title: 'Remove phpinfo.php File',
    severity: 'low',
    icon: '📋',
    estimatedTime: '2 mins',
    difficulty: 'Easy',
    description:
      'phpinfo.php is publicly accessible and reveals your entire server configuration.',
    impact: 'Full server config, PHP version, file paths, and extensions are exposed.',
    platforms: {
      cpanel: {
        name: 'cPanel / FTP',
        steps: [
          'Log in to cPanel → File Manager',
          'Navigate to your public_html directory',
          'Find phpinfo.php (or php_info.php, info.php)',
          'Right-click → Delete',
          'Also check these common names:',
          'info.php, phpinfo.php, php_info.php, test.php',
          'Delete ALL of them',
          'Verify: visit yoursite.com/phpinfo.php',
          'Should return 404 Not Found',
          'Re-scan to verify'
        ]
      },
      ssh: {
        name: 'SSH / Terminal',
        steps: [
          'Connect to your server via SSH',
          'Find the file: find /var/www -name "phpinfo.php"',
          'Delete it: rm /var/www/html/phpinfo.php',
          'Also remove common variants:',
          'rm -f /var/www/html/info.php',
          'rm -f /var/www/html/test.php',
          'rm -f /var/www/html/php_info.php',
          'Verify: curl -o /dev/null -s -w "%{http_code}" yoursite.com/phpinfo.php',
          'Should return 404',
          'Re-scan to verify'
        ]
      }
    },
    resources: [],
    verifyCheck: 'paths'
  },

  // ─── 14. ADMIN PANEL PUBLIC ──────────────────────────────
  'admin-panel-exposed': {
    id: 'admin-panel-exposed',
    title: 'Protect Admin Panel Access',
    severity: 'low',
    icon: '🔒',
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    description:
      'Your admin panel (/admin or /wp-admin) is accessible to everyone.',
    impact: 'Brute force attacks on your admin login. Credential stuffing risk.',
    platforms: {
      wordpress: {
        name: 'WordPress',
        steps: [
          'Method 1 — Restrict by IP in .htaccess:',
          'Open .htaccess in your WordPress root',
          'Add before # BEGIN WordPress:',
          '<Files wp-login.php>',
          '  Order deny,allow',
          '  Deny from all',
          '  Allow from YOUR.HOME.IP',
          '</Files>',
          '',
          'Method 2 — Use a security plugin:',
          'Install Wordfence or iThemes Security',
          'Enable "Brute Force Protection"',
          'Enable "Login Page CAPTCHA"',
          'Enable "Two-Factor Authentication"',
          '',
          'Method 3 — Change login URL:',
          'Install WPS Hide Login plugin',
          'Change /wp-admin to /your-secret-word',
          '',
          'Re-scan to verify'
        ]
      },
      custom: {
        name: 'Custom App',
        steps: [
          'Add authentication middleware to /admin routes:',
          'router.use("/admin", requireAuth, requireAdmin);',
          '',
          'Add rate limiting to admin login:',
          'npm install express-rate-limit',
          'const adminLimiter = rateLimit({',
          '  windowMs: 15 * 60 * 1000,',
          '  max: 5',
          '});',
          'app.use("/admin/login", adminLimiter);',
          '',
          'Add IP allowlist for admin:',
          'Only allow your office/home IP',
          '',
          'Enable 2FA for admin accounts',
          'Re-scan to verify'
        ]
      },
      cloudflare: {
        name: 'Cloudflare',
        steps: [
          'Log in to dash.cloudflare.com',
          'Go to Security → WAF → Custom Rules',
          'Create rule: "Protect Admin Panel"',
          'Expression:',
          '(http.request.uri.path contains "/admin")',
          'and (ip.src ne YOUR.HOME.IP)',
          'Action: Block',
          'Deploy the rule',
          'Re-scan to verify'
        ]
      }
    },
    resources: [
      { label: 'Cloudflare WAF', url: 'https://developers.cloudflare.com/waf/' }
    ],
    verifyCheck: 'paths'
  },

  // ─── 15. GIT CONFIG EXPOSED ──────────────────────────────
  'git-config-exposed': {
    id: 'git-config-exposed',
    title: 'Block .git Directory Access',
    severity: 'low',
    icon: '📁',
    estimatedTime: '5 mins',
    difficulty: 'Easy',
    description:
      '.git/config is publicly accessible. Your entire source code can be downloaded.',
    impact: 'Anyone can reconstruct your full source code and read all Git history.',
    platforms: {
      apache: {
        name: 'Apache / cPanel',
        steps: [
          'Open your .htaccess file',
          'Add these lines:',
          'RedirectMatch 404 /\\.git',
          '',
          'Or add this block:',
          '<DirectoryMatch "^/.*/\\.git/">',
          '  Order deny,allow',
          '  Deny from all',
          '</DirectoryMatch>',
          'Save and re-scan to verify'
        ]
      },
      nginx: {
        name: 'Nginx',
        steps: [
          'Open your Nginx site config',
          'Inside the server block, add:',
          'location ~ /\\.git {',
          '  deny all;',
          '  return 404;',
          '}',
          'sudo nginx -t',
          'sudo systemctl reload nginx',
          'Verify: visit yoursite.com/.git/config',
          'Should return 404',
          'Re-scan to verify'
        ]
      },
      best_practice: {
        name: 'Best Practice',
        steps: [
          'The real fix: never deploy with .git folder',
          'Use CI/CD pipelines that build from source',
          'Use: rsync -av --exclude=".git" . production/',
          'Or in Docker: add .dockerignore:',
          '.git',
          '.gitignore',
          '',
          'Never put your web root inside your git repo root'
        ]
      }
    },
    resources: [],
    verifyCheck: 'paths'
  },

  // ─── 16. MISSING DKIM ────────────────────────────────────
  'dns-no-dkim': {
    id: 'dns-no-dkim',
    title: 'Add DKIM DNS Record',
    severity: 'low',
    icon: '✉️',
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    description:
      'No DKIM record found. Your outgoing emails cannot be verified as genuine.',
    impact: 'Your emails go to spam. Domain can be used in email spoofing.',
    platforms: {
      google_workspace: {
        name: 'Google Workspace',
        steps: [
          'Log in to admin.google.com',
          'Go to Apps → Google Workspace → Gmail',
          'Click "Authenticate Email"',
          'Select your domain',
          'Click "Generate New Record"',
          'Copy the TXT record value shown',
          'Go to your DNS provider',
          'Add TXT record:',
          'Name: google._domainkey',
          'Value: (paste the value from Google)',
          'Wait 48 hours',
          'Return to Google Admin and click "Start Authentication"',
          'Verify at: mxtoolbox.com/dkim.aspx'
        ]
      },
      sendgrid: {
        name: 'SendGrid',
        steps: [
          'Log in to SendGrid → Settings → Sender Authentication',
          'Click "Authenticate Your Domain"',
          'Choose your DNS provider',
          'Follow the guided setup',
          'Add the CNAME records to your DNS',
          'Return to SendGrid and click Verify',
          'Verify at: mxtoolbox.com/dkim.aspx'
        ]
      },
      cpanel: {
        name: 'cPanel (Self-hosted)',
        steps: [
          'Log in to cPanel',
          'Go to Email → Email Deliverability',
          'Find your domain',
          'Click "Repair" next to DKIM',
          'cPanel auto-generates and installs DKIM',
          'Verify at: mxtoolbox.com/dkim.aspx'
        ]
      }
    },
    resources: [
      { label: 'DKIM Checker', url: 'https://mxtoolbox.com/dkim.aspx' }
    ],
    verifyCheck: 'dns'
  },

  // ─── 17. MISSING CAA RECORD ──────────────────────────────
  'dns-no-caa': {
    id: 'dns-no-caa',
    title: 'Add CAA DNS Record',
    severity: 'low',
    icon: '📜',
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    description:
      'No CAA record found. Any certificate authority can issue SSL for your domain.',
    impact: 'Attackers can trick a rogue CA into issuing a fake SSL cert for your domain.',
    platforms: {
      cloudflare: {
        name: 'Cloudflare DNS',
        steps: [
          'Log in to dash.cloudflare.com',
          'Select your domain → DNS → Records',
          'Click Add Record',
          'Type: CAA',
          'Name: @ (root domain)',
          'Flags: 0',
          'Tag: issue',
          'Value: "letsencrypt.org"',
          '(or "comodoca.com" or "digicert.com")',
          'depending on who issued your SSL',
          '',
          'Add another record to block all others:',
          'Type: CAA',
          'Name: @',
          'Flags: 0',
          'Tag: issuewild',
          'Value: ";"',
          '',
          'Click Save',
          'Verify at: sslmate.com/caa',
          'Wait 24-48 hours'
        ]
      },
      any_dns: {
        name: 'Any DNS Provider',
        steps: [
          'Go to your DNS provider control panel',
          'Add a new CAA record:',
          'Host: @ (or yourdomain.com)',
          'Flag: 0',
          'Tag: issue',
          'Value: "letsencrypt.org"',
          '(Use your SSL certificate provider name)',
          '',
          'Common CA values:',
          '"letsencrypt.org"  ← Free SSL',
          '"comodoca.com"     ← Comodo',
          '"digicert.com"     ← DigiCert',
          '"amazon.com"       ← AWS Certificate Manager',
          '',
          'Save and verify at: sslmate.com/caa'
        ]
      }
    },
    resources: [
      { label: 'CAA Record Checker', url: 'https://sslmate.com/caa' },
      { label: 'CAA Generator', url: 'https://sslmate.com/caa/#wizard' }
    ],
    verifyCheck: 'dns'
  }
};
