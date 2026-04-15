import chat from '../api-core/handlers/chat.js';
import scan from '../api-core/handlers/scan.js';
import aiFix from '../api-core/handlers/ai-fix.js';
import history from '../api-core/handlers/history.js';
import sendEmail from '../api-core/handlers/send-email.js';
import sendAlert from '../api-core/handlers/send-alert.js';
import monitor from '../api-core/handlers/monitor.js';
import stats from '../api-core/handlers/stats.js';
import chatbot from '../api-core/handlers/chatbot.js';
import generateApiKey from '../api-core/handlers/user/generate-api-key.js';
import updatePlan from '../api-core/handlers/user/update-plan.js';
import addMonitor from '../api-core/handlers/monitors/add.js';
import cronMonitor from '../api-core/handlers/cron/monitor.js';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Route mapping
  const routes = {
    '/api/chat': chat,
    '/api/scan': scan,
    '/api/ai-fix': aiFix,
    '/api/history': history,
    '/api/send-email': sendEmail,
    '/api/send-alert': sendAlert,
    '/api/monitor': monitor,
    '/api/stats': stats,
    '/api/chatbot': chatbot,
    '/api/user/generate-api-key': generateApiKey,
    '/api/user/update-plan': updatePlan,
    '/api/monitors/add': addMonitor,
    '/api/cron/monitor': cronMonitor
  };

  const handler = routes[path];

  if (handler) {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error(`Error in ${path}:`, error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  return res.status(404).json({ error: 'Not Found', path });
}
