# Medical Interpreter — Production Deployment Guide

This guide describes production deployment options for the Real-Time Medical Interpreter application.

---

## 1. Containerized Deployment (Recommended)

The repository provides a multi-stage `Dockerfile` and `docker-compose.yml` for unified deployment.

### Quickstart with Docker Compose
```bash
# 1. Clone repository
git clone https://github.com/Shivanshu27/realtime-openai-medical-interpreter-app.git
cd realtime-openai-medical-interpreter-app

# 2. Configure environment
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and preferred settings

# 3. Boot container cluster
docker compose up -d --build
```

The application will be available at `http://localhost:5000` with the built React SPA served directly alongside API routes.

---

## 2. Standalone Multi-Tier Deployment

If deploying frontend and backend to distinct hosting targets (e.g. AWS ECS / Cloud Run for backend, Vercel / Cloudflare Pages for frontend):

### Backend Setup
1. Deploy `server/` with Node.js 20+ runtime.
2. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   OPENAI_API_KEY=sk-proj-...
   MONGODB_URI=mongodb+srv://...
   MOCK_MODE=false
   ```
3. Health check probe: `GET /health` (expects HTTP 200).

### Frontend Setup
1. Build the client bundle:
   ```bash
   cd client
   REACT_APP_API_URL=https://your-backend-domain.com REACT_APP_MOCK_MODE=false npm run build
   ```
2. Serve the `client/build/` directory via any static hosting CDN.

---

## 3. Security & Compliance Checklist

- [ ] **No Client Keys:** Ensure `OPENAI_API_KEY` is set ONLY on the backend server.
- [ ] **HTTPS/WSS Enforcement:** WebRTC and getUserMedia APIs require secure contexts (`https://` or `localhost`).
- [ ] **CORS Configuration:** Restrict `cors()` origin in `server/src/app.js` to your trusted frontend domain in production.
- [ ] **Network Egress:** Allow outbound UDP and HTTPS traffic to `api.openai.com` for WebRTC media transport.
