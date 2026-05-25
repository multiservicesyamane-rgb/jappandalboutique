import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useCustomer } from "@/contexts/CustomerContext";
import { toast } from "sonner";
import {
  User, Phone, Mail, MapPin, ShoppingBag, Package, Clock,
  CheckCircle, Truck, XCircle, LogOut, Edit3, Save, X, ChevronRight, Loader2,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "En attente",   color: "#f59e0b", icon: Clock },
  contacted: { label: "Contacté",     color: "#3b82f6", icon: Phone },
  confirmed: { label: "Confirmé",     color: "#8b5cf6", icon: CheckCircle },
  delivered: { label: "Livré",        color: "#10b981", icon: Truck },
  cancelled: { label: "Annulé",       color: "#ef4444", icon: XCircle },
};

export default function Account() {
  const [, navigate] = useLocation();
  const { customer, isLoading, refetch } = useCustomer();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", address: "" });

  const { data: orders = [], isLoading: ordersLoading } = trpc.customerAuth.myOrders.useQuery(undefined, { enabled: !!customer });

  const logout = trpc.customerAuth.logout.useMutation({
    onSuccess: () => { refetch(); navigate("/"); toast.success("Déconnecté"); },
  });

  const updateProfile = trpc.customerAuth.updateProfile.useMutation({
    onSuccess: () => { toast.success("Profil mis à jour !"); setEditing(false); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const startEdit = () => {
    setEditForm({ name: customer?.name || "", email: customer?.email || "", address: customer?.address || "" });
    setEditing(true);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-[#060f1e]">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#A8D24E] animate-spin" />
      </div>
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen flex flex-col bg-[#060f1e]">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(168,210,78,0.1)" }}>
            <User className="h-10 w-10 text-[#A8D24E]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Espace Client</h2>
          <p className="text-white/50 text-sm mb-6">Connectez-vous pour accéder à vos commandes et gérer votre profil.</p>
          <div className="flex flex-col gap-3">
            <Link href="/compte/connexion">
              <span className="block w-full text-center py-3.5 rounded-xl font-bold text-white cursor-pointer" style={{ background: "#A8D24E", boxShadow: "0 0 20px rgba(168,210,78,0.3)" }}>
                Se connecter
              </span>
            </Link>
            <Link href="/compte/inscription">
              <span className="block w-full text-center py-3.5 rounded-xl font-bold text-white/70 cursor-pointer border border-white/20 hover:border-white/40">
                Créer un compte
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#060f1e] text-white">
      <Header />
      <main className="flex-1 pb-20 md:pb-8">
        {/* Profile header */}
        <div
          className="relative overflow-hidden py-8 px-4"
          style={{ background: "linear-gradient(135deg, rgba(30,90,142,0.3), rgba(168,210,78,0.1))" }}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#A8D24E] to-transparent" />
          <div className="container max-w-2xl mx-auto flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-2xl"
              style={{ background: "rgba(168,210,78,0.2)", boxShadow: "0 0 20px rgba(168,210,78,0.2)" }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black truncate">{customer.name}</h1>
              <p className="text-sm text-white/50">{customer.phone}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-[#A8D24E]">{orders.length} commande{orders.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <button
              onClick={() => logout.mutate()}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container max-w-2xl mx-auto px-4 mt-4">
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
            {([["orders", "Mes commandes", ShoppingBag], ["profile", "Mon profil", User]] as const).map(([t, label, Icon]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={tab === t ? { background: "#A8D24E", color: "#000", boxShadow: "0 0 15px rgba(168,210,78,0.3)" } : { color: "rgba(255,255,255,0.5)" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Orders tab ── */}
          {tab === "orders" && (
            <div className="space-y-3">
              {ordersLoading ? (
                <div className="text-center py-12"><Loader2 className="h-8 w-8 text-[#A8D24E] animate-spin mx-auto" /></div>
              ) : orders.length === 0 ? (
                <div
                  className="text-center py-12 rounded-2xl border border-white/10"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <Package className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 font-medium">Aucune commande pour l'instant</p>
                  <p className="text-white/25 text-sm mt-1">Vos commandes apparaîtront ici</p>
                  <Link href="/produits">
                    <span className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#A8D24E] font-semibold cursor-pointer hover:underline">
                      Découvrir nos produits <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border p-4 transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/40">#{order.id}</span>
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${status.color}20`, color: status.color }}
                            >
                              <StatusIcon className="h-2.5 w-2.5" />
                              {status.label}
                            </span>
                          </div>
                          <p className="font-semibold text-sm truncate">{order.productName}</p>
                          <p className="text-xs text-white/40 mt-0.5">
                            Qté: {order.quantity} · {parseFloat(order.totalAmount).toLocaleString("fr-FR")} FCFA
                          </p>
                          {order.deliveryLocation && (
                            <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{order.deliveryLocation}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-[#A8D24E]">
                            {parseFloat(order.totalAmount).toLocaleString("fr-FR")} F
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <div
              className="rounded-2xl border p-6 space-y-5"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              {editing ? (
                <>
                  {[
                    { k: "name", label: "Nom", icon: User, type: "text" },
                    { k: "email", label: "Email", icon: Mail, type: "email" },
                    { k: "address", label: "Adresse", icon: MapPin, type: "text" },
                  ].map(({ k, label, icon: Icon, type }) => (
                    <div key={k}>
                      <label className="text-xs text-white/50 font-medium mb-1.5 block">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                          type={type}
                          value={(editForm as any)[k]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [k]: e.target.value }))}
                          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => updateProfile.mutate(editForm)}
                      disabled={updateProfile.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black text-sm"
                      style={{ background: "#A8D24E" }}
                    >
                      {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Enregistrer
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-3 rounded-xl border border-white/20 text-sm text-white/60 hover:border-white/40">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {[
                    { label: "Nom", value: customer.name, icon: User },
                    { label: "Téléphone", value: customer.phone, icon: Phone },
                    { label: "Email", value: customer.email || "—", icon: Mail },
                    { label: "Adresse", value: customer.address || "—", icon: MapPin },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,210,78,0.1)" }}>
                        <Icon className="h-4 w-4 text-[#A8D24E]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={startEdit}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#A8D24E]/30 text-[#A8D24E] text-sm font-semibold hover:bg-[#A8D24E]/10 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier mon profil
                  </button>
                  <button
                    onClick={() => logout.mutate()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <div className="hidden md:block"><Footer /></div>
    </div>
  );
}
