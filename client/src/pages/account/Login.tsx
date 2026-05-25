import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Phone, Lock, Eye, EyeOff, LogIn, ShoppingBag, Loader2 } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export default function CustomerLogin() {
  const [, navigate] = useLocation();
  const { refetch } = useCustomer();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleLogin = trpc.customerAuth.googleLogin.useMutation({
    onSuccess: () => {
      toast.success("Connexion Google réussie !");
      refetch();
      navigate("/compte");
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => googleLogin.mutate({ credential: res.credential }),
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        locale: "fr",
        width: googleBtnRef.current.offsetWidth || 320,
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, []);

  const login = trpc.customerAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie !");
      refetch();
      navigate("/compte");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Remplissez tous les champs");
    login.mutate({ phone, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060f1e]">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl p-8 border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(30,90,142,0.15), rgba(168,210,78,0.06))",
              borderColor: "rgba(168,210,78,0.2)",
              boxShadow: "0 0 60px rgba(168,210,78,0.06)",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#A8D24E] to-transparent" />

            {/* Icon */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(168,210,78,0.15)", boxShadow: "0 0 20px rgba(168,210,78,0.2)" }}
              >
                <ShoppingBag className="h-8 w-8 text-[#A8D24E]" />
              </div>
              <h1 className="text-2xl font-black text-white">Connexion</h1>
              <p className="text-sm text-white/50 mt-1">Accédez à votre espace client</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="text-xs text-white/60 font-medium mb-1.5 block">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(168,210,78,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-white/60 font-medium mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(168,210,78,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={login.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all active:scale-95 mt-2"
                style={{
                  background: login.isPending ? "rgba(168,210,78,0.4)" : "#A8D24E",
                  boxShadow: "0 0 20px rgba(168,210,78,0.3)",
                }}
              >
                {login.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Connexion...</>
                ) : (
                  <><LogIn className="h-5 w-5" /> Se connecter</>
                )}
              </button>
            </form>

            {/* Google Sign-In */}
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <span className="text-xs text-white/30 shrink-0">ou continuer avec</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>
                <div className="flex justify-center">
                  {googleLogin.isPending ? (
                    <div className="flex items-center gap-2 text-white/50 text-sm py-3">
                      <Loader2 className="h-4 w-4 animate-spin" /> Connexion Google...
                    </div>
                  ) : (
                    <div ref={googleBtnRef} className="w-full" />
                  )}
                </div>
              </>
            )}

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                Pas encore de compte ?{" "}
                <Link href="/compte/inscription">
                  <span className="text-[#A8D24E] font-semibold hover:underline cursor-pointer">
                    Créer un compte
                  </span>
                </Link>
              </p>
            </div>
          </div>

          {/* Guest option */}
          <div className="mt-4 text-center">
            <Link href="/produits">
              <span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">
                Continuer en tant qu'invité →
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
