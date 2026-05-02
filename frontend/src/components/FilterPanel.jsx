import { ChevronDown } from 'lucide-react';

export default function FilterPanel() {
    return (
        <section
            className="glass-panel rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            id="filter-panel"
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant pl-1">
                        Search Keywords
                    </label>
                    <input
                        type="text"
                        placeholder="Physics, Art..."
                        className="w-full bg-white/50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant pl-1">
                        Difficulty
                    </label>
                    <div className="relative">
                        <select className="w-full bg-white/50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer">
                            <option>All Levels</option>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant pl-1">
                        Questions
                    </label>
                    <div className="relative">
                        <select className="w-full bg-white/50 border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer">
                            <option>Any length</option>
                            <option>5-10 Qs</option>
                            <option>11-25 Qs</option>
                            <option>25+ Qs</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <button className="bg-primary text-on-primary font-black py-3 px-6 rounded-2xl hero-glow-button hover:scale-[1.02] active:scale-95 transition-all text-sm">
                    Apply Filters
                </button>
            </div>
        </section>
    );
}