import React, { useState } from "react";
import { User } from "../types";
import { 
  FileText, CheckSquare, List, Sparkles, Printer, Download, 
  Info, Eye, Edit3, CheckCircle2, ChevronRight, Save 
} from "lucide-react";

interface ResumeBuilderViewProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onAnalyzeResume: (text: string, filename: string, base64Data?: string, mimeType?: string) => Promise<void>;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  user,
  onUpdateProfile,
  onAnalyzeResume,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Local builder states
  const [phone, setPhone] = useState(user.phone || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [github, setGithub] = useState(user.github || "");
  const [education, setEducation] = useState(`Bachelor of Engineering in ${user.department || "Computer Science"}\nSIT College | CGPA: ${user.cgpa || "8.5"}`);
  const [skills, setSkills] = useState(user.skills?.join(", ") || "React, Node.js, Python, SQL, Git");
  
  const [projectTitle, setProjectTitle] = useState("Placement Preparation System");
  const [projectDesc, setProjectDesc] = useState("Built a robust React & Express web app featuring resume parsers, mock chat interview bots, and daily task planners.");
  
  const [expTitle, setExpTitle] = useState("Software Developer Intern");
  const [expDesc, setExpDesc] = useState("Designed clean frontend dashboards in React and optimized database indexing execution times by 35%.");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Compile to text content for the ATS Analyzer
  const getCompiledText = () => {
    return `${user.name}
Phone: ${phone} | Email: ${user.email}
LinkedIn: ${linkedin} | GitHub: ${github}

EDUCATION:
${education}

TECHNICAL SKILLS:
${skills}

PROJECTS:
1. ${projectTitle}
- ${projectDesc}

EXPERIENCE:
- ${expTitle}
- ${expDesc}`;
  };

  const handleCompileAndAnalyze = async () => {
    setSaving(true);
    setFeedback("");
    const compiled = getCompiledText();
    try {
      // Save compiled text to student's resume profile
      await onUpdateProfile({
        resumeText: compiled,
        resumeFileName: "AI_Generated_Resume.txt"
      });

      // Trigger AI Analysis
      await onAnalyzeResume(compiled, "AI_Generated_Resume.txt");
      setFeedback("Resume built & analysed with AI ATS diagnostics successfully!");
      setActiveTab("preview");
    } catch (e) {
      setFeedback("Failed to run ATS diagnostics on compiled resume.");
    } finally {
      setSaving(false);
    }
  };

  const checklistItems = [
    { text: "Accurate Contact details (Phone, Email)", checked: !!phone },
    { text: "Integrated active LinkedIn link", checked: !!linkedin },
    { text: "Integrated active GitHub profile", checked: !!github },
    { text: "Detailed Cumulative CGPA & education milestones", checked: !!education },
    { text: "Detailed Technical Skill keywords", checked: !!skills },
    { text: "Highlighted complex academic engineering projects", checked: !!projectTitle && !!projectDesc },
    { text: "Described quantitative internship experiences", checked: !!expTitle && !!expDesc },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="resume-builder-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Professional Resume Builder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Construct an ATS-optimized, elegant tech resume and print your customized document.</p>
        </div>

        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl font-mono text-xs">
          <button 
            onClick={() => setActiveTab("edit")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "edit" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Template
          </button>
          <button 
            onClick={() => setActiveTab("preview")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "preview" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Resume Sheet
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {activeTab === "edit" ? (
        /* Edit Template Mode */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form left */}
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-blue-600" /> Resume Sheet Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Full Name</label>
                <input type="text" value={user.name} disabled className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm border-0 cursor-not-allowed text-gray-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Target Email</label>
                <input type="text" value={user.email} disabled className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm border-0 cursor-not-allowed text-gray-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Contact Phone</label>
                <input 
                  type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  placeholder="+91 88888 77777"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">LinkedIn Profile URL</label>
                <input 
                  type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">GitHub Profile URL</label>
                <input 
                  type="text" value={github} onChange={e => setGithub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                  placeholder="github.com/username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Education summary</label>
              <textarea 
                rows={3} value={education} onChange={e => setEducation(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none font-mono"
                placeholder="E.g., B.E. in Computer Science, cumulative CGPA: 8.5..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Technical Skill Keywords</label>
              <input 
                type="text" value={skills} onChange={e => setSkills(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                placeholder="React.js, Node.js, SQL, Java, DSA"
              />
            </div>

            {/* Project section */}
            <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white font-mono uppercase tracking-wider">Highlight Engineering Project</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Project Title</label>
                  <input 
                    type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="E.g. Placement Preparation Tracker"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Project Impact Description</label>
                  <input 
                    type="text" value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Describe impact, tech used..."
                  />
                </div>
              </div>
            </div>

            {/* Experience section */}
            <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white font-mono uppercase tracking-wider">Professional Experience / Internships</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Job / Role Title</label>
                  <input 
                    type="text" value={expTitle} onChange={e => setExpTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="E.g. Software Engineer Intern"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Key Responsibilities / Metrics</label>
                  <input 
                    type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Describe achievements with numbers..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleCompileAndAnalyze}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {saving ? "Compiling & Analyzing..." : "Compile & Run AI ATS Diagnosis"}
              </button>
            </div>
          </div>

          {/* Checklist right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                <CheckSquare className="w-4 h-4 text-indigo-600" /> Resume Integrity Checklist
              </h3>
              <p className="text-xs text-gray-400 mb-4">Maintain high ATS scoring standard by filling out essential fields:</p>
              
              <div className="space-y-3 font-mono text-[11px]">
                {checklistItems.map((chk, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100/10">
                    <span className={chk.checked ? "text-gray-500" : "text-gray-400"}>{chk.text}</span>
                    {chk.checked ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        Pass
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                        Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent border border-blue-500/10 shadow-xs flex items-center gap-3">
              <Info className="w-8 h-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Why Use Resume Builder?</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Our AI parsers process the structured elements instantly to calculate your matching score against premium companies like Google, Microsoft and Amazon.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Preview Document Mode */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Document (PDF)
            </button>
          </div>

          {/* Printable resume template */}
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white text-gray-900 shadow-md border border-gray-200 print:shadow-none print:border-0 font-sans leading-relaxed">
            <div className="text-center pb-6 border-b border-gray-200 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight uppercase text-gray-950">{user.name}</h2>
              <p className="text-xs text-gray-500 font-mono">
                Phone: {phone || "+91 88888 77777"} | Email: {user.email}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                LinkedIn: {linkedin || "linkedin.com/in/satvikpokale"} | GitHub: {github || "github.com/satvikpokale"}
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {/* Education */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">Education</h3>
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mt-2 font-mono">{education}</p>
              </div>

              {/* Skills */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">Technical Skills</h3>
                <p className="text-xs text-gray-700 mt-2 font-semibold font-mono">{skills}</p>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">Projects</h3>
                <div className="space-y-1 mt-2">
                  <h4 className="text-xs font-bold text-gray-900">{projectTitle}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{projectDesc}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">Experience & Internships</h3>
                <div className="space-y-1 mt-2">
                  <h4 className="text-xs font-bold text-gray-900">{expTitle}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{expDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
