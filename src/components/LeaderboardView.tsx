import React from "react";
import { LeaderboardUser } from "../types";
import { Trophy, Medal, Flame, Award, ArrowUp, Star } from "lucide-react";

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
}) => {
  // Top 3 for the podium
  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-6" id="leaderboard-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard Arena
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Challenge other engineering students. Rank scores compile dynamically from coding problems solved, streaks maintained, and aptitude tests taken.</p>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6 pb-2">
          
          {/* Second Place */}
          {topThree[1] && (
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center space-y-3 order-2 md:order-1 relative md:h-64 flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800">
                2
              </span>
              <div className="pt-2">
                <Medal className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2">{topThree[1].name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{topThree[1].department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{topThree[1].totalScore} pts</p>
                <div className="flex justify-center gap-2 text-[10px] font-mono text-gray-400">
                  <span>Code: {topThree[1].codingScore}</span>
                  <span>Apt: {topThree[1].aptitudeScore}</span>
                </div>
              </div>
            </div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/20 border-2 border-amber-500/30 text-center space-y-4 order-1 md:order-2 relative md:h-76 flex flex-col justify-between shadow-xs">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-base border-4 border-white dark:border-gray-900 shadow-md">
                1
              </span>
              <div className="pt-2">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">{topThree[0].name}</h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{topThree[0].department}</p>
              </div>
              <div className="space-y-1.5 pb-2">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{topThree[0].totalScore} pts</p>
                <div className="flex justify-center gap-3 text-[10px] font-mono text-gray-400">
                  <span>Code: {topThree[0].codingScore}</span>
                  <span>Apt: {topThree[0].aptitudeScore}</span>
                </div>
                {topThree[0].dailyStreak >= 5 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" /> {topThree[0].dailyStreak} Day Streak
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center space-y-3 order-3 relative md:h-60 flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-700 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800">
                3
              </span>
              <div className="pt-2">
                <Award className="w-8 h-8 text-orange-600 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2">{topThree[2].name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{topThree[2].department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{topThree[2].totalScore} pts</p>
                <div className="flex justify-center gap-2 text-[10px] font-mono text-gray-400">
                  <span>Code: {topThree[2].codingScore}</span>
                  <span>Apt: {topThree[2].aptitudeScore}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20 text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Coding Score</th>
                <th className="p-4">Aptitude Score</th>
                <th className="p-4">Streak</th>
                <th className="p-4 pr-6 text-right">Aggregate Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40 text-sm">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Leaderboard is current compiling...
                  </td>
                </tr>
              ) : (
                leaderboard.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/20 transition">
                    <td className="p-4 pl-6 font-mono font-bold text-gray-500">
                      {student.rank === 1 ? "🥇 1" : student.rank === 2 ? "🥈 2" : student.rank === 3 ? "🥉 3" : `#${student.rank}`}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900 dark:text-white">{student.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-gray-500 font-semibold">{student.department || "Engineering"}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{student.codingScore} pts</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{student.aptitudeScore} pts</span>
                    </td>
                    <td className="p-4">
                      {student.dailyStreak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 font-mono">
                          <Flame className="w-3.5 h-3.5 fill-orange-500" /> {student.dailyStreak}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {student.totalScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
