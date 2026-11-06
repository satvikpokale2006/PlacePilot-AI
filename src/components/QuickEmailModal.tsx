import React, { useState, useEffect } from "react";
import { User } from "../types";
import { X, Copy, Check, Mail, ExternalLink, Sparkles, FileText, Calendar, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  mentor: {
    name: string;
    role: string;
    email: string;
    officeHours: string;
    cabin: string;
    specialties: string[];
    department: string;
  };
}

type TemplateType = "resume" | "mock" | "placement";

export const QuickEmailModal: React.FC<QuickEmailModalProps> = ({
  isOpen,
  onClose,
  user,
  mentor,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>("resume");
  const [targetCompany, setTargetCompany] = useState("");
  const [copied, setCopied] = useState(false);

  // Student variables
  const studentName = user.name || "Student";
  const studentEmail = user.email || "";
  const department = user.department || "Engineering";
  const overallProgress = user.overallProgress !== undefined ? user.overallProgress : 0;
  
  const mentorName = mentor.name;
  const officeHours = mentor.officeHours;
  const cabinLocation = mentor.cabin;
  const mainSpecialty = mentor.specialties[0] || "Placement Preparation";

  // Templates dictionary
  const getTemplates = () => {
    const companyText = targetCompany.trim() || "upcoming campus drives";
    
    return {
      resume: {
        subject: `Request for Resume & Portfolio Feedback — ${studentName}`,
        body: `Dear ${mentorName},

I hope this email finds you well.

As a student in the ${department} branch, I am currently preparing for campus recruitment. I have been using our placement portal to refine my preparation, and my current overall preparedness progress is at ${overallProgress}%.

I would be extremely grateful if you could spare 15 minutes of your time to review my resume and portfolio. Your expert insights would help me align my projects and skills with industry expectations for ${companyText}.

Please let me know if you have any availability during your upcoming office hours (${officeHours}) or at any other time of your convenience.

Thank you very much for your continuous guidance and support.

Sincerely,
${studentName}
Email: ${studentEmail}`
      },
      mock: {
        subject: `Mock Interview & Career Guidance Request — ${studentName}`,
        body: `Dear ${mentorName},

I hope you are having a productive week.

I am writing to request your guidance as I prepare for placement interview rounds. I have been practicing behavioral and technical concepts on our platform, but I would highly value a brief mock interview or diagnostic feedback session with you to identify any areas of improvement.

I am particularly hoping to discuss strategy for interviews in the ${targetCompany.trim() ? targetCompany.trim() : "core technical"} domain.

If possible, please let me know if I can drop by your cabin (${cabinLocation}) during your office hours (${officeHours}) on a suitable day.

Thank you for your time and mentorship.

Best regards,
${studentName}
Branch: ${department}`
      },
      placement: {
        subject: `Inquiry Regarding Campus Placement Preparation — ${studentName}`,
        body: `Dear ${mentorName},

I hope you are doing well.

As my assigned placement mentor, I wanted to reach out to seek your advice regarding the campus recruitment drives for ${companyText}. 

Given your specialty in ${mainSpecialty}, I would be very grateful for your insights on what specific concepts, coding standards, or project types I should focus on to stand out to recruiters in this field.

I would love to connect briefly during your office hours or via email to get your advice on how I can optimize my preparation in the remaining weeks.

Thank you so much for your guidance.

Warm regards,
${studentName}
Department: ${department}`
      }
    };
  };

  const templates = getTemplates();
  const currentTemplate = templates[activeTemplate];

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const fullText = `Subject: ${currentTemplate.subject}\n\n${currentTemplate.body}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Generate mailto link
  const mailtoLink = `mailto:${mentor.email}?subject=${encodeURIComponent(currentTemplate.subject)}&body=${encodeURIComponent(currentTemplate.body)}`;

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          id="email-modal-backdrop"
        />

        {/* Modal content box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          id="email-modal-panel"
          className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800/80 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Mentor Outreach Template</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                  Target: <strong className="text-indigo-600 dark:text-indigo-400">{mentorName}</strong> &lt;{mentor.email}&gt;
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Quick tips notice */}
            <div className="px-4 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>AI Tip:</strong> Reaching out to your assigned mentor shows proactiveness. Select a template below, customize the target company/role if needed, and send. We have pre-filled your active preparedness score (<strong>{overallProgress}%</strong>) to prove your dedication!
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTemplate("resume");
                  setTargetCompany("");
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeTemplate === "resume"
                    ? "bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/80"
                    : "bg-gray-50 dark:bg-slate-900/40 border-gray-100/50 dark:border-gray-800/60 hover:bg-gray-100/30"
                }`}
              >
                <FileText className={`w-4 h-4 mt-0.5 ${activeTemplate === "resume" ? "text-indigo-600" : "text-gray-400"}`} />
                <div>
                  <p className={`text-xs font-bold ${activeTemplate === "resume" ? "text-indigo-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    Resume Review
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Request feedback on ATS compatibility</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTemplate("mock");
                  setTargetCompany("");
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeTemplate === "mock"
                    ? "bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/80"
                    : "bg-gray-50 dark:bg-slate-900/40 border-gray-100/50 dark:border-gray-800/60 hover:bg-gray-100/30"
                }`}
              >
                <Calendar className={`w-4 h-4 mt-0.5 ${activeTemplate === "mock" ? "text-indigo-600" : "text-gray-400"}`} />
                <div>
                  <p className={`text-xs font-bold ${activeTemplate === "mock" ? "text-indigo-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    Mock Interview
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Request a live office-hours counseling session</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTemplate("placement");
                  setTargetCompany("");
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  activeTemplate === "placement"
                    ? "bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/80"
                    : "bg-gray-50 dark:bg-slate-900/40 border-gray-100/50 dark:border-gray-800/60 hover:bg-gray-100/30"
                }`}
              >
                <MessageSquare className={`w-4 h-4 mt-0.5 ${activeTemplate === "placement" ? "text-indigo-600" : "text-gray-400"}`} />
                <div>
                  <p className={`text-xs font-bold ${activeTemplate === "placement" ? "text-indigo-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    Placement Advice
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Inquire about target industry requirements</p>
                </div>
              </button>
            </div>

            {/* Input to Customize Company/Role */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">
                Target Company or Job Role (Optional)
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder={activeTemplate === "resume" ? "e.g., Google Front-End position" : "e.g., TCS Digital Drive"}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[9px] text-gray-400 italic">
                Type a company name or role above to dynamically insert it into the email template below.
              </p>
            </div>

            {/* Preview Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">Template Preview</span>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono">Editable draft</span>
              </div>
              
              <div className="rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden text-xs bg-gray-50/50 dark:bg-slate-950">
                {/* Subject line preview */}
                <div className="px-4 py-2.5 border-b border-gray-150 dark:border-gray-800/80 bg-gray-100/50 dark:bg-slate-900/50 flex gap-2">
                  <span className="font-mono text-gray-400 select-none">Subject:</span>
                  <span className="font-semibold text-gray-950 dark:text-white">{currentTemplate.subject}</span>
                </div>
                {/* Body Textarea */}
                <div className="p-4">
                  <pre className="font-sans text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto select-all">
                    {currentTemplate.body}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[9px] text-gray-400 font-mono">
              Ready to send? Use the buttons to copy or open in Mail.
            </span>
            <div className="flex w-full sm:w-auto items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-gray-250 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied Draft!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <a
                href={mailtoLink}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-indigo-500/10 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Email</span>
                <ExternalLink className="w-3 h-3 text-indigo-200" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
