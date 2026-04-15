import chat from './_handlers/chat.js';
import scan from './_handlers/scan.js';
import aiFix from './_handlers/ai-fix.js';
import history from './_handlers/history.js';
import sendEmail from './_handlers/send-email.js';
import sendAlert from './_handlers/send-alert.js';
import monitor from './_handlers/monitor.js';
import stats from './_handlers/stats.js';
import chatbot from './_handlers/chatbot.js';
import generateApiKey from './_handlers/user/generate-api-key.js';
import updatePlan from './_handlers/user/update-plan.js';
import addMonitor from './_handlers/monitors/add.js';
import cronMonitor from './_handlers/cron/monitor.js';

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
