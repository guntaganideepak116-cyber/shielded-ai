import chat from './api/_core/handlers/chat.js';
import scan from './api/_core/handlers/scan.js';
import aiFix from './api/_core/handlers/ai-fix.js';
import history from './api/_core/handlers/history.js';
import sendEmail from './api/_core/handlers/send-email.js';
import sendAlert from './api/_core/handlers/send-alert.js';
import monitor from './api/_core/handlers/monitor.js';
import stats from './api/_core/handlers/stats.js';
import assistant from './api/_core/handlers/assistant.js';
import generateApiKey from './api/_core/handlers/user/generate-api-key.js';
import updatePlan from './api/_core/handlers/user/update-plan.js';
import addMonitor from './api/_core/handlers/monitors/add.js';
import cronMonitor from './api/_core/handlers/cron/monitor.js';

export default async function handler(req, res) {
  // CORS HEADERS (Global)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'http://localhost');
  let path = url.pathname.replace(/\/$/, '');
  
  const routes = {
    'chat': chat,
    'scan': scan,
    'ai-fix': aiFix,
    'history': history,
    'send-email': sendEmail,
    'send-alert': sendAlert,
    'monitor': monitor,
    'stats': stats,
    'chatbot': assistant,
    'assistant': assistant,
    'user/generate-api-key': generateApiKey,
    'user/update-plan': updatePlan,
    'monitors/add': addMonitor,
    'cron/monitor': cronMonitor
  };

  const key = path.replace(/^\/api\//, '').replace(/^\//, '');
  const apiHandler = routes[key];

  if (apiHandler) {
    try {
      return await apiHandler(req, res);
    } catch (error) {
      console.error(`Error in ${path}:`, error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  return res.status(404).json({ error: 'Not Found', path, key });
}
