import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Package,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminStatistics() {
  const { data: dashStats, isLoading } = trpc.statistics.dashboard.useQuery();
  const { data: orderStats } = trpc.orders.stats.useQuery();
  const { data: topProducts } = trpc.statistics.popularProducts.useQuery({ limit: 10 });
  const { data: recentOrders } = trpc.statistics.recentOrders.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <AdminLayout title="Statistiques">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Statistiques" subtitle="Analyse des performances">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {dashStats?.totalRevenue ? parseFloat(dashStats.totalRevenue).toLocaleString("fr-FR") : "0"} F
            </p>
            <p className="text-xs text-gray-400 mt-1">Chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{orderStats?.total || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total commandes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{orderStats?.delivered || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Livrées</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{orderStats?.pending || 0}</p>
            <p className="text-xs text-gray-400 mt-1">En attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Top products */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#A8D24E]" />
              Produits les plus vendus
            </h3>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product: any, index: number) => (
                  <div key={product.id || index} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-5 text-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.totalSold} vendu(s)</p>
                    </div>
                    <p className="text-sm font-semibold text-[#1E5A8E]">
                      {parseFloat(product.revenue || "0").toLocaleString("fr-FR")} F
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#A8D24E]" />
              Commandes récentes
            </h3>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{order.productName}</p>
                      <p className="text-xs text-gray-400">
                        {order.customerName || order.customerPhone || "—"} - x{order.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          order.status === "delivered"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status === "pending"
                          ? "En attente"
                          : order.status === "delivered"
                          ? "Livré"
                          : order.status === "cancelled"
                          ? "Annulé"
                          : order.status === "confirmed"
                          ? "Confirmé"
                          : "Contacté"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Aucune commande</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
