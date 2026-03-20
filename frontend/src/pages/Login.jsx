import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    Mail,
    Lock,
    Rocket,
    ArrowRight,
    Chrome,
    Github,
} from "lucide-react";

import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";
import InputField from "../components/InputField";

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="mesh-gradient-bg flex min-h-screen flex-col selection:bg-primary/30">
            <AuthNavbar mode="simple" />

            <main className="relative flex flex-grow items-center justify-center overflow-hidden px-4">
                <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
                <div className="absolute right-20 bottom-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 w-full max-w-md"
                >
                    <div className="glass-panel rounded-3xl p-4 shadow-soft-card md:p-12 mb-8">

                        <div className="mb-10 text-center">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/40">
                                <Rocket className="text-slate-700" size={32} />
                            </div>

                            <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
                                Welcome Back
                            </h1>
                            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                                Ready to smash some goals?
                            </p>
                        </div>

                        <form className="space-y-3" onSubmit={(e) => {
                            e.preventDefault();
                            navigate("/dashboard");
                        }}>
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
                                rightElement={
                                    <button
                                        type="button"
                                        className="text-[0.75rem] font-bold uppercase tracking-widest text-primary transition-colors hover:text-blue-500"
                                    >
                                        Forgot Password?
                                    </button>
                                }
                            />

                            <div className="flex items-center gap-3 px-1 my-6">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-5 w-5 cursor-pointer rounded border-slate-200 text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-slate-500"
                                >
                                    Keep me logged in
                                </label>
                            </div>

                            <button className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-slate-900 shadow-hero-glow transition-all duration-200 hover:scale-[0.98] active:scale-95">
                                Log In
                                <ArrowRight
                                    size={20}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        </form>

                        <div className="m-8 text-center">
                            <p className="font-medium text-slate-500">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-bold text-primary hover:underline">
                                    Sign Up
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