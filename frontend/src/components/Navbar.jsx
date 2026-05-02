import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
    return (
        <>
            {/* Desktop Navbar */}
            <nav
                className="fixed top-0 z-[60] w-full bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hidden md:block"
                id="desktop-nav"
            >
                <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-black tracking-tighter text-slate-900" id="logo">
                            StudySmash
                        </span>
                        <div className="flex gap-6">
                            <NavLink label="Dashboard" />
                            <NavLink label="Browse" active />
                            <NavLink label="Library" />
                            <NavLink label="Leaderboard" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                className="pl-10 pr-4 py-2 bg-white/40 border-0 rounded-full w-64 focus:ring-2 focus:ring-primary text-sm outline-none"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCF0F-lfqDCy_-G-m8Qz5CbzneoMIybPgFOZjnB05uF6cKfJIe0tR3jj21hcayo0q69e80zBArHNL_JAmHe3l5RG2NRRpa0Xa4r-UD1_6-ilvNUfKeapttcaRQzbnWUV3RyvGKcOA6ae-7v9PUm2mq9EY2hd2UGu8tOVjjAG43HWGD-QU4uFr-7VlNfA605LVRqYu6KrFbSATvRmVaePjH04NcXS3n_DeaESW7KLFbWaO-RN-Q3fks50lMLNqcGlT49-Bx9Z3uIA"
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar */}
            <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/70 backdrop-blur-2xl z-50 border-t border-white/30 rounded-t-[1.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden">
                <MobileNavLink icon="home" label="Home" />
                <MobileNavLink icon="search" label="Browse" active />
                <MobileNavLink icon="auto_awesome" label="Quests" />
                <MobileNavLink icon="person" label="Profile" />
            </nav>
        </>
    );
}

function NavLink({ label, active = false }) {
    return (
        <a
            href="#"
            className={`font-medium transition-all duration-300 px-3 py-1 rounded-xl active:scale-95 ${active
                ? 'text-sky-500 border-b-2 border-sky-400 font-bold'
                : 'text-slate-600 hover:bg-white/20 hover:backdrop-blur-lg'
                }`}
        >
            {label}
        </a>
    );
}

function MobileNavLink({ icon, label, active = false }) {
    return (
        <a
            href="#"
            className={`flex flex-col items-center justify-center px-5 py-2 hover:scale-110 transition-transform active:scale-90 ${active ? 'bg-sky-100/50 text-sky-600 rounded-2xl' : 'text-slate-500'
                }`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{label}</span>
        </a>
    );
}