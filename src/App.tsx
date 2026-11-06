import React, { useState, useEffect } from "react";
import { User, Company, CodingQuestion, AptitudeQuestion, PlannerTask, LeaderboardUser, SystemNotification, PlacementReadiness, InterviewQuestion } from "./types";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { DashboardView } from "./components/DashboardView";
import { ProfileView } from "./components/ProfileView";
import { CompaniesView } from "./components/CompaniesView";
import { CodingView } from "./components/CodingView";
import { AptitudeView } from "./components/AptitudeView";
import { InterviewView } from "./components/InterviewView";
import { ResumeBuilderView } from "./components/ResumeBuilderView";
import { PlannerView } from "./components/PlannerView";
import { AnalyticsView } from "./components/AnalyticsView";
import { LeaderboardView } from "./components/LeaderboardView";
import { AdminView } from "./components/AdminView";
import { AcademicMentorsView } from "./components/AcademicMentorsView";
import { HistoryView } from "./components/HistoryView";
import { PresentationView } from "./components/PresentationView";
import PlacePilotChatAssistant from "./components/PlacePilotChatAssistant";

import { 
  Building2, Code2, BrainCircuit, MessageSquare, CheckSquare, 
  BarChart3, Trophy, User as UserIcon, LogOut, Moon, Sun, 
  Bell, Settings, ShieldAlert, KeyRound, ArrowRight, Library, 
  Flame, Mail, Lock, Sparkles, ChevronRight, Menu, X, FileText,
  BookOpen, Mic, MicOff, History, Presentation
} from "lucide-react";

type NavTab = 
  | "dashboard" 
  | "profile" 
  | "companies" 
  | "coding" 
  | "aptitude" 
  | "interview" 
  | "resume" 
  | "planner" 
  | "analytics" 
  | "leaderboard" 
  | "mentors"
  | "history"
  | "presentation"
  | "admin";

/**
 * Plays a clean, professional, and subtle synthesized arpeggio chime sound
 * using the Web Audio API to indicate a successful action or voice navigation.
 */
function playNavigationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth volume envelope with instant attack and natural exponential decay
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Pleasant ascending arpeggio (C#5 -> E5 -> A5)
    playTone(554.37, now, 0.35);        // C#5
    playTone(659.25, now + 0.05, 0.35); // E5
    playTone(880.00, now + 0.10, 0.45); // A5
  } catch (err) {
    console.warn("Chime notification failed to play:", err);
  }
}

function MainAppContent() {
  const { theme, toggleTheme, brandTheme, setBrandTheme } = useTheme();
  
  // Auth state
  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  // Login/Register Form State
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("Artificial Intelligence and Machine Learning");
  const [cgpa, setCgpa] = useState("");
  const [authFeedback, setAuthFeedback] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Navigation Sidebar
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Voice Navigation Listener states
  const [globalVoiceActive, setGlobalVoiceActive] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState("");
  const [commandFeedback, setCommandFeedback] = useState("");
  const globalVoiceActiveRef = React.useRef(globalVoiceActive);

  useEffect(() => {
    globalVoiceActiveRef.current = globalVoiceActive;
  }, [globalVoiceActive]);

  useEffect(() => {
    if (!token || !globalVoiceActive) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript.trim().toLowerCase();
      console.log("Global Voice Command matched:", transcript);
      setLastVoiceCommand(transcript);

      // Map transcribed phrases to activeTab transitions
      let matchedTab: NavTab | null = null;
      let matchedLabel = "";

      if (transcript.includes("coding") || transcript.includes("code") || transcript.includes("practice")) {
        matchedTab = "coding";
        matchedLabel = "Coding Practice";
      } else if (transcript.includes("dashboard") || transcript.includes("overview") || transcript.includes("home") || transcript.includes("main")) {
        matchedTab = "dashboard";
        matchedLabel = "Dashboard";
      } else if (transcript.includes("profile") || transcript.includes("center") || transcript.includes("me") || transcript.includes("my account")) {
        matchedTab = "profile";
        matchedLabel = "Profile Center";
      } else if (transcript.includes("mentor") || transcript.includes("academic") || transcript.includes("teacher")) {
        matchedTab = "mentors";
        matchedLabel = "Academic Mentors";
      } else if (transcript.includes("company") || transcript.includes("companies") || transcript.includes("recruitment") || transcript.includes("drive") || transcript.includes("placement")) {
        matchedTab = "companies";
        matchedLabel = "Recruitment Drives";
      } else if (transcript.includes("aptitude") || transcript.includes("math") || transcript.includes("zone")) {
        matchedTab = "aptitude";
        matchedLabel = "Aptitude Zone";
      } else if (transcript.includes("interview") || transcript.includes("mock") || transcript.includes("hub") || transcript.includes("chatbot")) {
        matchedTab = "interview";
        matchedLabel = "AI Interview Hub";
      } else if (transcript.includes("resume") || transcript.includes("builder") || transcript.includes("cv")) {
        matchedTab = "resume";
        matchedLabel = "Resume Builder";
      } else if (transcript.includes("planner") || transcript.includes("task") || transcript.includes("daily") || transcript.includes("goal")) {
        matchedTab = "planner";
        matchedLabel = "Daily Planner";
      } else if (transcript.includes("analytics") || transcript.includes("readiness") || transcript.includes("performance") || transcript.includes("score")) {
        matchedTab = "analytics";
        matchedLabel = "Placement Readiness";
      } else if (transcript.includes("leaderboard") || transcript.includes("rank") || transcript.includes("trophy")) {
        matchedTab = "leaderboard";
        matchedLabel = "Leaderboard";
      } else if (transcript.includes("history") || transcript.includes("activity") || transcript.includes("past")) {
        matchedTab = "history";
        matchedLabel = "Activity History";
      } else if (transcript.includes("presentation") || transcript.includes("deck") || transcript.includes("slide") || transcript.includes("slides") || transcript.includes("project demo")) {
        matchedTab = "presentation";
        matchedLabel = "Presentation Deck";
      } else if (transcript.includes("admin") || transcript.includes("tpo") || transcript.includes("command")) {
        matchedTab = "admin";
        matchedLabel = "TPO Command Hub";
      }

      if (matchedTab) {
        setActiveTab(matchedTab);
        setCommandFeedback(`🚀 Navigated to ${matchedLabel}!`);
        // Play subtle confirmation chime sound
        playNavigationChime();
        // Voice synthesizer acknowledgment feedback!
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`Navigating to ${matchedLabel}`);
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        setCommandFeedback(`❓ No match for: "${transcript}"`);
      }

      // Automatically clear feedback after 3.5 seconds
      const timer = setTimeout(() => {
        setCommandFeedback("");
      }, 3500);
      return () => clearTimeout(timer);
    };

    recognition.onerror = (err: any) => {
      console.error("Global Speech recognition error:", err);
    };

    recognition.onend = () => {
      // Auto restart if still toggled active
      if (globalVoiceActiveRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart global recognition", e);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start global speech recognition", e);
    }

    return () => {
      recognition.onend = null;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [token, globalVoiceActive]);

  // Dynamic Data Lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Fetch current user details via token
  const fetchMe = async (authToken: string) => {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user.details);
      } else {
        // stale token
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMe(false);
    }
  };

  // Run initial state loading if logged in
  useEffect(() => {
    if (token) {
      fetchMe(token);
    }
  }, [token]);

  // General App Data Synchronizers
  const loadAppData = async () => {
    if (!token) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };

      // Companies
      const resComp = await fetch("/api/companies", { headers });
      const dataComp = await resComp.json();
      if (dataComp.companies) setCompanies(dataComp.companies);

      // Coding
      const resCoding = await fetch("/api/coding", { headers });
      const dataCoding = await resCoding.json();
      if (dataCoding.codingQuestions) setCodingQuestions(dataCoding.codingQuestions);

      // Aptitude
      const resApt = await fetch("/api/aptitude", { headers });
      const dataApt = await resApt.json();
      if (dataApt.aptitudeQuestions) setAptitudeQuestions(dataApt.aptitudeQuestions);

      // Planner
      const resPlanner = await fetch("/api/planner", { headers });
      const dataPlanner = await resPlanner.json();
      if (dataPlanner.tasks) setPlannerTasks(dataPlanner.tasks);

      // Leaderboard
      const resLead = await fetch("/api/leaderboard", { headers });
      const dataLead = await resLead.json();
      if (dataLead.leaderboard) setLeaderboard(dataLead.leaderboard);

      // Notifications
      const resNotif = await fetch("/api/notifications", { headers });
      const dataNotif = await resNotif.json();
      if (dataNotif.notifications) setNotifications(dataNotif.notifications);

    } catch (e) {
      console.error("Failed to fetch dashboard assets", e);
    }
  };

  useEffect(() => {
    if (token) {
      loadAppData();
    }
  }, [token, activeTab]);

  // Auth Submit Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback("");
    setAuthSuccess("");

    if (authMode === "forgot") {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword: password })
        });
        const result = await res.json();
        if (result.success) {
          setAuthSuccess("Password has been updated successfully! Login using new credentials.");
          setAuthMode("login");
        } else {
          setAuthFeedback(result.error || "Password update failed.");
        }
      } catch (err) {
        setAuthFeedback("Connection error with backend server.");
      }
      return;
    }

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = authMode === "login" 
      ? { email, password }
      : { email, password, name, rollNumber, department, cgpa: parseFloat(cgpa) || 0 };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user.details);
        setAuthSuccess("Welcome to the Placement Preparation Hub!");
        setActiveTab("dashboard");
      } else {
        setAuthFeedback(data.error || "Authentication failed. Validate credentials.");
      }
    } catch (err) {
      setAuthFeedback("Could not connect to the Express backend.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setActiveTab("dashboard");
  };

  // Auth Demo credentials click triggers
  const setDemoCredentials = (role: "student" | "admin") => {
    if (role === "student") {
      setEmail("student@placement.com");
      setPassword("studentpassword");
    } else {
      setEmail("admin@placement.com");
      setPassword("adminpassword");
    }
    setAuthMode("login");
  };

  // Profile update submit callback
  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!token) return;
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (result.success) {
        setUser(result.user.details);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resume upload parsing trigger
  const handleAnalyzeResume = async (text: string, filename: string, base64Data?: string, mimeType?: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/profile/upload-resume", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText: text, resumeFileName: filename, base64Data, mimeType })
      });
      const result = await res.json();
      if (result.success) {
        if (result.user?.details) {
          setUser(result.user.details);
        } else if (user) {
          setUser(prev => prev ? { 
            ...prev, 
            resumeAnalysis: result.analysis, 
            resumeFileName: filename, 
            resumeText: result.extractedText || text 
          } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete stored resume version
  const handleDeleteResumeVersion = async (versionId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/resume-version/${versionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.user?.details) {
        setUser(result.user.details);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch or restore a specific stored resume version as the active one
  const handleActivateResumeVersion = async (versionId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/resume-version/${versionId}/activate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.user?.details) {
        setUser(result.user.details);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Apply to recruitment drive
  const handleApplyCompany = async (companyId: string, notes: string) => {
    if (!token) return;
    const res = await fetch("/api/companies/apply", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ companyId, notes })
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || "Failed to submit application.");
    }
    loadAppData();
  };

  // Submit coding challenge code
  const handleSubmitCode = async (questionId: string, code: string, status: 'Solved' | 'Attempted'): Promise<string> => {
    if (!token) return "";
    const res = await fetch("/api/coding/submit", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ questionId, code, status })
    });
    const result = await res.json();
    loadAppData();
    return result.explanation || "";
  };

  // Submit aptitude score performance
  const handleSubmitAptitudeScore = async (section: string, score: number, total: number) => {
    if (!token) return;
    await fetch("/api/aptitude/submit", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ section, score, total })
    });
    loadAppData();
  };

  // Add Daily Task Goal
  const handleAddTask = async (title: string) => {
    if (!token) return;
    await fetch("/api/planner/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });
    loadAppData();
  };

  // Toggle Daily Goal task check status
  const handleToggleTask = async (taskId: string) => {
    if (!token) return;
    await fetch("/api/planner/toggle", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ taskId })
    });
    loadAppData();
  };

  // Delete Daily Goal task
  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    await fetch(`/api/planner/delete/${taskId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    loadAppData();
  };

  // Update Daily Goal task
  const handleUpdateTask = async (taskId: string, updates: { title?: string; completed?: boolean; voiceNotes?: string }) => {
    if (!token) return;
    await fetch("/api/planner/update", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ taskId, ...updates })
    });
    loadAppData();
  };

  // Generate Interview Questions with AI
  const handleGenerateQuestions = async (role: string, skills: string): Promise<InterviewQuestion[]> => {
    if (!token) return [];
    const res = await fetch("/api/interview/generate", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ role, skills })
    });
    const result = await res.json();
    return result.data?.questions || [];
  };

  // Send message to AI mock interviewer chatbot
  const handleSendChatbotMessage = async (messages: any[], userResponse: string, currentQuestion: string, audioAnalysis?: any) => {
    if (!token) return { feedback: "", rating: 3, reply: "" };
    const res = await fetch("/api/interview/chatbot", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ messages, userResponse, currentQuestion, audioAnalysis })
    });
    const result = await res.json();
    return {
      feedback: result.feedback,
      rating: result.rating,
      reply: result.reply,
      clarity: result.clarity,
      confidence: result.confidence,
      suggestions: result.suggestions,
      vocalConfidence: result.vocalConfidence,
      vocalClarity: result.vocalClarity,
      audioAnalysisFeedback: result.audioAnalysisFeedback,
      audioAnalysis: result.audioAnalysis || audioAnalysis
    };
  };

  // Save manual notes and ratings from mock preparation
  const handleSaveInterviewNotes = async (notes: string, ratings: Record<string, number>) => {
    if (!token) return;
    await fetch("/api/interview/save-notes", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ notes, ratings })
    });
    loadAppData();
  };

  // Fetch AI Placement readiness diagnostics
  const handleFetchReadiness = async (): Promise<PlacementReadiness> => {
    if (!token) throw new Error("No authorization token");
    const res = await fetch("/api/analytics/readiness", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    return result.analytics;
  };

  // Fetch AI daily context-aware interview coaching tips
  const handleFetchInterviewTips = async (): Promise<any> => {
    if (!token) return null;
    const res = await fetch("/api/interview/tips", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    return result.success ? result.data : null;
  };

  // Admin handlers
  const handleAddCompany = async (company: Partial<Company>) => {
    if (!token) return;
    await fetch("/api/companies/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(company)
    });
    loadAppData();
  };

  const handleAddCodingQuestion = async (question: Partial<CodingQuestion>) => {
    if (!token) return;
    await fetch("/api/coding/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(question)
    });
    loadAppData();
  };

  const handleAddAptitudeQuestion = async (question: Partial<AptitudeQuestion>) => {
    if (!token) return;
    await fetch("/api/aptitude/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(question)
    });
    loadAppData();
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    loadAppData();
  };

  // Unread notification count
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Sidebar list configurations
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Library },
    { id: "profile", label: "Profile Center", icon: UserIcon },
    { id: "mentors", label: "Academic Mentors", icon: BookOpen },
    { id: "companies", label: "Recruitment Drives", icon: Building2 },
    { id: "coding", label: "Coding Practice", icon: Code2 },
    { id: "aptitude", label: "Aptitude Zone", icon: BrainCircuit },
    { id: "interview", label: "AI Interview Hub", icon: MessageSquare },
    { id: "resume", label: "Resume Builder", icon: FileText },
    { id: "planner", label: "Daily Planner", icon: CheckSquare },
    { id: "analytics", label: "Placement Readiness", icon: BarChart3 },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "presentation", label: "Presentation Deck", icon: Presentation },
    { id: "history", label: "Activity History", icon: History },
  ];

  // If student and wants Admin command center access
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      
      {/* 1. Unauthorized authentication interface */}
      {!token ? (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
          
          {/* Visual ambience background circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full filter blur-3xl" />

          <div className="max-w-md w-full relative z-10 space-y-6">
            
            {/* Logo greeting */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-tight">Placement Prep</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Campus training and corporate drive registration portal.</p>
            </div>

            {/* Main Auth Form */}
            <div className="glass-card rounded-3xl p-8 space-y-6">
              
              {/* Form tabs headers */}
              <div className="flex gap-2 p-1 bg-white/50 dark:bg-slate-950/40 rounded-xl font-mono text-xs border border-white/20">
                <button 
                  onClick={() => { setAuthMode("login"); setAuthFeedback(""); }}
                  className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                    authMode === "login" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-400"
                  }`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setAuthMode("register"); setAuthFeedback(""); }}
                  className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                    authMode === "register" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs" : "text-slate-400"
                  }`}
                >
                  Register
                </button>
              </div>

              {authFeedback && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold">
                  {authFeedback}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold">
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {/* Roll metrics for register */}
                {authMode === "register" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 font-mono">Full Name</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 font-mono">Roll Number</label>
                        <input 
                          type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                          placeholder="CS2023001"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 font-mono">CGPA (Current)</label>
                        <input 
                          type="number" step="0.01" value={cgpa} onChange={e => setCgpa(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                          placeholder="8.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 font-mono">Academic Department</label>
                      <select 
                        value={department} 
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-transparent border border-gray-200 dark:border-gray-800 text-sm text-gray-950 dark:text-white focus:outline-none"
                      >
                        <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                        <option value="CSE(DS)">CSE(DS)</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Electronic and Telecommunication Engineering (EXTC)">Electronic and Telecommunication Engineering (EXTC)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Email inputs */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 font-mono">Student Email Address</label>
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="student@placement.com"
                  />
                </div>

                {/* Password inputs */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-400 font-mono">Password</label>
                    {authMode === "login" && (
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode("forgot"); setAuthFeedback(""); }}
                        className="text-[10px] font-mono text-blue-500 hover:underline outline-none"
                      >
                        Forgot / Reset?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md transition"
                >
                  {authMode === "login" ? "Sign In to Portal" : authMode === "register" ? "Register Account" : "Reset Password"}
                </button>
              </form>

              {/* Quick demo account shortcuts */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 space-y-2">
                <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Sandbox Demo Login Shortcuts</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDemoCredentials("student")}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-lg text-[10px] font-bold font-mono text-gray-600 dark:text-gray-300 transition text-center cursor-pointer border border-gray-200/10"
                  >
                    Student Demo
                  </button>
                  <button 
                    onClick={() => setDemoCredentials("admin")}
                    className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-lg text-[10px] font-bold font-mono text-gray-600 dark:text-gray-300 transition text-center cursor-pointer border border-gray-200/10"
                  >
                    Admin TPO Demo
                  </button>
                </div>
              </div>

            </div>

            {/* Mode switch helper footer */}
            {authMode === "forgot" && (
              <p className="text-center text-xs text-gray-400">
                Remember your credentials?{" "}
                <button onClick={() => setAuthMode("login")} className="text-blue-500 font-bold hover:underline">
                  Sign In
                </button>
              </p>
            )}

          </div>
        </div>
      ) : (
        /* 2. Main Authenticated full-stack workspace */
        <>
          {/* Left Sidebar (Desktop Navigation) */}
          <aside className="hidden lg:flex flex-col w-64 glass-sidebar p-6 justify-between flex-shrink-0">
            <div className="space-y-6">
              {/* Sidebar Header Title */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/40 dark:border-slate-800/40">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-400">Placement Hub</h2>
                  <span className="text-[10px] font-bold text-slate-400 block font-mono">ENGINEERING LABS</span>
                </div>
              </div>

              {/* Student Profile summary indicator */}
              {user && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950/40 border border-gray-100/10 space-y-2">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{user.name}</h3>
                    <p className="text-[9px] font-bold font-mono text-gray-400 uppercase mt-0.5">{user.rollNumber || "Student Profile"}</p>
                  </div>
                  {user.dailyStreak >= 3 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                      <span>{user.dailyStreak} Day Streak!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Navigation links */}
              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 cursor-pointer transition ${
                        isActive 
                          ? "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-xs" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Conditional TPO Officer Portal Link */}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-3 cursor-pointer transition mt-2 border border-indigo-500/15 ${
                      activeTab === "admin" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none" 
                        : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"
                    }`}
                  >
                    <Settings className="w-4.5 h-4.5" />
                    <span>TPO Command Hub</span>
                  </button>
                )}
              </nav>
              {/* Voice Command Assistant Sidebar Banner */}
              <div className="p-3 bg-indigo-50/40 dark:bg-slate-950/30 border border-indigo-100/10 rounded-2xl space-y-2 text-[11px]" id="sidebar-voice-commands-help">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Voice Navigation
                  </span>
                  <span className={`h-2 w-2 rounded-full ${globalVoiceActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                </div>
                <p className="text-gray-400 text-[10px] leading-tight">
                  Click the <Mic className="inline w-3 h-3 text-indigo-500" /> in the top header. Try speaking phrases like:
                </p>
                <div className="space-y-1 text-[10px] font-mono text-indigo-900 dark:text-indigo-400">
                  <div className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-gray-150 dark:border-slate-800/80">"Go to Coding Practice"</div>
                  <div className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-gray-150 dark:border-slate-800/80">"Show Analytics"</div>
                  <div className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-gray-150 dark:border-slate-800/80">"Open Leaderboard"</div>
                </div>
              </div>
            </div>

            {/* Logout/Theme Controls Footer */}
            <div className="pt-4 border-t border-gray-50 dark:border-gray-800/50 space-y-3">
              {/* Brand Theme Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 block uppercase">Brand Theme</span>
                <div className="flex items-center justify-between p-1.5 bg-gray-100/50 dark:bg-slate-950/40 rounded-xl border border-gray-200/10 gap-1">
                  {[
                    { id: "indigo", bg: "bg-indigo-600", title: "Classic Indigo" },
                    { id: "emerald", bg: "bg-emerald-600", title: "Deep Emerald" },
                    { id: "violet", bg: "bg-violet-600", title: "Royal Violet" },
                    { id: "amber", bg: "bg-amber-600", title: "Sunset Amber" },
                    { id: "rose", bg: "bg-rose-600", title: "Crimson Rose" },
                    { id: "midnight", bg: "bg-slate-600", title: "Midnight Slate" }
                  ].map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => setBrandTheme(brand.id as any)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition flex items-center justify-center relative hover:scale-110 active:scale-95 ${brand.bg}`}
                      title={brand.title}
                    >
                      {brandTheme === brand.id && (
                        <span className="w-2 h-2 bg-white rounded-full shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-gray-400">THEME MODE</span>
                <button 
                  onClick={toggleTheme}
                  className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out Portal
              </button>
            </div>
          </aside>

          {/* Right Main Stage Container */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Nav Header Bar */}
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between z-30 sticky top-0">
              
              {/* Mobile menu trigger */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-gray-500 cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <h2 className="text-sm font-bold text-gray-900 dark:text-white lg:hidden">Placement Prep</h2>
                
                <span className="hidden lg:inline text-xs font-semibold text-gray-400 font-mono uppercase">
                  Active Terminal: {activeTab === "admin" ? "TPO Officer Mode" : `${user?.name || 'Student'} Portal`}
                </span>
              </div>

              {/* Header Right Widgets: Alerts dropdown & Theme */}
              <div className="flex items-center gap-3 relative">
                
                {/* Global Voice Navigation Listener Widget */}
                <div className="flex items-center gap-2" id="global-voice-navigation-listener">
                  {commandFeedback && (
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 border border-indigo-100/10 rounded-xl shadow-inner animate-fade-in">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      <span>{commandFeedback}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const next = !globalVoiceActive;
                      setGlobalVoiceActive(next);
                      if (next) {
                        setCommandFeedback("🎙️ Voice command listening started...");
                      } else {
                        setCommandFeedback("");
                        if (typeof window !== "undefined" && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                        }
                      }
                    }}
                    title={globalVoiceActive ? "Disable Global Voice Navigation" : "Enable Global Voice Navigation"}
                    className={`p-2 transition rounded-xl flex items-center justify-center cursor-pointer ${
                      globalVoiceActive
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-gray-50 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {globalVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                {/* Alert Notification System */}
                <button 
                  onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); handleMarkNotificationsRead(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 relative cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[9px] font-black font-mono text-white rounded-full flex items-center justify-center">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Card */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 top-11 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl w-80 p-4 shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50 pb-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">Recent Notifications ({notifications.length})</span>
                      <button 
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[10px] text-gray-400 hover:underline"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs py-8 text-gray-400">No recent notifications logged.</p>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-2.5 rounded-xl text-xs space-y-1 transition ${
                              notif.read ? 'bg-transparent' : 'bg-blue-50/40 dark:bg-blue-950/10 border-l-2 border-blue-600'
                            }`}
                          >
                            <h4 className="font-bold text-gray-950 dark:text-white">{notif.title}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] text-gray-400 font-mono block text-right">
                              {new Date(notif.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Mobile Sidebar overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex animate-in fade-in duration-200">
                <div className="w-64 bg-white dark:bg-gray-900 p-6 flex flex-col justify-between h-full relative animate-in slide-in-from-left duration-200">
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Placement Hub</h2>
                    
                    <nav className="space-y-1">
                      {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-3 cursor-pointer ${
                              isActive 
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40" 
                                : "text-gray-500"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Brand Theme Switcher */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 block uppercase">Brand Theme</span>
                    <div className="flex items-center justify-between p-1.5 bg-gray-100/50 dark:bg-slate-950/40 rounded-xl border border-gray-200/10 gap-1">
                      {[
                        { id: "indigo", bg: "bg-indigo-600", title: "Classic Indigo" },
                        { id: "emerald", bg: "bg-emerald-600", title: "Deep Emerald" },
                        { id: "violet", bg: "bg-violet-600", title: "Royal Violet" },
                        { id: "amber", bg: "bg-amber-600", title: "Sunset Amber" },
                        { id: "rose", bg: "bg-rose-600", title: "Crimson Rose" },
                        { id: "midnight", bg: "bg-slate-600", title: "Midnight Slate" }
                      ].map(brand => (
                        <button
                          key={brand.id}
                          onClick={() => setBrandTheme(brand.id as any)}
                          className={`w-6 h-6 rounded-full cursor-pointer transition flex items-center justify-center relative hover:scale-110 active:scale-95 ${brand.bg}`}
                          title={brand.title}
                        >
                          {brandTheme === brand.id && (
                            <span className="w-2 h-2 bg-white rounded-full shadow-xs" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-gray-400">THEME MODE</span>
                    <button 
                      onClick={toggleTheme}
                      className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Inner Dashboard Viewports */}
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {loadingMe ? (
                <div className="text-center py-24 space-y-2">
                  <Sparkles className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 font-mono">Synchronizing workspace metadata...</p>
                </div>
              ) : user ? (
                <>
                  {activeTab === "dashboard" && (
                    <DashboardView 
                      user={user} 
                      companies={companies} 
                      codingQuestions={codingQuestions} 
                      tasks={plannerTasks} 
                      notifications={notifications}
                      onNavigate={(tab) => setActiveTab(tab as any)}
                      onToggleTask={handleToggleTask}
                    />
                  )}

                  {activeTab === "profile" && (
                    <ProfileView 
                      user={user} 
                      token={token}
                      onUpdateProfile={handleUpdateProfile} 
                      onAnalyzeResume={handleAnalyzeResume} 
                      onDeleteResumeVersion={handleDeleteResumeVersion}
                      onActivateResumeVersion={handleActivateResumeVersion}
                    />
                  )}

                  {activeTab === "companies" && (
                    <CompaniesView 
                      user={user} 
                      companies={companies} 
                      onApplyCompany={handleApplyCompany} 
                    />
                  )}

                  {activeTab === "coding" && (
                    <CodingView 
                      user={user} 
                      codingQuestions={codingQuestions} 
                      onSubmitCode={handleSubmitCode} 
                    />
                  )}

                  {activeTab === "aptitude" && (
                    <AptitudeView 
                      aptitudeQuestions={aptitudeQuestions} 
                      onSubmitAptitudeScore={handleSubmitAptitudeScore} 
                    />
                  )}

                  {activeTab === "interview" && (
                    <InterviewView 
                      user={user} 
                      onGenerateQuestions={handleGenerateQuestions} 
                      onSendChatbotMessage={handleSendChatbotMessage} 
                      onSaveInterviewNotes={handleSaveInterviewNotes} 
                      onGetInterviewTips={handleFetchInterviewTips}
                    />
                  )}

                  {activeTab === "resume" && (
                    <ResumeBuilderView 
                      user={user} 
                      onUpdateProfile={handleUpdateProfile} 
                      onAnalyzeResume={handleAnalyzeResume} 
                    />
                  )}

                  {activeTab === "mentors" && (
                    <AcademicMentorsView 
                      user={user} 
                      onAddTask={handleAddTask} 
                    />
                  )}

                  {activeTab === "planner" && (
                    <PlannerView 
                      user={user}
                      tasks={plannerTasks} 
                      onAddTask={handleAddTask} 
                      onToggleTask={handleToggleTask} 
                      onDeleteTask={handleDeleteTask} 
                      onUpdateTask={handleUpdateTask}
                    />
                  )}

                  {activeTab === "analytics" && (
                    <AnalyticsView 
                      token={token} 
                      onFetchReadiness={handleFetchReadiness} 
                      user={user}
                      codingQuestions={codingQuestions}
                      plannerTasks={plannerTasks}
                      companies={companies}
                    />
                  )}

                  {activeTab === "leaderboard" && (
                    <LeaderboardView 
                      leaderboard={leaderboard} 
                    />
                  )}

                  {activeTab === "history" && (
                    <HistoryView 
                      token={token} 
                    />
                  )}

                  {activeTab === "presentation" && (
                    <PresentationView 
                      onNavigate={(tab) => setActiveTab(tab as any)} 
                    />
                  )}

                  {activeTab === "admin" && isAdmin && (
                    <AdminView 
                      token={token} 
                      companies={companies} 
                      onAddCompany={handleAddCompany} 
                      onAddCodingQuestion={handleAddCodingQuestion} 
                      onAddAptitudeQuestion={handleAddAptitudeQuestion} 
                    />
                  )}

                  {/* Persistent ChatGPT & Gemini Style AI Chat Assistant Panel */}
                  <PlacePilotChatAssistant 
                    user={user} 
                    token={token} 
                    activeTab={activeTab} 
                    onNavigate={(tab) => setActiveTab(tab as any)} 
                  />
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xs text-gray-500">Workspace session synchronization failed. Re-authenticate.</p>
                </div>
              )}
            </main>

          </div>
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
