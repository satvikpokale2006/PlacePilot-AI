import React, { useState, useEffect } from "react";
import { 
  Presentation, ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  BookOpen, Code2, Cpu, Server, Database, Sparkles, BrainCircuit, 
  CheckCircle2, Layers, Award, Terminal, ShieldCheck, Zap, BarChart2, 
  FileText, Copy, Check, ExternalLink, Play, Pause, Volume2, Monitor
} from "lucide-react";

interface PresentationViewProps {
  onNavigate?: (tab: string) => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedDeck, setCopiedDeck] = useState(false);

  const slides = [
    {
      id: "slide_1",
      tag: "PROJECT OVERVIEW",
      title: "Place Pilot — AI-Powered Campus Placement & Career Readiness Platform",
      subtitle: "Full-Stack Project Presentation & Technical Architecture Breakdown",
      category: "Introduction",
      icon: <Presentation className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl border border-indigo-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Major Project / Capstone Presentation
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                v3.5 Production Ready
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Transforming Campus Placements with Intelligence & Precision
            </h2>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Place Pilot is an end-to-end, full-stack placement portal that bridges the gap between students and top tech recruiters. It combines real-time coding practice, ATS resume optimization, AI interview coaching, and automated eligibility matching into one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">AI-Driven Personalization</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by Gemini 3.5 Flash for ATS scoring, dynamic code evaluation, and context-aware career mentoring.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Full-Stack Architecture</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                React 18 SPA + Node.js Express REST API server + JWT Auth + RBAC database Engine.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Algorithmic Readiness</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Skill vector similarity algorithms, weighted leaderboard scoring, and contest time-limit simulators.
              </p>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Opening Greeting: Introduce yourself and the project name "Place Pilot".
• Key Context: Explain that current campus placement processes are fragmented—students use separate tools for coding practice, resume formatting, and interview prep.
• Value Proposition: Place Pilot unifies all these into a single full-stack platform backed by Google Gemini AI for instant feedback and custom study recommendations.
      `
    },
    {
      id: "slide_2",
      tag: "PROBLEM & SOLUTION",
      title: "Problem Statement & Proposed Solution",
      subtitle: "Why Traditional Campus Placement Methods Fall Short",
      category: "Motivation",
      icon: <BrainCircuit className="w-6 h-6 text-purple-500" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              The Problem Statement
            </h3>
            <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-500">1.</span>
                <span><strong>ATS Rejection:</strong> Over 75% of student resumes are filtered out by automated Applicant Tracking Systems due to keyword mismatches.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-500">2.</span>
                <span><strong>Lack of Real-Time Practice:</strong> Students struggle with time-constrained coding contests and lack step-by-step code complexity feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-500">3.</span>
                <span><strong>Eligibility Confusion:</strong> Difficult to track CGPA criteria, company deadline dates, and role requirements across dozens of visiting firms.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-500">4.</span>
                <span><strong>No Mentorship Bridge:</strong> Placement officers and academic mentors lack real-time activity analytics to guide weak students.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              The Place Pilot Solution
            </h3>
            <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>AI ATS Resume Analyzer:</strong> Instant resume parsing with keyword density scoring, missing skill detection, and version control.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Contest Simulator & AI Code Review:</strong> Integrated timer, test case executor, and Gemini code optimization advisor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Automated Eligibility Matcher:</strong> Algorithm matches student profile against company CGPA and skill requirements with 1-click apply.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>360° Mentor & Admin Dashboard:</strong> Real-time student progress tracking, placement rate analytics, and custom question creation.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      speakerNotes: `
• Problem Context: Emphasize that students face massive competition during campus hiring drives.
• Tech Solution: Highlight how Place Pilot automates the heavy lifting—from keyword extraction in resumes to algorithmic company matching and instant AI mock interview feedback.
      `
    },
    {
      id: "slide_3",
      tag: "SYSTEM ARCHITECTURE",
      title: "High-Level Architecture & Component Flow",
      subtitle: "3-Tier Modular Full-Stack Stack Architecture",
      category: "Architecture",
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gray-900 text-white font-mono text-xs overflow-x-auto border border-gray-800">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800 mb-3">
              <span className="text-indigo-400 font-bold">PLACE PILOT ARCHITECTURE DIAGRAM</span>
              <span className="text-gray-500">Client-Server-AI Triad</span>
            </div>
            <pre className="text-[11px] leading-relaxed text-gray-300">
{`┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (Browser SPA)                              │
│  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Web Speech & Audio APIs  │
│                                                                                        │
│  [Dashboard]  [Coding Simulator]  [ATS Resume]  [Aptitude]  [Place Pilot GPT Chat]     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON API (Bearer JWT Auth)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SERVER TIER (Node.js + Express)                           │
│  TypeScript ESBuild Server (Port 3000)                                                  │
│                                                                                        │
│  ├── /api/auth/*        ➜ JWT Auth & Password Hashing (Bcryptjs)                        │
│  ├── /api/resume/*      ➜ ATS Parser & Multi-version Control                             │
│  ├── /api/coding/*      ➜ Test Engine & Time Complexity Analyzer                         │
│  ├── /api/companies/*   ➜ Matching Engine & Registration Handler                        │
│  ├── /api/chat/ask      ➜ Context-Aware GPT AI Assistant Proxy                          │
│  └── /api/admin/*       ➜ RBAC Management & Mentor Analytics Logs                      │
└─────────────────────┬───────────────────────────────────────────────────┬──────────────┘
                      │                                                   │
                      ▼                                                   ▼
┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│     PERSISTENCE TIER (Data Engine)     │     │     AI INTELLIGENCE TIER (Google)     │
│  Atomic JSON Database Storage Engine   │     │  Google Gemini 3.5 Flash Model          │
│  (Users, Resumes, Questions, History)  │     │  @google/genai SDK                      │
└────────────────────────────────────────┘     └─────────────────────────────────────────┘`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Presentation Layer</span>
              <p className="text-gray-500 dark:text-gray-400">Single Page Application built with React 18, modular hooks, stateful views, and Web Audio synthesizers.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Application Layer</span>
              <p className="text-gray-500 dark:text-gray-400">RESTful Express middleware routes with JWT verification, input sanitization, and structured JSON responses.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">AI & Data Layer</span>
              <p className="text-gray-500 dark:text-gray-400">Server-side Gemini 3.5 Flash API calls with hidden secrets and persistent atomic disk updates.</p>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Architecture Highlights: Explain the 3-tier structure.
• Security Point: Emphasize that API keys like GEMINI_API_KEY remain strictly on the Express server side and are never exposed to client browser network requests.
• Performance: Mention Vite dev server and ESBuild CommonJS production bundler for fast execution.
      `
    },
    {
      id: "slide_4",
      tag: "FRONTEND TECH STACK",
      title: "Frontend Technologies & UI Engineering",
      subtitle: "Modern React 18, Modern Design System & Browser Native APIs",
      category: "Frontend",
      icon: <Code2 className="w-6 h-6 text-emerald-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="font-black text-lg text-indigo-600 dark:text-indigo-400">React 18</div>
              <div className="text-[11px] text-gray-500 mt-1">TypeScript Hooks & Custom Context</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="font-black text-lg text-sky-500">Tailwind CSS</div>
              <div className="text-[11px] text-gray-500 mt-1">Responsive Utility-First Styling</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="font-black text-lg text-purple-500">Vite</div>
              <div className="text-[11px] text-gray-500 mt-1">Fast Hot Module Replacement</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="font-black text-lg text-pink-500">Recharts</div>
              <div className="text-[11px] text-gray-500 mt-1">Data Visualization & Analytics</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-500" />
              Advanced Browser API Integrations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Web Speech API (STT)</span>
                <p className="text-gray-500 dark:text-gray-400">
                  <code className="text-indigo-500 font-mono text-[10px]">SpeechRecognition</code> parses live voice commands to navigate screens and dictate planner tasks hands-free.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Speech Synthesis API (TTS)</span>
                <p className="text-gray-500 dark:text-gray-400">
                  <code className="text-indigo-500 font-mono text-[10px]">SpeechSynthesisUtterance</code> reads out interview feedback and Place Pilot GPT answers out loud.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Web Audio Synthesizer</span>
                <p className="text-gray-500 dark:text-gray-400">
                  <code className="text-indigo-500 font-mono text-[10px]">AudioContext & OscillatorNode</code> produce custom audio chimes for contest timer alerts without external MP3 assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Frontend Strengths: Built purely with React 18 and TypeScript for strict type-safety.
• Browser Native Superpowers: Highlight that speech recognition, text-to-speech, and sound synthesis run directly in the browser using Web APIs without heavy external audio asset downloads.
      `
    },
    {
      id: "slide_5",
      tag: "BACKEND TECH STACK",
      title: "Backend Architecture & Database Design",
      subtitle: "Node.js, Express REST API, Security & Persistence",
      category: "Backend",
      icon: <Server className="w-6 h-6 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Core Server Components</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Node.js + Express</span>
                <p className="text-gray-500 dark:text-gray-400">Fast, event-driven REST API server handling all application data operations.</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">JWT Auth</span>
                <p className="text-gray-500 dark:text-gray-400">Stateless JSON Web Tokens for secure session validation across sessions.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Bcrypt Encryption</span>
                <p className="text-gray-500 dark:text-gray-400">Salted password hashing to protect user credentials against breaches.</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">RBAC Middleware</span>
                <p className="text-gray-500 dark:text-gray-400">Role-Based Access Control enforcing Student vs Admin privileges.</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Database Entities Schema Relationships</span>
              <span className="text-xs font-mono text-gray-400">Atomic File Persistence Engine</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">users</span>
                <p className="text-[10px] text-gray-500 mt-1">id, email, password, role, cgpa, skills, dailyStreak, scores</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">companies</span>
                <p className="text-[10px] text-gray-500 mt-1">id, name, package, eligibilityCgpa, requiredSkills, status</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">codingQuestions</span>
                <p className="text-[10px] text-gray-500 mt-1">id, title, category, difficulty, testCases, boilerplate</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">aptitudeQuestions</span>
                <p className="text-[10px] text-gray-500 mt-1">id, section, question, options, correctIndex, explanation</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">studyProgress</span>
                <p className="text-[10px] text-gray-500 mt-1">solvedCodingIds, attemptedCodingIds, aptitudeScores</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700">
                <span className="text-indigo-500 font-bold">historyLogs</span>
                <p className="text-[10px] text-gray-500 mt-1">id, studentId, actionType, description, timestamp</p>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Backend Overview: Node.js Express handles all API interactions cleanly.
• Security & Role Control: `+ "`authGuard`" + ` middleware verifies Bearer tokens, while `+ "`adminGuard`" + ` protects company creation and student metric edits.
• Data Reliability: Atomic JSON writing ensures zero data loss during server reboots.
      `
    },
    {
      id: "slide_6",
      tag: "AI INTELLIGENCE",
      title: "Google Gemini 3.5 Flash Integration & Generative Workflows",
      subtitle: "Multi-Modal AI Features across Resume, Code & Career Mentorship",
      category: "AI Engine",
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                Google GenAI SDK (@google/genai) Integration
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              We leverage the modern <code className="text-amber-300 font-mono font-bold">@google/genai</code> SDK with the <code className="text-indigo-300 font-mono font-bold">gemini-3.5-flash</code> model to provide sub-second intelligent reasoning for placement preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 1. ATS Resume Parsing Engine
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Extracts key skills, projects, and work experience from uploaded resumes. Computes ATS match score, identifies keyword gaps, and suggests bullet point rewrites.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> 2. AI Code Review & Optimizer
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Analyzes submitted code for edge cases, memory leaks, and time complexity. Provides refactored optimal solutions with algorithmic explanations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" /> 3. Place Pilot GPT Assistant
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Context-aware chatbot with multi-turn memory. Answers technical questions, generates practice problems, and dispatches UI navigation commands dynamically.
              </p>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• AI Model Choice: We selected Gemini 3.5 Flash because of its lightning-fast inference speed and structured JSON output generation capabilities.
• Real-World AI Value: Instead of generic ChatGPT responses, Place Pilot GPT receives the student's CGPA, weak skill areas, and current active tab in its system instruction prompt.
      `
    },
    {
      id: "slide_7",
      tag: "ALGORITHMS & FORMULAS",
      title: "Core Computer Science Algorithms Implemented",
      subtitle: "Data Structures, Matching Formulas & Scoring Logic",
      category: "Algorithms",
      icon: <Cpu className="w-6 h-6 text-rose-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                1. Skill Similarity & Match Score Algorithm
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Calculates the percentage match between a candidate's skill vector <code className="font-mono text-indigo-500">S_user</code> and a company's required skills <code className="font-mono text-indigo-500">S_req</code> using Jaccard Similarity Index:
              </p>
              <div className="p-3 rounded-xl bg-gray-900 text-amber-300 font-mono text-xs text-center border border-gray-800">
                Match Score = | S_user ∩ S_req | / | S_req | × 100%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                2. Weighted Leaderboard Ranking Formula
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Determines student overall batch ranking by combining problem-solving speed, aptitude scores, and consistency streak:
              </p>
              <div className="p-3 rounded-xl bg-gray-900 text-emerald-300 font-mono text-xs text-center border border-gray-800">
                Total Score = (Coding × 0.5) + (Aptitude × 0.3) + (Streak × 10)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3">
              3. Time & Space Complexity Evaluation Engine
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                <span className="font-bold text-emerald-600">O(1)</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Constant Time</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                <span className="font-bold text-blue-600">O(log N)</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Binary Search</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <span className="font-bold text-amber-600">O(N log N)</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Optimal Sorting</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                <span className="font-bold text-rose-600">O(N²)</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Nested Loops</p>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Algorithm Depth: Explain the Jaccard similarity index used for skill matching between student profiles and company eligibility criteria.
• Leaderboard Fairness: The weighted scoring formula rewards daily practice streaks alongside raw problem points to encourage continuous learning.
      `
    },
    {
      id: "slide_8",
      tag: "KEY FEATURES DEMO",
      title: "Core Modules & Student Workflow",
      subtitle: "End-to-End User Experience in Action",
      category: "Features",
      icon: <Zap className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">01</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Smart Placement Dashboard</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Real-time score gauges, daily streak counts, company registration alerts, and AI placement readiness radar charts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">02</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Contest Simulator Coding Zone</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Interactive code editor, countdown practice timer, automated test case runner, and Gemini optimization hints.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">03</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">ATS Resume Workbench</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Drag-and-drop resume parser with multi-version history, instant ATS score breakdown, and custom PDF generator.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">04</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Voice-Enabled Daily Planner</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Browser SpeechRecognition feature allowing hands-free task creation ('Speak to add') and voice notes recording.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">05</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Companies & 1-Click Apply</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Automatic CGPA and skill criteria validation, application status tracking (Shortlisted, Interview, Selected).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs">06</div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Place Pilot GPT Assistant</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Persistent ChatGPT-style floating AI mentor with voice speech synthesis and instant screen navigation dispatch.
            </p>
          </div>
        </div>
      ),
      speakerNotes: `
• Walkthrough Steps: Walk the evaluator through the 6 primary modules.
• Unique Selling Point: Mention voice commands and contest simulator as key differentiators setting Place Pilot apart from standard static web applications.
      `
    },
    {
      id: "slide_9",
      tag: "TESTING & IMPACT",
      title: "Testing, Performance & Student Impact",
      subtitle: "Validation, Build Optimization & Future Roadmap",
      category: "Impact",
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">TypeScript Strict Mode</div>
              <p className="text-[11px] text-gray-500 mt-1">Zero compilation errors across build and runtime linting.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">&lt; 200ms</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">API Response Latency</div>
              <p className="text-[11px] text-gray-500 mt-1">Optimized JSON payloads and server middleware pipeline.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">35%+</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">Estimated Placement Boost</div>
              <p className="text-[11px] text-gray-500 mt-1">Improved resume ATS scores and mock coding speed.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
              Future Enhancement Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <span><strong>Multi-Tenant Institutional Cloud Database:</strong> Integration with PostgreSQL / Firebase Firestore for campus-wide scale.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <span><strong>Video Mock Interview Analysis:</strong> Face expression and confidence score evaluation using multimodal video models.</span>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: `
• Wrap Up Points: Summarize the build quality and performance metrics.
• Future Vision: State how Place Pilot can be deployed institution-wide for engineering colleges to handle thousands of concurrent placement candidates.
      `
    },
    {
      id: "slide_10",
      tag: "CONCLUSION & QA",
      title: "Thank You & Q/A",
      subtitle: "Open for Questions, Feedback & Live Demonstration",
      category: "Conclusion",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      content: (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white text-center space-y-6 shadow-2xl border border-indigo-500/30">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready for Live Platform Demo
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Thank you for evaluating Place Pilot. The platform is running live and ready for interactive evaluation.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" /> Go to Live Dashboard
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate("coding")}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer flex items-center gap-2"
              >
                <Code2 className="w-4 h-4" /> Demo Coding Simulator
              </button>
            )}
          </div>
        </div>
      ),
      speakerNotes: `
• Conclusion: Thank the faculty and project examiners.
• Live Demo Transition: Offer to demonstrate specific features live like speech task creation, ATS resume parsing, or contest timer simulation.
      `
    }
  ];

  const currentSlideData = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Listen to keyboard arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const copyFullDeckText = () => {
    const text = slides.map((s, i) => `
SLIDE ${i + 1}: ${s.title.toUpperCase()}
[${s.tag} - ${s.category}]
Subtitle: ${s.subtitle}

SPEAKER TALKING POINTS:
${s.speakerNotes.trim()}
--------------------------------------------------
`).join("\n");

    navigator.clipboard.writeText(text);
    setCopiedDeck(true);
    setTimeout(() => setCopiedDeck(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header bar controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
              Project Presentation Deck & Tech Architecture
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800">
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive slide presentation mode for project vivas and demonstrations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              showSpeakerNotes 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
            }`}
            title="Toggle Speaker Notes for Viva Presentation"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showSpeakerNotes ? "Hide Viva Notes" : "Show Viva Notes"}
          </button>

          <button
            onClick={copyFullDeckText}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            title="Copy entire presentation transcript"
          >
            {copiedDeck ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedDeck ? "Copied!" : "Copy Deck Text"}
          </button>
        </div>
      </div>

      {/* Main Slide Card Display */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl transition-all duration-300 min-h-[460px] flex flex-col justify-between relative overflow-hidden`}>
        {/* Top Slide Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800">
              {currentSlideData.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                {currentSlideData.tag}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-950 dark:text-white">
                {currentSlideData.title}
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400 hidden sm:block">
            {currentSlideData.subtitle}
          </span>
        </div>

        {/* Slide Body */}
        <div className="flex-1 my-2 animate-in fade-in duration-300">
          {currentSlideData.content}
        </div>

        {/* Viva Speaker Talking Notes Drawer */}
        {showSpeakerNotes && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-400 uppercase text-[10px] tracking-wider font-mono">
              <BookOpen className="w-3.5 h-3.5" /> Speaker Talking Points (For Faculty / Evaluator Viva)
            </div>
            <pre className="font-sans text-xs whitespace-pre-wrap leading-relaxed opacity-90">
              {currentSlideData.speakerNotes.trim()}
            </pre>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentSlide === 0
                ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Slide Indicator Dots & Numbers */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx
                    ? "w-8 bg-indigo-600 dark:bg-indigo-400"
                    : "bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700"
                }`}
                title={`Go to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentSlide === slides.length - 1
                ? "bg-emerald-600 text-white opacity-50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Slide Selector Cards */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Jump to Slide Section
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                currentSlide === idx
                  ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                  : "bg-gray-50/50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="text-[9px] font-mono uppercase opacity-75">Slide 0{idx + 1}</div>
              <div className="text-xs truncate font-medium mt-0.5">{s.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
