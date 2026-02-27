# 🌾 FarmConnect AI

> WhatsApp-based agricultural market intelligence for African smallholder farmers.

FarmConnect AI is a zero-install WhatsApp chatbot that delivers real-time crop prices, buyer connections, and AI-powered market insights to farmers across Africa — working on any phone, any network, in 4 local languages.

**Live Bot:** Send `hello` to **+1 415 523 8886** on WhatsApp  
**Production URL:** `https://your-railway-url.up.railway.app`

---

## 📋 Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Routes](#api-routes)
- [NLP Pipeline](#nlp-pipeline)
- [WhatsApp Bot Flows](#whatsapp-bot-flows)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Branching Strategy](#branching-strategy)

---

## 🚨 The Problem

33M+ Nigerian smallholder farmers lose **40% of their income** due to:
- No access to real-time crop prices
- Poor market linkage and buyer connections
- Post-harvest losses from bad storage/selling decisions
- Language barriers and low digital literacy

## 💡 The Solution

A WhatsApp chatbot that works on **any phone with WhatsApp** — no app download, no bank account, no smartphone required. Farmers text in plain language and get instant price data, buyer contacts, and market insights.

---

## ✨ Features

| Feature | Status |
|---|---|
| Real-time crop price queries | ✅ Live |
| Price trend indicators (up/down/stable) | ✅ Live |
| Verified buyer matching | ✅ Live |
| Farmer registration & profiling | ✅ Live |
| Multi-language support (EN, Hausa, Yoruba, Igbo) | ✅ Live |
| Rule-based NLP intent classification | ✅ Live |
| Admin dashboard for price management | ✅ Live |
| Rate limiting (3 free queries/day) | ✅ Live |
| Conversation session state | ✅ Live |
| Hugging Face AI model integration | 🔄 In progress |
| Voice note support | 📅 Planned |
| SMS fallback | 📅 Planned |
| Airtime payments | 📅 Planned |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Fastify |
| Database | PostgreSQL (Neon) |
| Cache | Redis (Upstash) — optional |
| Queue | Bull |
| WhatsApp | Twilio WhatsApp Business API |
| NLP Phase 1 | Rule-based (regex + keyword matching) |
| NLP Phase 2 | Hugging Face `facebook/bart-large-mnli` |
| Deployment | Railway |
| Landing Page | HTML/CSS/JS → Vercel |

---

## 📁 Project Structure

```
farmconnect-ai/
│
├── src/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   ├── redis.js           # Redis/cache connection
│   │   └── env.js             # Environment variable validation
│   │
│   ├── routes/
│   │   ├── webhook.js         # ⭐ Main WhatsApp webhook (POST /webhook)
│   │   ├── prices.js          # Price CRUD endpoints
│   │   ├── farmers.js         # Farmer registration endpoints
│   │   ├── buyers.js          # Buyer directory endpoints
│   │   └── admin.js           # Admin dashboard API
│   │
│   ├── services/
│   │   ├── whatsapp.js        # Send messages via Twilio
│   │   ├── nlp.js             # ⭐ Intent classification + entity extraction
│   │   ├── priceService.js    # Price lookup + trend calculation
│   │   ├── farmerService.js   # Farmer CRUD + rate limiting
│   │   ├── buyerService.js    # Buyer matching logic
│   │   └── sessionService.js  # Conversation state management
│   │
│   ├── queues/
│   │   ├── messageQueue.js          # Bull queue setup
│   │   └── processors/
│   │       └── messageProcessor.js  # Async message processing
│   │
│   ├── db/
│   │   ├── schema.sql         # Full database schema
│   │   ├── seed.sql           # Seed data (crops, markets, prices, buyers)
│   │   ├── migrate.js         # Run schema migrations
│   │   └── seed.js            # Run seed data
│   │
│   ├── nlp/
│   │   ├── intents.js         # Intent patterns (regex)
│   │   ├── entities.js        # Crop/market name aliases in 4 languages
│   │   └── responses.js       # Response templates (EN, HA, YO, IG)
│   │
│   ├── middleware/
│   │   ├── rateLimiter.js     # Query rate limiting
│   │   └── validator.js       # Request validation
│   │
│   └── app.js                 # Fastify app + route registration
│
├── landing/                   # Landing page (deployed to Vercel)
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
│
├── admin/
│   └── index.html             # Admin price dashboard
│
├── tests/
│   ├── nlp.test.js
│   ├── prices.test.js
│   └── webhook.test.js
│
├── server.js                  # Entry point
├── package.json
├── .env.example               # Environment template (never commit .env)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- A [Neon](https://neon.tech) PostgreSQL account (free)
- A [Twilio](https://twilio.com) account with WhatsApp sandbox enabled
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/farmconnect-ai.git
cd farmconnect-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Fill in your real values — see Environment Variables section below
```

### 4. Set up the database
```bash
# Create schema (run once)
npm run migrate

# Seed with crops, markets, prices, buyers
npm run seed
```

### 5. Start development server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 6. Expose to internet (for Twilio webhook)
```bash
# Download ngrok from https://ngrok.com
ngrok http 3000
# Copy the https URL e.g. https://abc123.ngrok-free.dev
```

### 7. Connect Twilio
- Go to [Twilio Console](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
- Set **"When a message comes in"** to: `https://YOUR-NGROK-URL/webhook`
- Method: **POST**
- Save

### 8. Test the bot
Send `hello` to **+1 415 523 8886** on WhatsApp

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Server
PORT=3000
NODE_ENV=development          # change to 'production' on Railway

# PostgreSQL — get from neon.tech
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Redis — optional, get from upstash.com
# Leave blank to run without cache (works fine for dev)
REDIS_URL=redis://...

# Twilio — get from console.twilio.com
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# App
APP_URL=http://localhost:3000  # change to Railway URL in production
FREE_QUERY_LIMIT=3             # free queries per farmer per day

# Hugging Face — get from huggingface.co (for NLP Phase 2)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **NEVER commit your `.env` file.** It's in `.gitignore` for a reason.  
> Share credentials with teammates privately (WhatsApp, email, etc.)

---

## 🗄 Database

### Tables

| Table | Purpose |
|---|---|
| `farmers` | Registered farmers — phone is primary identifier |
| `markets` | Physical markets (Mile 12, Kano Central, etc.) |
| `crops` | Supported crops with local language names |
| `prices` | Price entries per crop per market with trend |
| `buyers` | Verified buyers/exporters/aggregators |
| `conversations` | Full message log for analytics |
| `sessions` | Conversation state (tracks registration flow etc.) |

### Useful commands
```bash
npm run migrate    # Create all tables
npm run seed       # Insert crops, markets, sample prices, buyers
```

### Adding prices manually
Open `admin/index.html` in your browser while the server is running locally, or visit `/api/admin` endpoints directly.

---

## 🌐 API Routes

### Webhook
```
POST /webhook          # Receives all WhatsApp messages from Twilio
GET  /webhook          # Health check
```

### Admin
```
GET  /api/admin/stats      # Dashboard stats
GET  /api/admin/prices     # All prices
POST /api/admin/prices     # Add new price
PUT  /api/admin/prices/:id # Update price
GET  /api/admin/crops      # All crops
GET  /api/admin/markets    # All markets
GET  /api/admin/farmers    # All registered farmers
GET  /api/admin/buyers     # All buyers
POST /api/admin/buyers     # Add new buyer
```

### Health
```
GET /                  # Server health check
```

---

## 🧠 NLP Pipeline

The NLP system processes incoming WhatsApp messages in 3 steps:

### Step 1 — Intent Classification
Determines what the farmer wants:

| Intent | Example messages |
|---|---|
| `price_check` | "Price of maize in Kano", "how much is rice" |
| `buyer_search` | "Find buyer for yam", "I want to sell maize" |
| `register` | "Register", "Join", "I am a farmer" |
| `help` | "Hello", "Hi", "Help", "Menu" |
| `price_trend` | "Maize price trend", "forecast for rice" |
| `subscribe` | "Subscribe", "Premium", "Upgrade" |

### Step 2 — Entity Extraction
Pulls out crop and market names from the message, supporting local language names:

```
"Agbado price for Lagos"
→ crop: "Maize" (agbado = Maize in Yoruba)
→ market: "Mile 12 Market" (Lagos maps to Mile 12)
```

### Step 3 — Response Generation
Queries the database and returns a formatted WhatsApp message.

### Phase 2 — Hugging Face Integration
**This is for the partner working on `feature/nlp-ai-model`.**

Replace the `classifyIntent` function in `src/services/nlp.js` with a call to the Hugging Face Inference API:

```javascript
// Target file: src/services/nlp.js
// Target function: classifyIntent(message)
// Model: facebook/bart-large-mnli (zero-shot classification)
// API docs: https://huggingface.co/docs/api-inference/tasks/zero-shot-classification
// Keep regex as fallback if HF API fails or times out
// Add HUGGINGFACE_API_KEY to .env
```

---

## 📱 WhatsApp Bot Flows

### Price Check
```
Farmer: "Price of maize in Lagos"
Bot: 💰 Maize Price
     📍 Mile 12 Market, Lagos
     💵 ₦350 per kg
     ➡️ Trend: Stable
```

### Buyer Search
```
Farmer: "2" or "Find buyer for rice"
Bot: Which crop do you want to sell?
Farmer: "Rice"
Bot: 🛒 Buyers for Rice:
     1. North Grain Export Co...
```

### Registration Flow
```
Farmer: "register"
Bot: What is your full name?
Farmer: "Aminu Ibrahim"
Bot: What state/city are you in?
Farmer: "Kano"
Bot: What crops do you farm?
Farmer: "Maize, Groundnut"
Bot: Preferred language? 1.English 2.Hausa 3.Yoruba 4.Igbo
Farmer: "2"
Bot: ✅ Welcome, Aminu Ibrahim! You're registered.
```

---

## 🚢 Deployment

### Backend — Railway
1. Push code to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add all environment variables in Railway → Variables tab
4. Railway auto-deploys on every `git push`

### Landing Page — Vercel
```bash
npx vercel --cwd landing
```
Or drag the `landing/` folder to [vercel.com/new](https://vercel.com/new)

### After deploying
1. Copy your Railway URL
2. Update `APP_URL` in Railway variables
3. Update Twilio webhook to `https://YOUR-RAILWAY-URL/webhook`

---

## 🌿 Branching Strategy

```
main                          ← stable, always deployable
├── feature/nlp-ai-model      ← partner: Hugging Face NLP upgrade
└── feature/landing-page-polish ← frontend polish + Vercel deploy
```

### Rules
- Never push directly to `main`
- Open a PR when your feature is ready
- One review before merging
- Always pull latest main before starting work:

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

---

## 🤝 Contributing

1. Accept the GitHub collaborator invite
2. Clone the repo: `git clone ...`
3. Create your branch: `git checkout -b feature/your-feature`
4. Copy `.env.example` to `.env` and fill in credentials (ask teammate privately)
5. Run `npm install` and `npm run dev`
6. Make your changes
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request on GitHub

---

## 📊 Current Data Coverage

**10 Crops:** Maize, Rice, Yam, Cassava, Tomato, Onion, Sorghum, Cowpea, Groundnut, Plantain

**20 Markets across 3 countries:**
- 🇳🇬 Nigeria — Lagos, Kano, Abuja, Onitsha, Port Harcourt, Enugu, Ibadan, Kaduna, Sokoto, Ogun
- 🇬🇭 Ghana — Kumasi, Accra
- 🇰🇪 Kenya — Nairobi, Mombasa

**5 Verified Buyers:** Aggregators, exporters, and processors across Nigeria, Ghana, and Kenya

---

## 👥 Team

Built in 6 days for a hackathon solving post-harvest losses for African smallholder farmers.

---

*Made with 🌾 for African farmers*