import { motion } from "motion/react";
import { Link } from 'react-router-dom'
import {
    Sparkles,
    Edit3,
    Users,
    BarChart3,
    Timer,
    Share2,
    Mail,
} from "lucide-react";

const features = [
    {
        title: "Create Your Own Quizzes",
        description:
            "Build custom study sets tailored to your specific curriculum or hobbies in minutes.",
        icon: Edit3,
        bgColor: "bg-accent-purple",
        shadowColor: "hover:shadow-accent-purple/20",
    },
    {
        title: "Compete with Others",
        description:
            "Challenge friends or climb the global leaderboard in real-time head-to-head battles.",
        icon: Users,
        bgColor: "bg-accent-yellow",
        shadowColor: "hover:shadow-accent-yellow/20",
    },
    {
        title: "Track Your Progress",
        description:
            "Visualize your growth with detailed analytics and personalized learning recommendations.",
        icon: BarChart3,
        bgColor: "bg-primary/40",
        shadowColor: "hover:shadow-primary/20",
    },
];

const quizOptions = [
    { label: "A", text: "Ancient Egyptians" },
    { label: "B", text: "Sumerians", active: true },
    { label: "C", text: "Indus Valley" },
    { label: "D", text: "The Maya" },
];

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden pastel-mesh-bg bg-background-light text-slate-900 antialiased selection:bg-primary/30">
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 px-6 py-4 backdrop-blur-xl lg:px-20">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-slate-800 shadow-sm">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                StudySmash
                            </h2>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link
                            to="/"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                            Home
                        </Link>
                        <a
                            href="#features"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                            Features
                        </a>
                        <a
                            href="#play"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                            Play
                        </a>
                        <a
                            href="#about"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                            About
                        </a>
                    </nav>

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

                <section className="px-6 py-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-slate-200/40"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-300"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-200"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-200"></div>
                                </div>
                                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Live Match: World History
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 font-bold text-slate-700">
                                    <Timer className="h-4 w-4 text-primary" />
                                    <span>00:15</span>
                                </div>
                                <div className="font-bold text-slate-500">Score: 1,240</div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="mb-12">
                                <span className="mb-4 inline-block rounded-full bg-accent-purple/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Question 4 of 10
                                </span>
                                <h3 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                                    Which civilization is credited with the invention of the
                                    earliest known writing system, Cuneiform?
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {quizOptions.map((option) => (
                                    <button
                                        key={option.label}
                                        className={`group flex cursor-pointer items-center gap-4 rounded-xl p-5 text-left transition-all ${option.active
                                            ? "border-2 border-primary bg-primary/20 shadow-md shadow-primary/10"
                                            : "border border-slate-100 bg-white hover:border-primary/50 hover:bg-primary/10"
                                            }`}
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded font-bold ${option.active
                                                ? "bg-primary text-slate-700"
                                                : "bg-slate-50 text-slate-400 group-hover:bg-primary/20 group-hover:text-slate-700"
                                                }`}
                                        >
                                            {option.label}
                                        </div>
                                        <span
                                            className={`font-semibold ${option.active ? "text-slate-900" : "text-slate-600"
                                                }`}
                                        >
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="px-6 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="soft-card-shadow relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/50 bg-white/60 px-8 py-16 backdrop-blur-md"
                    >
                        <div className="relative z-10">
                            <h2 className="mb-6 text-3xl font-black text-slate-900 md:text-4xl">
                                Start your learning journey today
                            </h2>
                            <p className="mx-auto mb-10 max-w-lg font-medium text-slate-600">
                                Join over 500,000 students and educators smashing their goals
                                daily.
                            </p>
                            <button className="hero-glow cursor-pointer rounded-xl border border-white/40 bg-primary px-10 py-4 text-xl font-bold text-slate-900 transition-transform hover:scale-105">
                                Sign Up for Free
                            </button>
                        </div>
                    </motion.div>
                </section>
            </main>

            <footer className="mt-auto border-t border-white/40 bg-white/40 px-6 py-16 backdrop-blur-md lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-12 md:flex-row">
                        <div className="max-w-xs">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-slate-800">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    StudySmash
                                </h2>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500">
                                Empowering learners through gamified experiences. Making
                                knowledge accessible and fun for everyone, everywhere.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-900">
                                    Platform
                                </h4>
                                <ul className="space-y-2 text-sm font-medium text-slate-500">
                                    {["How it works", "Pricing", "Quizzes"].map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="transition-colors hover:text-slate-900"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-900">
                                    Company
                                </h4>
                                <ul className="space-y-2 text-sm font-medium text-slate-500">
                                    {["About", "Contact", "Blog"].map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="transition-colors hover:text-slate-900"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-900">
                                    Connect
                                </h4>
                                <div className="flex gap-3">
                                    <a
                                        href="#"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/50 text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/50 text-slate-500 transition-all hover:bg-white hover:text-slate-900"
                                    >
                                        <Mail className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200/40 pt-8 sm:flex-row">
                        <p className="text-xs font-medium text-slate-400">
                            © 2024 StudySmash. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-xs font-medium text-slate-400">
                            <a href="#" className="hover:text-slate-900">
                                Privacy Policy
                            </a>
                            <a href="#" className="hover:text-slate-900">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}