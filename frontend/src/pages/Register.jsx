import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { registerRequest, setStoredUser, setToken } from "../api/client";
import InputField from "../components/InputField";
import AuthFooter from "../components/AuthFooter";
import AuthNavbar from "../components/AuthNavbar";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mesh-gradient-bg flex min-h-screen flex-col">
      <AuthNavbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-soft-card">
          <h1 className="text-4xl font-black tracking-tight">Create your account</h1>
          <p className="mt-2 text-slate-600">Passwords are hashed before being stored in MySQL.</p>
          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                const data = await registerRequest({ username, email, password });
                setToken(data.token);
                setStoredUser(data.user);
                navigate("/dashboard", { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create account");
              } finally {
                setLoading(false);
              }
            }}
          >
            {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            <InputField label="Username" icon={User} value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
            <InputField label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            <InputField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            <button className="w-full rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-hero-glow" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-blue-600">Log in</Link></p>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
