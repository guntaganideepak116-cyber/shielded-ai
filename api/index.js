// Bridge for Vercel Serverless Functions
// Re-exports the clean backend logic from /backend/index.js
const app = require('../backend/index.js');
module.exports = app;
