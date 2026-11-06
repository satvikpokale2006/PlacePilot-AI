import React, { useState } from "react";
import { User } from "../types";
import { 
  User as UserIcon, Mail, Clock, MapPin, Phone, Award, 
  Calendar, Send, CheckCircle2, Star, Sparkles, BookOpen 
} from "lucide-react";
import { QuickEmailModal } from "./QuickEmailModal";

interface AcademicMentorsViewProps {
  user: User;
  onAddTask?: (title: string) => Promise<void>;
}

interface Mentor {
  name: string;
  role: string;
  email: string;
  phone: string;
  officeHours: string;
  cabin: string;
  department: string;
  specialties: string[];
  bio: string;
}

// Pre-defined academic mentors mapped by academic departments
const DEPT_MENTORS: Record<string, Mentor> = {
  "Artificial Intelligence and Machine Learning": {
    name: "Dr. Rajesh Kulkarni",
    role: "Associate Professor & Head of AI Lab",
    email: "rajesh.kulkarni@placement.edu",
    phone: "+91 98230 45671",
    officeHours: "Mon, Wed — 2:00 PM to 4:00 PM",
    cabin: "AI Research Center, Block C-302",
    department: "Artificial Intelligence and Machine Learning",
    specialties: ["Deep Learning Models", "Industry Capstone Drills", "Resume ATS Alignment"],
    bio: "Dr. Kulkarni has over 15 years of research experience and specializes in helping students transition into ML Engineering roles with customized portfolio reviews."
  },
  "CSE(DS)": {
    name: "Prof. Sunita Sharma",
    role: "Assistant Professor (Data Science Core)",
    email: "sunita.sharma@placement.edu",
    phone: "+91 98112 33445",
    officeHours: "Tue, Thu — 10:00 AM to 12:00 PM",
    cabin: "Data Science Lab, Block A-104",
    department: "CSE(DS)",
    specialties: ["SQL Database Optimization", "Python Analytics", "Mock HR Interviews"],
    bio: "Prof. Sunita connects student profiles directly with data analytics recruiters and guides DS portfolios for tier-1 corporate placement drives."
  },
  "Civil Engineering": {
    name: "Dr. Amit Patil",
    role: "Professor & Structural Consultant",
    email: "amit.patil@placement.edu",
    phone: "+91 97554 11223",
    officeHours: "Wed, Fri — 3:00 PM to 5:00 PM",
    cabin: "Structural Dynamics Lab, Block B-12",
    department: "Civil Engineering",
    specialties: ["Infrastructure Tech Solutions", "Govt Sector Placement", "Public Speaking"],
    bio: "Dr. Patil advises civil engineering aspirants on core industrial placements, structural design portfolios, and enterprise project interviews."
  },
  "Artificial Intelligence and Data Science": {
    name: "Dr. Vikram Malhotra",
    role: "Senior AI Strategist & Placement Advisor",
    email: "vikram.malhotra@placement.edu",
    phone: "+91 99334 55667",
    officeHours: "Mon, Fri — 11:00 AM to 1:00 PM",
    cabin: "Intelligence Center, Block C-308",
    department: "Artificial Intelligence and Data Science",
    specialties: ["Data Engineering Pipelines", "Predictive Analytics", "Product Management Core"],
    bio: "Dr. Vikram bridges the gap between raw data analysis and AI orchestration. He offers regular portfolio tuning sessions for competitive tech drives."
  },
  "Data Science": {
    name: "Prof. Megha Deshmukh",
    role: "Lecturer & Corporate Liaison",
    email: "megha.deshmukh@placement.edu",
    phone: "+91 96445 77889",
    officeHours: "Tue, Fri — 2:00 PM to 4:00 PM",
    cabin: "Computational Stats Lab, Block A-112",
    department: "Data Science",
    specialties: ["Statistical Modeling", "Big Data Architectures", "Behavioral Interview Prep"],
    bio: "With her industrial ties in banking and fintech analytics, Prof. Megha provides structured paths for aspiring quantitative and data analysts."
  },
  "Mechanical Engineering": {
    name: "Dr. Sanjay Joshi",
    role: "Professor (CAD/CAM Dynamics)",
    email: "sanjay.joshi@placement.edu",
    phone: "+91 98332 99110",
    officeHours: "Mon, Thu — 3:00 PM to 5:00 PM",
    cabin: "Thermodynamics Lab, Block B-105",
    department: "Mechanical Engineering",
    specialties: ["Automotive Tech Design", "Core R&D Placements", "LinkedIn Networking"],
    bio: "Dr. Joshi guides students aiming for core automotive, aerospace, and heavy industry positions, coordinating mock technical panel drills."
  },
  "Computer Engineering": {
    name: "Dr. Ananya Iyer",
    role: "Dean of Computer Studies",
    email: "ananya.iyer@placement.edu",
    phone: "+91 99001 22334",
    officeHours: "Wed, Thu — 1:00 PM to 3:00 PM",
    cabin: "Main Computing Hub, Block A-202",
    department: "Computer Engineering",
    specialties: ["Full Stack Engineering", "Competitive Coding Strategy", "System Design Panels"],
    bio: "Dr. Iyer works extensively with student coders to prepare them for FAANG mock rounds, prioritizing elegant algorithms and clean system architectures."
  },
  "Electronic and Telecommunication Engineering (EXTC)": {
    name: "Prof. Nilesh Mehta",
    role: "Lead Coordinator for VLSI & Embedded",
    email: "nilesh.mehta@placement.edu",
    phone: "+91 95004 88776",
    officeHours: "Tue, Wed — 11:00 AM to 1:00 PM",
    cabin: "Telecom & Signal Lab, Block C-101",
    department: "Electronic and Telecommunication Engineering (EXTC)",
    specialties: ["VLSI Circuits & Embedded Systems", "IoT Protocols", "General HR Assessment"],
    bio: "Prof. Mehta mentors EXTC graduates on firmware development paths, telecom networks, and hardware co-design placement portfolios."
  }
};

// Default fallback mentor
const DEFAULT_MENTOR: Mentor = {
  name: "Prof. Rajeshwari Nair",
  role: "Chief Placement Counselor",
  email: "rajeshwari.nair@placement.edu",
  phone: "+91 98980 12345",
  officeHours: "Daily — 4:00 PM to 5:00 PM",
  cabin: "Main Placement Cell, Admin Building 2F",
  department: "General Placement & Career Advisory",
  specialties: ["Resume Branding", "Behavioral Strategies", "Mock HR Panels"],
  bio: "Prof. Nair handles general placement preparedness, soft skill training, and career alignment for students across all engineering branches."
};

export const AcademicMentorsView: React.FC<AcademicMentorsViewProps> = ({ user, onAddTask }) => {
  const dept = user.department || "";
  const mentor = DEPT_MENTORS[dept] || DEFAULT_MENTOR;

  // Form states
  const [sessionType, setSessionType] = useState("Resume Review");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Quick message state
  const [quickMsg, setQuickMsg] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  // Quick Email Template modal state
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleRequestSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate || !preferredTime) return;
    setLoading(true);

    // Mock API trigger
    setTimeout(async () => {
      setLoading(false);
      setSubmitted(true);
      
      // Auto register a planner task for the student
      if (onAddTask) {
        try {
          await onAddTask(`Academic Mentorship Session (${sessionType}) with ${mentor.name} on ${preferredDate}`);
        } catch (err) {
          console.error("Auto task registry failed", err);
        }
      }
    }, 900);
  };

  const handleSendQuickMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMsgSent(true);
      setQuickMsg("");
      setTimeout(() => setMsgSent(false), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Academic Mentorship
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Get personalized guidance from your department's expert faculty placement mentor.
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          {dept ? "Department Assigned" : "General Assignment"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Mentor Details card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 shadow-xs relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar placeholder with initials */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-sm relative shrink-0">
                {mentor.name.split(" ").map(n => n[0]).join("")}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Active placement guidance">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 w-full">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                    Assigned Placement Mentor
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(true)}
                    id="quick-email-mentor-top-btn"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 py-1 rounded-xl shadow-xs transition duration-150 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Quick Email Coach</span>
                  </button>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{mentor.name}</h2>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">{mentor.role}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono italic">{mentor.department}</p>
              </div>
            </div>

            {/* Profile Bio */}
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800/80">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                {mentor.bio}
              </p>
            </div>

            {/* Grid of Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 text-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold font-mono uppercase">Email Address</p>
                    <div className="flex flex-col items-start gap-1">
                      <a href={`mailto:${mentor.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium block">{mentor.email}</a>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        id="quick-email-mentor-link-btn"
                        className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100/20 transition cursor-pointer"
                      >
                        <Mail className="w-2.5 h-2.5" />
                        <span>Pre-filled Template</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold font-mono uppercase">Direct Hotline</p>
                    <p className="font-medium font-mono">{mentor.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold font-mono uppercase">Office Hours</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{mentor.officeHours}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold font-mono uppercase">Cabin Location</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{mentor.cabin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties tag blocks */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Mentorship Specialties
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {mentor.specialties.map((spec, sIdx) => (
                  <span 
                    key={sIdx}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-gray-200/20 text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Message Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 font-mono flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              Send a Quick Query
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Have a simple placement question? Send a direct message to {mentor.name.split(" ")[0]}. You'll receive a response within 24 hours.
            </p>

            <form onSubmit={handleSendQuickMsg} className="space-y-3">
              <div className="relative">
                <textarea
                  value={quickMsg}
                  onChange={(e) => setQuickMsg(e.target.value)}
                  placeholder={`E.g., "Hi ${mentor.name.split(" ")[0]} ${mentor.name.split(" ")[1]}, can you review my updated resume outline for the upcoming TCS recruitment?"`}
                  maxLength={500}
                  className="w-full h-24 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-xs text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  required
                />
                <span className="absolute bottom-2.5 right-3 text-[9px] font-mono text-gray-400">
                  {quickMsg.length}/500 chars
                </span>
              </div>

              <div className="flex items-center justify-between">
                {msgSent ? (
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Message dispatched directly to faculty inbox!
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400">Response is routed to your university email.</p>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !quickMsg.trim()}
                  className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive Schedule 1-on-1 */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Book Guidance Session
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Secure a 15-minute slot during {mentor.name.split(" ")[0]}'s office hours for live counseling.
            </p>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Session Scheduled!</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                    Your appointment for a <strong>{sessionType}</strong> is booked on <strong>{preferredDate}</strong> at <strong>{preferredTime}</strong> with {mentor.name}.
                  </p>
                </div>
                
                <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 text-[9px] text-indigo-700 dark:text-indigo-400 text-left space-y-1">
                  <p className="font-bold flex items-center gap-1 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" /> Planner Updated
                  </p>
                  <p>A reminder task has been appended to your Daily Planner tab.</p>
                </div>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setPreferredDate("");
                    setPreferredTime("");
                    setStudentNotes("");
                  }}
                  className="py-1.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Schedule Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSession} className="space-y-4 text-xs">
                {/* Session Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 font-mono">Guidance Focus</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Resume Review">Resume & Portfolio Review</option>
                    <option value="Coding Round Strategy">Coding Round & DSA Prep</option>
                    <option value="HR Mock Review">HR & Behavioral Strategy</option>
                    <option value="General Placement Guidance">General Placement Advisory</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 font-mono">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 font-mono">Preferred Slot</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- Choose a time block --</option>
                    <option value="11:15 AM - 11:30 AM">11:15 AM - 11:30 AM</option>
                    <option value="11:45 AM - 12:00 PM">11:45 AM - 12:00 PM</option>
                    <option value="02:15 PM - 02:30 PM">02:15 PM - 02:30 PM</option>
                    <option value="02:45 PM - 03:00 PM">02:45 PM - 03:00 PM</option>
                    <option value="03:30 PM - 03:45 PM">03:30 PM - 03:45 PM</option>
                  </select>
                  <p className="text-[9px] text-gray-400 mt-1 font-mono italic">
                    Note: Mentor active hours: {mentor.officeHours.split(" — ")[1] || "Office Hours"}
                  </p>
                </div>

                {/* Student notes */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 font-mono">Discussion Notes (Optional)</label>
                  <textarea
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="Briefly list any questions or targets..."
                    maxLength={300}
                    className="w-full h-16 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-indigo-500/10 transition duration-150 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  {loading ? "Confirming appointment..." : "Book Appointment Slot"}
                </button>
              </form>
            )}

          </div>

          {/* Guidelines info card */}
          <div className="p-5 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/15 text-xs text-indigo-950 dark:text-indigo-300 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
              Guidance Blueprint
            </h4>
            <p className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
              Assigned academic mentors monitor placement preparation scores, resume analysis reports, and chatbot mock transcript outcomes to custom-tailor corporate recommendations. Keep your profile updated for accurate referrals.
            </p>
          </div>

        </div>

      </div>

      <QuickEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        mentor={mentor}
      />
    </div>
  );
};
