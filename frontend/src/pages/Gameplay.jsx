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
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateQuiz } from '../api/client';

export default function Gameplay() {
    const location = useLocation();
    const navigate = useNavigate();

    const config = location.state || {
        categoryId: 9,
        difficulty: 'easy',
        amount: 10,
        title: 'General Knowledge Mix',
        categoryName: 'General'
    };

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [options, setOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    const [hasAnswered, setHasAnswered] = useState(false);

    // Decode base64 helper
    const decodeBase64 = (str) => {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return str;
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const data = await generateQuiz({
                    amount: config.amount,
                    categoryId: config.categoryId,
                    difficulty: config.difficulty
                });

                if (!mounted) return;

                if (data.response_code !== 0 || !data.results || data.results.length === 0) {
                    setError('Failed to fetch questions. Please try different settings.');
                    setIsLoading(false);
                    return;
                }

                const decodedQuestions = data.results.map(q => ({
                    question: decodeBase64(q.question),
                    correctAnswer: decodeBase64(q.correct_answer),
                    incorrectAnswers: q.incorrect_answers.map(decodeBase64),
                    difficulty: decodeBase64(q.difficulty),
                    category: decodeBase64(q.category)
                }));

                setQuestions(decodedQuestions);
                setupQuestion(decodedQuestions[0]);
                setIsLoading(false);
            } catch (err) {
                if (!mounted) return;
                console.error(err);
                setError('Network error occurred.');
                setIsLoading(false);
            }
        };

        fetchQuestions();
        return () => { mounted = false; };
    }, [config.amount, config.categoryId, config.difficulty]);

    // Timer logic
    useEffect(() => {
        if (isLoading || error || hasAnswered || questions.length === 0) return;

        if (timeLeft === 0) {
            setHasAnswered(true);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, isLoading, error, hasAnswered, questions.length]);

    const setupQuestion = (q) => {
        const allOptions = [...q.incorrectAnswers.map(text => ({ text, isCorrect: false })), { text: q.correctAnswer, isCorrect: true }];
        // Shuffle options
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        // Add ID (A, B, C, D)
        const labels = ['A', 'B', 'C', 'D'];
        const formattedOptions = allOptions.map((opt, i) => ({
            id: labels[i],
            text: opt.text,
            isCorrect: opt.isCorrect
        }));

        setOptions(formattedOptions);
        setSelectedOption(null);
        setHasAnswered(false);
        setTimeLeft(15);
    };

    const handleOptionSelect = (optionId) => {
        if (hasAnswered) return;
        setSelectedOption(optionId);
        setHasAnswered(true);
        const isCorrect = options.find(o => o.id === optionId)?.isCorrect;
        if (isCorrect) {
            // Give points based on time left
            setScore(s => s + 100 + (timeLeft * 10));
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setupQuestion(questions[currentIndex + 1]);
        } else {
            // End of quiz
            alert(`Quiz Finished! Your score: ${score}`);
            navigate('/dashboard');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center selection:bg-primary/30">
                <div className="flex flex-col items-center gap-4">
                    <Rocket className="w-12 h-12 text-primary animate-bounce" />
                    <h2 className="text-xl font-black text-slate-700 tracking-widest uppercase">Preparing Quiz...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center selection:bg-primary/30">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-red-500 mb-4 bg-red-100 p-4 rounded-full">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">{error}</h2>
                    <button
                        onClick={() => navigate('/quizbrowse')}
                        className="mt-6 bg-primary text-white font-bold py-3 px-8 rounded-full hero-glow-button"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen selection:bg-primary/30">
            {/* TopAppBar */}
            <header className="fixed top-0 left-0 w-full z-50 glass-header shadow-soft">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{config.categoryName}</span>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900">{config.title}</h1>
                    </div>

                    <div className="hidden md:flex flex-col items-center gap-1">
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">Question {currentIndex + 1} of {questions.length}</span>
                        <div className="w-48 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-white/50">
                            <Timer className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-black tabular-nums text-slate-900">{timeLeft}s</span>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Score</span>
                            <span className="text-lg font-black text-primary">{score.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-200/30 md:hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </header>

            <main className="pt-32 pb-32 px-4 max-w-5xl mx-auto min-h-screen flex flex-col justify-center relative z-10">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />

                    <div className="glass-card shadow-soft rounded-[2rem] p-8 md:p-16 text-center relative z-10 border-white/60">
                        <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-1.5 rounded-full mb-8 border border-white/40">
                            <Rocket className="w-4 h-4 text-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Question {currentIndex + 1}</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
                            {questions[currentIndex]?.question}
                        </h2>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {options.map((option, index) => {
                        const isSelected = selectedOption === option.id;
                        const isCorrect = option.isCorrect;
                        const showCorrect = hasAnswered && isCorrect;
                        const showWrong = hasAnswered && isSelected && !isCorrect;

                        return (
                            <motion.div
                                key={`${currentIndex}-${option.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <button
                                    onClick={() => handleOptionSelect(option.id)}
                                    disabled={hasAnswered}
                                    className={`
                    w-full glass-card rounded-2xl p-6 flex items-center gap-6 transition-all text-left border-2
                    ${showCorrect
                                            ? 'bg-white/90 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                                            : showWrong
                                                ? 'bg-white/90 border-red-400/50 shadow-[0_0_20px_rgba(248,113,113,0.2)]'
                                                : isSelected
                                                    ? 'bg-white/90 border-primary/50 shadow-hero'
                                                    : 'hover:bg-white/100 border-transparent hover:border-primary/50 shadow-soft'
                                        }
                  `}
                                >
                                    <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-colors
                    ${showCorrect
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : showWrong
                                                ? 'bg-red-100 text-red-600'
                                                : isSelected
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'
                                        }
                  `}>
                                        {option.id}
                                    </div>
                                    <span className={`text-lg font-bold ${showCorrect ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {option.text}
                                    </span>

                                    {showCorrect && (
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
                                    {showCorrect && isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute -top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg z-20"
                                        >
                                            Correct! +{100 + (timeLeft * 10)}
                                        </motion.div>
                                    )}
                                    {showWrong && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute -top-4 right-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg z-20"
                                        >
                                            Incorrect!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 flex justify-center md:justify-end">
                    <AnimatePresence>
                        {hasAnswered && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextQuestion}
                                className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black tracking-tight shadow-hero transition-all"
                            >
                                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        )}
                    </AnimatePresence>
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