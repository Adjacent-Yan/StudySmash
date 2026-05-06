import { Link } from 'react-router-dom'
import AuthFooter from "../components/AuthFooter";

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden pastel-mesh-bg bg-background-light text-slate-900 antialiased selection:bg-primary/30">
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 px-6 py-4 backdrop-blur-xl lg:px-20">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-blue-700/90">
                                StudySmash
                            </h2>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="hidden text-sm font-bold text-slate-700 transition-colors hover:text-slate-900 sm:block">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="soft-card-shadow rounded-xl border border-white/50 bg-white px-6 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section>
                    <div className="mesh-gradient-bg min-h-screen px-6 py-10 text-slate-900">
                        <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center gap-10 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-2xl">
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
                </section>

                {/*
                <section className="relative overflow-hidden px-6 py-20 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 mx-auto max-w-5xl text-center"
                    >
                        <h1 className="mb-6 text-5xl leading-tight font-black tracking-tight text-slate-900 md:text-7xl">
                            Learn Faster.
                            <br />
                            Compete Smarter.
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl">
                            Create quizzes, challenge others, and level up your knowledge in
                            the most engaging educational battle arena.
                        </p>
                        
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button className="hero-glow w-full cursor-pointer rounded-xl border border-white/40 bg-primary px-8 py-4 text-lg font-bold text-slate-900 transition-transform hover:scale-105 sm:w-auto">
                                Get Started
                            </button>
                            <button className="soft-card-shadow w-full cursor-pointer rounded-xl border border-white/50 bg-white/60 px-8 py-4 text-lg font-bold text-slate-900 backdrop-blur-sm transition-all hover:bg-white sm:w-auto">
                                Play Now
                            </button>
                        </div>
                       
                    </motion.div>
                </section> 
                */}

                {/*
                <section className="border-y border-white/40 bg-white/40 px-6 py-24 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-slate-900">
                                Master Your Subjects
                            </h2>
                            <p className="text-slate-600">
                                Everything you need to turn studying into an adventure.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;

                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`soft-card-shadow group rounded-2xl border border-white/60 bg-white/70 p-8 transition-all hover:bg-white hover:shadow-2xl ${feature.shadowColor}`}
                                    >
                                        <div
                                            className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} text-slate-700`}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-slate-900">
                                            {feature.title}
                                        </h3>
                                        <p className="leading-relaxed text-slate-600">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
                */}
            </main >
            <AuthFooter />
        </div >
    );
}