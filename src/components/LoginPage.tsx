import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [entrando, setEntrando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(false);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(senha);
    if (!ok) {
      setErro(true);
      setShake(true);
      setSenha("");
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    } else {
      // Senha correta: mostra animação antes de entrar
      setEntrando(true);
      // login() já foi chamado mas o AuthProvider mudou isAuthenticated = true
      // a tela de login só some depois de 1.4s (duração da animação)
    }
  };

  if (entrando) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all login-enter-anim">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/logo.png"
            alt="SOS Reparo"
            className="h-32 w-auto object-contain logo-enter-zoom"
            style={{ clipPath: "inset(4% 0 18% 0)" }}
          />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase animate-pulse">Entrando no sistema...</p>
        </div>
        <style>{`
          @keyframes enterAnim {
            0%   { opacity: 0; }
            15%  { opacity: 1; }
            80%  { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.05); }
          }
          .login-enter-anim {
            animation: enterAnim 1.4s ease-in-out forwards;
          }
          @keyframes logoZoom {
            0%   { transform: scale(0.7); opacity: 0; }
            40%  { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .logo-enter-zoom {
            animation: logoZoom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Fundo decorativo colorido */}
      <div className="pointer-events-none absolute inset-0">
        {/* Blobs de cor */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-400/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-green-400/25 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-blue-300/20 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 h-[250px] w-[250px] rounded-full bg-emerald-300/20 blur-[90px]" />
        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #1a56db 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Card animado */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 login-card-enter ${shake ? "login-shake" : ""}`}
      >
        {/* Borda brilhante */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-blue-200/60 via-white/80 to-green-200/40 shadow-2xl shadow-blue-200/50" />

        <div className="relative rounded-3xl bg-white/90 backdrop-blur-xl p-9 shadow-xl border border-white/60">
          
          {/* Logo centralizada */}
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <div className="relative mb-2">
              {/* Halo atrás da logo */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl scale-150" />
              <img
                src="/logo.png"
                alt="SOS Reparo"
                className="relative h-36 w-auto object-contain drop-shadow-md"
                style={{ clipPath: "inset(4% 0 18% 0)" }}
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sistema de Gestão Técnica
            </p>
          </div>

          {/* Divisor */}
          <div className="mb-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={mostrar ? "text" : "password"}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro(false);
                  }}
                  placeholder="••••••••••"
                  autoFocus
                  className={`w-full rounded-xl border-2 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all focus:bg-white focus:ring-3 ${
                    erro
                      ? "border-red-400 focus:ring-red-100 bg-red-50"
                      : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrar(!mostrar)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className={`mt-2 flex items-center gap-1.5 text-xs text-red-500 transition-all duration-200 ${erro ? "opacity-100" : "opacity-0"}`}>
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Senha incorreta. Tente novamente.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !senha}
              className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: "linear-gradient(135deg, #1a56db 0%, #0ea5e9 50%, #10b981 100%)",
                boxShadow: "0 8px 25px rgba(26, 86, 219, 0.35)",
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Entrar no sistema"
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-slate-400">
            SOS Reparo © {new Date().getFullYear()} — Acesso restrito
          </p>
        </div>
      </div>

      <style>{`
        /* Animação de entrada do card */
        @keyframes cardEnter {
          0%   { opacity: 0; transform: translateY(40px) scale(0.95); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-card-enter {
          animation: cardEnter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* Shake no erro */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        .login-shake {
          animation: shake 0.4s ease-in-out;
        }

        /* Blobs animados no fundo */
        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(20px, -20px) scale(1.05); }
          66%      { transform: translate(-15px, 15px) scale(0.97); }
        }
      `}</style>
    </div>
  );
}
