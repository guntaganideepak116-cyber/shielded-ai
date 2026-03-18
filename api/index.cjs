// Bridge for Vercel Serverless Functions
// Re-exports the clean backend logic from /backend/index.cjs
const app = require('../backend/index.cjs');
module.exports = app;
