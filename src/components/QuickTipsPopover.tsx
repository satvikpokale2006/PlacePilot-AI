import React, { useState, useEffect, useRef } from "react";
import { User } from "../types";
import { Sparkles, Brain, RefreshCw, X, CheckCircle2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickTipsPopoverProps {
  user: User;
  onGetInterviewTips: () => Promise<any>;
}

interface Tip {
  title: string;
  category: string;
  content: string;
  checklist: string[];
}

interface TipsData {
  theme: string;
  date: string;
  tips: Tip[];
}

export const QuickTipsPopover: React.FC<QuickTipsPopoverProps> = ({
  user,
  onGetInterviewTips,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tipsData, setTipsData] = useState<TipsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`quick_tips_checked_${user.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync checklist checked state to localStorage
  useEffect(() => {
    localStorage.setItem(`quick_tips_checked_${user.id}`, JSON.stringify(checkedItems));
  }, [checkedItems, user.id]);

  // Click outside listener to close the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchTips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await onGetInterviewTips();
      if (data) {
        setTipsData(data);
      } else {
        setError("Unable to retrieve AI tips. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coaching tips from AI server.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !tipsData && !loading) {
      fetchTips();
    }
  };

  const toggleCheck = (tipIdx: number, checkIdx: number) => {
    const key = `${tipIdx}-${checkIdx}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="relative shrink-0" ref={popoverRef} id="quick-tips-popover-container">
      {/* Popover trigger button */}
      <button
        onClick={handleToggle}
        id="quick-tips-trigger-btn"
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-bold transition shadow-md hover:shadow-orange-500/15 cursor-pointer relative"
      >
        <Lightbulb className="w-4 h-4 text-amber-100 animate-pulse" />
        <span>AI Coach: Quick Tips</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-ping" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            id="quick-tips-popover-panel"
            className="absolute right-0 mt-3 w-[340px] sm:w-[420px] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl z-50 p-5 space-y-4 text-left"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3" id="quick-tips-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
                    Daily AI Placement Tips
                  </h3>
                  <p className="text-[9px] text-gray-400 font-mono">
                    {tipsData?.date || new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={fetchTips}
                  disabled={loading}
                  title="Generate new tips"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-amber-500 transition disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Focus Theme */}
            {tipsData?.theme && !loading && !error && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Theme: {tipsData.theme}
              </div>
            )}

            {/* Content Body */}
            {loading ? (
              <div className="py-8 space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div className="space-y-2 max-w-[200px] mx-auto">
                  <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-5/6 mx-auto" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2 mx-auto" />
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Curating HR & behavioral advice for {user.department || "your field"}...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-red-500 font-semibold">{error}</p>
                <button
                  onClick={fetchTips}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-semibold rounded-xl transition"
                >
                  Retry Loading Tips
                </button>
              </div>
            ) : tipsData?.tips && tipsData.tips.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {tipsData.tips.map((tip, tipIdx) => {
                  const checklistKeys = tip.checklist.map((_, i) => `${tipIdx}-${i}`);
                  const completedCount = checklistKeys.filter((k) => checkedItems[k]).length;
                  const totalCount = tip.checklist.length;
                  const isAllDone = completedCount === totalCount && totalCount > 0;

                  return (
                    <div
                      key={tipIdx}
                      className={`p-3.5 rounded-2xl border transition duration-200 ${
                        isAllDone
                          ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10"
                          : "bg-gray-50 dark:bg-gray-950 border-gray-100/10 dark:border-gray-800/40"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          {tip.title}
                        </h4>
                        <span
                          className={`text-[8px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            tip.category === "HR"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                          }`}
                        >
                          {tip.category}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {tip.content}
                      </p>

                      {totalCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-bold font-mono">
                            <span className="text-gray-400 uppercase">Preparation Checklist</span>
                            <span className={isAllDone ? "text-emerald-500" : "text-amber-500"}>
                              {completedCount} / {totalCount} Completed
                            </span>
                          </div>

                          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isAllDone ? "bg-emerald-500" : "bg-amber-500"}`}
                              style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                          </div>

                          <ul className="space-y-1.5 pt-1">
                            {tip.checklist.map((item, checkIdx) => {
                              const key = `${tipIdx}-${checkIdx}`;
                              const isChecked = checkedItems[key] || false;

                              return (
                                <li
                                  key={checkIdx}
                                  onClick={() => toggleCheck(tipIdx, checkIdx)}
                                  className="flex items-start gap-2 cursor-pointer select-none group"
                                >
                                  <div
                                    className={`mt-0.5 w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                      isChecked
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-gray-300 dark:border-gray-700 group-hover:border-amber-400"
                                    }`}
                                  >
                                    {isChecked && <CheckCircle2 className="w-3 h-3 text-white fill-white" />}
                                  </div>
                                  <span
                                    className={`text-[10px] leading-tight transition ${
                                      isChecked
                                        ? "text-gray-400 line-through dark:text-gray-500"
                                        : "text-gray-600 dark:text-gray-300 group-hover:text-amber-500 dark:group-hover:text-amber-400"
                                    }`}
                                  >
                                    {item}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No tips loaded. Click refresh to query AI placement insights.
              </div>
            )}

            {/* Footer */}
            <div className="text-[9px] font-mono text-gray-400 text-center border-t border-gray-100 dark:border-gray-800 pt-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-2xl">
              Daily advice is dynamically adjusted for <strong>{user.department || "your branch"}</strong>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
