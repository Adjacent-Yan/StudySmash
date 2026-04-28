import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../api/client";

export default function AppShell({ children, title, subtitle, actions = null }) {
  const navigate = useNavigate();
  const user = getStoredUser();

  return (
    <div className="mesh-gradient-bg min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-blue-500">StudySmash</Link>
            {title ? <div className="text-sm font-semibold text-slate-700">{title}</div> : null}
            {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
          </div>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <NavLink to="/dashboard" className={({isActive}) => `rounded-xl px-4 py-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-white/70'}`}>Dashboard</NavLink>
            <NavLink to="/create-quiz" className={({isActive}) => `rounded-xl px-4 py-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-white/70'}`}>Create Quiz</NavLink>
            <NavLink to="/leaderboard" className={({isActive}) => `rounded-xl px-4 py-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-white/70'}`}>Leaderboard</NavLink>
            <div className="hidden rounded-xl bg-white/70 px-4 py-2 text-slate-700 md:block">{user?.username ?? 'Player'}</div>
            <button
              onClick={() => {
                clearSession();
                navigate("/login", { replace: true });
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      {actions}
    </div>
  );
}
