import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, 
  Trash2, Copy, Check, Bot, ArrowRight, CornerDownLeft, RefreshCw, Zap
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  year?: string;
  cgpa?: number;
  skills?: string[];
  phone?: string;
  linkedin?: string;
  github?: string;
  resumeText?: string;
  resumeFileName?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PlacePilotChatAssistantProps {
  user: User;
  token: string;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function PlacePilotChatAssistant({ 
  user, 
  token, 
  activeTab, 
  onNavigate 
}: PlacePilotChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested starter prompts based on active tab context
  const getSuggestedPrompts = () => {
    switch (activeTab) {
      case "coding":
        return [
          { text: "Explain Two Sum array approach", icon: "💻" },
          { text: "What is logarithmic time complexity?", icon: "⏱️" },
          { text: "Give me 3 graph cycle detection tricks", icon: "🚀" }
        ];
      case "aptitude":
        return [
          { text: "Formula shortcut for work & time", icon: "🔢" },
          { text: "How to solve fast probability sums", icon: "📈" },
          { text: "Give me a logical reasoning puzzle", icon: "🧠" }
        ];
      case "resume":
        return [
          { text: "Analyze my resume skills section", icon: "📝" },
          { text: "How do I write an ATS headline?", icon: "✨" },
          { text: "Give me bullet points for a React project", icon: "⚡" }
        ];
      case "interview":
        return [
          { text: "HR question: What is your weakness?", icon: "🤝" },
          { text: "Explain STAR behavioral framework", icon: "🌟" },
          { text: "Mock question for frontend engineer", icon: "🎙️" }
        ];
      case "planner":
        return [
          { text: "Suggest a 30-day DSA study roadmap", icon: "📅" },
          { text: "How do I balance core subjects & coding?", icon: "⚖️" },
          { text: "Tips to maintain daily coding streak", icon: "🔥" }
        ];
      default:
        return [
          { text: "What are Google's top hiring eligibility rules?", icon: "🏢" },
          { text: "Create an custom study plan for me", icon: "🎯" },
          { text: "How can I improve my placement readiness?", icon: "💡" }
        ];
    }
  };

  // Sync conversation with localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`place_pilot_gpt_chat_${user.id}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    } else {
      // Set initial welcome greeting
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi **${user.name}**! 👋 I am your custom **Place Pilot GPT** assistant—modeled with the advanced reasoning power of ChatGPT and Gemini.\n\nI have complete context of your placement profile, CGPA (${user.cgpa || "not set"}), skills (${user.skills?.length ? user.skills.join(", ") : "no skills uploaded"}), and active daily progress.\n\nHow can I accelerate your placement preparation today?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
    }
  }, [user.id, user.name]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Save messages to localstorage
  const saveChatHistory = (updated: ChatMessage[]) => {
    setMessages(updated);
    localStorage.setItem(`place_pilot_gpt_chat_${user.id}`, JSON.stringify(updated));
  };

  // Speech-to-Text recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputValue(prev => (prev ? prev + " " + transcript : transcript));
      }
      setIsListening(false);
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not fully supported in this browser viewport.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech Playback
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Strip markdown before speaking for a cleaner vocal experience
    const cleanSpeech = text
      .replace(/[*_#`~>]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/```[\s\S]*?```/g, "[Code snippet block excluded from reading]");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech.substring(0, 500));
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...messages, userMsg];
    saveChatHistory(updatedHistory);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call general chat assistant backend proxy endpoint
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({
            role: m.role,
            content: m.content
          })),
          activeTabContext: activeTab
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          role: "assistant",
          content: data.text,
          timestamp: new Date().toISOString()
        };

        const finalHistory = [...updatedHistory, assistantMsg];
        saveChatHistory(finalHistory);

        // Auto speak if enabled
        if (speechEnabled) {
          speakText(data.text);
        }

        // Check if the AI wants to guide the tab navigation
        const lowText = data.text.toLowerCase();
        if (lowText.includes("navigating to coding") || lowText.includes("opening coding")) {
          setTimeout(() => onNavigate("coding"), 2000);
        } else if (lowText.includes("navigating to daily planner") || lowText.includes("opening daily planner")) {
          setTimeout(() => onNavigate("planner"), 2000);
        } else if (lowText.includes("navigating to aptitude") || lowText.includes("opening aptitude")) {
          setTimeout(() => onNavigate("aptitude"), 2000);
        } else if (lowText.includes("navigating to resume") || lowText.includes("opening resume")) {
          setTimeout(() => onNavigate("resume"), 2000);
        } else if (lowText.includes("navigating to mock interview") || lowText.includes("opening mock interview")) {
          setTimeout(() => onNavigate("interview"), 2000);
        } else if (lowText.includes("navigating to placement") || lowText.includes("opening companies")) {
          setTimeout(() => onNavigate("companies"), 2000);
        }

      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (e: any) {
      console.error(e);
      const errMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `❌ **Service Connection Issue**: I'm having trouble matching with the Gemini backend. Check your internet connection or verify your API secrets.`,
        timestamp: new Date().toISOString()
      };
      saveChatHistory([...updatedHistory, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to wipe this ChatGPT chat assistant history?")) {
      localStorage.removeItem(`place_pilot_gpt_chat_${user.id}`);
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi **${user.name}**! 👋 Let's start fresh. I'm ready to answer any tricky engineering interview question, proofread your cover letter, or mock-test you on aptitude.`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to highlight code snippets inside responses
  const renderMessageContent = (content: string) => {
    // Basic Markdown Parser for Bold (**), List (-), Code blocks (```), and inline code (`)
    const paragraphs = content.split("\n");
    return paragraphs.map((para, pIdx) => {
      // Check for code blocks
      if (para.startsWith("```")) {
        return null; // Handle unified code render if blocks are matched
      }

      // Check for list items
      const isListItem = para.trim().startsWith("-") || para.trim().startsWith("*");
      let cleanPara = para;
      if (isListItem) {
        cleanPara = para.trim().substring(1).trim();
      }

      // Bold tag replacement
      const parts = cleanPara.split("`");
      const renderedParts = parts.map((part, index) => {
        const isCodeInline = index % 2 === 1;
        
        if (isCodeInline) {
          return (
            <code key={index} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-rose-500 font-mono text-xs font-bold border border-gray-200/40">
              {part}
            </code>
          );
        }

        // Support Bold text **
        const boldParts = part.split("**");
        return boldParts.map((subPart, bIndex) => {
          if (bIndex % 2 === 1) {
            return <strong key={bIndex} className="font-black text-gray-900 dark:text-white">{subPart}</strong>;
          }
          return subPart;
        });
      });

      if (isListItem) {
        return (
          <li key={pIdx} className="ml-4 list-disc text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-1">
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={pIdx} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2 break-words">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Sparkly GPT Launch Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl hover:scale-110 hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-white/20 animate-pulse-subtle"
        id="place-pilot-assistant-fab"
        title="Open Place Pilot GPT Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-spin-once" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-amber-300 animate-pulse" />
          </div>
        )}
      </button>

      {/* Slide-out Gemini ChatGPT style Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[480px] h-[70vh] min-h-[480px] max-h-[640px] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          id="place-pilot-chat-window"
        >
          {/* Header Panel */}
          <div className="p-4 bg-gradient-to-r from-gray-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wider uppercase font-sans">Place Pilot GPT</h4>
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">v3.5 Live</span>
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Powered by Gemini Intelligent Reasoning
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  speechEnabled ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-slate-800"
                }`}
                title={speechEnabled ? "Auto Voice Readout: On" : "Auto Voice Readout: Off"}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Wipe ChatGPT conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Bar */}
          <div className="px-4 py-1.5 bg-indigo-50/40 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-800 text-[10px] flex justify-between items-center shrink-0">
            <span className="font-mono text-gray-500 dark:text-gray-400 uppercase tracking-tight flex items-center gap-1">
              🎯 Active Context: <strong className="text-indigo-600 dark:text-indigo-400">{activeTab} screen</strong>
            </span>
            <span className="text-gray-400">ATS Profile Integrated</span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-slate-950/20 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Profile Pic/Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.role === "user" 
                    ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-black"
                    : "bg-indigo-600 border-indigo-700 text-white"
                }`}>
                  {msg.role === "user" ? user.name.charAt(0).toUpperCase() : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message bubble */}
                <div className="space-y-1.5">
                  <div className={`p-3.5 rounded-2xl relative group ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-800/80 rounded-tl-none shadow-xs"
                  }`}>
                    {/* Render message formatting */}
                    <div className={msg.role === "user" ? "text-xs leading-relaxed font-sans text-white" : ""}>
                      {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}
                    </div>

                    {/* Copy/Speak actions on hover for assistant messages */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <div className="absolute right-2 -bottom-2.5 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-lg p-0.5 shadow-xs transition-opacity duration-200">
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                          title="Copy text to clipboard"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => speakText(msg.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                          title="Read out loud"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-indigo-500" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono block px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* AI thinking state */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white animate-pulse">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce duration-500" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce duration-500" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce duration-500" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 animate-pulse">GPT Reasoning...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts footer bar (scrolling chips) */}
          {!isLoading && (
            <div className="px-4 py-2 bg-white dark:bg-gray-950 border-t border-gray-50 dark:border-slate-900 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none whitespace-nowrap">
              {getSuggestedPrompts().map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 cursor-pointer transition flex items-center gap-1"
                >
                  <span>{chip.icon}</span>
                  <span>{chip.text}</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-55" />
                </button>
              ))}
            </div>
          )}

          {/* User Input controls */}
          <div className="p-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 rounded-2xl px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"
            >
              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                title={isListening ? "Listening... Click to stop" : "Dictate your question with your voice"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything (e.g. 'How do I optimize SQL search?')"
                className="flex-1 bg-transparent border-0 outline-none text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:ring-0 py-1"
                disabled={isLoading}
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  inputValue.trim() && !isLoading
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                    : "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex justify-between items-center px-1.5 mt-1">
              <span className="text-[8px] text-gray-400">Shift+Enter to newline</span>
              <span className="text-[8px] text-gray-400 font-mono flex items-center gap-1">
                Ctrl+K triggers Voice <CornerDownLeft className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
