import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { clearSession, fetchDashboard, formatHighScore, formatPoints, setStoredUser } from "../api/client";

function StatCard({ label, value }) {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-soft-card">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dashboard = await fetchDashboard();
        if (cancelled) return;
        setData(dashboard);
        if (dashboard.user) setStoredUser(dashboard.user);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return <AppShell title="Dashboard"><div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div></AppShell>;
  }
  if (!data?.user) {
    return <AppShell title="Dashboard"><div className="text-sm font-semibold text-slate-500">Loading dashboard...</div></AppShell>;
  }

  return (
    <AppShell title={`Welcome back, ${data.user.username}`} subtitle="Start a quiz battle, create a new set, or chase the rankings.">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Level" value={data.user.level} />
        <StatCard label="Points" value={formatPoints(data.user.points)} />
        <StatCard label="High score" value={formatHighScore(data.user.high_score)} />
        <StatCard label="Accuracy" value={`${Number(data.user.accuracy_pct ?? 0).toFixed(1)}%`} />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.7fr,1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Public quizzes</h2>
            <Link to="/create-quiz" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Create quiz</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {data.quizzes.map((quiz) => (
              <div key={quiz.id} className="glass-panel rounded-3xl p-5 shadow-soft-card">
                <div className="text-sm font-semibold text-blue-700">{quiz.category}</div>
                <h3 className="mt-2 text-xl font-black">{quiz.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                  <span>{quiz.question_count} questions</span>
                  <span>{quiz.time}</span>
                  <span>{quiz.rating} rating</span>
                </div>
                <Link to={`/gameplay/${quiz.id}`} className="mt-5 inline-flex rounded-xl bg-blue-500 px-4 py-3 font-bold text-white shadow-hero-glow">
                  Play now
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-soft-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Top players</h2>
            <Link to="/leaderboard" className="text-sm font-bold text-blue-600">Full leaderboard</Link>
          </div>
          <div className="space-y-3">
            {data.leaderboard.map((entry) => (
              <div key={`${entry.rank}-${entry.name}`} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${entry.is_user ? 'bg-blue-50' : 'bg-white/60'}`}>
                <div>
                  <div className="text-sm font-semibold text-slate-500">#{entry.rank}</div>
                  <div className="font-black">{entry.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-black">{formatPoints(entry.pts)}</div>
                  <div className="text-xs text-slate-500">Lvl {entry.lvl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
