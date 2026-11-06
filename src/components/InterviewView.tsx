import React, { useState, useEffect, useRef } from "react";
import { User, InterviewQuestion } from "../types";
import { 
  Sparkles, Award, MessageSquare, ListTodo, ChevronRight, 
  Send, Save, HelpCircle, Star, Info, UserCheck, Settings,
  Lightbulb, CheckCircle2, RefreshCw, X, ChevronDown, Brain,
  TrendingUp, ShieldCheck, Activity, HelpCircle as QuestionIcon,
  Volume2, VolumeX, Mic, MicOff
} from "lucide-react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend, Tooltip 
} from "recharts";
import { QuickTipsPopover } from "./QuickTipsPopover";

interface InterviewViewProps {
  user: User;
  onGenerateQuestions: (role: string, skills: string) => Promise<InterviewQuestion[]>;
  onSendChatbotMessage: (messages: any[], userResponse: string, currentQuestion: string, audioAnalysis?: any) => Promise<{ feedback: string; rating: number; reply: string; clarity?: string; confidence?: string; suggestions?: string[]; vocalConfidence?: number | null; vocalClarity?: number | null; audioAnalysisFeedback?: string | null; audioAnalysis?: any }>;
  onSaveInterviewNotes: (notes: string, ratings: Record<string, number>) => Promise<void>;
  onGetInterviewTips: () => Promise<any>;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  user,
  onGenerateQuestions,
  onSendChatbotMessage,
  onSaveInterviewNotes,
  onGetInterviewTips,
}) => {
  const [role, setRole] = useState("Software Engineer");
  const [skills, setSkills] = useState(user.skills?.join(", ") || "React, SQL, Java");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  // Dynamic AI baseline calculation based on actual platform metrics
  const getInitialAiScores = () => {
    const baseTech = user.resumeAnalysis ? Math.min(5, 3 + (user.resumeAnalysis.atsScore - 60) / 20) : 3.5;
    const baseHr = user.skills && user.skills.length > 0 ? Math.min(5, 3 + user.skills.length * 0.2) : 3.2;
    const baseBehavioral = user.github || user.linkedin ? 3.8 : 3.0;
    return {
      technical: parseFloat(baseTech.toFixed(1)),
      hr: parseFloat(baseHr.toFixed(1)),
      behavioral: parseFloat(baseBehavioral.toFixed(1))
    };
  };

  // State-based AI assessment ratings matching categories (Technical, HR, Behavioral)
  const storageKey = `ai_ratings_${user.id}`;
  const [aiTechnicalRating, setAiTechnicalRating] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_tech`);
    return saved ? parseFloat(saved) : getInitialAiScores().technical;
  });
  const [aiHrRating, setAiHrRating] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_hr`);
    return saved ? parseFloat(saved) : getInitialAiScores().hr;
  });
  const [aiBehavioralRating, setAiBehavioralRating] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_behavioral`);
    return saved ? parseFloat(saved) : getInitialAiScores().behavioral;
  });
  const [activeCategory, setActiveCategory] = useState<string>("Technical");

  // Sync AI ratings to local storage
  useEffect(() => {
    localStorage.setItem(`${storageKey}_tech`, aiTechnicalRating.toString());
  }, [aiTechnicalRating, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_hr`, aiHrRating.toString());
  }, [aiHrRating, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_behavioral`, aiBehavioralRating.toString());
  }, [aiBehavioralRating, storageKey]);

  const handleResetAiRatings = () => {
    const baseline = getInitialAiScores();
    setAiTechnicalRating(baseline.technical);
    setAiHrRating(baseline.hr);
    setAiBehavioralRating(baseline.behavioral);
  };

  // Self Ratings
  const [techRating, setTechRating] = useState(user.resumeAnalysis ? 4 : 3);
  const [hrRating, setHrRating] = useState(3);
  const [behavioralRating, setBehavioralRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState("");

  // Audio playback / Web Speech API settings
  const [speakEnabled, setSpeakEnabled] = useState(() => {
    return localStorage.getItem("interview_speak_enabled") === "true";
  });
  const [speakRate, setSpeakRate] = useState(() => {
    return parseFloat(localStorage.getItem("interview_speak_rate") || "1.0");
  });
  const [speakVoice, setSpeakVoice] = useState(() => {
    return localStorage.getItem("interview_speak_voice") || "";
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Check if speaking is enabled in state/localStorage, or if Voice Mode is on
    const isEnabled = aiVoiceMode || localStorage.getItem("interview_speak_enabled") === "true" || speakEnabled;
    if (!isEnabled) return;

    // Clean up the text: remove brackets, markdown formatters, etc.
    const cleanedText = text
      .replace(/\[Category:.*?\]/g, "")
      .replace(/[*_#`~]/g, "")
      .replace(/AI Placement Interviewer:|Candidate \(You\):/gi, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    if (speakVoice) {
      const selectedVoice = voices.find(v => v.name === speakVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = speakRate;

    utterance.onend = () => {
      // Auto-trigger recording in voice mode once synthesis completes
      if (aiVoiceModeRef.current) {
        setTimeout(() => {
          startVoiceRecording();
        }, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when disabled
  const handleToggleSpeak = () => {
    const nextVal = !speakEnabled;
    setSpeakEnabled(nextVal);
    localStorage.setItem("interview_speak_enabled", String(nextVal));
    if (!nextVal && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Web Speech & Audio API voice recognition and analytics states
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const [aiVoiceMode, setAiVoiceMode] = useState(false);
  const aiVoiceModeRef = useRef(false);
  useEffect(() => {
    aiVoiceModeRef.current = aiVoiceMode;
  }, [aiVoiceMode]);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0); // volume bar bounce (0-100)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedVolumesRef = useRef<number[]>([]);
  const silenceSamplesCountRef = useRef<number>(0);
  const totalSamplesCountRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);
  const lastSoundTimeRef = useRef<number>(0);
  const [lastRecordingAnalysis, setLastRecordingAnalysis] = useState<any | null>(null);

  // Real-time sentiment analysis states & transcript reference
  const [realTimePositivity, setRealTimePositivity] = useState(60);
  const [realTimeEnergy, setRealTimeEnergy] = useState(30);
  const [sentimentLabel, setSentimentLabel] = useState("Calm & Balanced");
  const currentTranscriptRef = useRef("");

  const calculateRealTimeSentiment = (text: string, currentVol: number) => {
    if (!text) {
      const energyBase = Math.round(30 + (currentVol * 0.5));
      return {
        positivity: 60,
        energy: Math.min(100, Math.max(10, energyBase)),
        label: "Ready to Speak / Listening..."
      };
    }

    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    
    // Positive & Confident & Technical lexicons
    const positiveWords = [
      "agree", "benefit", "growth", "optimize", "passion", "success", "achieve", "team", "improve", 
      "solve", "collaborate", "confident", "learn", "excited", "love", "creative", "efficient", 
      "opportunity", "glad", "happy", "leadership", "goal", "scalable", "modular", "reliable", 
      "secure", "best", "great", "excellent", "definitely", "absolutely", "strong", "perfect", 
      "good", "indeed", "clear", "resolved", "dynamic", "effectively", "quality", "ensure",
      "support", "growth", "helpful", "forward", "progress", "together", "innovate", "value"
    ];

    const negativeWords = [
      "fail", "bad", "wrong", "hate", "hard", "difficult", "unable", "sorry", "error", "broken", 
      "issue", "worry", "struggle", "hesitate", "scared", "fear", "dunno", "don't know", "can't", 
      "cannot", "never", "nothing", "unfortunately", "terrible", "poor", "annoyed", "failed", 
      "useless", "flaw"
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, "");
      if (positiveWords.includes(cleanWord)) {
        positiveCount++;
      }
      if (negativeWords.includes(cleanWord)) {
        negativeCount++;
      }
    });

    // Score Positivity
    let positivity = 60;
    if (words.length > 0) {
      positivity = Math.round(65 + (positiveCount * 8) - (negativeCount * 12));
    }
    positivity = Math.min(100, Math.max(15, positivity));

    // Score Energy
    const elapsed = Math.max(1, (Date.now() - recordingStartTimeRef.current) / 1000);
    const speechRateWpm = Math.round((words.length / elapsed) * 60);

    const wpmRatio = Math.min(1.2, speechRateWpm / 130);
    const volumeRatio = Math.min(1.2, currentVol / 35);

    let energy = Math.round(25 + (volumeRatio * 40) + (wpmRatio * 35));
    energy = Math.min(100, Math.max(10, energy));

    // Determine semantic sentiment label
    let label = "Calm & Balanced";
    if (positivity >= 75 && energy >= 70) {
      label = "Dynamic & Enthusiastic";
    } else if (positivity >= 75 && energy < 70) {
      label = "Warm & Confident";
    } else if (positivity >= 55 && energy >= 75) {
      label = "Highly Energetic";
    } else if (positivity < 45 && energy >= 70) {
      label = "Assertive & Intense";
    } else if (positivity < 45 && energy < 45) {
      label = "Hesitant & Uncertain";
    } else if (positivity >= 45 && positivity < 55 && energy < 45) {
      label = "Soft-spoken & Thoughtful";
    } else if (positivity >= 45 && positivity < 55 && energy >= 45 && energy < 70) {
      label = "Measured & Analytical";
    } else if (positivity >= 70) {
      label = "Optimistic & Constructive";
    } else {
      label = "Steady & Focused";
    }

    return { positivity, energy, label };
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoiceRecording = async () => {
    if (isRecordingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingDuration(0);
      setVolumeLevel(0);
      recordedVolumesRef.current = [];
      silenceSamplesCountRef.current = 0;
      totalSamplesCountRef.current = 0;
      recordingStartTimeRef.current = Date.now();
      lastSoundTimeRef.current = Date.now();

      // Reset real-time sentiment states
      setRealTimePositivity(60);
      setRealTimeEnergy(30);
      setSentimentLabel("Ready to Speak / Listening...");
      currentTranscriptRef.current = "";

      // Initialize Web Audio API Analyser
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        setVolumeLevel(normalizedVol);

        // Record metrics for voice analysis
        recordedVolumesRef.current.push(average);
        totalSamplesCountRef.current += 1;
        if (average < 8) { // quiet volume threshold
          silenceSamplesCountRef.current += 1;
        }

        // Live sentiment and energy updates based on active audio stream parameters
        const sentiment = calculateRealTimeSentiment(currentTranscriptRef.current, normalizedVol);
        setRealTimePositivity(sentiment.positivity);
        setRealTimeEnergy(sentiment.energy);
        setSentimentLabel(sentiment.label);

        // Silence-based auto-submit for AI Voice Mode
        if (average >= 12) { // speaking/noise threshold
          lastSoundTimeRef.current = Date.now();
        } else if (currentTranscriptRef.current.trim().length > 0) {
          const silentElapsed = Date.now() - lastSoundTimeRef.current;
          if (aiVoiceModeRef.current && silentElapsed > 3500) { // 3.5 seconds of continuous silence after speaking
            console.log("Silence detected. Auto-submitting response...");
            lastSoundTimeRef.current = Date.now() + 999999; // avoid double submission
            handleSendChatResponse(currentTranscriptRef.current);
            return;
          }
        }

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateVolume);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        const lowerCombined = combined.toLowerCase();

        // Voice Command: Repeat Question
        if (lowerCombined.endsWith("repeat question") || lowerCombined.endsWith("voice command repeat") || lowerCombined.endsWith("say that again")) {
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (err) {}
          }
          speakText(chatQuestion);
          return;
        }

        // Voice Command: Clear Answer / Clear Response
        if (lowerCombined.endsWith("clear response") || lowerCombined.endsWith("clear answer") || lowerCombined.endsWith("voice command clear")) {
          finalTranscript = "";
          currentTranscriptRef.current = "";
          setChatResponse("");
          setSentimentLabel("🧹 Response Cleared!");
          lastSoundTimeRef.current = Date.now();
          return;
        }

        // Voice Command: Submit Answer / Submit Response
        if (lowerCombined.endsWith("submit answer") || lowerCombined.endsWith("submit response") || lowerCombined.endsWith("voice command submit")) {
          const stripped = combined
            .replace(/submit answer/gi, "")
            .replace(/submit response/gi, "")
            .replace(/voice command submit/gi, "")
            .trim();
          console.log("Voice Command: Submit Answer. Stripped content:", stripped);
          handleSendChatResponse(stripped);
          return;
        }

        currentTranscriptRef.current = combined;
        setChatResponse(combined);

        // Instant sentiment refresh upon incoming speech words
        const sentiment = calculateRealTimeSentiment(combined, volumeLevel);
        setRealTimePositivity(sentiment.positivity);
        setRealTimeEnergy(sentiment.energy);
        setSentimentLabel(sentiment.label);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
      };

      recognition.onend = () => {
        // Auto-restart if recording is still active
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      (window as any)._micStream = stream;
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    const stream = (window as any)._micStream;
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (window as any)._micStream = null;
    }

    // Process audio analytics metrics using synchronous transcript ref to avoid React stale closures
    const duration = Math.max(1.5, (Date.now() - recordingStartTimeRef.current) / 1000);
    const transcriptText = currentTranscriptRef.current.trim();
    const words = transcriptText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wpm = Math.round((wordCount / duration) * 60);

    // Count filler words
    const fillerWordsToCount = ["um", "uh", "ah", "like", "basically", "actually", "you know"];
    let fillerCount = 0;
    words.forEach(w => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, "");
      if (fillerWordsToCount.includes(cleanW)) {
        fillerCount++;
      }
    });
    
    // approximate "you know"
    const lowerText = transcriptText.toLowerCase();
    const youKnowMatches = (lowerText.match(/you know/g) || []).length;
    fillerCount += youKnowMatches;

    const volumes = recordedVolumesRef.current;
    const avgVol = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
    const variance = volumes.length > 0 
      ? volumes.reduce((sum, val) => sum + Math.pow(val - avgVol, 2), 0) / volumes.length 
      : 0;
    const stdDev = Math.sqrt(variance);

    const silenceRatio = totalSamplesCountRef.current > 0 
      ? silenceSamplesCountRef.current / totalSamplesCountRef.current 
      : 0;

    const audioAnalysis = {
      usedVoice: true,
      duration: duration,
      speechRate: wpm > 300 ? 135 : wpm,
      fillerWords: fillerCount,
      averageVolume: Math.min(100, Math.round((avgVol / 128) * 100)),
      volumeVariance: Math.min(50, Math.round(stdDev)),
      silenceRatio: parseFloat(silenceRatio.toFixed(3))
    };

    setLastRecordingAnalysis(audioAnalysis);
    return audioAnalysis;
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      if (aiVoiceMode) {
        handleSendChatResponse(currentTranscriptRef.current);
      } else {
        stopVoiceRecording();
      }
    } else {
      startVoiceRecording();
    }
  };

  // Chatbot active mock simulation
  const [chatbotActive, setChatbotActive] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatHistory, setChatHistory] = useState<{ 
    role: 'interviewer' | 'candidate'; 
    text: string; 
    rating?: number; 
    feedback?: string;
    clarity?: string;
    confidence?: string;
    suggestions?: string[];
    vocalConfidence?: number | null;
    vocalClarity?: number | null;
    audioAnalysisFeedback?: string | null;
    audioAnalysis?: any;
    realTimeSentiment?: {
      positivity: number;
      energy: number;
      label: string;
    };
  }[]>([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const qs = await onGenerateQuestions(role, skills);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesFeedback("");
    try {
      await onSaveInterviewNotes(notes, {
        technical: techRating,
        hr: hrRating,
        behavioral: behavioralRating
      });
      setNotesFeedback("Self-ratings and notes logged successfully!");
    } catch (e) {
      setNotesFeedback("Failed to save evaluation notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const startMockSimulation = (questionText: string) => {
    // Determine the category of the selected question
    const matchedQ = questions.find(q => q.question === questionText);
    const category = matchedQ ? matchedQ.category : "Technical";
    setActiveCategory(category);

    setChatQuestion(questionText);
    const startMsg = `Hello ${user.name}! Let's begin the mock interview session. Here is your question: ${questionText}`;
    setChatHistory([
      { role: 'interviewer', text: `Hello ${user.name}! Let's begin the mock interview session [Category: ${category}]. Here is your question:\n\n"${questionText}"\n\nPlease formulate your answer below.` }
    ]);
    setChatbotActive(true);
    setChatResponse("");

    // Speak initial prompt
    setTimeout(() => {
      speakText(startMsg);
    }, 150);
  };

  const handleSendChatResponse = async (overrideText?: string, forcedAnalysis?: any) => {
    // Stop recording first if they send while active
    let currentAnalysis = forcedAnalysis;
    if (isRecordingRef.current) {
      const analysis = stopVoiceRecording();
      if (!currentAnalysis) {
        currentAnalysis = analysis;
      }
    }

    const finalMsg = (overrideText || chatResponse).trim();
    if (!finalMsg) return;
    
    const candidateMsg = finalMsg;
    
    // Capture final sentiment values for this response session
    const finalSentiment = {
      positivity: realTimePositivity,
      energy: realTimeEnergy,
      label: sentimentLabel
    };

    setChatHistory(prev => [
      ...prev, 
      { 
        role: 'candidate', 
        text: candidateMsg,
        realTimeSentiment: finalSentiment
      }
    ]);
    
    // Reset sentiment states for the next turn
    setRealTimePositivity(60);
    setRealTimeEnergy(30);
    setSentimentLabel("Calm & Balanced");
    currentTranscriptRef.current = "";

    setChatResponse("");
    setChatbotLoading(true);

    // Capture the voice parameters for this answer
    if (!currentAnalysis) {
      currentAnalysis = lastRecordingAnalysis;
    }
    setLastRecordingAnalysis(null);

    try {
      // API call to Express with context
      const formattedHistory = chatHistory.map(c => ({
        role: c.role === 'interviewer' ? 'model' : 'user',
        parts: [{ text: c.text }]
      }));

      const res = await onSendChatbotMessage(formattedHistory, candidateMsg, chatQuestion, currentAnalysis);
      
      setChatHistory(prev => [
        ...prev,
        { 
          role: 'interviewer', 
          text: res.reply,
          rating: res.rating,
          feedback: res.feedback,
          clarity: res.clarity,
          confidence: res.confidence,
          suggestions: res.suggestions,
          vocalConfidence: res.vocalConfidence,
          vocalClarity: res.vocalClarity,
          audioAnalysisFeedback: res.audioAnalysisFeedback,
          audioAnalysis: res.audioAnalysis || currentAnalysis
        }
      ]);

      // Dynamically update the AI assessment score based on category
      if (res.rating) {
        const parsedRating = Number(res.rating) || 3;
        if (activeCategory === "Technical" || activeCategory === "System Design") {
          setAiTechnicalRating(prev => parseFloat(((prev * 0.6) + (parsedRating * 0.4)).toFixed(1)));
        } else if (activeCategory === "HR") {
          setAiHrRating(prev => parseFloat(((prev * 0.6) + (parsedRating * 0.4)).toFixed(1)));
        } else if (activeCategory === "Behavioral") {
          setAiBehavioralRating(prev => parseFloat(((prev * 0.6) + (parsedRating * 0.4)).toFixed(1)));
        }
      }

      // Set the next question in focus
      setChatQuestion(res.reply);
      setTimeout(() => {
        speakText(res.reply);
      }, 100);
    } catch (e) {
      // Fallback response and evaluation trigger
      const fallbackMsg = "Excellent answer. Now, could you walk me through your latest engineering project?";
      
      const simulatedVocalConfidence = currentAnalysis 
        ? Math.min(100, Math.max(50, Math.round(95 - (currentAnalysis.fillerWords * 5) - (currentAnalysis.silenceRatio * 60))))
        : null;

      const simulatedVocalClarity = currentAnalysis
        ? Math.min(100, Math.max(45, Math.round(98 - (currentAnalysis.fillerWords * 7) - (currentAnalysis.silenceRatio * 70))))
        : null;

      const simulatedFeedback = currentAnalysis
        ? `Speaking at ${currentAnalysis.speechRate} WPM was very clear. Avoided pauses mostly, but detected ${currentAnalysis.fillerWords} vocal filler words (e.g. um/like).`
        : null;

      setChatHistory(prev => [
        ...prev,
        {
          role: 'interviewer',
          text: fallbackMsg,
          rating: 4,
          feedback: "Great terminology. Ensure explaining optimization parameters clearly.",
          clarity: "Your explanation was structurally clear and logically sequenced.",
          confidence: "You write with solid technical posture and authoritative phrasing.",
          suggestions: [
            "Outline key metrics and performance numbers to solidify the impact of your technical work.",
            "List specific structural trade-offs of the chosen engineering design."
          ],
          vocalConfidence: simulatedVocalConfidence,
          vocalClarity: simulatedVocalClarity,
          audioAnalysisFeedback: simulatedFeedback,
          audioAnalysis: currentAnalysis
        }
      ]);

      // Fallback response rating update
      if (activeCategory === "Technical" || activeCategory === "System Design") {
        setAiTechnicalRating(prev => parseFloat(((prev * 0.6) + (4 * 0.4)).toFixed(1)));
      } else if (activeCategory === "HR") {
        setAiHrRating(prev => parseFloat(((prev * 0.6) + (4 * 0.4)).toFixed(1)));
      } else if (activeCategory === "Behavioral") {
        setAiBehavioralRating(prev => parseFloat(((prev * 0.6) + (4 * 0.4)).toFixed(1)));
      }
      
      setTimeout(() => {
        speakText(fallbackMsg);
      }, 100);
    } finally {
      setChatbotLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="interview-view">
      {/* Header with AI Quick Tips Popover */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" /> AI Mock Interview Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Conduct live voice & text mock sessions, generate domain-specific questions, and evaluate self readiness scores.</p>
        </div>

        {/* AI Coaching Tips Popover Component */}
        <QuickTipsPopover user={user} onGetInterviewTips={onGetInterviewTips} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Generator and Questions */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Generator Settings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Dynamic Placement Question Generator
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Target Role</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  placeholder="E.g. Frontend developer, ML Engineer..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Primary Skills Filter</label>
                <input 
                  type="text" 
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  placeholder="React, SQL, Java"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {generating ? "Generating Placement Questions..." : "Generate Custom Questions"}
              </button>
            </div>
          </div>

          {/* Question List display */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Generated Target Questions</h3>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No custom questions generated yet. Set your target role and skills, and click generate to populate tailored campus drive questions.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                          {q.category}
                        </span>
                        <h4 className="text-xs font-bold text-gray-950 dark:text-white mt-1">Q. {q.question}</h4>
                      </div>
                    </div>

                    <details className="text-xs text-gray-500 bg-white dark:bg-gray-950/40 p-3 rounded-lg border border-gray-100/20 cursor-pointer">
                      <summary className="font-semibold text-gray-400 outline-none select-none">Show Recommended Core Keypoints</summary>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">{q.sampleAnswer}</p>
                    </details>

                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => startMockSimulation(q.question)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950/20 dark:text-blue-400 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        Launch Mock Chatbot Simulator <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chatbot Simulator & Self-Ratings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Interview Chatbot */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between min-h-[580px] h-[580px]">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3" id="ai-chatbot-header">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-500 animate-pulse" /> Live AI Interview Chatbot
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Mute/Unmute quick toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    id="speech-toggle-quick-btn"
                    className={`p-1.5 rounded-lg transition duration-150 cursor-pointer ${
                      speakEnabled 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100" 
                        : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={speakEnabled ? "Disable AI voice playback" : "Enable AI voice playback"}
                  >
                    {speakEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  {/* Settings toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAudioSettings(!showAudioSettings)}
                    id="speech-settings-toggle-btn"
                    className={`p-1.5 rounded-lg transition duration-150 cursor-pointer ${
                      showAudioSettings 
                        ? "bg-indigo-600 text-white" 
                        : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200"
                    }`}
                    title="AI Speech & Audio Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </h2>

              {/* Collapsible Audio / Speech Synthesis Settings */}
              {showAudioSettings && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 my-2 text-[11px]" id="ai-chatbot-audio-settings">
                  <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/50 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200">AI Speech Configuration</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAudioSettings(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Toggle Option */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Read Aloud Interviewer Reply</span>
                    <button
                      type="button"
                      onClick={handleToggleSpeak}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        speakEnabled ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      id="speech-enabled-settings-switch"
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          speakEnabled ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Voice Selector */}
                  <div className="space-y-1">
                    <label className="block text-[9px] text-gray-400 font-mono uppercase font-semibold">Select Interviewer Voice</label>
                    {voices.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">No custom system voices detected. Falling back to default system voice.</p>
                    ) : (
                      <select
                        value={speakVoice}
                        onChange={(e) => {
                          setSpeakVoice(e.target.value);
                          localStorage.setItem("interview_speak_voice", e.target.value);
                        }}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Default System Voice</option>
                        {voices
                          .filter(v => v.lang.toLowerCase().includes("en")) // Only English voices for best accent
                          .map((voice, index) => (
                            <option key={index} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Speech Rate (Speed Slider) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono uppercase font-semibold">
                      <span>Interviewer Speed</span>
                      <span>{speakRate}x</span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={speakRate}
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value);
                        setSpeakRate(rate);
                        localStorage.setItem("interview_speak_rate", String(rate));
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Play Sample Response Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => speakText("This is a voice preview. I will be your interviewer today. Best of luck!")}
                      disabled={!speakEnabled}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-150/10 transition cursor-pointer disabled:opacity-40"
                    >
                      🗣️ Play Audio Preview
                    </button>
                  </div>
                </div>
              )}

              {!chatbotActive ? (
                <div className="text-center py-20 text-gray-400 text-xs flex flex-col items-center justify-center space-y-2 h-[300px]">
                  <Award className="w-10 h-10 text-gray-300" />
                  <p className="max-w-xs mx-auto">Click "Launch Mock Chatbot" below any generated question above, or input a default question below to begin simulating placement interviews.</p>
                  <button 
                    onClick={() => startMockSimulation("Walk me through your engineering career. Why do you choose software engineering?")}
                    className="mt-3 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-xl font-semibold text-[11px]"
                  >
                    Start with Default Question
                  </button>
                </div>
              ) : (
                /* Chat Scroll Container */
                <div className="space-y-3">
                  {/* AI Voice Mode Toggle Banner */}
                  <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 dark:bg-slate-900/60 rounded-xl border border-indigo-100/10 text-xs shadow-xs animate-fade-in" id="ai-voice-mode-banner">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${aiVoiceMode ? "bg-indigo-600 text-white animate-pulse" : "bg-gray-100 dark:bg-slate-800 text-gray-400"}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          AI Voice Mode
                          {aiVoiceMode && <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-0.5 font-bold animate-pulse">● LIVE (Hands-Free)</span>}
                        </p>
                        <p className="text-[10px] text-gray-400">Continuous speech-to-text with auto-speak & auto-submit on pause</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !aiVoiceMode;
                        setAiVoiceMode(nextVal);
                        if (nextVal) {
                          setSpeakEnabled(true);
                          localStorage.setItem("interview_speak_enabled", "true");
                          if (chatbotActive && typeof window !== "undefined" && !window.speechSynthesis.speaking) {
                            startVoiceRecording();
                          }
                        } else {
                          if (isRecording) {
                            stopVoiceRecording();
                          }
                          if (typeof window !== "undefined" && "speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                          }
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        aiVoiceMode ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      id="ai-voice-mode-toggle"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          aiVoiceMode ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Spoken Voice Commands Helper Badge */}
                  <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-800/60 rounded-xl flex flex-wrap gap-1.5 justify-center items-center text-[9px] font-mono text-gray-500 dark:text-gray-400 shadow-xs animate-fade-in" id="spoken-voice-commands-strip">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">🎙️ Say:</span>
                    <span className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/80 rounded-md text-gray-700 dark:text-gray-300 font-bold">"submit answer"</span>
                    <span className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/80 rounded-md text-gray-700 dark:text-gray-300 font-bold">"clear response"</span>
                    <span className="px-1 py-0.5 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/80 rounded-md text-gray-700 dark:text-gray-300 font-bold">"repeat question"</span>
                  </div>

                  <div className={`space-y-4 ${showAudioSettings ? "h-[100px]" : "h-[240px]"} overflow-y-auto pr-1 pt-1`}>
                    {chatHistory.map((ch, idx) => (
                    <div key={idx} className={`space-y-1 max-w-[85%] ${ch.role === 'candidate' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                      <span className="text-[9px] font-bold font-mono text-gray-400 block uppercase">
                        {ch.role === 'interviewer' ? 'AI Placement Interviewer' : 'Candidate (You)'}
                      </span>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        ch.role === 'candidate' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100/10'
                      }`}>
                        {ch.text}
                      </div>

                      {ch.role === 'candidate' && ch.realTimeSentiment && (
                        <div className="mt-1 flex flex-wrap justify-end items-center gap-1.5 text-[9px] font-mono text-gray-500">
                          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100/10 flex items-center gap-1 font-bold">
                            <span>🎙️ Sentiment: {ch.realTimeSentiment.label}</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100/10">
                            Positivity: <span className="font-bold">{ch.realTimeSentiment.positivity}%</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-md border border-amber-100/10">
                            Energy: <span className="font-bold">{ch.realTimeSentiment.energy}%</span>
                          </span>
                        </div>
                      )}

                      {/* feedback display if interviewer sends diagnostic feedback */}
                      {ch.role === 'interviewer' && ch.feedback && (
                        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/30 text-[10px] text-indigo-800 dark:text-indigo-300 mt-1.5 space-y-2.5 text-left shadow-xs">
                          <div className="flex justify-between items-center border-b border-indigo-100/20 pb-1.5">
                            <p className="font-bold flex items-center gap-1 font-mono text-[11px] text-indigo-900 dark:text-indigo-200">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> 
                              Evaluation Score: {ch.rating}/5
                            </p>
                            <span className="text-[9px] font-bold font-mono bg-indigo-100/50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              AI Diagnostic
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="font-bold text-indigo-950 dark:text-indigo-100">Strengths & Core Assessment</p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{ch.feedback}</p>
                          </div>

                          {ch.clarity && (
                            <div className="space-y-1">
                              <p className="font-bold text-indigo-950 dark:text-indigo-100">Communication Clarity</p>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{ch.clarity}</p>
                            </div>
                          )}

                          {ch.confidence && (
                            <div className="space-y-1">
                              <p className="font-bold text-indigo-950 dark:text-indigo-100">Posture & Confidence</p>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{ch.confidence}</p>
                            </div>
                          )}

                          {ch.suggestions && ch.suggestions.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-indigo-100/10">
                              <p className="font-bold text-indigo-950 dark:text-indigo-100">Suggestions for Improvement</p>
                              <ul className="list-disc pl-3.5 space-y-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {ch.suggestions.map((sug, sIdx) => (
                                  <li key={sIdx}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* AI Voice & Audio Analysis (Web Speech API) */}
                          {ch.vocalConfidence !== undefined && ch.vocalConfidence !== null ? (
                            <div className="mt-3 pt-2.5 border-t border-indigo-100/15 space-y-2.5" id="voice-analysis-dashboard">
                              <p className="font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider">
                                🎙️ AI Vocal Diagnostics
                              </p>
                              
                              <div className="grid grid-cols-2 gap-3">
                                {/* Vocal Confidence Meter */}
                                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-indigo-100/5 space-y-1">
                                  <div className="flex justify-between items-center text-[9px] font-mono font-semibold">
                                    <span className="text-indigo-600 dark:text-indigo-400">Vocal Confidence</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-bold">{ch.vocalConfidence}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${ch.vocalConfidence}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Vocal Clarity Meter */}
                                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-indigo-100/5 space-y-1">
                                  <div className="flex justify-between items-center text-[9px] font-mono font-semibold">
                                    <span className="text-indigo-600 dark:text-indigo-400">Vocal Clarity</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-bold">{ch.vocalClarity}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${ch.vocalClarity}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Measured Audio Telemetry */}
                              {ch.audioAnalysis && (
                                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
                                  <div className="px-1.5 py-1 bg-white/30 dark:bg-black/10 rounded-lg text-center border border-indigo-100/5">
                                    <span className="block text-[8px] uppercase tracking-tight text-gray-400">Speech Speed</span>
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200">{ch.audioAnalysis.speechRate} WPM</span>
                                  </div>
                                  <div className="px-1.5 py-1 bg-white/30 dark:bg-black/10 rounded-lg text-center border border-indigo-100/5">
                                    <span className="block text-[8px] uppercase tracking-tight text-gray-400">Filler Words</span>
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200">{ch.audioAnalysis.fillerWords} count</span>
                                  </div>
                                  <div className="px-1.5 py-1 bg-white/30 dark:bg-black/10 rounded-lg text-center border border-indigo-100/5">
                                    <span className="block text-[8px] uppercase tracking-tight text-gray-400">Vocal Power</span>
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200">{ch.audioAnalysis.averageVolume}%</span>
                                  </div>
                                </div>
                              )}

                              {ch.audioAnalysisFeedback && (
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic bg-indigo-50/40 dark:bg-indigo-950/20 p-2 rounded-xl text-[9px] border border-indigo-100/10">
                                  {ch.audioAnalysisFeedback}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2.5 pt-2 border-t border-indigo-100/10 text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-1 leading-snug">
                              <span>💡 Speech analytics offline. Respond with your voice using the 🎤 microphone button next time to unlock real-time vocal feedback!</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {chatbotLoading && (
                    <div className="text-left text-xs font-mono text-gray-400 animate-pulse">
                      Interviewer is analyzing your response and formulating feedback...
                    </div>
                  )}
                </div>
                </div>
              )}
            </div>

            {/* Message input */}
            {chatbotActive && (
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                {/* Real-time Sentiment & Vocal Diagnostics Gauge Panel */}
                <div className="p-3 bg-indigo-50/30 dark:bg-slate-900/40 border border-indigo-100/10 rounded-xl space-y-2 animate-fade-in" id="sentiment-analysis-live-gauge">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold font-mono text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 ${isRecording ? "" : "hidden"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecording ? "bg-emerald-500" : "bg-indigo-400"}`}></span>
                      </span>
                      {isRecording ? "LIVE SPEECH SENTIMENT DIAGNOSTICS" : "REAL-TIME SPEECH SENTIMENT GAUGE"}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide transition ${
                      isRecording 
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 animate-pulse" 
                        : "bg-gray-105 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {sentimentLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Positivity Level Gauge */}
                    <div className="space-y-1 p-2 bg-white/40 dark:bg-black/10 rounded-xl border border-indigo-100/5">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-gray-500 dark:text-gray-400">Positivity Index</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{realTimePositivity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500 transition-all duration-300" 
                          style={{ width: `${realTimePositivity}%` }}
                        />
                      </div>
                      <div className="text-[8px] text-gray-400 flex justify-between">
                        <span>analytical</span>
                        <span>optimistic</span>
                      </div>
                    </div>

                    {/* Vocal Energy Level Gauge */}
                    <div className="space-y-1 p-2 bg-white/40 dark:bg-black/10 rounded-xl border border-indigo-100/5">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-gray-500 dark:text-gray-400">Speech Energy</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{realTimeEnergy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 transition-all duration-300" 
                          style={{ width: `${realTimeEnergy}%` }}
                        />
                      </div>
                      <div className="text-[8px] text-gray-400 flex justify-between">
                        <span>thoughtful</span>
                        <span>passionate</span>
                      </div>
                    </div>
                  </div>

                  {isRecording && (
                    <p className="text-[8.5px] text-gray-400 font-mono text-center leading-normal italic animate-pulse">
                      {realTimePositivity > 70 
                        ? "✨ Brilliant constructive tone! Keep using positive technical verbs to project leadership." 
                        : realTimeEnergy > 70 
                        ? "🔥 Tremendous voice drive and tempo! Ensure you state key technical parameters clearly." 
                        : "💡 Speak clearly using key verbs like 'optimize', 'collaborate', and 'deliver' to tune the sentiment index."}
                    </p>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-100/30 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-mono animate-fade-in" id="voice-recording-wave-visualizer">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="font-bold">RECORDING YOUR VOICE...</span>
                      <span className="opacity-80">({recordingDuration}s)</span>
                    </div>
                    
                    {/* Glowing dynamic frequency bars */}
                    <div className="flex items-end gap-0.5 h-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                        const randomOffset = Math.sin(bar * 0.8) * 4;
                        const calculatedHeight = Math.max(3, Math.min(16, (volumeLevel / 100) * 16 + randomOffset));
                        return (
                          <div 
                            key={bar} 
                            className="w-0.5 bg-red-500 dark:bg-red-400 rounded-t-sm transition-all duration-75"
                            style={{ height: `${calculatedHeight}px` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={chatResponse}
                    onChange={e => setChatResponse(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChatResponse(); }}
                    disabled={chatbotLoading}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    placeholder={isRecording ? "Listening to your speech... (transcribing in real-time)" : "Formulate your response and click send..."}
                  />
                  <button
                    type="button"
                    onClick={handleToggleRecord}
                    disabled={chatbotLoading}
                    id="mic-recording-btn"
                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                      isRecording 
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
                    }`}
                    title={isRecording ? "Stop recording voice answer" : "Speak your answer (Speech-to-Text)"}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleSendChatResponse()}
                    disabled={chatbotLoading || (!chatResponse.trim() && !isRecording)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Placement Performance Analytics (Radar Chart Card) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700/50 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-500 animate-pulse" /> AI Performance Radar
                </h2>
                <p className="text-[10px] text-gray-400">Comparing dynamic AI mock assessment vs. your self-ratings</p>
              </div>
              <button 
                onClick={handleResetAiRatings}
                className="text-[10px] text-gray-400 hover:text-rose-500 font-bold flex items-center gap-1 transition cursor-pointer"
                title="Recalibrate scores to profile baseline"
              >
                <RefreshCw className="w-3 h-3" /> Reset AI
              </button>
            </div>

            {/* Radar Chart Display */}
            <div className="h-60 w-full -my-2 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                  { subject: "Technical", "Self-Rating": techRating, "AI-Assessment": aiTechnicalRating, fullMark: 5 },
                  { subject: "HR & Communications", "Self-Rating": hrRating, "AI-Assessment": aiHrRating, fullMark: 5 },
                  { subject: "Behavioral", "Self-Rating": behavioralRating, "AI-Assessment": aiBehavioralRating, fullMark: 5 },
                ]}>
                  <PolarGrid stroke="rgba(156, 163, 175, 0.15)" />
                  <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} fontWeight="medium" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#9CA3AF" fontSize={8} />
                  <Radar name="Self Rating" dataKey="Self-Rating" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                  <Radar name="AI Assessment" dataKey="AI-Assessment" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                      borderRadius: '8px', 
                      borderColor: '#4B5563',
                      fontSize: '11px',
                      color: '#fff'
                    }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Smart Insights */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> AI Insights & Gap Analysis
              </p>
              
              <div className="space-y-2 text-xs leading-relaxed">
                {/* Technical check */}
                {Math.abs(aiTechnicalRating - techRating) > 0.5 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/20 text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-amber-700 dark:text-amber-400">Technical Gap: </span>
                    {aiTechnicalRating > techRating 
                      ? "The AI detects strong core problem-solving capacity. Speak with higher self-conviction during technical inquiries."
                      : "Your self-rating is higher than AI indicators show. Revise DSA complexities and trace your codes carefully."
                    }
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/20 text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Technical Aligned: </span>
                    Your Technical self-evaluation matches your mock results perfectly. Great realism!
                  </div>
                )}

                {/* Behavioral check */}
                {Math.abs(aiBehavioralRating - behavioralRating) > 0.5 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/20 text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-amber-700 dark:text-amber-400">Behavioral Gap: </span>
                    {aiBehavioralRating > behavioralRating
                      ? "AI results show excellent leadership potential in your STAR stories. Avoid underselling your teamwork efforts!"
                      : "Improve STAR structure alignment. Make sure to clearly separate Situation, Task, Action, and Quantitative Result."
                    }
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/20 text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Behavioral Aligned: </span>
                    Your STAR method application is well-grounded and highly balanced.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Self Ratings Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-3">
              <Star className="w-4 h-4 text-blue-600" /> Self evaluation Notes
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-500 font-mono">
                  <span>Technical Skills</span>
                  <span>{techRating} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={techRating} 
                  onChange={e => setTechRating(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-500 font-mono">
                  <span>HR & Conversation</span>
                  <span>{hrRating} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={hrRating} 
                  onChange={e => setHrRating(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-500 font-mono">
                  <span>Behavioral (STAR method)</span>
                  <span>{behavioralRating} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={behavioralRating} 
                  onChange={e => setBehavioralRating(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-mono">Notes from mock preparation sessions</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  placeholder="Add notes, weaknesses identified, or specific areas to revise..."
                />
              </div>

              {notesFeedback && (
                <p className="text-xs text-center text-emerald-600 font-semibold">{notesFeedback}</p>
              )}

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {savingNotes ? "Saving..." : "Save Self-Ratings"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
