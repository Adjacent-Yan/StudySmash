import { Clock, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toggleSaveQuiz } from '../api/client';

export default function QuizCard({ quiz, onStart, initiallySaved = false, layout = 'vertical' }) {
    const [isSaved, setIsSaved] = useState(initiallySaved);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleSave = async (e) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            const res = await toggleSaveQuiz(quiz.id);
            if (res.saved !== undefined) {
                setIsSaved(res.saved);
            }
        } catch (err) {
            console.error("Failed to toggle save", err);
        } finally {
            setIsSaving(false);
        }
    };
    const difficultyColor =
        {
            Easy: 'text-secondary-dim',
            Medium: 'text-primary-dim',
            Hard: 'text-red-400',
        }[quiz.difficulty] || 'text-slate-500';

    const categoryBg =
        {
            Science: 'bg-secondary/40 text-secondary-dim',
            History: 'bg-tertiary/40 text-tertiary-dim',
            General: 'bg-primary/20 text-primary-dim',
            Tech: 'bg-secondary/40 text-secondary-dim',
        }[quiz.category] || 'bg-slate-100 text-slate-600';

    // Horizontal Layout
    if (layout === 'horizontal') {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass-card relative rounded-3xl p-6 flex flex-row items-center justify-between gap-6 group hover:bg-white transition-all duration-300"
                id={`quiz-card-${quiz.id}`}
            >
                <button 
                    onClick={handleToggleSave}
                    disabled={isSaving}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-black/5 transition-colors"
                    title={isSaved ? "Remove from Saved" : "Save Quiz"}
                >
                    <Bookmark 
                        className={`w-5 h-5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-slate-400'}`} 
                    />
                </button>
                <div className="flex-1 pr-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className={`${categoryBg} px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest`}>
                            {quiz.category}
                        </span>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{quiz.durationMinutes} MIN</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-primary-dim transition-colors">
                        {quiz.title}
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase ${difficultyColor} tracking-tighter`}>
                            {quiz.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-on-surface-variant">
                            {quiz.questionCount} Questions
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-8 relative z-20 pr-8">
                    <div className="flex -space-x-3 hidden sm:flex">
                        {quiz.avatars.map((avatar, i) => (
                            <img
                                key={i}
                                src={avatar}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ))}
                        {quiz.participantCount > quiz.avatars.length && (
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                                +{quiz.participantCount - quiz.avatars.length}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => onStart && onStart(quiz)}
                        className="bg-primary hover:bg-primary-dim text-on-primary font-black py-4 px-8 rounded-2xl hero-glow-button text-sm transition-all active:scale-95 flex items-center gap-2">
                        Start Quiz
                    </button>
                </div>
            </motion.div>
        );
    }

    // Default Vertical Layout
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="glass-card relative rounded-3xl p-6 flex flex-col group hover:bg-white transition-all duration-300"
            id={`quiz-card-${quiz.id}`}
        >
            <button 
                onClick={handleToggleSave}
                disabled={isSaving}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-black/5 transition-colors"
                title={isSaved ? "Remove from Saved" : "Save Quiz"}
            >
                <Bookmark 
                    className={`w-5 h-5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-slate-400'}`} 
                />
            </button>
            <div className="flex justify-between items-start mb-6">
                <span className={`${categoryBg} px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest`}>
                    {quiz.category}
                </span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{quiz.durationMinutes} MIN</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-primary-dim transition-colors">
                {quiz.title}
            </h3>

            <div className="flex items-center gap-4 mb-8">
                <span className={`text-[10px] font-black uppercase ${difficultyColor} tracking-tighter`}>
                    {quiz.difficulty}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant">
                    {quiz.questionCount} Questions
                </span>
            </div>

            <div className="mt-auto flex items-center justify-between">
                <div className="flex -space-x-2">
                    {quiz.avatars.map((avatar, i) => (
                        <img
                            key={i}
                            src={avatar}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full border-2 border-white object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ))}
                    {quiz.participantCount > quiz.avatars.length && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">
                            +{quiz.participantCount - quiz.avatars.length}
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => onStart && onStart(quiz)}
                    className="bg-primary hover:bg-primary-dim text-on-primary font-black py-2.5 px-5 rounded-2xl hero-glow-button text-xs transition-all active:scale-95 flex items-center gap-2">
                    Start Quiz
                </button>
            </div>
        </motion.div>
    );
}