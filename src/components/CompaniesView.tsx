import React, { useState } from "react";
import { User, Company } from "../types";
import { 
  Building2, Search, Filter, AlertTriangle, CheckCircle, 
  Clock, MapPin, Calendar, Briefcase, Plus, Send, ChevronRight, X 
} from "lucide-react";

interface CompaniesViewProps {
  user: User;
  companies: Company[];
  onApplyCompany: (companyId: string, notes: string) => Promise<void>;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  user,
  companies,
  onApplyCompany,
}) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "eligible" | "applied">("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [applyNotes, setApplyNotes] = useState("");
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setApplying(true);
    setFeedback("");
    try {
      await onApplyCompany(selectedCompany.id, applyNotes);
      setFeedback("Application submitted successfully!");
      // Reset
      setTimeout(() => {
        setSelectedCompany(null);
        setApplyNotes("");
        setFeedback("");
      }, 1500);
    } catch (err: any) {
      setFeedback(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const studentCgpa = user.cgpa || 0;

  const filteredCompanies = companies.filter(c => {
    // Search query
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
                          (c.location && c.location.toLowerCase().includes(search.toLowerCase()));

    // Tab filters
    if (!matchesSearch) return false;
    if (tab === "eligible") {
      return studentCgpa >= c.eligibilityCgpa;
    }
    if (tab === "applied") {
      return c.applicationStatus !== "Not Applied";
    }
    return true;
  });

  return (
    <div className="space-y-6" id="companies-view">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" /> Active Placement Drives
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Review, filter, and apply for upcoming campus corporate drives.</p>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between glass-card p-4 rounded-3xl shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            placeholder="Search by company name, skills, location..."
          />
        </div>

        <div className="flex gap-2 font-mono">
          <button 
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === "all" ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
            }`}
          >
            All Drives ({companies.length})
          </button>
          <button 
            onClick={() => setTab("eligible")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === "eligible" ? "bg-emerald-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
            }`}
          >
            Eligible Only ({companies.filter(c => studentCgpa >= c.eligibilityCgpa).length})
          </button>
          <button 
            onClick={() => setTab("applied")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === "applied" ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
            }`}
          >
            My Applications ({companies.filter(c => c.applicationStatus !== "Not Applied").length})
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            No active recruitment drives found matching your search criteria.
          </div>
        ) : (
          filteredCompanies.map(c => {
            const isEligible = studentCgpa >= c.eligibilityCgpa;
            const applied = c.applicationStatus !== "Not Applied";

            return (
              <div 
                key={c.id}
                className="p-6 rounded-3xl glass-card flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group"
              >
                {/* Eligibility Badge */}
                <span className={`absolute top-4 right-4 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  isEligible ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                }`}>
                  {isEligible ? "✓ Eligible" : `✕ Min CGPA: ${c.eligibilityCgpa}`}
                </span>

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {c.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{c.location || "India"}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3">
                    {c.description || "Leading industry enterprise conducting recruitment for computer software engineers, data model experts, and frontend analysts."}
                  </p>

                  {/* Skills tags */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {c.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> Package:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">{c.package}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Deadline:
                    </span>
                    <span className="font-semibold text-gray-600 dark:text-gray-300 font-mono">{c.registrationDeadline}</span>
                  </div>

                  {c.applicationStatus !== "Not Applied" && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/10 flex justify-between items-center mt-1">
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">Your Status:</span>
                      <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 font-mono">
                        {c.applicationStatus}
                      </span>
                    </div>
                  )}

                  {!applied ? (
                    <button 
                      onClick={() => setSelectedCompany(c)}
                      disabled={!isEligible}
                      className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isEligible 
                          ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-900 dark:text-gray-600"
                      }`}
                    >
                      {isEligible ? "Apply Now" : "Ineligible to Apply"}
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Successfully Applied
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Application overlay modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 dark:text-white">Apply for {selectedCompany.name}</h3>
            <p className="text-xs text-gray-400 mt-1">Submit your profile summary and cover letters for this corporate drive.</p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 font-mono space-y-1">
              <p>Candidate: <span className="text-gray-900 dark:text-white font-semibold">{user.name}</span></p>
              <p>Current CGPA: <span className="text-emerald-600 font-bold">{user.cgpa}</span> (Req: {selectedCompany.eligibilityCgpa})</p>
              <p>Active Resume: <span className="text-gray-900 dark:text-white font-semibold">{user.resumeFileName || "None Uploaded"}</span></p>
            </div>

            {!user.resumeFileName && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/20 flex gap-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p>Warning: You haven't uploaded a resume file in the Profile Center. We recommend configuring a resume for better screening selection.</p>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-mono">Cover Notes / Special Interests (Optional)</label>
                <textarea 
                  rows={4}
                  value={applyNotes}
                  onChange={e => setApplyNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="E.g., I have 2 React development projects and would love to work as a Software Engineering Intern..."
                />
              </div>

              {feedback && (
                <p className={`text-xs text-center font-semibold ${feedback.includes("success") ? "text-emerald-600" : "text-rose-600"}`}>
                  {feedback}
                </p>
              )}

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {applying ? "Applying..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
