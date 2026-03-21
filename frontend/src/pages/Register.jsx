import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Crown,
    Chrome,
    Gamepad2,
} from "lucide-react";

import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";
import InputField from "../components/InputField";

export default function Register() {
    const navigate = useNavigate();
    return (
        <div className="mesh-gradient-bg flex min-h-screen flex-col selection:bg-primary/30">
            <AuthNavbar mode="full" />

            <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4">
                <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
                <div className="absolute right-20 bottom-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 w-full max-w-md"
                >
                    <div className="glass-panel rounded-3xl p-4 shadow-soft-card md:p-12 mb-12">
                        <div className="mb-10 text-center">
                            <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
                                Join and Get Started
                            </h1>
                            <p className="font-medium text-slate-500">
                                Level up your learning journey today.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            navigate("/dashboard");
                        }}>
                            <InputField
                                label="Username"
                                icon={User}
                                placeholder="username"
                            />

                            <InputField
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                placeholder="name@example.com"
                            />

                            <InputField
                                label="Password"
                                icon={Lock}
                                type="password"
                                placeholder="••••••••••••••"
                            />

                            <button className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-slate-900 shadow-hero-glow transition-all duration-200 hover:scale-[0.98] active:scale-95">
                                Sign Up
                                <ArrowRight
                                    size={20}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="font-medium text-slate-500">
                                Already a member?{" "}
                                <Link to="/login" className="font-bold text-primary hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <AuthFooter />
        </div>
    );
}