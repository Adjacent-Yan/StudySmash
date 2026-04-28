import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mesh-gradient-bg min-h-screen px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center gap-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-block rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-soft-card">
            StudySmash
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Study smarter. Compete faster.</h1>
          <p className="mt-6 text-lg text-slate-700">
            Create quiz sets, race through timed questions, track your mastery, and climb daily, weekly, and all-time leaderboards.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-hero-glow">Create account</Link>
            <Link to="/login" className="rounded-2xl bg-white/80 px-6 py-4 font-bold text-slate-900 shadow-soft-card">Log in</Link>
          </div>
        </div>
        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          {[
            ["Interactive gameplay", "Timed quiz play with instant correctness feedback and score bonuses for speed."],
            ["Quiz creation", "Build public or private quiz sets with multiple-choice questions."],
            ["Leaderboard", "See how you rank across daily, weekly, and overall competition."],
            ["Progress tracking", "Monitor best scores, mastery percentage, and repeat attempts."],
          ].map(([title, text]) => (
            <div key={title} className="glass-panel rounded-3xl p-6 shadow-soft-card">
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm text-slate-700">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
