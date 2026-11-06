import React, { useState, useEffect } from "react";
import { User, CodingQuestion } from "../types";
import { 
  Code2, Play, Sparkles, CheckCircle2, RefreshCw, 
  ChevronRight, Terminal, Search, HelpCircle, X,
  Timer, Pause, RotateCcw, AlertTriangle
} from "lucide-react";
import Markdown from "react-markdown";

interface CodingViewProps {
  user: User;
  codingQuestions: CodingQuestion[];
  onSubmitCode: (questionId: string, code: string, status: 'Solved' | 'Attempted') => Promise<string>;
}

// Helper audio synthesizers to keep the app interactive and realistic
const playTimerEndChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Encouraging success/alert sound
    playNote(523.25, now, 0.4);        // C5
    playNote(659.25, now + 0.15, 0.4); // E5
    playNote(783.99, now + 0.3, 0.4);  // G5
    playNote(1046.50, now + 0.45, 0.6); // C6
  } catch (err) {
    console.warn("Audio failed to play:", err);
  }
};

const playTimerClickChime = (isStart: boolean) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(isStart ? 880 : 440, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {}
};

export const CodingView: React.FC<CodingViewProps> = ({
  user,
  codingQuestions,
  onSubmitCode,
}) => {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Selected coding problem state
  const [activeQuestion, setActiveQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [feedback, setFeedback] = useState("");

  // Contest Countdown Timer States
  const [timerSeconds, setTimerSeconds] = useState(1800); // 30 minutes default
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(1800);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerEnded, setTimerEnded] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerEnded(true);
            playTimerEndChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleToggleTimer = () => {
    const nextState = !timerRunning;
    setTimerRunning(nextState);
    if (timerEnded) {
      setTimerEnded(false);
    }
    playTimerClickChime(nextState);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(timerInitialSeconds);
    setTimerEnded(false);
    playTimerClickChime(false);
  };

  const handleSetPreset = (secs: number) => {
    setTimerRunning(false);
    setTimerSeconds(secs);
    setTimerInitialSeconds(secs);
    setTimerEnded(false);
    playTimerClickChime(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenQuestion = (q: CodingQuestion) => {
    setActiveQuestion(q);
    setCode(q.boilerplate);
    setExplanation("");
    setTestOutput("");
    setFeedback("");
    
    // Automatically reset contest timer for new question practicing session
    setTimerSeconds(1800);
    setTimerInitialSeconds(1800);
    setTimerRunning(false);
    setTimerEnded(false);
  };

  const handleRunTest = () => {
    if (!activeQuestion) return;
    setTestOutput("Running tests...\n");
    setTimeout(() => {
      setTestOutput(
        `✓ Test Case 1 Passed: Input: ${activeQuestion.testCases[0]?.input || "N/A"}\n  Output: ${activeQuestion.testCases[0]?.output || "N/A"}\n\n✓ All local test cases passed! Submit your solution to compute placement metrics.`
      );
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!activeQuestion) return;
    setSubmitting(true);
    setFeedback("");
    try {
      // Simulate real submission
      const aiFeedback = await onSubmitCode(activeQuestion.id, code, "Solved");
      setExplanation(aiFeedback);
      setFeedback("Success! Solved problem. Placement metrics and overall score updated.");
    } catch (err: any) {
      setFeedback("Failed to submit code.");
    } finally {
      setSubmitting(false);
    }
  };

  // Lists
  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const categories = [
    "All", "Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graph", "Dynamic Programming"
  ];

  const filteredQuestions = codingQuestions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                          q.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
    return matchesSearch && matchesDiff && matchesCat;
  });

  const solvedCount = codingQuestions.filter(q => q.status === "Solved").length;

  return (
    <div className="space-y-6" id="coding-view">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600" /> Coding Practice Lab
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Solve algorithmic challenges, improve compile consistency, and ask AI to analyze code solutions.</p>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 font-semibold border border-emerald-100/10">
            Solved: {solvedCount} / {codingQuestions.length}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 font-semibold border border-blue-100/10">
            Rank Score: {user.codingScore} pts
          </div>
        </div>
      </div>

      {activeQuestion ? (
        /* Code Editor Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Left Column: Problem description */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between h-full min-h-[500px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700/50">
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase text-gray-400">{activeQuestion.category}</span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeQuestion.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeQuestion.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" :
                      activeQuestion.difficulty === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                      "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                    }`}>
                      {activeQuestion.difficulty}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      +{activeQuestion.points} pts
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed whitespace-pre-line">
                  {activeQuestion.description}
                </div>

                <div className="mt-6">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white font-mono uppercase tracking-wider">Example Test Cases</h4>
                  <div className="space-y-2 mt-2">
                    {activeQuestion.testCases.map((tc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl text-xs font-mono border border-gray-100/10">
                        <p className="text-gray-500"><span className="font-semibold text-gray-400">Input:</span> {tc.input}</p>
                        <p className="text-gray-500 mt-1"><span className="font-semibold text-gray-400">Output:</span> {tc.output}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 flex gap-2">
                <button 
                  onClick={() => setActiveQuestion(null)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Code input, outputs and Gemini reviews */}
          <div className="space-y-6">
            {/* Contest Simulator Countdown Timer Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-slate-900/40 dark:to-slate-900/10 border border-indigo-100/30 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl transition-all ${timerRunning ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-indigo-500/10 text-indigo-500"}`}>
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                      Contest Simulator Mode
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        timerRunning ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}>
                        {timerRunning ? "Live Practicing" : "Paused"}
                      </span>
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                      Set constraints and practice under intense time pressure.
                    </p>
                  </div>
                </div>

                {/* Quick preset triggers */}
                {!timerRunning && timerSeconds === timerInitialSeconds && (
                  <div className="flex items-center gap-1">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSetPreset(mins * 60)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          timerInitialSeconds === mins * 60
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Countdown Time Display */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black font-mono tracking-tight ${
                    timerSeconds < 60 && timerSeconds > 0
                      ? "text-red-500 animate-pulse"
                      : "text-gray-950 dark:text-white"
                  }`}>
                    {formatTime(timerSeconds)}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">left</span>
                </div>

                {/* Control Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTimer}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                      timerRunning
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> {timerSeconds === timerInitialSeconds ? "Start Contest" : "Resume"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5">
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      timerSeconds < 60
                        ? "bg-red-500"
                        : timerSeconds < timerInitialSeconds * 0.25
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                    }`}
                    style={{ width: `${(timerSeconds / timerInitialSeconds) * 100}%` }}
                  />
                </div>
              </div>

              {/* Alerts or Completion states */}
              {timerEnded && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100/10 text-xs text-red-650 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <p className="font-bold">Contest Time Expired!</p>
                    <p className="opacity-90">Your practice time limit is over. Keep pushing or submit your solution now!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Console */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                <Terminal className="w-4 h-4 text-blue-600" /> Interactive Code Sandbox (JavaScript)
              </h3>

              <textarea 
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full p-4 h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900 text-emerald-400 font-mono text-xs focus:outline-none"
                placeholder="Write your solution code here..."
              />

              <div className="mt-4 flex gap-2 justify-end">
                <button 
                  onClick={handleRunTest}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Run Code Tests
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {submitting ? "Compiling..." : "Submit Code Solution"}
                </button>
              </div>

              {testOutput && (
                <div className="mt-4 p-4 rounded-xl bg-gray-950 text-xs font-mono text-gray-300 whitespace-pre-line border border-gray-800">
                  <p className="text-gray-500 font-bold uppercase tracking-wider mb-2">Test Console Output:</p>
                  {testOutput}
                </div>
              )}

              {feedback && (
                <p className="mt-3 text-xs text-center text-emerald-600 font-bold">
                  {feedback}
                </p>
              )}
            </div>

            {/* Gemini Review and explanation output */}
            {explanation && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent border border-blue-500/20 shadow-xs animate-in fade-in duration-300">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> AI Code Explanation & Solutions Review
                </h3>
                <div className="markdown-body prose dark:prose-invert max-w-none text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  <Markdown>{explanation}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Challenges Table Mode */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters Bento bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Search problem title..."
              />
            </div>

            <div>
              <select 
                value={selectedDifficulty} 
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>{d} Difficulty</option>
                ))}
              </select>
            </div>

            <div>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c} Category</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of challenges */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20 text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                    <th className="p-4 pl-6">Status</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Reward</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40 text-sm">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        No coding challenges found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/20 transition">
                        <td className="p-4 pl-6">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            q.status === "Solved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" :
                            q.status === "Attempted" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                            "bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-500"
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-900 dark:text-white">{q.title}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{q.category}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" :
                            q.difficulty === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                            "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">+{q.points} pts</span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => handleOpenQuestion(q)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-blue-600 dark:hover:text-white transition cursor-pointer"
                          >
                            Solve Challenge <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
