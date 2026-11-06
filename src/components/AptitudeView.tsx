import React, { useState } from "react";
import { AptitudeQuestion } from "../types";
import { 
  BrainCircuit, CheckCircle2, XCircle, Info, ArrowRight, 
  HelpCircle, Timer, AlertCircle, RefreshCw 
} from "lucide-react";

interface AptitudeViewProps {
  aptitudeQuestions: AptitudeQuestion[];
  onSubmitAptitudeScore: (section: string, score: number, total: number) => Promise<void>;
}

export const AptitudeView: React.FC<AptitudeViewProps> = ({
  aptitudeQuestions,
  onSubmitAptitudeScore,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Quiz taking state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const sections = ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"];

  const handleStartSection = (section: string) => {
    setSelectedSection(section);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setFeedback("");
  };

  const sectionQuestions = aptitudeQuestions.filter(q => q.section === selectedSection);

  const handleOptionSelect = (optionIdx: number) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleNext = () => {
    if (currentIdx < sectionQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate score
      let score = 0;
      sectionQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          score += 1;
        }
      });
      setQuizScore(score);
      setQuizFinished(true);
      submitScore(score);
    }
  };

  const submitScore = async (score: number) => {
    if (!selectedSection) return;
    setSubmitting(true);
    try {
      await onSubmitAptitudeScore(selectedSection, score, sectionQuestions.length);
      setFeedback("Aptitude performance scores logged successfully!");
    } catch (e) {
      setFeedback("Could not update aptitude metrics.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="aptitude-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-600" /> Aptitude Practice Zone
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Practice sections in Quantitative, Logical, Verbal, and Data Analysis to prepare for screening tests.</p>
      </div>

      {!selectedSection ? (
        /* Section Selector Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(sec => {
            const count = aptitudeQuestions.filter(q => q.section === sec).length;
            return (
              <div 
                key={sec} 
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:border-blue-500/20 hover:shadow-xs transition"
              >
                <div>
                  <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Core Screening Section
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-3">{sec}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {sec === "Quantitative Aptitude" && "Work & time, speed distance, profit loss, permutations, and compound ratios."}
                    {sec === "Logical Reasoning" && "Syllogisms, seating arrangements, number series, calendar patterns, and directions."}
                    {sec === "Verbal Ability" && "Synonyms, error correction, sentence completions, reading comprehensions, and idioms."}
                    {sec === "Data Interpretation" && "Bar charts, pie visuals, tabular percentages, compound averages, and analytics analysis."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">{count} Practice Questions</span>
                  <button 
                    onClick={() => handleStartSection(sec)}
                    disabled={count === 0}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                      count > 0 
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-900"
                    }`}
                  >
                    Start Test <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Test Taking Mode */
        <div className="max-w-2xl mx-auto space-y-6">
          {sectionQuestions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border text-center py-20 text-gray-400">
              No questions found for {selectedSection}.
              <button onClick={() => setSelectedSection(null)} className="block mt-4 mx-auto text-blue-600 underline">
                Go back
              </button>
            </div>
          ) : !quizFinished ? (
            /* Active Test Card */
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase text-gray-400">{selectedSection}</span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    Question {currentIdx + 1} of {sectionQuestions.length}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                  <Timer className="w-4 h-4 text-indigo-500" />
                  <span>Practice Timer Active</span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
                {sectionQuestions[currentIdx].question}
              </p>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {sectionQuestions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      className={`w-full p-4 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                        isSelected 
                          ? "bg-blue-50/50 border-blue-500 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300" 
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/40 dark:border-gray-700"
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "bg-blue-600 border-blue-600 text-white text-[9px]" : "border-gray-300"
                      }`}>
                        {isSelected && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                <button 
                  onClick={() => setSelectedSection(null)}
                  className="text-xs text-gray-500 hover:underline cursor-pointer"
                >
                  Quit Practice Test
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentIdx] === undefined}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {currentIdx === sectionQuestions.length - 1 ? "Finish Test" : "Next Question"}
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              {/* Score card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs text-center space-y-4">
                <BrainCircuit className="w-12 h-12 text-indigo-600 mx-auto" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSection} Completed</h2>
                  <p className="text-xs text-gray-400 mt-1">Practice score metrics processed below.</p>
                </div>

                <div className="py-4 font-mono">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {quizScore}
                  </span>
                  <span className="text-gray-400"> / {sectionQuestions.length} Correct</span>
                </div>

                {feedback && (
                  <p className="text-xs text-emerald-600 font-bold">
                    {feedback}
                  </p>
                )}

                <div className="pt-4 flex gap-2 justify-center">
                  <button 
                    onClick={() => handleStartSection(selectedSection)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake Practice
                  </button>
                  <button 
                    onClick={() => setSelectedSection(null)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close Test Results
                  </button>
                </div>
              </div>

              {/* Detailed Review List */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700/50 pb-3">
                  <Info className="w-4 h-4 text-blue-600" /> Answers and Explanations Review
                </h3>

                <div className="space-y-6">
                  {sectionQuestions.map((q, idx) => {
                    const ans = selectedAnswers[idx];
                    const isCorrect = ans === q.correctIndex;
                    return (
                      <div key={q.id} className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-700/30 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Q{idx + 1}. {q.question}</p>
                          {isCorrect ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Correct
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Incorrect
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctIndex;
                            const isSelectedOpt = oIdx === ans;
                            return (
                              <div 
                                key={oIdx} 
                                className={`p-2.5 rounded-lg text-xs font-semibold flex justify-between items-center ${
                                  isCorrectOpt ? "bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400" :
                                  isSelectedOpt ? "bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-950/10 dark:text-rose-400" :
                                  "bg-gray-50/50 dark:bg-gray-900/20 text-gray-500"
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrectOpt && <span className="text-[10px] font-bold">Correct Answer</span>}
                                {!isCorrectOpt && isSelectedOpt && <span className="text-[10px] font-bold">Your Choice</span>}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-xl text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">Solution Explanation:</span> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
