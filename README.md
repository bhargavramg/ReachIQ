# Xeno CRM — AI-Native Mini CRM

## Overview
Xeno CRM is an AI-powered customer relationship management platform designed for modern D2C brands. It leverages Gemini AI for natural language audience segmentation, campaign generation, and actionable performance insights.

## Architecture
```text
Browser → React (Vercel)
             ↓ REST API
         Express Backend (Railway) → PostgreSQL (Neon)
             ↓                    → Gemini AI
         POST /send
             ↓
         Channel Service (Railway)
             ↓ async callbacks
         POST /api/receipts
             ↓
         Update campaign stats
```

## Tech Stack
| Component | Technology | Why Chosen |
| --- | --- | --- |
| Frontend | React + Vite + Tailwind | Fast local dev, highly customizable utility classes for pixel-perfect design. |
| Backend | Node.js + Express | Lightweight, fast setup, excellent async I/O handling for microservices. |
| Database | PostgreSQL (Neon) | Serverless Postgres provides instant scaling and native JSON querying capabilities. |
| ORM | Prisma | Type-safe database client with excellent schema management. |
| AI | Gemini API | Extremely fast inference and large context window for data analysis. |

## AI Features
1. **Natural language segmentation:** Type "VIPs who haven't ordered in 60 days" and get a strict JSON filter array.
2. **AI message drafting:** Automatically generates contextual marketing copy based on the selected segment.
3. **Campaign insight summaries:** Analyzes funnel drop-offs and open rates to provide actionable 2-sentence recommendations.
4. **AI Copilot chat:** A contextual chat assistant that can analyze overall CRM health and suggest next steps.

## Setup & Run Locally

1. Install dependencies and setup database for backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/seed.js
npm run dev
```

2. Start the channel service (in a new terminal):
```bash
cd channel-service
npm install
npm run dev
```

3. Start the frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

## Conscious Tradeoffs
- **No auth:** Kept simple for demonstration. At scale, would use JWT + middleware.
- **setTimeout callbacks:** Simulates async processing. At scale, would use BullMQ/Redis queues for robustness.
- **Stats per-receipt:** Live incrementing works for small scale. At scale, would use batch aggregation pipelines.
- **Single region:** Currently local/monolithic. Would add CDN + multi-region routing at scale.
- **Polling for live stats:** Currently polls every 3s. Would replace with WebSockets or Server-Sent Events (SSE).

## Seed Data
The `seed.js` script automatically generates 200 realistic Indian D2C customer profiles and 800 randomized past orders. Just run `node src/seed.js` from the backend directory to populate the database.
