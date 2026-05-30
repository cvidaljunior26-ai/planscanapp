import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("E-mail ou senha invalidos."); } else { navigate("/"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-tight">Plan<span className="text-accent">Scan</span></h1>
          <p className="text-sub text-sm mt-2">Gestao inteligente de gondolas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-lg font-extrabold text-textMain mb-6">Entrar na plataforma</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-sub mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sub mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="..." />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-extrabold py-3 rounded-xl shadow-card hover:bg-primary-md transition-colors disabled:opacity-60">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
