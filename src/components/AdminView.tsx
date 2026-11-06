import React, { useState, useEffect } from "react";
import { Company, CodingQuestion, AptitudeQuestion } from "../types";
import { 
  Plus, Settings, Building2, BrainCircuit, Code2, Users, 
  Send, Edit, Trash2, CheckCircle, Clock, Save, ChevronRight, X 
} from "lucide-react";

interface AdminViewProps {
  token: string;
  companies: Company[];
  onAddCompany: (company: Partial<Company>) => Promise<void>;
  onAddCodingQuestion: (question: Partial<CodingQuestion>) => Promise<void>;
  onAddAptitudeQuestion: (question: Partial<AptitudeQuestion>) => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  token,
  companies,
  onAddCompany,
  onAddCodingQuestion,
  onAddAptitudeQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<"drives" | "coding" | "aptitude" | "students">("drives");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Lists of students for roster management
  const [students, setStudents] = useState<any[]>([]);

  // Add Company inputs
  const [compName, setCompName] = useState("");
  const [compPkg, setCompPkg] = useState("");
  const [compCgpa, setCompCgpa] = useState("7.5");
  const [compSkills, setCompSkills] = useState("");
  const [compDeadline, setCompDeadline] = useState("2026-08-10");
  const [compInterview, setCompInterview] = useState("2026-08-20");
  const [compDesc, setCompDesc] = useState("");
  const [compLoc, setCompLoc] = useState("");

  // Add Coding inputs
  const [codeTitle, setCodeTitle] = useState("");
  const [codeCat, setCodeCat] = useState("Arrays");
  const [codeDiff, setCodeDiff] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [codeDesc, setCodeDesc] = useState("");
  const [codePoints, setCodePoints] = useState("50");

  // Add Aptitude inputs
  const [aptSec, setAptSec] = useState("Quantitative Aptitude");
  const [aptQuest, setAptQuest] = useState("");
  const [aptOptA, setAptOptA] = useState("");
  const [aptOptB, setAptOptB] = useState("");
  const [aptOptC, setAptOptC] = useState("");
  const [aptOptD, setAptOptD] = useState("");
  const [aptCorrect, setAptCorrect] = useState("0");
  const [aptExplain, setAptExplain] = useState("");

  // Managing applications popup
  const [selectedStudentApp, setSelectedStudentApp] = useState<any | null>(null);
  const [appStatusUpdate, setAppStatusUpdate] = useState("Shortlisted");
  const [appNotesUpdate, setAppNotesUpdate] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.students) {
        setStudents(result.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compPkg) return;
    setLoading(true);
    setFeedback("");
    try {
      await onAddCompany({
        name: compName,
        package: compPkg,
        eligibilityCgpa: parseFloat(compCgpa) || 0,
        requiredSkills: compSkills.split(",").map(s => s.trim()),
        registrationDeadline: compDeadline,
        interviewDate: compInterview,
        description: compDesc,
        location: compLoc,
      });
      setFeedback(`Placement Drive for ${compName} added successfully and students notified!`);
      // Reset
      setCompName(""); setCompPkg(""); setCompDesc(""); setCompLoc("");
    } catch (err) {
      setFeedback("Failed to add placement drive.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeTitle || !codeDesc) return;
    setLoading(true);
    setFeedback("");
    try {
      await onAddCodingQuestion({
        title: codeTitle,
        category: codeCat,
        difficulty: codeDiff,
        description: codeDesc,
        points: parseInt(codePoints) || 50,
        boilerplate: `function solve() {\n  // Write code here\n}`,
        testCases: [{ input: "default_input = true", output: "true" }]
      });
      setFeedback(`Coding question "${codeTitle}" added successfully!`);
      setCodeTitle(""); setCodeDesc("");
    } catch (err) {
      setFeedback("Failed to add coding question.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAptitude = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptQuest || !aptOptA || !aptOptB) return;
    setLoading(true);
    setFeedback("");
    try {
      await onAddAptitudeQuestion({
        section: aptSec,
        question: aptQuest,
        options: [aptOptA, aptOptB, aptOptC, aptOptD].filter(Boolean),
        correctIndex: parseInt(aptCorrect),
        explanation: aptExplain,
        points: 20
      });
      setFeedback(`Aptitude question added successfully under ${aptSec}!`);
      setAptQuest(""); setAptOptA(""); setAptOptB(""); setAptOptC(""); setAptOptD(""); setAptExplain("");
    } catch (e) {
      setFeedback("Failed to add aptitude question.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentApp) return;
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("/api/companies/status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudentApp.studentId,
          companyId: selectedStudentApp.companyId,
          status: appStatusUpdate,
          notes: appNotesUpdate
        })
      });
      const result = await res.json();
      if (result.success) {
        setFeedback("Application status updated and notification triggered!");
        fetchStudents();
        setTimeout(() => setSelectedStudentApp(null), 1000);
      } else {
        setFeedback(result.error || "Failed to update status.");
      }
    } catch (err) {
      setFeedback("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" /> T&P Officer Command Station
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add active placement drives, configure coding and aptitude banks, and monitor registered student applicant roster lists.</p>
        </div>

        {/* Dynamic subtabs */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl font-mono text-xs">
          <button 
            onClick={() => { setActiveTab("drives"); setFeedback(""); }}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
              activeTab === "drives" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            Drives Manager
          </button>
          <button 
            onClick={() => { setActiveTab("coding"); setFeedback(""); }}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
              activeTab === "coding" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            Coding Bank
          </button>
          <button 
            onClick={() => { setActiveTab("aptitude"); setFeedback(""); }}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
              activeTab === "aptitude" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            Aptitude Bank
          </button>
          <button 
            onClick={() => { setActiveTab("students"); setFeedback(""); }}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
              activeTab === "students" ? "bg-white dark:bg-gray-950 text-blue-600 shadow-xs" : "text-gray-500"
            }`}
          >
            Student Roster
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Renders Tab Panels */}
      {activeTab === "drives" && (
        /* Create Drive */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Dispatch New Campus Placement Drive
            </h2>

            <form onSubmit={handleAddCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Company Name</label>
                  <input type="text" value={compName} onChange={e => setCompName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="Google LLC" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Package Compensation (LPA)</label>
                  <input type="text" value={compPkg} onChange={e => setCompPkg(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="32 LPA" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Eligibility Min CGPA</label>
                  <input type="number" step="0.1" value={compCgpa} onChange={e => setCompCgpa(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="8.0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Registration Deadline</label>
                  <input type="date" value={compDeadline} onChange={e => setCompDeadline(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Interview Date</label>
                  <input type="date" value={compInterview} onChange={e => setCompInterview(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Required Skills (Comma separated)</label>
                  <input type="text" value={compSkills} onChange={e => setCompSkills(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="C++, Algorithms, System Design" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Drive Location</label>
                  <input type="text" value={compLoc} onChange={e => setCompLoc(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="Bangalore, India" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Corporate Description & Core Roles</label>
                <textarea rows={4} value={compDesc} onChange={e => setCompDesc(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none" placeholder="Provide information on drive details, target job roles..." />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer">
                  {loading ? "Broadcasting..." : "Broadcast Drive & Alert Students"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" /> Dispatched Companies
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {companies.map(c => (
                  <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100/10 text-xs font-semibold flex justify-between items-center">
                    <div>
                      <p className="text-gray-900 dark:text-white">{c.name}</p>
                      <span className="text-[10px] font-mono text-gray-400 font-normal">PKG: {c.package} | CGPA eligibility: {c.eligibilityCgpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "coding" && (
        /* Create Coding Challenge */
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" /> Add Algorithmic Coding Challenge
          </h2>

          <form onSubmit={handleAddCoding} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Question Title</label>
                <input type="text" value={codeTitle} onChange={e => setCodeTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="E.g. Binary Search" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Difficulty</label>
                  <select value={codeDiff} onChange={e => setCodeDiff(e.target.value as any)} className="w-full px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Reward Points</label>
                  <input type="number" value={codePoints} onChange={e => setCodePoints(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="50" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Target Category</label>
              <select value={codeCat} onChange={e => setCodeCat(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none">
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Linked List">Linked List</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
                <option value="Trees">Trees</option>
                <option value="Graph">Graph</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Problem Description / Constraints</label>
              <textarea rows={5} value={codeDesc} onChange={e => setCodeDesc(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none" placeholder="Write comprehensive constraints and descriptions..." required />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer">
                {loading ? "Saving challenge..." : "Save Coding Question"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "aptitude" && (
        /* Create Aptitude Question */
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" /> Add Aptitude Question
          </h2>

          <form onSubmit={handleAddAptitude} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Screening Section</label>
              <select value={aptSec} onChange={e => setAptSec(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none">
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Logical Reasoning">Logical Reasoning</option>
                <option value="Verbal Ability">Verbal Ability</option>
                <option value="Data Interpretation">Data Interpretation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Question Text</label>
              <textarea rows={3} value={aptQuest} onChange={e => setAptQuest(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none" placeholder="E.g., A train running at 60km/hr crosses a pole in..." required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Option A</label>
                <input type="text" value={aptOptA} onChange={e => setAptOptA(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Option B</label>
                <input type="text" value={aptOptB} onChange={e => setAptOptB(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Option C</label>
                <input type="text" value={aptOptC} onChange={e => setAptOptC(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Option D</label>
                <input type="text" value={aptOptD} onChange={e => setAptOptD(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Correct Option Index (0 = Option A, 1 = Option B, etc.)</label>
              <select value={aptCorrect} onChange={e => setAptCorrect(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none">
                <option value="0">0 (Option A)</option>
                <option value="1">1 (Option B)</option>
                <option value="2">2 (Option C)</option>
                <option value="3">3 (Option D)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">Detailed Answer Explanation</label>
              <textarea rows={3} value={aptExplain} onChange={e => setAptExplain(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none" placeholder="Provide step by step calculations..." />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer">
                {loading ? "Saving challenge..." : "Save Aptitude Question"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "students" && (
        /* Roster & Application Manager */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-4">
              <Users className="w-4 h-4 text-blue-600" /> Enrolled Students & Live Application Review
            </h2>

            <div className="space-y-6">
              {students.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No active students enrolled in roster.
                </div>
              ) : (
                students.map((student: any) => (
                  <div key={student.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100/10 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-950 dark:text-white">{student.name} ({student.rollNumber || "N/A"})</h3>
                        <p className="text-[10px] text-gray-500 font-mono font-normal mt-0.5">{student.department} | CGPA: {student.cgpa} | Code score: {student.codingScore || 0} pts | Apt score: {student.aptitudeScore || 0} pts</p>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/20 px-2 py-0.5 rounded-full font-bold">
                        Streak: {student.dailyStreak || 0} days
                      </span>
                    </div>

                    {/* Applications list */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Submitted Drive Applications:</p>
                      {student.applications?.length === 0 ? (
                        <p className="text-xs text-gray-400">No applications submitted by this student.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {student.applications?.map((app: any) => (
                            <div key={app.id} className="p-3 rounded-xl bg-white dark:bg-gray-950/40 border border-gray-100/10 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{app.companyName}</p>
                                <span className="text-[10px] text-gray-400 font-normal">Status: <span className="font-bold text-indigo-600">{app.status}</span></span>
                                {app.notes && <p className="text-[10px] text-gray-400 mt-1 italic">"{app.notes}"</p>}
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedStudentApp({ studentId: student.id, companyId: app.companyId, companyName: app.companyName, studentName: student.name });
                                  setAppStatusUpdate(app.status);
                                  setAppNotesUpdate(app.notes || "");
                                }}
                                className="px-2.5 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition text-[10px] font-bold cursor-pointer"
                              >
                                Edit Status
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application overlay editor popup */}
      {selectedStudentApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedStudentApp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 dark:text-white">Modify Drive Status</h3>
            <p className="text-xs text-gray-400 mt-1">Review student applications, adjust stages, and dispatch auto-alerts.</p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 font-mono space-y-1">
              <p>Candidate: <span className="text-gray-900 dark:text-white font-semibold">{selectedStudentApp.studentName}</span></p>
              <p>Corporate: <span className="text-gray-900 dark:text-white font-semibold">{selectedStudentApp.companyName}</span></p>
            </div>

            <form onSubmit={handleUpdateAppStatus} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-mono">Recruitment Round Phase</label>
                <select 
                  value={appStatusUpdate} 
                  onChange={e => setAppStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-950 dark:text-white focus:outline-none border border-gray-200"
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-mono">Special Evaluation Notes (Will alert Candidate)</label>
                <input 
                  type="text" 
                  value={appNotesUpdate} 
                  onChange={e => setAppNotesUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none" 
                  placeholder="E.g., Interview scheduled for tomorrow morning."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedStudentApp(null)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1 shadow-sm cursor-pointer">
                  <CheckCircle className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
