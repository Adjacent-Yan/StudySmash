import { Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../api/client";

export default function Navbar() {
    const navigate = useNavigate();
    const user = getStoredUser();

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="fixed top-0 z-[60] w-full bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hidden md:block">
                <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <NavLink
                            to="/dashboard"
                            className="text-2xl font-black tracking-tighter text-blue-700 bg-blue-100"
                        >
                            StudySmash
                        </NavLink>

                        <div className="flex gap-2">
                            <NavbarLink to="/dashboard" label="Dashboard" />
                            <NavbarLink to="/play" label="Play" />
                            <NavbarLink to="/create-quiz" label="Create Quiz" />
                            <NavbarLink to="/leaderboard" label="Leaderboard" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                className="pl-10 pr-4 py-2 bg-white/40 border-0 rounded-full w-64 focus:ring-2 focus:ring-blue-400 text-sm outline-none"
                            />
                        </div>

                        <div className="hidden rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 md:block">
                            {user?.username ?? "Player"}
                        </div>

                        <button
                            onClick={() => {
                                clearSession();
                                navigate("/login", { replace: true });
                            }}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar */}
            <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/70 backdrop-blur-2xl z-50 border-t border-white/30 rounded-t-[1.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden">
                <MobileNavLink to="/dashboard" icon="home" label="Dashboard" />
                <MobileNavLink to="/play" icon="sports_esports" label="Play" />
                <MobileNavLink to="/create-quiz" icon="add_circle" label="Create" />
                <MobileNavLink to="/leaderboard" icon="leaderboard" label="Rank" />
            </nav>
        </>
    );
}

function NavbarLink({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-white/70"
                }`
            }
        >
            {label}
        </NavLink>
    );
}

function MobileNavLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center px-5 py-2 hover:scale-110 transition-transform active:scale-90 ${isActive
                    ? "bg-blue-100/50 text-blue-700 rounded-2xl"
                    : "text-slate-500"
                }`
            }
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">
                {label}
            </span>
        </NavLink>
    );
}