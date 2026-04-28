import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, setStoredUser, setToken } from "../api/client";
import InputField from "../components/InputField";
import AuthFooter from "../components/AuthFooter";
import AuthNavbar from "../components/AuthNavbar";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mesh-gradient-bg flex min-h-screen flex-col">
      <AuthNavbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-soft-card">
          <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
          <p className="mt-2 text-slate-600">Use the seeded test account or your own MySQL-backed account.</p>
          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                const data = await loginRequest({ email, password });
                setToken(data.token);
                setStoredUser(data.user);
                navigate("/dashboard", { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not sign in");
              } finally {
                setLoading(false);
              }
            }}
          >
            {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            <InputField label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            <InputField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            <button className="w-full rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-hero-glow" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-600">Need an account? <Link to="/register" className="font-bold text-blue-600">Sign up</Link></p>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
