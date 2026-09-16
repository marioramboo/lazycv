# 🚀 LazyCV — Local-First AI CV & Resume Generator

> **Tailor your CV to every job offer in seconds.** Open-source, local-first, privacy-focused. Connect your GitHub, paste a job description, and generate ATS-optimized CVs, cover letters, and interview cheat sheets.

---

## ✨ Features

- **🤖 Bring Your Own AI Provider:** Connect to **OpenAI** (GPT-4o), **Anthropic** (Claude 3.5 Sonnet), **Google Gemini**, or run **100% offline with Ollama** (Llama 3, DeepSeek, Mistral).
- **🔒 100% Local & Private:** No cloud accounts, external databases, or analytics tracking. All your profile data, CVs, and application logs stay in your browser's IndexedDB.
- **🐙 GitHub Integration:** Fetch your public repositories, tech stacks, stars, and README highlights directly into your portfolio.
- **🎯 Live ATS Scoring:** Real-time applicant tracking system match score, missing keyword detection, and formatting optimization.
- **🎨 5 Professional CV Templates:** Choose from Classic, Modern, Tech, Creative, and Executive layouts.
- **✏️ WYSIWYG Editor:** Full rich-text inline editing, drag-and-drop section reordering, and instant live preview.
- **📦 Quick Apply Pack (ZIP Export):** One-click download containing your tailored PDF/DOCX resume, cover letter, and personalized technical interview cheat sheet.
- **📊 Job Application Tracker:** Built-in Kanban-style application log to track your job search progress from application to offer.
- **💾 Data Portability:** Complete JSON export and import for seamless backups and device migration.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui, Lucide Icons
- **State & Database:** Zustand, Dexie.js (IndexedDB)
- **Editor & Export:** Tiptap, @dnd-kit, docx, jsPDF, JSZip

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:3000` in your browser.
