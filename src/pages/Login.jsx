import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function fmtErr(detail) {
  if (!detail) return "Errore";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      toast.success(mode === "login" ? "Bentornato" : "Account creato");
      nav("/");
    } catch (err) {
      toast.error(fmtErr(err.response?.data?.detail) || "Errore");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 grain relative z-10" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">Personal</p>
          <h1 className="font-display text-5xl tracking-tighter font-light leading-none">
            Cashflow<span className="italic text-neutral-400">.</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-3">
            {mode === "login" ? "Accedi al tuo dashboard" : "Crea un nuovo account"}
          </p>
        </div>

        <form onSubmit={submit} className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Nome</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-white outline-none"
                data-testid="register-name" placeholder="Es. Mario" />
            </label>
          )}
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-white outline-none"
              data-testid="auth-email" placeholder="tu@email.it" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-white outline-none"
              data-testid="auth-password" placeholder="Min 6 caratteri" />
          </label>
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black font-medium px-5 py-3 rounded-full hover:bg-neutral-200 transition-colors active:scale-[0.98] disabled:opacity-50 text-sm"
            data-testid="auth-submit">
            {loading ? "..." : (mode === "login" ? "Accedi" : "Crea account")}
          </button>
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="w-full text-xs text-neutral-400 hover:text-white transition-colors mt-2"
            data-testid="auth-switch">
            {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
