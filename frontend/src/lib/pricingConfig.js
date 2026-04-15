export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    badge: 'FREE FOREVER',
    color: '#00ff88',
    features: [
      '10 scans per day',
      '6 security header checks',
      'SSL certificate check',
      'VirusTotal reputation scan',
      'Basic security score',
      'AI fix recommendations',
      'Scan history (last 10)',
      'PDF report export',
      'Email report delivery',
    ],
    limits: {
      dailyScans: 10,
      historyCount: 10,
      monitoring: 1,
      apiAccess: true,
      apiDailyLimit: 10,
    },
    notIncluded: [
      'Directory exposure checks',
      'Sensitive data detection',
      'Port scanning',
      'DNS security analysis',
      'Cookie security audit',
      'Advanced OWASP checks',
      'Multi-page crawl',
      'Continuous monitoring (multiple sites)',
    ]
  },

  pro: {
    name: 'Pro',
    price: 9,
    badge: 'MOST POPULAR',
    color: '#00d4ff',
    features: [
      'Everything in Free',
      '200 scans per day',
      'Directory & path exposure',
      'Sensitive data detection',
      'Cookie security audit',
      'Port scanning (Shodan)',
      'DNS security (SPF/DMARC)',
      'Server info disclosure',
      'Full OWASP Top 10',
      'Multi-page crawl (10 pages)',
      'Continuous monitoring (5 sites)',
      'Email alerts on score drop',
      'Unlimited scan history',
      'API access (200 req/day)',
      'Priority support',
    ],
    limits: {
      dailyScans: 200,
      historyCount: -1, // unlimited
      monitoring: 5,
      apiAccess: true,
      apiDailyLimit: 200,
    },
    notIncluded: []
  },

  enterprise: {
    name: 'Enterprise',
    price: 49,
    badge: 'CUSTOM',
    color: '#7c3aed',
    features: [
      'Everything in Pro',
      'Unlimited scans',
      'SQLi & XSS active testing',
      'CSRF vulnerability testing',
      'API endpoint discovery',
      'Custom scan profiles',
      'Unlimited monitoring',
      'Custom alerts & webhooks',
      'Slack/Discord integration',
      'Team management',
      'Unlimited API access',
      'SLA guarantee',
      'Dedicated support',
    ],
    limits: {
      dailyScans: -1, // unlimited
      historyCount: -1,
      monitoring: -1,
      apiAccess: true,
      apiDailyLimit: -1,
    }
  }
};
