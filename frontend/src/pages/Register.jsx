import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
} from "lucide-react";

import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";
import InputField from "../components/InputField";
import { registerRequest, setStoredUser, setToken } from "../api/client";

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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

                        <form
                            className="space-y-6"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setError("");
                                setLoading(true);
                                try {
                                    const data = await registerRequest({
                                        username: username.trim(),
                                        email: email.trim(),
                                        password,
                                    });
                                    setToken(data.token);
                                    setStoredUser(data.user);
                                    navigate("/dashboard");
                                } catch (err) {
                                    setError(
                                        err instanceof Error
                                            ? err.message
                                            : "Could not create account",
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            {error ? (
                                <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-600">
                                    {error}
                                </p>
                            ) : null}

                            <InputField
                                label="Username"
                                icon={User}
                                name="username"
                                placeholder="username"
                                value={username}
                                onChange={(ev) => setUsername(ev.target.value)}
                                autoComplete="username"
                                required
                                disabled={loading}
                            />

                            <InputField
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(ev) => setEmail(ev.target.value)}
                                autoComplete="email"
                                required
                                disabled={loading}
                            />

                            <InputField
                                label="Password"
                                icon={Lock}
                                type="password"
                                name="password"
                                placeholder="••••••••••••••"
                                value={password}
                                onChange={(ev) => setPassword(ev.target.value)}
                                autoComplete="new-password"
                                required
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-slate-900 shadow-hero-glow transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-60"
                            >
                                {loading ? "Creating account…" : "Sign Up"}
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