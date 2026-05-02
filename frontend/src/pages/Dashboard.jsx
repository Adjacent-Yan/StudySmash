import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    LayoutDashboard,
    BarChart3,
    Trophy,
    Users,
    ShoppingCart,
    HelpCircle,
    LogOut,
    Bell,
    Settings,
    Crown,
    PlusCircle,
    Timer,
    Star,
    Sparkles,
    User,
    Shield,
    Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
    clearSession,
    fetchDashboard,
    formatHighScore,
    formatPoints,
    getToken,
    toggleSaveQuiz,
} from "../api/client";

const colorStyles = {
    primary: {
        hoverBorder: "hover:border-primary/50",
        text: "text-primary",
        softText: "text-primary/70",
        bgSoft: "bg-primary/20",
        glowBg: "bg-primary/5",
        glowHoverBg: "group-hover:bg-primary/15",
        badgeText: "text-primary",
        border: "border-primary",
        rankBg: "bg-primary",
        rankText: "text-surface",
        titleHover: "group-hover:text-primary",
    },
    secondary: {
        hoverBorder: "hover:border-secondary/50",
        text: "text-secondary",
        softText: "text-secondary/70",
        bgSoft: "bg-secondary/20",
        glowBg: "bg-secondary/5",
        glowHoverBg: "group-hover:bg-secondary/15",
        badgeText: "text-secondary",
        border: "border-secondary",
        rankBg: "bg-secondary",
        rankText: "text-surface",
        titleHover: "group-hover:text-secondary",
    },
    tertiary: {
        hoverBorder: "hover:border-tertiary/50",
        text: "text-tertiary",
        softText: "text-tertiary/70",
        bgSoft: "bg-tertiary/20",
        glowBg: "bg-tertiary/5",
        glowHoverBg: "group-hover:bg-tertiary/15",
        badgeText: "text-tertiary",
        border: "border-tertiary",
        rankBg: "bg-tertiary",
        rankText: "text-surface",
        titleHover: "group-hover:text-tertiary",
    },
    red: {
        hoverBorder: "hover:border-red-400/50",
        text: "text-red-400",
        softText: "text-red-400/70",
        bgSoft: "bg-red-500/20",
        glowBg: "bg-red-400/5",
        glowHoverBg: "group-hover:bg-red-400/15",
        badgeText: "text-red-400",
        border: "border-red-400",
        rankBg: "bg-red-400",
        rankText: "text-surface",
        titleHover: "group-hover:text-red-400",
    },
    muted: {
        hoverBorder: "hover:border-white/10",
        text: "text-on-surface-variant",
        softText: "text-on-surface-variant",
        bgSoft: "bg-surface-high/50",
        glowBg: "bg-white/5",
        glowHoverBg: "group-hover:bg-white/10",
        badgeText: "text-on-surface-variant",
        border: "border-on-surface-variant",
        rankBg: "bg-on-surface-variant",
        rankText: "text-on-surface",
        titleHover: "group-hover:text-on-surface",
    },
};

function SidebarItem({ icon: Icon, label, active = false }) {
    return (
        <motion.a
            whileHover={{ x: 4 }}
            href="#"
            className={`group flex items-center gap-3 px-6 py-3 transition-all ${active
                ? "border-r-4 border-primary bg-surface-high text-primary shadow-[0_0_15px_rgba(173,226,251,0.1)]"
                : "text-on-surface-variant hover:bg-surface-low hover:text-tertiary"
                }`}
        >
            <Icon size={20} className={active ? "fill-primary/20" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-[0.05em]">
                {label}
            </span>
        </motion.a>
    );
}

function StatCard({ label, value, color = "primary" }) {
    const styles = colorStyles[color];

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.10, ease: "easeOut" }}
            className={`glass-panel flex flex-col items-center justify-center rounded-lg border border-white/5 p-6 text-center transition-all group ${styles.hoverBorder}`}
        >
            <span className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-on-surface-variant">
                {label}
            </span>
            <div className={`text-3xl font-black transition-transform group-hover:scale-110 ${styles.text}`}>
                {value}
            </div>
        </motion.div>
    );
}

function QuizCard({ id, category, title, time, rating, image, color = "primary" }) {
    const styles = colorStyles[color];
    const [isSaved, setIsSaved] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleSave = async (e) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            const res = await toggleSaveQuiz(id);
            if (res.saved !== undefined) {
                setIsSaved(res.saved);
            }
        } catch (err) {
            console.error("Failed to toggle save", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isSaved) return null;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-surface-low p-5 transition-all hover:bg-surface-high ${styles.hoverBorder}`}
        >
            <div
                className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl transition-all ${styles.glowBg} ${styles.glowHoverBg}`}
            ></div>

            <button
                onClick={handleToggleSave}
                disabled={isSaving}
                className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
                title={isSaved ? "Remove from Saved" : "Save Quiz"}
            >
                <Bookmark
                    className={`w-5 h-5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-slate-400'}`}
                />
            </button>

            <div className="relative z-10 flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-highest">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>

                <div className="flex-1">
                    <span className={`mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${styles.bgSoft} ${styles.badgeText}`}>
                        {category}
                    </span>

                    <h3 className={`text-lg font-bold text-on-surface transition-colors ${styles.titleHover}`}>
                        {title}
                    </h3>

                    <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                            <Timer size={12} /> {time}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star size={12} className="fill-current" /> {rating}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function LeaderboardItem({ rank, name, lvl, pts, image, isUser = false }) {
    let styles = colorStyles.muted;

    if (rank === 1) styles = colorStyles.tertiary;
    if (isUser) styles = colorStyles.primary;

    return (
        <div
            className={`flex items-center justify-between rounded-lg p-3 transition-all ${isUser
                ? "border-2 border-primary bg-surface-high shadow-[0_0_15px_rgba(173,226,251,0.2)]"
                : "border border-white/5 bg-surface-low"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className={`h-10 w-10 overflow-hidden rounded-full border-2 ${styles.border}`}>
                        <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>

                    <div
                        className={`absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${styles.rankBg} ${styles.rankText}`}
                    >
                        {rank}
                    </div>
                </div>

                <div>
                    <div className={`text-sm font-bold ${isUser ? "text-primary" : "text-on-surface"}`}>
                        {name}
                    </div>
                    <div
                        className={`text-[10px] font-black uppercase tracking-widest ${isUser ? "text-primary/70" : "text-on-surface-variant"
                            }`}
                    >
                        LVL {lvl}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div
                    className={`font-black ${rank === 1
                        ? "text-tertiary"
                        : isUser
                            ? "text-primary"
                            : "text-on-surface"
                        }`}
                >
                    {pts}
                </div>
                <div className="text-[9px] font-bold uppercase text-on-surface-variant">
                    PTS
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [dash, setDash] = useState(null);
    const [loadErr, setLoadErr] = useState(null);

    useEffect(() => {
        if (!getToken()) {
            navigate("/login", { replace: true });
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchDashboard();
                if (!cancelled) {
                    setDash(data);
                    setLoadErr(null);
                }
            } catch (e) {
                if (cancelled) return;
                const status = e && typeof e === "object" && "status" in e ? e.status : null;
                if (status === 401) {
                    clearSession();
                    navigate("/login", { replace: true });
                    return;
                }
                setLoadErr(
                    e instanceof Error ? e.message : "Failed to load dashboard",
                );
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

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

    const user = dash?.user;
    const accuracyStr =
        user && typeof user.accuracy_pct === "number"
            ? `${user.accuracy_pct.toFixed(1)}%`
            : "—";

    if (loadErr && !dash) {
        return (
            <div className="mesh-gradient-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 selection:bg-primary/30">
                <p className="text-center text-on-surface">{loadErr}</p>
                <Link
                    to="/login"
                    className="font-bold text-primary underline-offset-4 hover:underline"
                >
                    Back to login
                </Link>
            </div>
        );
    }

    if (!dash || !user) {
        return (
            <div className="mesh-gradient-bg flex min-h-screen items-center justify-center selection:bg-primary/30">
                <p className="text-sm font-medium tracking-widest text-on-surface-variant uppercase">
                    Loading your dashboard…
                </p>
            </div>
        );
    }
    const quizzes = dash.quizzes ?? [];
    const leaderboard = dash.leaderboard ?? [];

    return (
        <div className="mesh-gradient-bg min-h-screen pb-20 selection:bg-primary/30 md:pb-0">
            <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-primary/15 bg-white/40 px-6 backdrop-blur-xl">
                <div className="flex items-center gap-8">
                    <Link
                        to="/dashboard"
                        className="text-2xl font-black tracking-tighter text-slate-900"
                    >
                        StudySmash
                    </Link>

                    <div className="hidden items-center gap-6 md:flex">
                        <a className="border-b-2 border-primary pb-1 text-sm font-medium tracking-wide text-primary" href="#">
                            Dashboard
                        </a>
                        <Link
                            to="/quizbrowse">
                            <a className="text-sm font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary" href="#">
                                Play
                            </a>
                        </Link>
                        <a className="text-sm font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary" href="#">
                            Create Quiz
                        </a>
                        <a className="text-sm font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary" href="#">
                            Leaderboard
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="rounded-lg p-2 text-primary transition-all hover:bg-surface-high/50">
                        <Bell size={20} />
                    </button>
                    <button className="rounded-lg p-2 text-primary transition-all hover:bg-surface-high/50">
                        <Settings size={20} />
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`h-8 w-8 cursor-pointer overflow-hidden rounded-full border transition-all hover:shadow-[0_0_12px_rgba(173,226,251,0.35)] ${isDropdownOpen
                                ? "border-primary shadow-[0_0_10px_rgba(173,226,251,0.4)]"
                                : "border-primary/30"
                                }`}
                        >
                            <img
                                src={user.avatar_url}
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
                                    <div className="mb-1 border-b border-white/5 px-4 py-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-primary">
                                            {user.username}
                                        </p>
                                        <p className="text-[10px] text-on-surface-variant">
                                            {user.tier}
                                        </p>
                                    </div>

                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-low hover:text-primary"
                                    >
                                        <User size={16} />
                                        <span className="font-medium">Edit Profile</span>
                                    </a>

                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-low hover:text-primary"
                                    >
                                        <Shield size={16} />
                                        <span className="font-medium">Policy</span>
                                    </a>

                                    <div className="my-1 border-t border-white/5"></div>

                                    <Link
                                        to="/"
                                        onClick={() => clearSession()}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-surface-low"
                                    >
                                        <LogOut size={16} />
                                        <span className="font-medium">Log out</span>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            <aside className="fixed top-16 left-0 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-primary/10 bg-surface pt-8 pb-4 lg:flex">
                <div className="mb-8 px-6">
                    <div className="glass-panel flex items-center gap-3 rounded-lg border border-primary/10 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/20 text-tertiary">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-primary">
                                {user.tier}
                            </div>
                            <div className="text-xs font-medium text-on-surface-variant">
                                LVL {user.level}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active />
                    <SidebarItem icon={BarChart3} label="My Stats" />
                    <SidebarItem icon={Trophy} label="Achievements" />
                    <SidebarItem icon={Users} label="Friends" />
                    <SidebarItem icon={ShoppingCart} label="Shop" />
                </nav>

                <div className="mt-auto px-6">
                    {/*
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mb-6 w-full rounded-lg bg-primary py-3 text-xs font-bold uppercase tracking-widest text-surface shadow-[0_0_20px_rgba(173,226,251,0.3)]"
                    >
                        Upgrade to Plus
                    </motion.button>
                    */}

                    <div className="space-y-1 border-t border-primary/10 pt-4">
                        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant transition-all hover:text-primary" href="#">
                            <HelpCircle size={16} />
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.05em]">
                                Help
                            </span>
                        </a>

                        <Link
                            to="/"
                            onClick={() => clearSession()}
                            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant transition-all hover:text-red-400"
                        >
                            <LogOut size={16} />
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.05em]">
                                Logout
                            </span>
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="px-6 pt-24 pb-12 lg:ml-64">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-12">
                    <div className="space-y-10 xl:col-span-8">
                        <section className="relative">
                            <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"></div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 text-5xl leading-none font-black tracking-tighter text-on-surface md:text-7xl"
                            >
                                Welcome back,
                                <br />
                                <span className="text-glow text-primary">{user.username}</span>
                            </motion.h1>

                            <p className="max-w-xl text-lg text-on-surface-variant">
                                Your study streak is currently{" "}
                                <span className="font-bold text-tertiary">
                                    {user.streak_days} days
                                </span>
                                . Keep the
                                flame alive and smash today's daily challenge!
                            </p>
                        </section>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard
                                label="Games Played"
                                value={formatPoints(user.games_played)}
                                color="primary"
                            />
                            <StatCard
                                label="High Score"
                                value={formatHighScore(user.high_score)}
                                color="secondary"
                            />
                            <StatCard label="Accuracy" value={accuracyStr} color="tertiary" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <motion.button
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.1, ease: "easeOut" }}
                                className="group relative h-48 overflow-hidden rounded-xl shadow-[0_15px_40px_rgba(173,226,251,0.2)] transition-all hover:shadow-[0_20px_60px_rgba(173,226,251,0.3)]"
                            >
                                <div className="absolute inset-0 bg-primary opacity-90 transition-opacity group-hover:opacity-100"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                                <Link
                                    to="/quizbrowse">
                                    <div className="relative flex h-full flex-col items-center justify-center p-8 text-surface">
                                        <Crown size={48} className="mb-3 fill-current transition-transform duration-150 ease-out group-hover:scale-105" />
                                        <span className="text-3xl font-black tracking-tighter transition-transform duration-150 ease-out group-hover:scale-105">
                                            PLAY QUIZ
                                        </span>
                                        <span className="mt-1 text-sm font-bold opacity-70 transition-transform duration-150 ease-out group-hover:scale-105">
                                            Jump into the action
                                        </span>
                                    </div>
                                </Link>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.1, ease: "easeOut" }}
                                className="glass-panel group relative h-48 overflow-hidden rounded-xl border-2 border-primary/30 transition-all hover:border-primary/60"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>

                                <Link
                                    to="#">
                                    <div className="relative flex h-full flex-col items-center justify-center p-8">
                                        <PlusCircle size={48} className="mb-3 text-primary transition-transform duration-150 ease-out group-hover:scale-105" />
                                        <span className="text-3xl font-black tracking-tighter text-primary transition-transform duration-150 ease-out group-hover:scale-105">
                                            CREATE QUIZ
                                        </span>
                                        <span className="mt-1 text-sm font-bold text-on-surface-variant transition-transform duration-150 ease-out group-hover:scale-105">
                                            Build your own universe
                                        </span>
                                    </div>
                                </Link>
                            </motion.button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight">
                                    <Bookmark size={24} className="fill-primary/20 text-primary" />
                                    Saved Quizzes
                                </h2>
                                <a
                                    className="text-xs font-black uppercase tracking-[0.1em] text-primary transition-colors hover:text-on-surface"
                                    href="#"
                                >
                                    View All
                                </a>
                            </div>

                            {quizzes.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {quizzes.map((q) => (
                                        <QuizCard
                                            key={q.id}
                                            id={q.id}
                                            category={q.category}
                                            title={q.title}
                                            time={q.time}
                                            rating={q.rating}
                                            color={q.color}
                                            image={q.image}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-surface-low/50 py-12 text-center">
                                    <Bookmark className="mb-4 text-on-surface-variant opacity-50" size={48} />
                                    <h3 className="mb-2 text-xl font-bold">No Saved Quizzes Yet</h3>
                                    <p className="mb-6 max-w-sm text-sm text-on-surface-variant">
                                        You haven't saved any quizzes. Head over to the Quiz Browse page to find some challenges and save them here!
                                    </p>
                                    <Link
                                        to="/quizbrowse"
                                        className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-surface transition-transform hover:scale-105"
                                    >
                                        Browse Quizzes
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8 xl:col-span-4">
                        <div className="glass-panel overflow-hidden rounded-lg border border-white/10">
                            <div className="flex items-center justify-between border-b border-white/10 bg-surface-high px-6 py-5">
                                <h3 className="text-xl font-black tracking-tight">Top Players</h3>
                                <Trophy size={20} className="text-tertiary" />
                            </div>

                            <div className="space-y-4 p-6">
                                {leaderboard.map((row) => (
                                    <LeaderboardItem
                                        key={`${row.rank}-${row.name}`}
                                        rank={row.rank}
                                        name={row.name}
                                        lvl={row.lvl}
                                        pts={formatPoints(row.pts)}
                                        image={row.image}
                                        isUser={row.is_user}
                                    />
                                ))}
                            </div>

                            <button className="w-full border-t border-white/10 p-4 text-xs font-black uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary">
                                View Full Ranking
                            </button>
                        </div>

                        <div className="glass-panel relative overflow-hidden rounded-lg border border-secondary/20 p-6">
                            <div className="absolute -right-4 -bottom-4 rotate-12 scale-150 text-secondary/5">
                                <Trophy size={120} />
                            </div>

                            <h3 className="mb-4 text-xl font-black text-secondary">
                                Quest Progress
                            </h3>

                            <div className="relative z-10 space-y-4">
                                <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Smash 5 Science Quizzes</span>
                                        <span className="text-secondary">4/5</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-highest">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "80%" }}
                                            className="h-full bg-secondary shadow-[0_0_10px_rgba(233,222,250,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Perfect Score Streak</span>
                                        <span className="text-tertiary">2/3</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-highest">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "66%" }}
                                            className="h-full bg-tertiary shadow-[0_0_10px_rgba(251,252,219,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*
                        <div className="flex items-center gap-6 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-surface-high to-surface p-6">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                                <Timer size={32} className="animate-pulse text-primary" />
                            </div>
                            <div>
                                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                    Live Event
                                </div>
                                <h4 className="text-lg leading-tight font-bold">
                                    Flash Study Frenzy
                                </h4>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    2X XP for the next 2 hours!
                                </p>
                            </div>
                        </div>
                        */}
                    </div>
                </div>
            </main>

            {/*}
            <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/10 bg-surface-low/90 px-4 backdrop-blur-xl md:hidden">
                <a className="flex flex-col items-center gap-1 text-primary" href="#">
                    <LayoutDashboard size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                        Home
                    </span>
                </a>
                <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
                    <Crown size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                        Play
                    </span>
                </a>
                <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
                    <PlusCircle size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                        Create
                    </span>
                </a>
                <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
                    <BarChart3 size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                        Ranks
                    </span>
                </a>
            </nav>*/}
        </div>
    );
}