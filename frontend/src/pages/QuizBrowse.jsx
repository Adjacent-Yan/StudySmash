import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from "react";
import FilterPanel from '../components/FilterPanel';
import QuizCard from '../components/QuizCard';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, User, Shield, LogOut, Trophy, Timer, X } from "lucide-react";
import { clearSession, fetchDashboard, getToken, formatPoints, fetchCategories } from "../api/client";

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

export default function QuizBrowse() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [dash, setDash] = useState(null);

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
                }
            } catch (e) {
                if (cancelled) return;
                const status = e && typeof e === "object" && "status" in e ? e.status : null;
                if (status === 401) {
                    clearSession();
                    navigate("/login", { replace: true });
                    return;
                }
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

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [configData, setConfigData] = useState({ amount: 10, difficulty: 'easy' });
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

    useEffect(() => {
        let mounted = true;
        fetchCategories().then(data => {
            if (mounted && data && data.trivia_categories) {
                setCategories(data.trivia_categories);
            }
        }).catch(err => {
            console.error("Could not fetch categories", err);
        });
        return () => { mounted = false; };
    }, []);

    const user = dash?.user;
    const leaderboard = dash?.leaderboard ?? [];

    const handleStartQuiz = (quiz) => {
        setSelectedCategory(quiz);
        setIsModalOpen(true);
    };

    const handleConfirmStart = () => {
        setIsModalOpen(false);
        navigate('/gameplay', {
            state: {
                categoryId: selectedCategory.categoryId,
                difficulty: configData.difficulty,
                amount: configData.amount,
                title: selectedCategory.title,
                categoryName: selectedCategory.category
            }
        });
    };

    const colorClasses = [
        'bg-primary/10 text-primary border-primary/20',
        'bg-secondary/10 text-secondary border-secondary/20',
        'bg-tertiary/10 text-tertiary border-tertiary/20',
        'bg-sky-500/10 text-sky-600 border-sky-500/20',
        'bg-purple-500/10 text-purple-600 border-purple-500/20'
    ];

    const mappedQuizzes = categories.map((cat, i) => ({
        id: cat.id,
        title: cat.name,
        category: cat.name.split(':')[0].trim(),
        categoryId: cat.id,
        difficulty: 'Mixed',
        questionCount: 'Varies',
        durationMinutes: 15,
        avatars: [`https://api.dicebear.com/7.x/avataaars/svg?seed=${cat.id}L`, `https://api.dicebear.com/7.x/avataaars/svg?seed=${cat.id}R`],
        participantCount: 120 + (i * 7),
        colorClass: colorClasses[i % colorClasses.length]
    }));

    const uniqueCategories = Array.from(new Set(mappedQuizzes.map(q => q.category)));
    const mainCategories = ['All', ...uniqueCategories];

    const filteredQuizzes = activeCategoryFilter === 'All'
        ? mappedQuizzes
        : mappedQuizzes.filter(q => q.category === activeCategoryFilter);

    return (
        <div className="mesh-gradient-bg min-h-screen selection:bg-primary/30">
            <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-primary/15 bg-white/40 px-6 backdrop-blur-xl">
                <div className="flex items-center gap-8">
                    <Link
                        to="/dashboard"
                        className="text-2xl font-black tracking-tighter text-slate-900"
                    >
                        StudySmash
                    </Link>

                    <div className="hidden items-center gap-6 md:flex">
                        <Link to="/dashboard" className="text-sm font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary">
                            Dashboard
                        </Link>
                        <a className="border-b-2 border-primary pb-1 text-sm font-medium tracking-wide text-primary" href="#">
                            Play
                        </a>
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
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="User profile"
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-200 animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && user && (
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

            <main className="pt-24 pb-28 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area (Left) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Header */}
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4"
                            id="hero-header"
                        >
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-primary/20 text-sky-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]">
                                    StudySmash Explorer
                                </span>
                                <span className="bg-secondary/30 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]">
                                    Powered by Trivia API
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.025em] text-on-surface mb-4">
                                Choose Your Next{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dim to-secondary-dim">
                                    Challenge
                                </span>
                            </h1>
                            <p className="text-on-surface-variant text-lg max-w-2xl font-medium">
                                Explore thousands of community-crafted quizzes or test your knowledge
                                with daily featured topics. Level up your profile with every correct
                                answer.
                            </p>
                        </motion.header>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <FilterPanel />
                        </motion.div>

                        {/* Categories Chips */}
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                            id="categories"
                        >
                            {mainCategories.map((catName) => (
                                <button
                                    key={catName}
                                    onClick={() => setActiveCategoryFilter(catName)}
                                    className={`whitespace-nowrap px-6 py-2 rounded-full border font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                                        activeCategoryFilter === catName 
                                            ? 'bg-primary text-surface border-primary' 
                                            : 'bg-surface-high text-on-surface-variant border-white/10 hover:border-primary/50'
                                    }`}
                                >
                                    {catName}
                                </button>
                            ))}
                        </motion.section>


                        {/* Quiz Grid */}
                        <motion.section
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 },
                                },
                            }}
                            className="flex flex-col gap-4"
                            id="quiz-grid"
                        >
                            {filteredQuizzes.map((quiz) => (
                                <motion.div
                                    key={quiz.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <QuizCard quiz={quiz} onStart={handleStartQuiz} layout="horizontal" />
                                </motion.div>
                            ))}
                        </motion.section>
                    </div>

                    {/* Sidebar / Right Panel */}
                    <div className="space-y-8 lg:col-span-4">
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

            <AnimatePresence>
                {isModalOpen && selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-surface text-on-surface shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 bg-surface-high p-6">
                                <div>
                                    <h3 className="text-xl font-black tracking-tighter">Configure Match</h3>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{selectedCategory.title}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-full p-2 text-on-surface-variant hover:bg-white/10 hover:text-on-surface transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="mb-3 block text-sm font-black uppercase tracking-widest text-on-surface-variant">
                                        Question Amount
                                    </label>
                                    <div className="flex gap-3">
                                        {[10, 15, 20].map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setConfigData({ ...configData, amount: amt })}
                                                className={`flex-1 rounded-xl border-2 py-3 text-sm font-black transition-all ${configData.amount === amt
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-white/10 text-on-surface-variant hover:border-primary/50'
                                                    }`}
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-black uppercase tracking-widest text-on-surface-variant">
                                        Difficulty
                                    </label>
                                    <div className="flex gap-3">
                                        {['easy', 'medium', 'hard'].map((diff) => (
                                            <button
                                                key={diff}
                                                onClick={() => setConfigData({ ...configData, difficulty: diff })}
                                                className={`flex-1 rounded-xl border-2 py-3 text-sm font-black capitalize transition-all ${configData.difficulty === diff
                                                    ? 'border-secondary bg-secondary/10 text-secondary'
                                                    : 'border-white/10 text-on-surface-variant hover:border-secondary/50'
                                                    }`}
                                            >
                                                {diff}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmStart}
                                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black tracking-widest text-on-primary transition-transform hover:bg-primary-dim active:scale-95 hero-glow-button"
                                >
                                    START QUIZ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}