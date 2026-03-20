import { Link } from "react-router-dom";
import { CircleUser } from "lucide-react";

export default function AuthNavbar({ mode = "full" }) {
    return (
        <header className="z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <Link
                to="/"
                className="cursor-pointer text-2xl font-black tracking-tighter text-blue-400"
            >
                StudySmash
            </Link>

            {mode === "full" ? (
                <>
                    <Link
                        to="/"
                        className="rounded-xl bg-primary px-6 py-2 font-bold text-slate-900 shadow-hero-glow transition-all duration-200 active:scale-95"
                    >
                        Back to Home
                    </Link>
                </>
            ) : (
                <Link
                    to="/"
                    className="rounded-xl bg-primary px-6 py-2 font-bold text-slate-900 shadow-hero-glow transition-all duration-200 active:scale-95"
                >
                    Back to Home
                </Link>
            )}
        </header>
    );
}