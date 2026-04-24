# AI-Enhanced Deal & Discount Platform (MSc Starter)

Full-stack starter for a personalized ecommerce promotion platform.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM

## Project Structure

- `frontend/`: customer feed and merchant console UI
- `backend/`: REST API, recommendation service, and Prisma schema
- `api/[...route].ts`: Vercel serverless entrypoint for Express API
- `ml/`: user behavior dataset, Python training script, and model artifacts

## Core API Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/deals/feed?userId=<id>`
- `POST /api/deals/:id/redeem`
- `POST /api/merchant/deals`
- `GET /api/merchant/:merchantId/analytics`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL locally

```bash
createdb ai_deals
```

3. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` if your local PostgreSQL username/password differ from the default example.

4. Generate Prisma client and run migrations

```bash
npm --workspace backend run prisma:generate
npm --workspace backend run prisma:migrate -- --name init
```

5. Start both apps

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`

## Python Model Training (User Behavior)

This project now includes a Python training pipeline that learns a purchase propensity model and exports model weights used by the backend recommendation service.

Run training:

```bash
npm run ml:train
```

Generated files:

- `ml/data/user_behavior_features.csv`
- `ml/artifacts/user_behavior_model.json`
- `ml/artifacts/user_behavior_metrics.json`

The backend automatically loads `ml/artifacts/user_behavior_model.json` when generating personalized deal scores.

## Vercel Deployment (Preview)

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. In Vercel project settings, add environment variables:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public
CLIENT_URL=https://<your-vercel-domain>
VITE_API_BASE_URL=/api
```

4. Run Prisma migration against your hosted PostgreSQL database:

```bash
npm --workspace backend run prisma:migrate -- --name init
```

5. Deploy in Vercel (this project is configured to build `frontend/dist` and serve API from `/api/*`).

## Notes for Dissertation

- Current authentication is intentionally simplified (plain password placeholder) for scaffolding.
- Recommendation scoring now supports a Python-trained behavior propensity model blended with a rule-based baseline.
- User behavior data source:
  - UCI Machine Learning Repository, Online Shoppers Purchasing Intention Dataset
  - URL: `https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset`
  - Raw CSV used in this project: `ml/data/online_shoppers_intention.csv`
