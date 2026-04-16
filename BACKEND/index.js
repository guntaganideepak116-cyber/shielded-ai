import chat from './_core/handlers/chat.js';
import scan from './_core/handlers/scan.js';
import aiFix from './_core/handlers/ai-fix.js';
import history from './_core/handlers/history.js';
import sendEmail from './_core/handlers/send-email.js';
import sendAlert from './_core/handlers/send-alert.js';
import monitor from './_core/handlers/monitor.js';
import stats from './_core/handlers/stats.js';
import chatbot from './_core/handlers/chatbot.js';
import generateApiKey from './_core/handlers/user/generate-api-key.js';
import updatePlan from './_core/handlers/user/update-plan.js';
import addMonitor from './_core/handlers/monitors/add.js';
import cronMonitor from './_core/handlers/cron/monitor.js';

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
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
