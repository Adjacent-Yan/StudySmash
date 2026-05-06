import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Shield, User } from "lucide-react";
import { clearSession, getStoredUser } from "../api/client";

export default function AppShell({ children, title, subtitle, actions = null }) {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mesh-gradient-bg min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link
              to="/dashboard"
              className="text-2xl font-black tracking-tight text-blue-500"
            >
              StudySmash
            </Link>

            {title ? (
              <div className="text-sm font-semibold text-slate-700">{title}</div>
            ) : null}

            {subtitle ? (
              <div className="text-xs text-slate-500">{subtitle}</div>
            ) : null}
          </div>

          <nav className="flex items-center gap-2 text-sm font-semibold">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-white/70"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/quizbrowse"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-white/70"
                }`
              }
            >
              Browse Quiz
            </NavLink>

            <NavLink
              to="/create-quiz"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-white/70"
                }`
              }
            >
              Create Quiz
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-white/70"
                }`
              }
            >
              Leaderboard
            </NavLink>

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`h-9 w-9 cursor-pointer overflow-hidden rounded-full border transition-all hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] ${
                  isDropdownOpen
                    ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                    : "border-blue-300"
                }`}
              >
                <img
                  src={user?.avatar_url}
                  alt="User profile"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
                  >
                    <div className="mb-1 border-b border-gray-100 px-4 py-2">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                        {user?.username ?? "Player"}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <User size={16} />
                      <span className="font-medium">Edit Profile</span>
                    </Link>

                    <Link
                      to="/policy"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Shield size={16} />
                      <span className="font-medium">Policy</span>
                    </Link>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      {actions}
    </div>
  );
}