# LeadDork — AI-Powered LinkedIn Lead Generation Tool

> A professional lead generation web application that converts natural language search queries into precision Google dork queries targeting LinkedIn profiles. Built for sales teams, recruiters, and growth professionals who need to find high-quality leads fast.

---

## 📋 Table of Contents

- [LeadDork — AI-Powered LinkedIn Lead Generation Tool](#leaddork--ai-powered-linkedin-lead-generation-tool)
  - [📋 Table of Contents](#-table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
    - [Backend (`server/.env`)](#backend-serverenv)
    - [Frontend (`client/.env`)](#frontend-clientenv)
  - [Installation \& Setup](#installation--setup)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Backend Setup](#2-backend-setup)
    - [3. Database Setup](#3-database-setup)
    - [4. Frontend Setup](#4-frontend-setup)
  - [Running the App](#running-the-app)
    - [Development](#development)
    - [Production](#production)
  - [API Reference](#api-reference)
    - [Search](#search)
      - [`POST /api/search/generate`](#post-apisearchgenerate)
    - [Leads](#leads)
      - [`GET /api/leads`](#get-apileads)
      - [`POST /api/leads`](#post-apileads)
      - [`PATCH /api/leads/:id`](#patch-apileadsid)
      - [`DELETE /api/leads/:id`](#delete-apileadsid)
    - [Search History](#search-history)
      - [`GET /api/history`](#get-apihistory)
      - [`DELETE /api/history/:id`](#delete-apihistoryid)
  - [Database Schema](#database-schema)
  - [Deployment](#deployment)
    - [Backend (Railway)](#backend-railway)
    - [Frontend (Vercel)](#frontend-vercel)
  - [How It Works](#how-it-works)
  - [Usage Guide](#usage-guide)
  - [Contributing](#contributing)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)

---

## Overview

**LeadDork** solves the tedious manual process of constructing Google dork queries to find LinkedIn profiles. Instead of wrestling with search operators, you simply describe your ideal lead in plain English — the AI interprets your intent, builds an optimized dork query, and fires the Google search automatically.

Leads found are saved to a PostgreSQL database where you can tag, annotate, track, and export them. The tool is designed to feel like a real product — fast, clean, and built for daily use.

---

## Features

- **Natural Language Search** — Describe your target lead in plain English; AI handles query construction
- **AI Query Generation** — Claude (Anthropic) converts your description into a precision Google dork query
- **One-Click Search** — Automatically opens Google results in a new tab
- **Multiple Query Variants** — Generates 2–3 dork variations per search for broader coverage
- **Lead Management** — Save, tag, and add notes to leads directly in the app
- **Search History** — Revisit and replay any past search query
- **CSV Export** — Export your leads list for use in outreach tools like Apollo, HubSpot, or Instantly
- **Custom CSS UI** — Polished, professional interface with no CSS framework dependencies
- **REST API Backend** — Node.js/Express backend with full PostgreSQL persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) |
| **Styling** | Plain CSS (custom, no framework) |
| **Component Primitives** | shadcn/ui (used selectively) |
| **AI** | Anthropic Claude API (`claude-sonnet-4-6`) |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **ORM** | pg (node-postgres) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway |

---

## Project Structure

```
leaddork/
├── client/                         # React frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                 # Icons, images, static files
│   │   ├── components/
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SearchBar.css
│   │   │   ├── QueryCard/
│   │   │   │   ├── QueryCard.jsx
│   │   │   │   └── QueryCard.css
│   │   │   ├── LeadTable/
│   │   │   │   ├── LeadTable.jsx
│   │   │   │   └── LeadTable.css
│   │   │   ├── SearchHistory/
│   │   │   │   ├── SearchHistory.jsx
│   │   │   │   └── SearchHistory.css
│   │   │   ├── TagBadge/
│   │   │   │   ├── TagBadge.jsx
│   │   │   │   └── TagBadge.css
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.jsx
│   │   │       └── Sidebar.css
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── Leads/
│   │   │   │   ├── Leads.jsx
│   │   │   │   └── Leads.css
│   │   │   ├── History/
│   │   │   │   ├── History.jsx
│   │   │   │   └── History.css
│   │   │   └── Settings/
│   │   │       ├── Settings.jsx
│   │   │       └── Settings.css
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance for backend calls
│   │   │   └── anthropic.js        # Claude API integration
│   │   ├── hooks/
│   │   │   ├── useLeads.js
│   │   │   └── useSearchHistory.js
│   │   ├── utils/
│   │   │   ├── exportCSV.js
│   │   │   └── buildGoogleUrl.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css               # Global styles, CSS variables
│   │   └── main.jsx
│   ├── .env                        # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/
│   │   └── db.js                   # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── leadsController.js
│   │   ├── searchController.js
│   │   └── historyController.js
│   ├── routes/
│   │   ├── leads.js
│   │   ├── search.js
│   │   └── history.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── db/
│   │   └── schema.sql              # PostgreSQL schema (run once to set up)
│   ├── .env                        # Backend environment variables
│   ├── index.js                    # Express entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node)
- **PostgreSQL** v14 or higher — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)
- An **Anthropic API Key** — [Get one here](https://console.anthropic.com/)

---

## Environment Variables

### Backend (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leaddork
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here

# CORS
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files.** Both are listed in `.gitignore` by default.

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/leaddork.git
cd leaddork
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Dependencies installed:
- `express` — HTTP server framework
- `pg` — PostgreSQL client for Node.js
- `dotenv` — Environment variable loader
- `cors` — Cross-Origin Resource Sharing
- `@anthropic-ai/sdk` — Official Anthropic SDK
- `nodemon` — Dev auto-restart (devDependency)

---

### 3. Database Setup

Make sure PostgreSQL is running on your machine, then create the database and run the schema:

**Step 1 — Create the database:**

```bash
psql -U your_postgres_username -c "CREATE DATABASE leaddork;"
```

**Step 2 — Run the schema:**

```bash
psql -U your_postgres_username -d leaddork -f server/db/schema.sql
```

**Step 3 — Verify tables were created:**

```bash
psql -U your_postgres_username -d leaddork -c "\dt"
```

You should see the following tables listed:
- `leads`
- `search_history`
- `tags`
- `lead_tags`

---

### 4. Frontend Setup

```bash
cd ../client
npm install
```

Dependencies installed:
- `react` + `react-dom` — UI framework
- `react-router-dom` — Client-side routing
- `axios` — HTTP requests to backend
- `@anthropic-ai/sdk` — Claude API for query generation
- `vite` — Dev server and build tool (devDependency)

---

## Running the App

### Development

Open two terminal windows:

**Terminal 1 — Start the backend:**

```bash
cd server
npm run dev
```

The Express server starts at `http://localhost:5000`

**Terminal 2 — Start the frontend:**

```bash
cd client
npm run dev
```

The React app starts at `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

---

### Production

**Build the frontend:**

```bash
cd client
npm run build
```

This generates a `dist/` folder with optimized static files ready for deployment.

**Start the backend in production mode:**

```bash
cd server
NODE_ENV=production node index.js
```

---

## API Reference

All backend endpoints are prefixed with `/api`.

---

### Search

#### `POST /api/search/generate`

Sends a natural language query to Claude and returns generated Google dork query variants.

**Request body:**
```json
{
  "query": "fintech startup founders in Lagos with under 50 employees"
}
```

**Response:**
```json
{
  "success": true,
  "variants": [
    {
      "label": "Founders by title",
      "dork": "site:linkedin.com/in/ \"founder\" OR \"co-founder\" \"fintech\" \"Lagos\" -intitle:\"jobs\""
    },
    {
      "label": "CEO/CTO angle",
      "dork": "site:linkedin.com/in/ \"CEO\" OR \"CTO\" \"fintech\" \"Nigeria\" \"Lagos\""
    },
    {
      "label": "Broad net",
      "dork": "site:linkedin.com/in/ \"fintech\" \"Lagos\" (\"founder\" | \"CEO\" | \"MD\")"
    }
  ],
  "savedHistoryId": 14
}
```

---

### Leads

#### `GET /api/leads`

Returns all saved leads, ordered by most recently added.

**Query params (optional):**
- `tag` — Filter by tag name (e.g., `?tag=warm`)
- `limit` — Number of results (default: 50)
- `offset` — Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "leads": [
    {
      "id": 1,
      "name": "Amaka Obi",
      "linkedin_url": "https://linkedin.com/in/amakaobi",
      "title": "Co-Founder & CEO",
      "company": "PayStack",
      "location": "Lagos, Nigeria",
      "notes": "Met at TechPoint summit",
      "tags": ["warm", "follow-up"],
      "created_at": "2026-02-14T10:22:00Z"
    }
  ],
  "total": 84
}
```

---

#### `POST /api/leads`

Saves a new lead to the database.

**Request body:**
```json
{
  "name": "Amaka Obi",
  "linkedin_url": "https://linkedin.com/in/amakaobi",
  "title": "Co-Founder & CEO",
  "company": "PayStack",
  "location": "Lagos, Nigeria",
  "notes": "Met at TechPoint summit"
}
```

---

#### `PATCH /api/leads/:id`

Updates an existing lead's notes, tags, or status.

**Request body (all fields optional):**
```json
{
  "notes": "Replied to cold email — interested",
  "tags": ["warm", "replied"]
}
```

---

#### `DELETE /api/leads/:id`

Permanently deletes a lead.

---

### Search History

#### `GET /api/history`

Returns all past search queries.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 14,
      "raw_query": "fintech startup founders in Lagos",
      "generated_dorks": [...],
      "created_at": "2026-02-14T10:00:00Z"
    }
  ]
}
```

---

#### `DELETE /api/history/:id`

Removes a single item from search history.

---

## Database Schema

The full schema lives at `server/db/schema.sql`. Here is an overview:

```sql
-- Saved leads
CREATE TABLE leads (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  linkedin_url TEXT NOT NULL UNIQUE,
  title       VARCHAR(255),
  company     VARCHAR(255),
  location    VARCHAR(255),
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Tags available for labelling leads
CREATE TABLE tags (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
);

-- Many-to-many: leads <-> tags
CREATE TABLE lead_tags (
  lead_id  INT REFERENCES leads(id) ON DELETE CASCADE,
  tag_id   INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

-- Record of every AI search performed
CREATE TABLE search_history (
  id               SERIAL PRIMARY KEY,
  raw_query        TEXT NOT NULL,
  generated_dorks  JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

---

## Deployment

### Backend (Railway)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Select **Deploy from GitHub repo** and choose your repository
4. Add a **PostgreSQL** plugin to the project — Railway provisions the database automatically
5. Set all environment variables from `server/.env` in Railway's **Variables** tab (use Railway's auto-generated `DATABASE_URL` for the DB connection)
6. Set the **Start Command** to `node index.js`
7. Railway will deploy and give you a live backend URL (e.g., `https://leaddork-api.up.railway.app`)

---

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set the **Root Directory** to `client`
3. Set the **Build Command** to `npm run build`
4. Set the **Output Directory** to `dist`
5. Add the environment variable:
   ```
   VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
   ```
6. Deploy — Vercel gives you a live URL instantly

---

## How It Works

```
User types:  "growth hackers in SaaS B2B startups, Series A, remote"
                              ↓
                     Sent to Claude API
                              ↓
         Claude parses intent: role → "growth", industry → "SaaS B2B",
         stage → "Series A", setting → "remote"
                              ↓
         Claude constructs 2–3 optimized LinkedIn dork variants
                              ↓
         Variants displayed as cards in the UI
                              ↓
         User clicks a card → Google opens in new tab with the dork pre-filled
                              ↓
         User finds a profile → clicks "Save Lead" in the app
                              ↓
         Lead stored in PostgreSQL with optional tags and notes
```

---

## Usage Guide

**1. Search**
Navigate to the **Dashboard** and type a plain English description of the kind of LinkedIn profile you're looking for. Be as specific or as broad as you like. Examples:

- *"VPs of Engineering at Nigerian fintech companies"*
- *"Procurement managers at manufacturing companies in South Africa"*
- *"Solo founders of climate tech startups, Series A, based in London"*

**2. Pick a Variant**
The AI returns 2–3 dork query cards. Each one takes a slightly different angle (e.g., title-focused vs. company-focused vs. broad net). Click the one that best matches your intent.

**3. Review Results**
Google opens in a new tab with the dork query. Browse the LinkedIn profiles that appear.

**4. Save Leads**
Click **Save Lead** in the app, paste in the LinkedIn URL and any details you captured. Add tags like `warm`, `cold`, `replied`, or create your own.

**5. Manage & Export**
Go to the **Leads** page to view all saved leads, filter by tag, add notes, or export to CSV for your outreach tool.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please keep PRs focused — one feature or fix per PR. Write descriptive commit messages.

---

## Troubleshooting

**`ECONNREFUSED` when starting backend**
Your PostgreSQL service is not running. Start it with:
```bash
# macOS (Homebrew)
brew services start postgresql

# Ubuntu/Debian
sudo service postgresql start

# Windows
net start postgresql-x64-14
```

---

**`invalid API key` from Anthropic**
Double-check that `ANTHROPIC_API_KEY` in `server/.env` starts with `sk-ant-` and has no trailing spaces or quotes.

---

**React app shows blank page**
Check that `VITE_API_BASE_URL` in `client/.env` points to the correct backend URL and that the backend is running.

---

**Google blocks the search after many queries**
This is Google's rate limiting on automated-looking traffic. Space out searches by a few seconds, or use a different browser profile. The app does not use any scraping — it simply opens Google URLs, which is the same as typing manually.

---

**Database migration after schema change**
If you update `schema.sql`, drop and recreate the tables (only safe in development):
```bash
psql -U your_username -d leaddork -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U your_username -d leaddork -f server/db/schema.sql
```

---

## License

MIT License. See `LICENSE` for details.

---

*Built with the Anthropic Claude API. Not affiliated with LinkedIn or Google.*