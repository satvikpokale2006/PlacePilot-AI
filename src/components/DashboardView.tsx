import React, { useState } from "react";
import { User, Company, CodingQuestion, PlannerTask, SystemNotification } from "../types";
import { 
  Trophy, Flame, Calendar, CheckSquare, ChevronRight, 
  ArrowUpRight, AlertCircle, Sparkles, Code2, BrainCircuit, Play 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import { useTheme } from "./ThemeContext";

interface DashboardViewProps {
  user: User;
  companies: Company[];
  codingQuestions: CodingQuestion[];
  tasks: PlannerTask[];
  notifications: SystemNotification[];
  onNavigate: (view: string) => void;
  onToggleTask: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  companies,
  codingQuestions,
  tasks,
  notifications,
  onNavigate,
  onToggleTask,
}) => {
  const { theme } = useTheme();
  const [completedToday, setCompletedToday] = useState(0);

  // Filter dynamic upcoming drives (within next 30 days)
  const upcomingDrives = companies
    .filter(c => new Date(c.registrationDeadline) >= new Date())
    .slice(0, 3);

  // Solved questions count
  const solvedQuestions = codingQuestions.filter(q => q.status === "Solved");
  const recentlySolved = solvedQuestions.slice(0, 3);

  // Daily task completion stats
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Study statistics charts data (mocked weekly progression)
  const weeklyStudyData = [
    { name: "Mon", hr: 2.5, questions: 1 },
    { name: "Tue", hr: 4.0, questions: 3 },
    { name: "Wed", hr: 1.5, questions: 1 },
    { name: "Thu", hr: 5.5, questions: 4 },
    { name: "Fri", hr: 3.0, questions: 2 },
    { name: "Sat", hr: 6.0, questions: 5 },
    { name: "Sun", hr: 4.5, questions: 3 },
  ];

  const categoryAptitudeData = [
    { name: "Quant", value: 75, color: "#3B82F6" },
    { name: "Logical", value: 85, color: "#10B981" },
    { name: "Verbal", value: 60, color: "#F59E0B" },
    { name: "DI", value: 70, color: "#8B5CF6" },
  ];

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-indigo-600/10 backdrop-blur-md border border-indigo-500/20 shadow-sm dark:bg-indigo-950/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                Class of 2026
              </span>
              {user.dailyStreak >= 5 && (
                <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                  <Flame className="w-4 h-4 fill-amber-500" /> {user.dailyStreak} Day Streak
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              Track your daily placement goals, practice coding problems, test aptitude levels, and review current corporate registration drives.
            </p>
          </div>
          <button 
            onClick={() => onNavigate("analytics")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> AI Readiness Analysis
          </button>
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Readiness */}
        <div className="p-5 rounded-3xl glass-card shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Overall Progress</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{user.overallProgress}%</span>
            <span className="text-xs text-emerald-500 font-semibold font-mono flex items-center gap-0.5">
              +5% this wk
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${user.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Coding Score */}
        <div className="p-5 rounded-3xl glass-card shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Coding Solved</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{solvedQuestions.length} Questions</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-mono">Score: {user.codingScore} points</p>
        </div>

        {/* Aptitude Points */}
        <div className="p-5 rounded-3xl glass-card shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Aptitude Score</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{user.aptitudeScore} pts</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-mono">Target benchmark: 500 pts</p>
        </div>

        {/* Resume Status */}
        <div className="p-5 rounded-3xl glass-card shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Resume Score</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.resumeAnalysis?.atsScore ? `${user.resumeAnalysis.atsScore}%` : "Not Evaluated"}
            </span>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold flex items-center gap-1 cursor-pointer" onClick={() => onNavigate("profile")}>
            {user.resumeFileName ? "Optimize Resume" : "Upload Resume"} <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Performance Analytics */}
          <div className="p-6 rounded-3xl glass-card shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Preparation Consistency</h3>
                <p className="text-xs text-gray-400">Hours spent & questions solved during the last week</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                Weekly Active
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyStudyData}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={theme === "dark" ? {
                      backgroundColor: "rgba(30, 41, 59, 0.95)",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "8px",
                      fontSize: "12px"
                    } : {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    itemStyle={theme === "dark" ? { color: "#f8fafc" } : { color: "#0f172a" }}
                    labelStyle={theme === "dark" ? { color: "#94a3b8" } : { color: "#64748b" }}
                  />
                  <Area type="monotone" dataKey="hr" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" name="Study Hours" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recently Solved and Aptitude Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solved Problems */}
            <div className="p-5 rounded-3xl glass-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recently Solved Problems</h3>
                <button 
                  onClick={() => onNavigate("coding")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  Practice <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {recentlySolved.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No questions solved yet. Start practice coding challenges!
                </div>
              ) : (
                <div className="space-y-3">
                  {recentlySolved.map(q => (
                    <div key={q.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100/10">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.title}</p>
                        <span className="text-[10px] font-mono text-gray-400">{q.category}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                        q.difficulty === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
                        "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aptitude Stats */}
            <div className="p-5 rounded-3xl glass-card">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Aptitude Strengths</h3>
              <div className="space-y-3 h-44 flex flex-col justify-center">
                {categoryAptitudeData.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                      <span>{sec.name}</span>
                      <span className="font-mono">{sec.value}% Accuracy</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${sec.value}%`, backgroundColor: sec.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column (Upcoming, Planner Checklist) */}
        <div className="space-y-6">
          {/* Upcoming Drives Card */}
          <div className="p-5 rounded-3xl glass-card shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Drives
              </h3>
              <button onClick={() => onNavigate("companies")} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {upcomingDrives.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No corporate drives active currently.
                </div>
              ) : (
                upcomingDrives.map(c => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100/10 hover:border-blue-500/20 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{c.location || "India"}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                        {c.package}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                      <span>Deadline: {c.registrationDeadline}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        c.applicationStatus === "Applied" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        c.applicationStatus === "Shortlisted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {c.applicationStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Goals Planner */}
          <div className="p-5 rounded-3xl glass-card shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-600" /> Today's Goals
              </h3>
              <button onClick={() => onNavigate("planner")} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No goals set for today.
                </div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60">
                    <span className={`text-xs ${t.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {t.title}
                    </span>
                    <button 
                      onClick={() => onToggleTask(t.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer ${
                        t.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 dark:border-gray-600 hover:border-indigo-600 dark:hover:border-indigo-400"
                      }`}
                    >
                      {t.completed && <span className="text-[10px]">✓</span>}
                    </button>
                  </div>
                ))
              )}
            </div>
            {tasks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-[11px] font-semibold text-gray-500">
                <span>Completed Progress:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{taskProgress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
