import React, { useState, useRef, useEffect } from "react";
import { PlannerTask, User } from "../types";
import { 
  CheckSquare, Plus, Trash2, Calendar as CalendarIcon, 
  Clock, Info, ListCheck, ChevronRight, Mic, MicOff, Sparkles, Save, X, Edit2
} from "lucide-react";
import { PlannerNotifications } from "./PlannerNotifications";
import { HabitTracker } from "./HabitTracker";

interface PlannerViewProps {
  user: User;
  tasks: PlannerTask[];
  onAddTask: (title: string) => Promise<void>;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: { title?: string; completed?: boolean; voiceNotes?: string }) => Promise<void>;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  user,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Web Speech API Voice Note states
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [manualNotesText, setManualNotesText] = useState("");

  const [isListeningToAddTask, setIsListeningToAddTask] = useState(false);

  const recognitionRef = useRef<any>(null);
  const addTaskRecognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (addTaskRecognitionRef.current) {
        try {
          addTaskRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startSpeakToAddTask = () => {
    if (recordingTaskId) {
      stopVoiceNote();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListeningToAddTask(true);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setNewTitle(prev => {
          const base = prev.trim();
          return base ? base + " " + final.trim() : final.trim();
        });
      }
    };

    recognition.onerror = (err: any) => {
      console.error("Speak to add task recognition error:", err);
      stopSpeakToAddTask();
    };

    recognition.onend = () => {
      setIsListeningToAddTask(false);
    };

    try {
      recognition.start();
      addTaskRecognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to start speech recognition for add task:", e);
    }
  };

  const stopSpeakToAddTask = () => {
    if (addTaskRecognitionRef.current) {
      try {
        addTaskRecognitionRef.current.stop();
      } catch (e) {}
      addTaskRecognitionRef.current = null;
    }
    setIsListeningToAddTask(false);
  };

  const startVoiceNote = (taskId: string) => {
    if (isListeningToAddTask) {
      stopSpeakToAddTask();
    }
    if (recordingTaskId) {
      stopVoiceNote();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setRecordingTaskId(taskId);
      setInterimTranscript("");
      setFinalTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setFinalTranscript(prev => (prev + " " + final).trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (err: any) => {
      console.error("Voice Note recognition error:", err);
      stopVoiceNote();
    };

    recognition.onend = () => {
      // Keep state so the user can review and hit "Save Dictation"
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopVoiceNote = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setRecordingTaskId(null);
  };

  const handleSaveVoiceNote = async (taskId: string, text: string) => {
    try {
      await onUpdateTask(taskId, { voiceNotes: text });
      setInterimTranscript("");
      setFinalTranscript("");
      setRecordingTaskId(null);
      setEditingNotesTaskId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await onAddTask(newTitle);
      setNewTitle("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Simple current month calendar grid display
  const daysInMonth = 30;
  const currentDay = new Date().getDate();

  return (
    <div className="space-y-6" id="planner-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-blue-600" /> Daily Preparation Planner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Add daily goals, mark tasks completed, and maintain consistency benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Task Manager */}
        <div className="lg:col-span-3 space-y-6">
          {/* Add Goal Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-blue-600" /> Add Daily Prep Goal
            </h2>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="E.g., Solve 3 dynamic programming problems, revise verbal reasoning..."
                  required
                />
                <button
                  type="button"
                  onClick={() => isListeningToAddTask ? stopSpeakToAddTask() : startSpeakToAddTask()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isListeningToAddTask 
                      ? "bg-red-500 text-white animate-pulse shadow-sm" 
                      : "text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={isListeningToAddTask ? "Stop Listening" : "Speak to Add Goal"}
                >
                  {isListeningToAddTask ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {submitting ? "Adding..." : "Add Goal"}
              </button>
            </form>

            {isListeningToAddTask && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/10 text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Voice Task Input active... speak clearly to type.
                </span>
                <button 
                  type="button" 
                  onClick={stopSpeakToAddTask} 
                  className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 rounded text-[10px] cursor-pointer text-gray-750 dark:text-gray-300 transition"
                >
                  Done Speaking
                </button>
              </div>
            )}
          </div>

          {/* Goals List Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ListCheck className="w-4 h-4 text-indigo-600" /> Goal Checklist
              </h3>

              <div className="flex gap-1.5 font-mono text-[10px]">
                <button 
                  onClick={() => setFilter("all")}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    filter === "all" ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-500"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button 
                  onClick={() => setFilter("pending")}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    filter === "pending" ? "bg-amber-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-500"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button 
                  onClick={() => setFilter("completed")}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    filter === "completed" ? "bg-emerald-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-500"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No active goals found for selected filter.
                </div>
              ) : (
                filteredTasks.map(t => {
                  const isRecordingThis = recordingTaskId === t.id;
                  return (
                    <div 
                      key={t.id} 
                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-150/40 dark:border-gray-800 space-y-2.5 transition duration-150 hover:shadow-xs"
                    >
                      {/* Task Header Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button 
                            onClick={() => onToggleTask(t.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 cursor-pointer ${
                              t.completed ? "bg-blue-600 border-blue-600 text-white text-[10px]" : "border-gray-300 hover:border-blue-600"
                            }`}
                          >
                            {t.completed && "✓"}
                          </button>
                          <span className={`text-xs break-words leading-relaxed ${t.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300 font-medium"}`}>
                            {t.title}
                          </span>
                        </div>

                        {/* Controls (Voice Note button & Delete) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Voice Note Mic Button */}
                          <button
                            onClick={() => isRecordingThis ? stopVoiceNote() : startVoiceNote(t.id)}
                            title={isRecordingThis ? "Stop Recording" : "Dictate Voice Note / Status Update"}
                            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                              isRecordingThis 
                                ? "bg-red-500 text-white animate-pulse" 
                                : t.voiceNotes 
                                  ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40" 
                                  : "text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {isRecordingThis ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          </button>

                          <button 
                            onClick={() => onDeleteTask(t.id)}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Active Recording State Overlay */}
                      {isRecordingThis && (
                        <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/10 text-xs space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <span className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              RECORDING VOICE NOTE (WEB SPEECH API)...
                            </span>
                            <button 
                              onClick={() => stopVoiceNote()} 
                              className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 rounded text-[9px] cursor-pointer text-gray-700 dark:text-gray-300 transition"
                            >
                              Stop Dictating
                            </button>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 font-sans italic bg-white/50 dark:bg-slate-900/50 p-2 rounded-md border border-gray-100/50 dark:border-slate-800/50 min-h-[36px]">
                            {finalTranscript || interimTranscript ? `${finalTranscript} ${interimTranscript}` : "Start speaking now to dictate status updates or task details..."}
                          </p>

                          <div className="flex gap-1.5 justify-end">
                            <button 
                              onClick={() => {
                                setFinalTranscript("");
                                setInterimTranscript("");
                              }}
                              className="px-2 py-1 text-[10px] border border-gray-200 dark:border-gray-750 rounded-lg text-gray-500 hover:bg-gray-150/40 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Clear
                            </button>
                            <button 
                              onClick={() => handleSaveVoiceNote(t.id, `${finalTranscript} ${interimTranscript}`.trim())}
                              disabled={!(finalTranscript || interimTranscript)}
                              className="px-3 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3 h-3" /> Save Dictation
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Render Dictated Voice Note Details if present */}
                      {t.voiceNotes && !isRecordingThis && (
                        <div className="p-3 rounded-lg bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/10 text-xs space-y-1.5 relative group">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold font-mono">
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                              <Mic className="w-3 h-3 text-indigo-500" /> DICTATED DETAIL / STATUS
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                              <button 
                                onClick={() => {
                                  setEditingNotesTaskId(t.id);
                                  setManualNotesText(t.voiceNotes || "");
                                }}
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded text-[9px] cursor-pointer"
                              >
                                Edit Text
                              </button>
                              <button 
                                onClick={() => onUpdateTask(t.id, { voiceNotes: "" })}
                                className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 rounded text-[9px] cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {editingNotesTaskId === t.id ? (
                            <div className="space-y-2">
                              <textarea 
                                value={manualNotesText}
                                onChange={(e) => setManualNotesText(e.target.value)}
                                className="w-full p-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                rows={2}
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button 
                                  onClick={() => setEditingNotesTaskId(null)}
                                  className="px-2 py-1 text-[10px] border border-gray-200 dark:border-slate-750 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleSaveVoiceNote(t.id, manualNotesText)}
                                  className="px-3 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                                >
                                  Save Change
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-300 font-sans leading-relaxed break-words">
                              {t.voiceNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <HabitTracker user={user} />
        </div>

        {/* Right Column: Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
              <CalendarIcon className="w-4 h-4 text-indigo-600" /> Prep Calendar (July 2026)
            </h2>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold font-mono text-gray-400 mb-2">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isToday = dayNum === currentDay;
                const hasTask = tasks.some(t => parseInt(t.date?.split("-")?.[2]) === dayNum);
                const allCompleted = hasTask && tasks.filter(t => parseInt(t.date?.split("-")?.[2]) === dayNum).every(t => t.completed);

                return (
                  <div 
                    key={idx}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center relative cursor-pointer font-mono text-xs font-semibold border transition ${
                      isToday 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasTask && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        allCompleted ? "bg-emerald-500" : isToday ? "bg-white" : "bg-amber-500"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-4 text-[10px] font-bold font-mono text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Goals Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Goals Incomplete</span>
              </div>
            </div>
          </div>

          <PlannerNotifications tasks={tasks} />
        </div>
      </div>
    </div>
  );
};
