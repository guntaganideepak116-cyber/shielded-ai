# SECURESHIELD AI - Enterprise Security SaaS

A high-performance, AI-driven security scanner built with a clean, modular architecture.

## 📁 Project Structure

This project follows a clean "SaaS-ready" architecture:

- **`/frontend`**: The core React/Vite application.
  - `/src`: Components, hooks, and UI logic.
  - `/public`: Static assets and icons.
- **`/backend`**: Node.js/Express serverless functions.
  - `index.js`: Main API entry point (Express).
- **`/db`**: Database configuration and security.
  - `firestore.rules`: Security rules for scan data.
  - `schema.md`: Firestore collection and mapping guide.
- **`/api`**: Vercel deployment bridge (Standard Serverless).

## 🚀 Getting Started

### 1. Installation
Install all dependencies from the project root:
```bash
npm install
```

### 2. Development
Run the full-stack development environment:
```bash
npm run dev
```
*Wait: This will launch the Vite frontend at `localhost:8080`.*

### 3. Backend Setup
Create a `.env` file in the root and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
```

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Firebase Admin SDK.
- **Auth**: Firebase Authentication (Email/Password + Google OAuth).
- **Deployment**: Vercel Serverless Functions.

## 🛡️ Security
This project uses **Firestore Security Rules** to ensure that:
1. Only authenticated users can write data.
2. Users can only read their own scan history.
3. Anonymous sessions are blocked from persistent storage (SaaS Guard).
