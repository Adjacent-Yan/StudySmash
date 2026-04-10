import {
    Timer,
    Rocket,
    CheckCircle2,
    ArrowRight,
    GraduationCap,
    Trophy,
    BarChart3,
    User,
    Beaker,
    Sparkles,
    Coins,
    Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

export default function Gameplay() {
    // Removed <string | null> generic
    const [selectedOption, setSelectedOption] = useState('B');

    const options = [
        { id: 'A', text: 'Its chemical composition' },
        { id: 'B', text: 'Its initial mass', isCorrect: true },
        { id: 'C', text: 'Its distance from other stars' },
        { id: 'D', text: 'Its rotational speed' },
    ];

    return (
        <div className="min-h-screen selection:bg-primary/30">
            {/* TopAppBar */}
            <header className="fixed top-0 left-0 w-full z-50 glass-header shadow-soft">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Subject</span>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900">Advanced Astrophysics Basics</h1>
                    </div>

                    <div className="hidden md:flex flex-col items-center gap-1">
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">Question 3 of 10</span>
                        <div className="w-48 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '30%' }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-white/50">
                            <Timer className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-black tabular-nums text-slate-900">15s</span>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Score</span>
                            <span className="text-lg font-black text-primary">1,250</span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-200/30 md:hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '30%' }}
                        className="h-full bg-primary"
                    />
                </div>
            </header>

            <main className="pt-32 pb-32 px-4 max-w-5xl mx-auto min-h-screen flex flex-col justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />

                    <div className="glass-card shadow-soft rounded-[2rem] p-8 md:p-16 text-center relative z-10 border-white/60">
                        <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-1.5 rounded-full mb-8 border border-white/40">
                            <Rocket className="w-4 h-4 text-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Astro-Challenge</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
                            What is the primary factor that determines a star's lifecycle?
                        </h2>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {options.map((option, index) => {
                        const isSelected = selectedOption === option.id;
                        const isCorrect = option.isCorrect;

                        return (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <button
                                    onClick={() => setSelectedOption(option.id)}
                                    className={`
                    w-full glass-card rounded-2xl p-6 flex items-center gap-6 transition-all text-left border-2
                    ${isSelected && isCorrect
                                            ? 'bg-white/90 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                                            : isSelected
                                                ? 'bg-white/90 border-primary/50 shadow-hero'
                                                : 'hover:bg-white/100 border-transparent hover:border-primary/50 shadow-soft'
                                        }
                  `}
                                >
                                    <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-colors
                    ${isSelected && isCorrect
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : isSelected
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'
                                        }
                  `}>
                                        {option.id}
                                    </div>
                                    <span className={`text-lg font-bold ${isSelected && isCorrect ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {option.text}
                                    </span>

                                    {isSelected && isCorrect && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="ml-auto"
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                        </motion.div>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isSelected && isCorrect && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute -top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg z-20"
                                        >
                                            Correct! +250
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 flex justify-center md:justify-end">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black tracking-tight shadow-hero transition-all"
                    >
                        <span>Next Question</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-white/70 backdrop-blur-2xl border-t border-white/50 shadow-2xl">
                <NavItem icon={<GraduationCap />} label="Learn" active />
                <NavItem icon={<Trophy />} label="Compete" />
                <NavItem icon={<BarChart3 />} label="Progress" />
                <NavItem icon={<User />} label="Profile" />
            </nav>

            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
                <FloatingIcon icon={<Beaker />} className="top-[20%] left-[10%] text-primary text-6xl" animate />
                <FloatingIcon icon={<Sparkles />} className="top-[60%] right-[5%] text-secondary text-8xl" />
                <FloatingIcon icon={<Coins />} className="bottom-[15%] left-[5%] text-tertiary text-4xl" />
                <FloatingIcon icon={<Calculator />} className="top-[10%] right-[20%] text-blue-200 text-5xl" />

                <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-secondary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
            </div>
        </div>
    );
}

// Removed the TS interface for props
function NavItem({ icon, label, active = false }) {
    return (
        <button className={`
      flex flex-col items-center justify-center p-2 px-4 transition-all
      ${active
                ? 'bg-primary/20 text-primary rounded-2xl ring-4 ring-primary/10'
                : 'text-slate-400 hover:scale-110'
            }
    `}>
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</span>
        </button>
    );
}

// Removed the TS interface for props
function FloatingIcon({ icon, className, animate = false }) {
    return (
        <motion.div
            animate={animate ? {
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
            } : {}}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`absolute ${className}`}
        >
            {icon}
        </motion.div>
    );
}