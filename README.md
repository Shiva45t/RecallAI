# RecallAI 🧠⚡

An intelligent, offline-first spaced repetition learning platform accelerated by **Groq LPUs** and **Supabase**.

RecallAI eliminates the manual flashcard authoring barrier using ultra-fast generative AI, maximizes long-term memory retention through an exact mathematical implementation of the **SuperMemo SM-2 algorithm**, and ensures continuous study accessibility via an **offline-first Progressive Web Application (PWA)** architecture.

---

## 🌟 Key Features

- **🚀 Ultra-Fast AI Deck Synthesis**: Ingests raw textual prompts, topics, or PDF lecture slides to automatically generate structured conceptual flashcards in seconds via Groq Language Processing Units.
- **📈 SuperMemo SM-2 Scheduling Engine**: Pure mathematical implementation of the SM-2 algorithm dynamically scheduling review intervals ($1 \text{ day}, 6 \text{ days}, \dots$) and tracking individual card Ease Factors ($EF \ge 1.3$).
- **💡 Real-Time Non-Spoiling Hints**: Streams cognitive nudges token-by-token via Server-Sent Events (SSE) without disclosing the target answer.
- **🎯 Conceptual Answer Evaluation**: Fuzzy evaluation of student-typed answers (0–100% score) with itemized strengths, weaknesses, and qualitative feedback.
- **🗺️ Hierarchical Concept Maps**: Visual mind maps generating node-edge graphs of complex concepts.
- **📶 Offline-First Reactive Architecture**: Local persistence powered by IndexedDB (via Dexie.js) with optimistic UI updates and an eventual-consistency background sync queue to cloud PostgreSQL.
- **📊 Learning Analytics & Heatmap**: 365-day study activity heatmap, retention velocity metrics, study streaks, and AI-driven weak-spot diagnosis.
- **📱 PWA & Standalone Installable**: Full offline precaching via Workbox service workers across desktop and mobile browsers.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts
- **State Management**: Zustand
- **Local Persistence**: IndexedDB via Dexie.js
- **Cloud Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Google OAuth 2.0)
- **AI Inference Engine**: Groq SDK (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`)
- **Document Ingestion**: Mozilla PDF.js (`pdfjs-dist`)
- **Testing & Quality**: Vitest, Oxlint

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Shiva45t/RecallAI.git
cd RecallAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your API credentials:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

### 4. Setup Database
Run the SQL migration script located in `supabase_setup.sql` in your **Supabase Dashboard → SQL Editor** to create the required tables (`profiles`, `decks`, `cards`, `study_sessions`, `card_reviews`) and security policies.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

- **Unit Tests**:
  ```bash
  npm run test
  ```
- **Linter Check**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

---

## 📄 License
MIT License.
