import React, { useState, useEffect } from "react";
import { 
  Sparkles, Award, RefreshCw, BarChart3, TrendingUp, 
  MapPin, CheckCircle, Info, Calendar, BookOpen, AlertCircle, Play,
  FileDown
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { jsPDF } from "jspdf";

import { PlacementReadiness, User, CodingQuestion, PlannerTask, Company } from "../types";

interface AnalyticsViewProps {
  token: string;
  onFetchReadiness: () => Promise<PlacementReadiness>;
  user?: User | null;
  codingQuestions?: CodingQuestion[];
  plannerTasks?: PlannerTask[];
  companies?: Company[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  token,
  onFetchReadiness,
  user,
  codingQuestions,
  plannerTasks,
  companies,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PlacementReadiness | null>(null);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await onFetchReadiness();
      setData(result);
    } catch (e: any) {
      setError("Failed to generate AI Analytics insights. Make sure the backend dev server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [token]);

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - 2 * margin; // 180mm
    let y = 20;

    const checkPageOverflow = (heightNeeded: number) => {
      if (y + heightNeeded > 270) {
        doc.addPage();
        y = 20;
        // Header on new pages
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Campus Placement AI Readiness & Preparation Report", margin, 10);
        doc.text("Page " + doc.getNumberOfPages(), pageWidth - margin - 15, 10);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, 12, pageWidth - margin, 12);
      }
    };

    // --- PAGE 1 HEADER BAR ---
    doc.setFillColor(15, 23, 42); // dark slate/navy
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("CAMPUS PLACEMENT READINESS REPORT", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Comprehensive Candidate Assessment & Preparation Diagnostics", margin, 25);

    // Score status ribbon
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`READINESS SCORE: ${data.readinessScore} / 100`, pageWidth - margin - 60, 20);

    let statusText = "EXCELLENT READY";
    let statusColor = [16, 185, 129]; // emerald
    if (data.readinessScore < 60) {
      statusText = "NEEDS PREPARATION";
      statusColor = [239, 68, 68]; // red
    } else if (data.readinessScore < 80) {
      statusText = "GOOD PROGRESS - ACTIVE";
      statusColor = [245, 158, 11]; // amber
    }
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(pageWidth - margin - 60, 24, 60, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(statusText, pageWidth - margin - 57, 28.2);

    // Reset Y starting below cover block
    y = 52;

    // --- CANDIDATE PROFILE SECTION ---
    if (user) {
      checkPageOverflow(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("I. STUDENT PROFILE & CREDENTIALS", margin, y);
      y += 4;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // 2-column key-value metrics
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      const col1_x = margin + 4;
      const col2_x = margin + 95;

      // Left Column
      doc.setFont("helvetica", "bold"); doc.text("Name:", col1_x, y);
      doc.setFont("helvetica", "normal"); doc.text(user.name || "N/A", col1_x + 25, y);
      y += 5;

      doc.setFont("helvetica", "bold"); doc.text("Department:", col1_x, y);
      doc.setFont("helvetica", "normal"); doc.text(user.department || "N/A", col1_x + 25, y);
      y += 5;

      doc.setFont("helvetica", "bold"); doc.text("Roll Number:", col1_x, y);
      doc.setFont("helvetica", "normal"); doc.text(user.rollNumber || "N/A", col1_x + 25, y);
      y += 5;

      doc.setFont("helvetica", "bold"); doc.text("Academic CGPA:", col1_x, y);
      doc.setFont("helvetica", "normal"); doc.text(user.cgpa ? `${user.cgpa} / 10` : "N/A", col1_x + 25, y);

      // Back to original Y for Right Column
      let ry = y - 15;
      doc.setFont("helvetica", "bold"); doc.text("Email:", col2_x, ry);
      doc.setFont("helvetica", "normal"); doc.text(user.email || "N/A", col2_x + 25, ry);
      ry += 5;

      doc.setFont("helvetica", "bold"); doc.text("Streak:", col2_x, ry);
      doc.setFont("helvetica", "normal"); doc.text(user.dailyStreak ? `${user.dailyStreak} Days` : "0 Days", col2_x + 25, ry);
      ry += 5;

      doc.setFont("helvetica", "bold"); doc.text("Progress Score:", col2_x, ry);
      doc.setFont("helvetica", "normal"); doc.text(`${user.overallProgress || 0}%`, col2_x + 25, ry);
      ry += 5;

      doc.setFont("helvetica", "bold"); doc.text("Last Active:", col2_x, ry);
      doc.setFont("helvetica", "normal"); doc.text(user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Just Now", col2_x + 25, ry);

      y += 10;
    }

    // --- METRICS & RADAR PLOTS ---
    checkPageOverflow(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("II. DETAILED PREPARATION PERFORMANCE METRICS", margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const aptitudeVal = Math.min(100, data.readinessScore - 5);
    const codingVal = Math.min(100, data.readinessScore + 10);
    const atsVal = Math.min(100, data.readinessScore - 2);
    const interviewVal = Math.min(100, data.readinessScore + 5);
    const academicVal = Math.min(100, data.readinessScore - 8);

    const metrics = [
      { name: "Aptitude & Logical Reasoning Score", value: user?.aptitudeScore || aptitudeVal },
      { name: "Coding & Algorithmic Practice Score", value: user?.codingScore || codingVal },
      { name: "Resume Quality / ATS Evaluation Match", value: user?.resumeAnalysis?.atsScore || atsVal },
      { name: "Interview Mock Communication Readiness", value: interviewVal },
      { name: "Academic Standing / GPA Performance Ratio", value: academicVal },
    ];

    metrics.forEach(m => {
      checkPageOverflow(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(m.name, margin + 4, y);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(`${m.value}%`, pageWidth - margin - 20, y);

      // Draw horizontal progress bar
      y += 2.5;
      doc.setFillColor(241, 245, 249); // slate-100 background bar
      doc.rect(margin + 4, y, contentWidth - 24, 2, "F");
      
      doc.setFillColor(59, 130, 246); // blue bar
      doc.rect(margin + 4, y, ((contentWidth - 24) * m.value) / 100, 2, "F");
      y += 7.5;
    });

    y += 4;

    // --- SKILL GAP DIAGNOSTICS ---
    if (data.skillGapAnalysis) {
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("III. SKILL GAP DIAGNOSTICS & ANALYSIS", margin, y);
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Strengths
      if (data.skillGapAnalysis.strengths && data.skillGapAnalysis.strengths.length > 0) {
        checkPageOverflow(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text("Recognized Strengths:", margin + 4, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const strengthsText = data.skillGapAnalysis.strengths.join(", ");
        const splitStrengths = doc.splitTextToSize(strengthsText, contentWidth - 10);
        checkPageOverflow(splitStrengths.length * 5);
        doc.text(splitStrengths, margin + 8, y);
        y += splitStrengths.length * 5 + 5;
      }

      // Gaps
      if (data.skillGapAnalysis.gaps && data.skillGapAnalysis.gaps.length > 0) {
        checkPageOverflow(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(239, 68, 68); // red-600
        doc.text("Identified Skill Gaps / Deficiencies:", margin + 4, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const gapsText = data.skillGapAnalysis.gaps.join(", ");
        const splitGaps = doc.splitTextToSize(gapsText, contentWidth - 10);
        checkPageOverflow(splitGaps.length * 5);
        doc.text(splitGaps, margin + 8, y);
        y += splitGaps.length * 5 + 5;
      }

      // AI Recommendations
      if (data.skillGapAnalysis.recommendations && data.skillGapAnalysis.recommendations.length > 0) {
        checkPageOverflow(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(99, 102, 241); // indigo-600
        doc.text("AI Action Strategy Recommendations:", margin + 4, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        data.skillGapAnalysis.recommendations.forEach(rec => {
          const splitRec = doc.splitTextToSize(`• ${rec}`, contentWidth - 12);
          checkPageOverflow(splitRec.length * 5 + 2);
          doc.text(splitRec, margin + 8, y);
          y += splitRec.length * 5 + 2;
        });
        y += 4;
      }
    }

    // --- STUDENT DICTATED VOICE NOTES & DAILY GOALS (SPECIAL PLANNED WORK) ---
    if (plannerTasks && plannerTasks.length > 0) {
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("IV. STUDENT DAILY GOALS & VOICE DICTATIONS", margin, y);
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      plannerTasks.forEach((tsk, tIdx) => {
        const taskStatus = tsk.completed ? "[COMPLETED]" : "[PENDING]";
        const taskText = `${tIdx + 1}. ${tsk.title} -- ${taskStatus}`;
        
        const splitTask = doc.splitTextToSize(taskText, contentWidth - 10);
        checkPageOverflow(splitTask.length * 5 + (tsk.voiceNotes ? 12 : 5));

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(splitTask, margin + 4, y);
        y += splitTask.length * 5 + 1;

        if (tsk.voiceNotes) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.setTextColor(99, 102, 241); // indigo text for voice dictation
          const dictationText = `🗣️ Dictated Detail: "${tsk.voiceNotes}"`;
          const splitDictation = doc.splitTextToSize(dictationText, contentWidth - 15);
          checkPageOverflow(splitDictation.length * 4.5);
          doc.text(splitDictation, margin + 8, y);
          y += splitDictation.length * 4.5 + 2;
        } else {
          y += 2;
        }
      });
      y += 4;
    }

    // --- RECRUITER PLACEMENT FIT MATCHING ---
    if (data.companyRecommendations && data.companyRecommendations.length > 0) {
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("V. RECOMMENDED COMPATIBLE RECRUITERS", margin, y);
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      data.companyRecommendations.forEach((rec, idx) => {
        const companyText = `${idx + 1}. ${rec.companyName}`;
        const reasonText = `Fit Reason: ${rec.reason}`;
        
        const splitReason = doc.splitTextToSize(reasonText, contentWidth - 12);
        checkPageOverflow(splitReason.length * 5 + 10);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(companyText, margin + 4, y);
        y += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(splitReason, margin + 8, y);
        y += splitReason.length * 5 + 4.5;
      });
      y += 4;
    }

    // --- STUDY ROADMAP ---
    if (data.smartStudyPlan && data.smartStudyPlan.length > 0) {
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("VI. PERSONALIZED CURRICULUM ROADMAP", margin, y);
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      data.smartStudyPlan.forEach((plan) => {
        checkPageOverflow(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text(`Phase: ${plan.phase}`, margin + 4, y);
        y += 4.5;

        plan.tasks?.forEach((tsk) => {
          const splitTsk = doc.splitTextToSize(`• ${tsk}`, contentWidth - 15);
          checkPageOverflow(splitTsk.length * 5 + 2);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(splitTsk, margin + 8, y);
          y += splitTsk.length * 5 + 1.5;
        });
        y += 3;
      });
    }

    // Bottom decorative footer
    checkPageOverflow(20);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("End of generated Preparation Progress & Performance report. Maintain active practice logs to update metrics.", margin, y);

    // Save report
    doc.save("placement_preparation_report.pdf");
  };

  // Radar chart data based on simulated evaluation metrics
  const radarChartData = [
    { subject: "Aptitude Score", A: data?.readinessScore ? Math.min(100, data.readinessScore - 5) : 70, fullMark: 100 },
    { subject: "Coding Metrics", A: data?.readinessScore ? Math.min(100, data.readinessScore + 10) : 85, fullMark: 100 },
    { subject: "Resume ATS Score", A: data?.readinessScore ? Math.min(100, data.readinessScore - 2) : 75, fullMark: 100 },
    { subject: "Interview Readiness", A: data?.readinessScore ? Math.min(100, data.readinessScore + 5) : 80, fullMark: 100 },
    { subject: "Academic Standing", A: data?.readinessScore ? Math.min(100, data.readinessScore - 8) : 65, fullMark: 100 },
  ];

  return (
    <div className="space-y-6" id="analytics-view">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" /> AI Placement Readiness Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review real-time smart study plans, compute machine learning readiness scores, and identify skill gaps with AI diagnostics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {data && (
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Download PDF Report
            </button>
          )}

          <button 
            onClick={handleFetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? "Analyzing..." : "Recompute AI Metrics"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 space-y-4">
          <Sparkles className="w-10 h-10 text-indigo-500 mx-auto animate-spin" />
          <p className="text-xs text-gray-500 font-mono">Running regression models and executing Gemini smart prompt parsers...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 dark:bg-rose-950/20 text-center py-12 text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          {error}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in duration-300">
          
          {/* Left Column: Readiness, Radar Chart, Company Recommendations */}
          <div className="lg:col-span-3 space-y-6">
            {/* Score metric card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
              
              {/* Placement readiness circular visualization */}
              <div className="sm:col-span-1 flex flex-col items-center justify-center text-center space-y-2 border-r border-gray-100 dark:border-gray-700/50 pr-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer progress ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#E5E7EB" strokeWidth="6" fill="transparent" className="dark:stroke-gray-700" />
                    <circle cx="56" cy="56" r="48" stroke="#3B82F6" strokeWidth="8" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={(2 * Math.PI * 48) * (1 - data.readinessScore / 100)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black text-gray-900 dark:text-white font-mono">{data.readinessScore}</span>
                </div>
                <span className="text-[10px] font-bold font-mono text-blue-600 uppercase tracking-wider">Readiness Index</span>
              </div>

              {/* Radar Chart metrics breakdown */}
              <div className="sm:col-span-2 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" fontSize={8} />
                    <Radar name="Readiness" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Company Recommendation Engine */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Recommended Recruiters
              </h3>

              <div className="space-y-4">
                {data.companyRecommendations?.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100/10 hover:border-blue-500/20 transition">
                    <h4 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> {rec.companyName}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generated Daily Challenge */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent border border-blue-500/20 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> AI Daily Brain-Teaser Challenge
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                {data.aiDailyQuestion?.question}
              </p>

              <div className="mt-4 pt-3 border-t border-blue-100/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Hints:</p>
                <ul className="mt-2 space-y-1.5 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
                  {data.aiDailyQuestion?.hints?.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Skill Gap Analysis & Smart Study Planner */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Gap Analysis */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Skill Gap Diagnostics
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Top Strengths</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.skillGapAnalysis?.strengths?.map((str, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/10">
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider">Active Skill Gaps</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.skillGapAnalysis?.gaps?.map((gap, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/10">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Improvement Steps</span>
                  <ul className="mt-2 space-y-2">
                    {data.skillGapAnalysis?.recommendations?.map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Smart Study Planner */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                <BookOpen className="w-4 h-4 text-blue-600" /> Smart Curriculum Roadmap
              </h3>

              <div className="space-y-4">
                {data.smartStudyPlan?.map((plan, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-500" /> {plan.phase}
                    </span>
                    <ul className="pl-5 space-y-1 text-xs text-gray-500 dark:text-gray-400 list-disc">
                      {plan.tasks?.map((tsk, tIdx) => (
                        <li key={tIdx}>{tsk}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Could not compute analytics. Select a button to re-trigger.
        </div>
      )}
    </div>
  );
};
