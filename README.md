# Vigilant AI - Indian SME Compliance & Regulatory Intelligence Agent

**Vigilant AI** is a state-of-the-art compliance copilot designed to help Indian SMEs (Small & Medium Enterprises) automate compliance workflows. It serves as an intelligent virtual compliance officer that tracks, reconciles, and reports on GST, EPF, ESIC, Labour Laws, FSSAI, PCB (Pollution Control), and Factories Act obligations.

This project was engineered for a national-level hackathon with startup viability in mind. It incorporates a **Dual Execution Mode**:
1. **Interactive Demo Mode (Default):** Runs completely client-side utilizing rich mock datasets and simulated Gemini/PostgreSQL drivers. Allows judges to evaluate all features (checklists, AI chat, audits, and broadcasts) instantly without config keys.
2. **Production Mode:** Integrates live **Google Gemini API** (using `@google/generative-ai` SDK) and **Supabase Database / Auth** once environmental keys are supplied.

---

## 🚀 Key Features

- **Module 1: Authentication Shell:** Sleek login/signup workflow featuring a "Demo Mode" evaluator bypass.
- **Module 2: Onboarding Analyzer:** Company details form (industry, state, licenses, employee count) that automatically prompts Gemini to seed custom regulatory checklists.
- **Module 3: Command Center Dashboard:** Circular compliance health meter, risk scores, active penalties accrued, upcoming calendar deadlines, and real-time AI recommendation feeds.
- **Module 4: Multilingual Voice Copilot:** Chat workspace supporting text & voice queries (Web Speech API) with multilingual inputs translated dynamically in **English, Hindi, and Telugu**. Includes Text-to-Speech (read-aloud) replies.
- **Module 5: OCR Document Inspector:** Document scanner (notices, contracts) with click-to-run demo presets. AI parses summaries, warnings, action items, and schedules deadlines.
- **Module 6: Interactive Tracker:** Filterable tracker for completing tasks, checking overdue penalties, and creating custom legal events.
- **Module 7 & 8: Analytics & Report Synthesizer:** Trend charts (Recharts) mapping monthly health rates, category loads, and a markdown audit compiler with PDF export functions.
- **Module 9: Back-office Broadcaster:** Administration desk logs system audits, measures API token expenditures, and dispatches global notice warnings to dashboards.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide React (Icons)
- **Visuals:** Recharts (SVG Responsive Charts)
- **AI Engine:** Google Gemini Generative AI SDK (`@google/generative-ai`)
- **Database:** Supabase Client (PostgreSQL)

---

## ⚡ Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Local Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the cockpit.

3. **Deploy (Production Mode):**
   Copy `.env.local` variables and paste into your hosting environment (e.g. Vercel dashboard).

---

## ⚙️ Environment Variables

Configure `.env.local` to override Demo Mode:
```env
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Alternatively, configure your API Key directly inside the app using the **Configure Gemini API Key** dashboard link on the top banner!
