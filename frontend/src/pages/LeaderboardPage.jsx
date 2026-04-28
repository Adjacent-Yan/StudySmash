import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { fetchLeaderboard, formatPoints } from "../api/client";

const periods = ["daily", "weekly", "overall"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("overall");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLeaderboard(period);
        if (!cancelled) {
          setEntries(data.leaderboard ?? []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load leaderboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <AppShell title="Leaderboard" subtitle="Daily, weekly, and overall rankings based on completed sessions.">
      <div className="mb-6 flex gap-3">
        {periods.map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`rounded-2xl px-4 py-3 font-bold capitalize ${period === p ? 'bg-blue-500 text-white' : 'bg-white/70 text-slate-700'}`}>
            {p}
          </button>
        ))}
      </div>
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      <div className="glass-panel overflow-hidden rounded-3xl shadow-soft-card">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/60 text-left text-sm font-bold text-slate-500">
                <th className="w-24 border-b border-white/50 px-6 py-4">Rank</th>
                <th className="border-b border-white/50 px-6 py-4">Player</th>
                <th className="w-28 border-b border-white/50 px-6 py-4">Level</th>
                <th className="w-32 border-b border-white/50 px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${period}-${entry.rank}-${entry.name}`} className={`${entry.is_user ? "bg-blue-50" : "bg-white/40"} text-slate-900`}>
                  <td className="border-b border-white/40 px-6 py-4 font-black">#{entry.rank}</td>
                  <td className="border-b border-white/40 px-6 py-4">
                    <div className="font-black">{entry.name}</div>
                    <div className="text-sm text-slate-500">{entry.games_played} completed games</div>
                  </td>
                  <td className="border-b border-white/40 px-6 py-4 font-semibold">{entry.lvl}</td>
                  <td className="border-b border-white/40 px-6 py-4 font-black">{formatPoints(entry.pts)}</td>
                </tr>
              ))}
              {!entries.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm font-semibold text-slate-500">
                    No leaderboard entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
