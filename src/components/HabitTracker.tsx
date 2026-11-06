import React, { useState, useEffect } from "react";
import { User } from "../types";
import { 
  Flame, Plus, Trash2, RotateCcw, CheckCircle2, Sparkles, 
  Hourglass, Code, Award, CheckSquare, MessageSquare, AlertCircle, BookOpen 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitTrackerProps {
  user: User;
}

export interface Habit {
  id: string;
  name: string;
  unit: string;
  target: number;
  current: number;
  streak: number;
  lastLogged: string; // YYYY-MM-DD
  category: "coding" | "aptitude" | "interview" | "academic" | "custom";
}

const DEFAULT_HABITS: Omit<Habit, "id" | "lastLogged">[] = [
  {
    name: "Daily Coding Practice",
    unit: "problems",
    target: 3,
    current: 0,
    streak: 0,
    category: "coding",
  },
  {
    name: "Aptitude Revision Time",
    unit: "mins",
    target: 30,
    current: 0,
    streak: 0,
    category: "aptitude",
  },
  {
    name: "HR / Behavioral Preparation",
    unit: "responses",
    target: 2,
    current: 0,
    streak: 0,
    category: "interview",
  },
  {
    name: "Core Subjects Revision",
    unit: "hours",
    target: 2,
    current: 0,
    streak: 0,
    category: "academic",
  }
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({ user }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("hours");
  const [newTarget, setNewTarget] = useState(2);
  const [newCategory, setNewCategory] = useState<Habit["category"]>("custom");
  const [formError, setFormError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Load habits from localStorage on mount / user change
  useEffect(() => {
    const saved = localStorage.getItem(`planner_habits_${user.id}`);
    if (saved) {
      try {
        const parsed: Habit[] = JSON.parse(saved);
        // Auto-check for day transitions to roll over daily current scores or update streaks
        const updated = parsed.map(h => {
          if (h.lastLogged && h.lastLogged !== todayStr) {
            // If they hit their target yesterday, maintain/increment streak (or preserve for reference)
            const achievedYesterday = h.current >= h.target;
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            
            let nextStreak = h.streak;
            if (h.lastLogged === yesterdayStr) {
              // Consecutive day
              nextStreak = achievedYesterday ? h.streak : 0;
            } else if (h.lastLogged !== todayStr) {
              // Gap of more than 1 day
              nextStreak = 0;
            }

            return {
              ...h,
              current: 0, // Reset daily progress for the new day
              streak: nextStreak,
              // don't update lastLogged yet, only when they log something today
            };
          }
          return h;
        });
        setHabits(updated);
        localStorage.setItem(`planner_habits_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to parse habits", e);
        initializeDefaultHabits();
      }
    } else {
      initializeDefaultHabits();
    }
  }, [user.id]);

  const initializeDefaultHabits = () => {
    const initial: Habit[] = DEFAULT_HABITS.map((dh, idx) => ({
      ...dh,
      id: `default-${idx}`,
      lastLogged: todayStr,
    }));
    setHabits(initial);
    localStorage.setItem(`planner_habits_${user.id}`, JSON.stringify(initial));
  };

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem(`planner_habits_${user.id}`, JSON.stringify(updatedHabits));
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newName.trim()) {
      setFormError("Habit name is required");
      return;
    }
    if (newTarget <= 0) {
      setFormError("Target must be greater than 0");
      return;
    }

    const newHabit: Habit = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      unit: newUnit.trim() || "times",
      target: Number(newTarget),
      current: 0,
      streak: 0,
      lastLogged: todayStr,
      category: newCategory,
    };

    const updated = [...habits, newHabit];
    saveHabits(updated);

    // Reset Form
    setNewName("");
    setNewUnit("hours");
    setNewTarget(2);
    setNewCategory("custom");
    setIsAdding(false);
  };

  const handleUpdateProgress = (id: string, amount: number) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const prevAchieved = h.current >= h.target;
        const nextCurrent = Math.max(0, h.current + amount);
        const nextAchieved = nextCurrent >= h.target;

        let nextStreak = h.streak;
        if (nextAchieved && !prevAchieved) {
          nextStreak += 1; // Increment streak if they just crossed the line today
        } else if (!nextAchieved && prevAchieved) {
          nextStreak = Math.max(0, h.streak - 1); // Decrement if they went back below
        }

        return {
          ...h,
          current: nextCurrent,
          streak: nextStreak,
          lastLogged: todayStr,
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    saveHabits(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all habit progress for today? Your active streaks will remain intact.")) {
      const updated = habits.map(h => ({
        ...h,
        current: 0,
        lastLogged: todayStr,
      }));
      saveHabits(updated);
    }
  };

  const getCategoryIcon = (category: Habit["category"]) => {
    switch (category) {
      case "coding":
        return <Code className="w-4 h-4 text-blue-500" />;
      case "aptitude":
        return <Award className="w-4 h-4 text-emerald-500" />;
      case "interview":
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case "academic":
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      default:
        return <CheckSquare className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4"
      id="habit-tracker-container"
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            Daily Placement Habits
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Build daily consistency to crack campus hiring benchmarks</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetProgress}
            title="Reset daily progress"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Add Habit Form inline */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddHabit}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-800 space-y-3 overflow-hidden text-xs"
            id="add-habit-form"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 dark:text-gray-300">Create Custom Habit</span>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                <AlertCircle className="w-3 h-3" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase">Habit Title</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="E.g., Practice SQL Queries, Speak in English..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase">Target Goal</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={e => setNewTarget(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-mono uppercase">Unit of Measure</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  placeholder="hours, problems, pages..."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Habit["category"])}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="coding">Coding & Data Structures</option>
                <option value="aptitude">Quantitative Aptitude & Logic</option>
                <option value="interview">HR & Mock Interviews</option>
                <option value="academic">Academic & Subjects</option>
                <option value="custom">Other Custom Habit</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Add New habit
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit List */}
      <div className="space-y-3" id="habit-list-container">
        {habits.length === 0 ? (
          <p className="text-center text-xs py-6 text-gray-400 italic">
            No habits logged. Click "Add Habit" to start building your placement routines!
          </p>
        ) : (
          habits.map(habit => {
            const progressPercent = Math.min(100, Math.round((habit.current / habit.target) * 100));
            const isCompleted = habit.current >= habit.target;

            return (
              <div 
                key={habit.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isCompleted 
                    ? "bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-500/5 dark:border-emerald-500/20" 
                    : "bg-slate-50/50 dark:bg-slate-900/30 border-gray-100/50 dark:border-gray-800/40"
                }`}
              >
                {/* Name, Category Icon, & Delete */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 shadow-xs flex items-center justify-center">
                      {getCategoryIcon(habit.category)}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${isCompleted ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"}`}>
                        {habit.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-mono">
                        Goal: {habit.target} {habit.unit} daily
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Daily Streak Indicator */}
                    {habit.streak > 0 && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono" title="Consecutive days goal reached!">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        <span>{habit.streak}d</span>
                      </div>
                    )}

                    {/* Delete Custom Habit */}
                    {habit.id.startsWith("custom-") && (
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Controls & Stats */}
                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Progress Info */}
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono">
                    <span className={isCompleted ? "text-emerald-500 font-extrabold" : "text-gray-800 dark:text-gray-200"}>
                      {habit.current}
                    </span>
                    <span className="mx-0.5">/</span>
                    <span>{habit.target}</span>
                    <span className="ml-1 text-[9px] text-gray-400 font-normal">{habit.unit}</span>
                  </div>

                  {/* Incremental Log Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateProgress(habit.id, -1)}
                      disabled={habit.current === 0}
                      className="w-5 h-5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer disabled:opacity-30"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(habit.id, 1)}
                      className="w-5 h-5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                    >
                      +
                    </button>

                    {/* Quick Hit Target */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleUpdateProgress(habit.id, habit.target - habit.current)}
                        className="px-1.5 h-5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold font-mono transition cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isCompleted 
                          ? "bg-emerald-500" 
                          : habit.current > 0 
                            ? "bg-blue-500" 
                            : "bg-gray-300 dark:bg-gray-700"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold font-mono uppercase text-gray-400">
                    <span>Progress</span>
                    <span className={isCompleted ? "text-emerald-500" : "text-gray-500"}>
                      {progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Celebration Sparkle Banner */}
                {isCompleted && (
                  <div className="mt-2 pt-2 border-t border-emerald-100/10 dark:border-emerald-950/20 flex items-center gap-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" />
                    <span>Daily consistency goal completed! Keep it up!</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
