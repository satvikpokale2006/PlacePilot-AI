import React, { useState, useEffect } from "react";
import { HistoryItem, User } from "../types";
import { 
  History, Search, Trash2, Calendar, Filter, Code2, 
  BrainCircuit, FileText, CheckSquare, MessageSquare, 
  User as UserIcon, Building2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryViewProps {
  token: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ token }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [clearing, setClearing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch activity history.");
      }
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading your history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const handleClearHistory = async () => {
    try {
      setClearing(true);
      const res = await fetch("/api/history/clear", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to clear activity history.");
      }
      setHistory([]);
      setConfirmClearOpen(false);
    } catch (err: any) {
      console.error(err);
      setError("Failed to clear activity history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  // Helper to resolve action category color & icon
  const getCategoryDetails = (type: string) => {
    switch (type) {
      case "coding":
        return {
          icon: Code2,
          color: "text-blue-600 bg-blue-50 border-blue-150 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          accentBorder: "border-l-4 border-l-blue-500",
          glow: "shadow-[0_0_15px_rgba(59,130,246,0.25)] dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
          bulletRing: "ring-blue-100 dark:ring-blue-900/40",
          iconColor: "text-blue-500 dark:text-blue-400",
          label: "Coding Practice"
        };
      case "aptitude":
        return {
          icon: BrainCircuit,
          color: "text-amber-600 bg-amber-50 border-amber-150 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          accentBorder: "border-l-4 border-l-amber-500",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)] dark:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          bulletRing: "ring-amber-100 dark:ring-amber-900/40",
          iconColor: "text-amber-500 dark:text-amber-400",
          label: "Aptitude Zone"
        };
      case "resume":
        return {
          icon: FileText,
          color: "text-emerald-600 bg-emerald-50 border-emerald-150 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
          accentBorder: "border-l-4 border-l-emerald-500",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.25)] dark:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          bulletRing: "ring-emerald-100 dark:ring-emerald-900/40",
          iconColor: "text-emerald-500 dark:text-emerald-400",
          label: "Resume Analysis"
        };
      case "planner":
        return {
          icon: CheckSquare,
          color: "text-indigo-600 bg-indigo-50 border-indigo-150 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40",
          badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
          accentBorder: "border-l-4 border-l-indigo-500",
          glow: "shadow-[0_0_15px_rgba(99,102,241,0.25)] dark:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
          bulletRing: "ring-indigo-100 dark:ring-indigo-900/40",
          iconColor: "text-indigo-500 dark:text-indigo-400",
          label: "Planner Goal"
        };
      case "interview":
        return {
          icon: MessageSquare,
          color: "text-purple-600 bg-purple-50 border-purple-150 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40",
          badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
          accentBorder: "border-l-4 border-l-purple-500",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.25)] dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
          bulletRing: "ring-purple-100 dark:ring-purple-900/40",
          iconColor: "text-purple-500 dark:text-purple-400",
          label: "Mock Interview"
        };
      case "profile":
        return {
          icon: UserIcon,
          color: "text-rose-600 bg-rose-50 border-rose-150 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
          accentBorder: "border-l-4 border-l-rose-500",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.25)] dark:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
          bulletRing: "ring-rose-100 dark:ring-rose-900/40",
          iconColor: "text-rose-500 dark:text-rose-400",
          label: "Profile Center"
        };
      case "application":
        return {
          icon: Building2,
          color: "text-cyan-600 bg-cyan-50 border-cyan-150 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/40",
          badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
          accentBorder: "border-l-4 border-l-cyan-500",
          glow: "shadow-[0_0_15px_rgba(6,182,212,0.25)] dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
          bulletRing: "ring-cyan-100 dark:ring-cyan-900/40",
          iconColor: "text-cyan-500 dark:text-cyan-400",
          label: "Job Application"
        };
      default:
        return {
          icon: History,
          color: "text-gray-600 bg-gray-50 border-gray-150 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900/40",
          badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
          accentBorder: "border-l-4 border-l-gray-400",
          glow: "shadow-[0_0_15px_rgba(107,114,128,0.25)] dark:shadow-[0_0_20px_rgba(107,114,128,0.15)]",
          bulletRing: "ring-gray-100 dark:ring-gray-900/40",
          iconColor: "text-gray-500 dark:text-gray-400",
          label: "General"
        };
    }
  };


  // Filter & Search Logic
  const filteredHistory = history.filter(item => {
    // Defensive normalization: old/local db files may contain incomplete or
    // non-string history fields. Never let one malformed record crash the page.
    const actionType = String(item?.actionType ?? "general");
    const description = String(item?.description ?? "Activity recorded");
    const timestamp = String(item?.timestamp ?? "");
    const category = getCategoryDetails(actionType);
    const itemDate = new Date(timestamp);
    const validDate = !Number.isNaN(itemDate.getTime());
    const dateFormatted = validDate ? itemDate.toLocaleDateString() : "";
    const dateTimeFormatted = validDate ? itemDate.toLocaleString() : "";
    const dateIso = timestamp.toLowerCase();

    // 1. Keyword search (checks description, type, category label, metadata, and full formatted dates)
    const matchesKeyword = 
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dateFormatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dateTimeFormatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dateIso.includes(searchQuery.toLowerCase());

    // 2. Specific calendar date search (YYYY-MM-DD comparison)
    let matchesSpecificDate = true;
    if (searchDate) {
      const selectedYMD = searchDate; // "YYYY-MM-DD"
      const year = itemDate.getFullYear();
      const month = String(itemDate.getMonth() + 1).padStart(2, '0');
      const day = String(itemDate.getDate()).padStart(2, '0');
      const itemYMD = `${year}-${month}-${day}`;
      matchesSpecificDate = itemYMD === selectedYMD;
    }

    // 3. Category filter
    const matchesCategory = selectedFilter === "all" || actionType === selectedFilter;

    return matchesKeyword && matchesSpecificDate && matchesCategory;
  });

  // Calculate statistics
  const getActionTypeCount = (type: string) => {
    return history.filter(item => String(item?.actionType ?? "general") === type).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and overview stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white" id="history-view-title">My Activity History</h1>
              <p className="text-xs text-gray-400 font-mono">Live audited sequence of your placement training milestones</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-gray-200/10"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {history.length > 0 && (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-rose-500/10"
            >
              <Trash2 className="w-4 h-4" /> Clear All History
            </button>
          )}
        </div>
      </div>

      {/* Confirmation modal for clearing history */}
      {confirmClearOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Are you absolutely sure?</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              This action will permanently delete all your audit logs and activity history. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition cursor-pointer"
                disabled={clearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                disabled={clearing}
              >
                {clearing ? "Clearing..." : "Yes, Clear History"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Search & Specific Date Filter at the TOP */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword search input */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search past activities by name, keyword, or action details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gray-50/20 dark:bg-slate-950/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-gray-950 dark:text-white font-sans transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Calendar date picker filter */}
          <div className="md:col-span-5 relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gray-50/20 dark:bg-slate-950/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-gray-950 dark:text-white font-sans transition cursor-pointer"
              title="Filter by specific date"
            />
            {searchDate && (
              <button 
                onClick={() => setSearchDate("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 cursor-pointer"
                title="Clear date filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action category filter tags and filter summary */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-gray-100/50 dark:border-gray-800/30 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400 font-mono mr-1 flex-shrink-0">Category:</span>
            {[
              { id: "all", label: "All Audits", colorClass: "bg-indigo-500" },
              { id: "coding", label: "Coding", colorClass: "bg-blue-500" },
              { id: "aptitude", label: "Aptitude", colorClass: "bg-amber-500" },
              { id: "interview", label: "AI Interview", colorClass: "bg-purple-500" },
              { id: "planner", label: "Planner", colorClass: "bg-indigo-500" },
              { id: "resume", label: "Resume", colorClass: "bg-emerald-500" },
              { id: "application", label: "Applications", colorClass: "bg-cyan-500" },
              { id: "profile", label: "Profile", colorClass: "bg-rose-500" },
            ].map(filter => {
              const count = filter.id === "all" ? history.length : history.filter(item => String(item?.actionType ?? "general") === filter.id).length;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition flex-shrink-0 flex items-center gap-1.5 border ${
                    selectedFilter === filter.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-gray-50/50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-gray-800"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filter.colorClass} ${selectedFilter === filter.id ? "bg-white" : ""}`} />
                  <span>{filter.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    selectedFilter === filter.id 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-gray-400 font-mono">
            {searchDate && (
              <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(searchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {(searchQuery || searchDate || selectedFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchDate("");
                  setSelectedFilter("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold text-[10px]"
              >
                Clear All Filter Options
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Total Logs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-gray-950 dark:text-white">{history.length}</span>
              <span className="text-[10px] text-gray-400 font-semibold">items</span>
            </div>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Code2 className="w-3 h-3 text-blue-500" /> Coding
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("coding")}</span>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-amber-500" /> Aptitude
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("aptitude")}</span>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-purple-500" /> Interview
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("interview")}</span>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-indigo-500" /> Planners
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("planner")}</span>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-500" /> Resume
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("resume")}</span>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-500" /> Applied
            </span>
            <span className="text-lg font-black text-gray-950 dark:text-white mt-1">{getActionTypeCount("application")}</span>
          </div>
        </div>
      )}

      {/* Audit Timeline Grid or empty state */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150/40 dark:border-gray-800 space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Synchronizing activity audit trails...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-rose-150/40 dark:border-gray-800/80 p-6 space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-gray-900 dark:text-white font-bold">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150/40 dark:border-gray-800 p-8 space-y-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
            <History className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">No activity logs recorded</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              We couldn't find any audited logs matching the filter. Action checkpoints are recorded when you submit code, practice aptitude, generate AI interviews, or apply to drives.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden py-2 px-1">
          {/* Vertical layout timeline line - responsive left coordinate */}
          <div className="absolute left-[18px] md:left-[162px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-indigo-500/5 dark:from-indigo-500/20 dark:via-slate-800 dark:to-transparent" />

          <div className="space-y-6 relative z-10">
            <AnimatePresence initial={false}>
              {filteredHistory.map((item, idx) => {
                const category = getCategoryDetails(item.actionType);
                const Icon = category.icon;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-4 group"
                  >
                    {/* Left Side: Time detail column (visible only on desktop md+) */}
                    <div className="hidden md:flex flex-col items-end w-32 text-right shrink-0 font-mono mt-1 select-none space-y-0.5">
                      <span className="text-xs font-black text-gray-900 dark:text-gray-200">
                        {new Date(String(item?.timestamp ?? "")).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {new Date(String(item?.timestamp ?? "")).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Central checkpoint circle column */}
                    <div className="flex flex-col items-center shrink-0 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 flex-shrink-0 z-10 transition duration-300 group-hover:scale-110 ${category.color} ${category.glow}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Right side: Detailed card container with dynamic left highlight border */}
                    <div className={`flex-1 min-w-0 p-4 bg-white dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 ${category.accentBorder} space-y-2`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider w-fit uppercase ${category.badge}`}>
                          {category.label}
                        </span>
                        
                        {/* Inline time display (mobile only) */}
                        <div className="flex md:hidden items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(String(item?.timestamp ?? "")).toLocaleString()}</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-relaxed">
                        {String(item?.description ?? "Activity recorded")}
                      </h4>

                      {/* Display meta details dynamically if present */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-850 mt-1">
                          {Object.entries(item.metadata).map(([key, value]) => {
                            if (typeof value === "object" || key === "code") return null;
                            return (
                              <span key={key} className="bg-gray-50 dark:bg-slate-950/60 border border-gray-200/10 px-2 py-0.5 rounded-md text-slate-500 dark:text-gray-400">
                                <span className="font-bold uppercase text-[9px] text-gray-400 mr-1">{key}</span>
                                <span className="text-gray-600 dark:text-gray-300">{String(value)}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
