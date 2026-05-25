import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Phone, Lock, Eye, EyeOff, User, Mail, MapPin, UserPlus, Loader2 } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

export default function CustomerRegister() {
  const [, navigate] = useLocation();
  const { refetch } = useCustomer();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPwd: "", address: "" });
  const [showPwd, setShowPwd] = useState(false);

  const register = trpc.customerAuth.register.useMutation({
    onSuccess: () => {
      toast.success("Compte créé ! Bienvenue chez Jappandal 🎉");
      refetch();
      navigate("/compte");
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) return toast.error("Remplissez les champs obligatoires");
    if (form.password !== form.confirmPwd) return toast.error("Les mots de passe ne correspondent pas");
    if (form.password.length < 6) return toast.error("Mot de passe trop court (min. 6 caractères)");
    register.mutate({
      name: form.name,
      phone: form.phone,
      password: form.password,
      email: form.email || undefined,
      address: form.address || undefined,
    });
  };

  const fields = [
    { key: "name", label: "Nom complet *", icon: User, type: "text", placeholder: "Prénom Nom" },
    { key: "phone", label: "Téléphone *", icon: Phone, type: "tel", placeholder: "77 123 45 67" },
    { key: "email", label: "Email (optionnel)", icon: Mail, type: "email", placeholder: "exemple@email.com" },
    { key: "address", label: "Adresse (optionnel)", icon: MapPin, type: "text", placeholder: "Quartier, Dakar" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#060f1e]">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl p-8 border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(30,90,142,0.15), rgba(168,210,78,0.06))",
              borderColor: "rgba(168,210,78,0.2)",
              boxShadow: "0 0 60px rgba(168,210,78,0.06)",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#A8D24E] to-transparent" />

            <div className="text-center mb-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(168,210,78,0.15)", boxShadow: "0 0 20px rgba(168,210,78,0.2)" }}
              >
                <UserPlus className="h-8 w-8 text-[#A8D24E]" />
              </div>
              <h1 className="text-2xl font-black text-white">Créer un compte</h1>
              <p className="text-sm text-white/50 mt-1">Rejoignez la communauté Jappandal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-white/60 font-medium mb-1.5 block">{label}</label>
                  {key === "phone" ? (
                    <div className="flex">
                      <span
                        className="flex items-center gap-1 px-3 py-3.5 rounded-l-xl text-sm font-semibold whitespace-nowrap text-white/70"
                        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.1)", borderRight: "none" }}
                      >
                        🇸🇳 +221
                      </span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="77 123 45 67"
                        className="flex-1 pr-4 py-3.5 rounded-r-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", paddingLeft: "14px" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(168,210,78,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        type={type}
                        value={(form as any)[key]}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(168,210,78,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Password */}
              {(["password", "confirmPwd"] as const).map((k) => (
                <div key={k}>
                  <label className="text-xs text-white/60 font-medium mb-1.5 block">
                    {k === "password" ? "Mot de passe *" : "Confirmer le mot de passe *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={form[k]}
                      onChange={(e) => set(k, e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(168,210,78,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    {k === "password" && (
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={register.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all active:scale-95 mt-2"
                style={{ background: register.isPending ? "rgba(168,210,78,0.4)" : "#A8D24E", boxShadow: "0 0 20px rgba(168,210,78,0.3)" }}
              >
                {register.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Création...</> : <><UserPlus className="h-5 w-5" /> Créer mon compte</>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                Déjà un compte ?{" "}
                <Link href="/compte/connexion">
                  <span className="text-[#A8D24E] font-semibold hover:underline cursor-pointer">Se connecter</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
