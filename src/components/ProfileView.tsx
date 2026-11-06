import React, { useState } from "react";
import { User } from "../types";
import { 
  User as UserIcon, Mail, Phone, GraduationCap, Code, 
  Linkedin, Github, FileText, CheckCircle2, XCircle, 
  Sparkles, Save, Upload, Info, AlertTriangle, Play 
} from "lucide-react";

interface ProfileViewProps {
  user: User;
  token: string;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onAnalyzeResume: (text: string, filename: string, base64Data?: string, mimeType?: string) => Promise<void>;
  onDeleteResumeVersion: (id: string) => Promise<void>;
  onActivateResumeVersion: (id: string) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  token,
  onUpdateProfile,
  onAnalyzeResume,
  onDeleteResumeVersion,
  onActivateResumeVersion,
}) => {
  // Local state for profile inputs
  const [name, setName] = useState(user.name || "");
  const [rollNumber, setRollNumber] = useState(user.rollNumber || "");
  const [department, setDepartment] = useState(user.department || "");
  const [year, setYear] = useState(user.year || "Final Year");
  const [cgpa, setCgpa] = useState(user.cgpa?.toString() || "0");
  const [skills, setSkills] = useState(user.skills?.join(", ") || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [github, setGithub] = useState(user.github || "");

  // Resume builder input
  const [resumeText, setResumeText] = useState(user.resumeText || "");
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedback("");
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      await onUpdateProfile({
        name,
        rollNumber,
        department,
        year,
        cgpa: parseFloat(cgpa) || 0,
        skills: skillsArray,
        phone,
        linkedin,
        github,
      });
      setFeedback("Profile updated successfully!");
    } catch (err: any) {
      setFeedback(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploading(true);
    setFeedback("");
    const isDoc = file.name.endsWith(".docx") || file.name.endsWith(".doc");
    const isPdf = file.name.endsWith(".pdf") || file.type === "application/pdf";
    const mimeType = file.type || (isPdf ? "application/pdf" : isDoc ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "text/plain");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (isPdf || isDoc) {
          const dataUrl = event.target?.result as string;
          const base64Data = dataUrl.split(",")[1];
          await onAnalyzeResume("", file.name, base64Data, mimeType);
          setFeedback(`Successfully uploaded and analyzed "${file.name}" with AI ATS Scanner!`);
        } else {
          const text = event.target?.result as string;
          setResumeText(text);
          await onAnalyzeResume(text, file.name);
          setFeedback(`Successfully analyzed "${file.name}" plain text content!`);
        }
      } catch (err: any) {
        console.error(err);
        setFeedback("Failed to perform AI ATS analysis on your file.");
      } finally {
        setUploading(false);
      }
    };

    if (isPdf || isDoc) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleAnalyzePaste = async () => {
    if (!resumeText.trim()) {
      setFeedback("Please enter resume text first.");
      return;
    }
    setUploading(true);
    try {
      await onAnalyzeResume(resumeText, "Pasted_Resume.txt");
      setFeedback("Resume analyzed with AI successfully!");
    } catch (e) {
      setFeedback("Failed to analyze resume.");
    } finally {
      setUploading(false);
    }
  };

  // Populate dynamic pre-filled resume text template for student to quickly analyze
  const loadPreFilledResume = () => {
    const template = `SATVIK POKALE
Pune, Maharashtra | +91 88888 77777 | satvikpokale@gmail.com | linkedin.com/in/satvikpokale | github.com/satvikpokale

EDUCATION
Bachelor of Engineering in Computer Science | CGPA: 8.5
Symbiosis Institute of Technology | 2022 - 2026

TECHNICAL SKILLS
Languages: Python, JavaScript, SQL, C++
Web Development: React.js, Node.js, Express.js, Tailwind CSS, HTML5/CSS3
Database & Cloud: MongoDB, Postgres, Git, Docker

PROJECTS
1. Placement Preparation Tracker (Full Stack)
- Built a web app to manage coding streak and companies.
- Tech Stack: React, Tailwind, Express, Node.js.
- Used AI to analyze resumes and simulate interviews.

2. E-Commerce Backend Service
- Engineered REST APIs handling order pipelines, authentication and product listings.
- Improved database query lookup times by 35% through optimal indexing in SQL.

EXPERIENCE
Software Engineering Intern | Tech Solutions | May 2025 - July 2025
- Designed customer dashboard screens in React, leading to 20% faster loading times.
- Resolved high priority bugs and worked with standard agile deployment flows.`;
    setResumeText(template);
  };

  const analysis = user.resumeAnalysis;

  return (
    <div className="space-y-6" id="profile-view">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Resume Center</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Update your academic portfolio and run AI ATS diagnostics on your resume.</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm border ${
          feedback.includes("success") 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30" 
            : "bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30"
        }`}>
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Editable Details (Bento Profile Form) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <UserIcon className="w-4 h-4 text-blue-600" /> Professional Portfolio
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    placeholder="E.g. Satvik Pokale"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Roll Number</label>
                  <input 
                    type="text" 
                    value={rollNumber} 
                    onChange={e => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    placeholder="E.g. CS2023045"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Department</label>
                  <select 
                    value={department} 
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                    <option value="CSE(DS)">CSE(DS)</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Electronic and Telecommunication Engineering (EXTC)">Electronic and Telecommunication Engineering (EXTC)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Year</label>
                  <select 
                    value={year} 
                    onChange={e => setYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Cumulative CGPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa} 
                    onChange={e => setCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono" 
                    placeholder="E.g. 8.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Technical Skills (Comma separated)</label>
                <input 
                  type="text" 
                  value={skills} 
                  onChange={e => setSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  placeholder="React.js, Node.js, Python, SQL, Git"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Phone</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    placeholder="+91 99999 88888"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">LinkedIn Profile URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="url" 
                      value={linkedin} 
                      onChange={e => setLinkedin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">GitHub Profile URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="url" 
                      value={github} 
                      onChange={e => setGithub(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" 
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingProfile ? "Saving..." : "Save Portfolio"}
                </button>
              </div>
            </form>
          </div>

          {/* AI Resume Scanner Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Resume Analyzer Content
              </h2>
              <button 
                type="button" 
                onClick={loadPreFilledResume}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Load Pre-filled Template
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Paste your raw resume text content below, or drop a PDF, DOCX, or TXT resume file into the uploader zone. Then click "Analyze with AI" to generate the ATS report.
            </p>

            <textarea 
              rows={8}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="Paste complete text from your resume here..."
            />

            {/* File Drag Uploader Zone */}
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleResumeDrop}
              className="mt-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition relative"
            >
              <input 
                type="file" 
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Drag & Drop Resume File</p>
              <p className="text-[10px] text-gray-400 mt-1">Accepts PDF, DOCX, and TXT resume files</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {user.resumeFileName ? `Currently active file: ${user.resumeFileName}` : "No file uploaded yet"}
              </span>
              <button 
                type="button"
                onClick={handleAnalyzePaste}
                disabled={uploading || !resumeText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {uploading ? "Analyzing with AI..." : "Analyze with AI"}
              </button>
            </div>
          </div>

          {/* Resume Version History Tracking Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Stored Resume Versions
              </h2>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                {user.resumeVersions?.length || 0} Saved
              </span>
            </div>

            {(!user.resumeVersions || user.resumeVersions.length === 0) ? (
              <p className="text-center text-xs py-8 text-gray-400">
                No previous resume versions saved. Try uploading a PDF or DOCX file to begin tracking your iterations!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="pb-3 font-semibold">File Name</th>
                      <th className="pb-3 font-semibold">Upload Date</th>
                      <th className="pb-3 font-semibold text-center">ATS Score</th>
                      <th className="pb-3 font-semibold text-center">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {user.resumeVersions.map((version) => {
                      const isActive = user.resumeFileName === version.fileName && user.resumeAnalysis?.atsScore === version.atsScore;
                      const uploadDateObj = new Date(version.uploadDate);
                      const formattedDate = isNaN(uploadDateObj.getTime())
                        ? "N/A"
                        : uploadDateObj.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                      return (
                        <tr key={version.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                          <td className="py-3 font-medium text-gray-800 dark:text-gray-200 max-w-[140px] truncate" title={version.fileName}>
                            {version.fileName}
                          </td>
                          <td className="py-3 text-gray-400 dark:text-gray-500 font-mono text-[10px]">
                            {formattedDate}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold ${
                              version.atsScore >= 80 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                              version.atsScore >= 60 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                              "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                            }`}>
                              {version.atsScore}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {isActive ? (
                              <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200/30">
                                Active
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-full border border-gray-200/10">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => onActivateResumeVersion(version.id)}
                                className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/60 font-semibold rounded-md transition cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteResumeVersion(version.id)}
                              className="text-[10px] px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60 font-semibold rounded-md transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ATS Score & Diagnostic Feedback */}
        <div className="lg:col-span-2">
          {analysis ? (
            <div className="space-y-6 sticky top-6">
              {/* Score card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border border-indigo-950 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-300">ATS Evaluation Score</span>
                    <h3 className="text-3xl font-bold mt-1 font-mono">{analysis.atsScore}/100</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    analysis.atsScore >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                    analysis.atsScore >= 60 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    {analysis.atsScore >= 80 ? "Optimized" : analysis.atsScore >= 60 ? "Needs Polish" : "Action Needed"}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-indigo-200">Strengths Detected:</p>
                    <ul className="mt-2 space-y-1">
                      {analysis.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs flex items-center gap-1.5 text-indigo-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-indigo-200">Critical Gaps:</p>
                    <ul className="mt-2 space-y-1">
                      {analysis.gaps.map((gap, idx) => (
                        <li key={idx} className="text-xs flex items-center gap-1.5 text-indigo-100">
                          <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action recommendations checklist */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> ATS Compatibility Checklist
                </h3>
                <div className="space-y-3">
                  {analysis.checklist?.map((chk, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                      <span className="text-xs text-gray-700 dark:text-gray-300">{chk.item}</span>
                      {chk.status ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">Pass</span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">Fix</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> AI Action Recommendations:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {analysis.recommendations?.map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs text-center py-20">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">AI ATS Diagnostic Diagnostic</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
                No resume analyzed yet. Upload or paste your resume content in the editor to calculate your real-time placement ATS compatibility score and obtain deep diagnostic reports.
              </p>
              <button 
                onClick={loadPreFilledResume}
                className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-xl font-semibold text-xs border border-indigo-200/20"
              >
                Populate Template Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
