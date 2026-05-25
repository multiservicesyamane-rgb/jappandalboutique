import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Phone, Search, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending:   { label: "En attente",  color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: <Clock className="h-4 w-4" />,        step: 1 },
  contacted: { label: "Contacté",    color: "text-blue-600 bg-blue-50 border-blue-200",       icon: <Phone className="h-4 w-4" />,        step: 2 },
  confirmed: { label: "Confirmé",    color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Package className="h-4 w-4" />,      step: 3 },
  delivered: { label: "Livré ✅",    color: "text-green-600 bg-green-50 border-green-200",    icon: <CheckCircle className="h-4 w-4" />,  step: 4 },
  cancelled: { label: "Annulé",      color: "text-red-600 bg-red-50 border-red-200",          icon: <XCircle className="h-4 w-4" />,      step: 0 },
};

const steps = [
  { step: 1, label: "Reçue",     icon: <Clock className="h-4 w-4" /> },
  { step: 2, label: "Contacté",  icon: <Phone className="h-4 w-4" /> },
  { step: 3, label: "Confirmée", icon: <Package className="h-4 w-4" /> },
  { step: 4, label: "Livrée",    icon: <Truck className="h-4 w-4" /> },
];

export default function OrderTracking() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { data: orders, isLoading, refetch } = trpc.orders.getByPhone.useQuery(
    { phone: searchPhone },
    { enabled: searchPhone.length >= 6 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 6) { alert("Veuillez entrer un numéro valide"); return; }
    setSearchPhone(cleaned);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container max-w-xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1E5A8E]/10 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-[#1E5A8E]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Suivi de commande</h1>
          <p className="text-sm text-gray-500">Entrez votre numéro de téléphone pour voir vos commandes</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            <Phone className="h-4 w-4 text-[#1E5A8E]" /> Votre numéro de téléphone
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 77 123 45 67"
              className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5A8E]/40 focus:border-[#1E5A8E]"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1E5A8E] text-white font-bold px-5 py-3 rounded-xl text-sm active:scale-95 transition-transform"
            >
              <Search className="h-4 w-4" />
              Chercher
            </button>
          </div>
        </form>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#1E5A8E]" />
          </div>
        )}

        {searchPhone && !isLoading && orders && (
          orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <Package className="h-12 w-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
              <p className="text-xs text-gray-400 mt-1">Vérifiez le numéro utilisé lors de votre commande</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-600">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
                <button onClick={() => refetch()} className="text-xs text-[#1E5A8E] flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Actualiser
                </button>
              </div>

              {orders.map((order) => {
                const status = statusConfig[order.status] ?? statusConfig.pending;
                const currentStep = status.step;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                      <p className="text-xs font-mono text-gray-400">Commande #{order.id}</p>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <div className="p-4">
                      {/* Product */}
                      <div className="mb-4">
                        <p className="font-semibold text-gray-800">{order.productName}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-[#1E5A8E] font-bold">
                            {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} FCFA
                          </span>
                          <span className="text-xs text-gray-400">× {order.quantity}</span>
                        </div>
                        {order.deliveryLocation && (
                          <p className="text-xs text-gray-500 mt-1">📍 {order.deliveryLocation}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(order.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>

                      {/* Progress bar — only for non-cancelled */}
                      {order.status !== "cancelled" && (
                        <div className="flex items-center gap-0">
                          {steps.map((s, i) => {
                            const active = currentStep >= s.step;
                            const isCurrent = currentStep === s.step;
                            return (
                              <div key={s.step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors ${active ? "bg-[#A8D24E]" : "bg-gray-200"} ${isCurrent ? "ring-2 ring-[#A8D24E] ring-offset-1" : ""}`}>
                                    {s.icon}
                                  </div>
                                  <span className={`text-[9px] mt-1 font-medium ${active ? "text-[#A8D24E]" : "text-gray-400"}`}>
                                    {s.label}
                                  </span>
                                </div>
                                {i < steps.length - 1 && (
                                  <div className={`flex-1 h-1 mx-1 rounded ${currentStep > s.step ? "bg-[#A8D24E]" : "bg-gray-200"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
