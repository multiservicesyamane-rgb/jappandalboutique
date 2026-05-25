import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  contacted: "Contacté",
  confirmed: "Confirmé",
  delivered: "Livré",
  cancelled: "Annulé",
};

export default function AdminStatistics() {
  const utils = trpc.useUtils();
  const { data: dashStats, isLoading } = trpc.statistics.dashboard.useQuery();
  const { data: orderStats } = trpc.orders.stats.useQuery();
  const { data: topProducts } = trpc.statistics.popularProducts.useQuery({ limit: 10 });
  const { data: recentOrders } = trpc.statistics.recentOrders.useQuery({ limit: 50 });
  const { data: allOrders } = trpc.orders.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();

  const handleRefresh = () => {
    utils.statistics.dashboard.invalidate();
    utils.orders.stats.invalidate();
    utils.statistics.popularProducts.invalidate();
    utils.statistics.recentOrders.invalidate();
    utils.orders.list.invalidate();
  };

  // Compute period revenues from allOrders
  const todayRevenue = allOrders
    ?.filter((o) => o.status !== "cancelled" && isToday(new Date(o.createdAt)))
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) || 0;

  const weekRevenue = allOrders
    ?.filter((o) => o.status !== "cancelled" && isThisWeek(new Date(o.createdAt), { weekStartsOn: 1 }))
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) || 0;

  const monthRevenue = allOrders
    ?.filter((o) => o.status !== "cancelled" && isThisMonth(new Date(o.createdAt)))
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) || 0;

  const totalRevenue = dashStats?.totalRevenue ? parseFloat(dashStats.totalRevenue) : 0;

  // Compute last 7 days bar data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = format(d, "EEE dd", { locale: fr });
    const dayStr = d.toDateString();
    const revenue = allOrders
      ?.filter((o) => o.status !== "cancelled" && new Date(o.createdAt).toDateString() === dayStr)
      .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) || 0;
    const count = allOrders?.filter((o) => new Date(o.createdAt).toDateString() === dayStr).length || 0;
    return { label, revenue, count };
  });

  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);

  const outOfStockCount = products?.filter((p) => p.inStock === 0).length || 0;

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
    <AdminLayout title="Statistiques" subtitle="Analyse complète des performances">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </Button>
      </div>

      {/* Revenue KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-[#1E5A8E] to-[#0D3B6E] border-0 shadow-lg text-white">
          <CardContent className="p-4">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-bold">{totalRevenue.toLocaleString("fr-FR")} F</p>
            <p className="text-xs text-white/70 mt-1">CA Total (livré)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{monthRevenue.toLocaleString("fr-FR")} F</p>
            <p className="text-xs text-gray-400 mt-1">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <BarChart2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{weekRevenue.toLocaleString("fr-FR")} F</p>
            <p className="text-xs text-gray-400 mt-1">Cette semaine</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center mb-3">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{todayRevenue.toLocaleString("fr-FR")} F</p>
            <p className="text-xs text-gray-400 mt-1">Aujourd'hui</p>
          </CardContent>
        </Card>
      </div>

      {/* Order status KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: orderStats?.total || 0, icon: ShoppingCart, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "En attente", value: orderStats?.pending || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Contactées", value: orderStats?.contacted || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Confirmées", value: orderStats?.confirmed || 0, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Livrées", value: orderStats?.delivered || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Annulées", value: orderStats?.cancelled || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-white border shadow-sm">
              <CardContent className="p-3 text-center">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue bar chart (last 7 days) */}
      <Card className="bg-white border shadow-sm mb-6">
        <CardContent className="p-4 lg:p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#1E5A8E]" />
            Revenus des 7 derniers jours
          </h3>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-400 font-medium">
                  {day.revenue > 0 ? `${Math.round(day.revenue / 1000)}k` : ""}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: 90 }}>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#1E5A8E] to-[#4a9fd4] transition-all duration-500 hover:opacity-80"
                    style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 90)}px` }}
                    title={`${day.revenue.toLocaleString("fr-FR")} FCFA · ${day.count} commande${day.count !== 1 ? "s" : ""}`}
                  />
                </div>
                <span className="text-[9px] text-gray-400 text-center leading-tight whitespace-nowrap">{day.label}</span>
                {day.count > 0 && (
                  <span className="text-[9px] text-[#A8D24E] font-bold">{day.count}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#1E5A8E] inline-block" /> Revenus FCFA</span>
            <span className="flex items-center gap-1"><span className="text-[#A8D24E] font-bold">n</span> Nb commandes</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Top products */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#A8D24E]" />
              Produits les plus vendus
            </h3>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product: any, index: number) => {
                  const maxSold = topProducts[0]?.totalSold || 1;
                  const pct = Math.round((product.totalSold / maxSold) * 100);
                  return (
                    <div key={product.id || index}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-gray-300 w-5 text-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-[#1E5A8E]">
                            {parseFloat(product.revenue || "0").toLocaleString("fr-FR")} F
                          </p>
                          <p className="text-[10px] text-gray-400">{product.totalSold} vendu(s)</p>
                        </div>
                      </div>
                      <div className="ml-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A8D24E] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* Stock & Customers overview */}
        <div className="space-y-4">
          {/* Stock summary */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#1E5A8E]" />
                Inventaire produits
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{products?.length || 0}</p>
                  <p className="text-[10px] text-gray-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {products?.filter((p) => p.inStock > 0).length || 0}
                  </p>
                  <p className="text-[10px] text-gray-400">En stock</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
                  <p className="text-[10px] text-gray-400">Rupture</p>
                </div>
              </div>
              {outOfStockCount > 0 && (
                <div className="mt-3 bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-red-600 font-medium">
                    {outOfStockCount} produit{outOfStockCount > 1 ? "s" : ""} en rupture de stock
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {products?.filter((p) => p.inStock === 0).slice(0, 5).map((p) => (
                      <span key={p.id} className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {p.name}
                      </span>
                    ))}
                    {outOfStockCount > 5 && (
                      <span className="text-[10px] text-red-400">+{outOfStockCount - 5} autres</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clients overview */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Clients
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{customers?.length || 0}</p>
                  <p className="text-[10px] text-gray-400">Total clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#A8D24E]">
                    {customers?.filter((c: any) => c.passwordHash).length || 0}
                  </p>
                  <p className="text-[10px] text-gray-400">Comptes en ligne</p>
                </div>
              </div>
              {(orderStats?.total ?? 0) > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Taux livraison</span>
                    <span className="font-bold text-green-600">
                      {Math.round(((orderStats?.delivered || 0) / (orderStats?.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.round(((orderStats?.delivered || 0) / (orderStats?.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent orders full list */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-[#A8D24E]" />
            Dernières commandes (50)
          </h3>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-xs text-gray-300 font-mono w-8">#{order.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.productName}</p>
                    <p className="text-xs text-gray-400">
                      {order.customerName || order.customerPhone || "—"} · x{order.quantity} ·{" "}
                      {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: fr }) : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[order.status] || order.status}
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
    </AdminLayout>
  );
}
