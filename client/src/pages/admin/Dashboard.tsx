import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
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

export default function AdminDashboard() {
  const utils = trpc.useUtils();
  const { data: products } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: orderStats } = trpc.orders.stats.useQuery();
  const { data: dashStats } = trpc.statistics.dashboard.useQuery();
  const { data: recentOrders } = trpc.statistics.recentOrders.useQuery({ limit: 10 });
  const { data: customers } = trpc.customers.list.useQuery();

  const inStockCount = products?.filter((p) => p.inStock > 0).length || 0;
  const outOfStockCount = products?.filter((p) => p.inStock === 0).length || 0;
  const lowStockProducts = products?.filter((p) => p.inStock > 0 && p.inStock <= 5) || [];
  const totalRevenue = dashStats?.totalRevenue ? parseFloat(dashStats.totalRevenue) : 0;

  const handleRefresh = () => {
    utils.orders.stats.invalidate();
    utils.statistics.dashboard.invalidate();
    utils.statistics.recentOrders.invalidate();
    utils.products.list.invalidate();
    utils.customers.list.invalidate();
  };

  return (
    <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique">
      {/* Refresh */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {/* Revenue */}
        <Card className="bg-gradient-to-br from-[#1E5A8E] to-[#0D3B6E] border-0 shadow-lg text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-white/70">CA Total</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white">
              {totalRevenue.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-white/70 mt-1">FCFA chiffre d'affaires</p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {inStockCount} dispo
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{products?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total Produits</p>
            {outOfStockCount > 0 && (
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {outOfStockCount} en rupture
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
              </div>
              {(orderStats?.pending ?? 0) > 0 ? (
                <span className="text-xs font-medium text-yellow-600 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {orderStats?.pending} attente
                </span>
              ) : null}
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{orderStats?.total || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total Commandes</p>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                <CheckCircle className="h-3 w-3" />
                {orderStats?.delivered || 0} livrées
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{customers?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">
                Stock faible — {lowStockProducts.length} produit{lowStockProducts.length > 1 ? "s" : ""} à réapprovisionner
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                  {p.name}
                  <span className="bg-amber-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold ml-1">
                    {p.inStock}
                  </span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Order status breakdown */}
        <Card className="lg:col-span-2 bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Statut des commandes</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "En attente", value: orderStats?.pending || 0, color: "bg-yellow-100 text-yellow-700" },
                { label: "Contactées", value: orderStats?.contacted || 0, color: "bg-blue-100 text-blue-700" },
                { label: "Confirmées", value: orderStats?.confirmed || 0, color: "bg-indigo-100 text-indigo-700" },
                { label: "Livrées", value: orderStats?.delivered || 0, color: "bg-green-100 text-green-700" },
                { label: "Annulées", value: orderStats?.cancelled || 0, color: "bg-red-100 text-red-700" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`rounded-xl py-3 px-2 ${stat.color}`}>
                    <p className="text-xl lg:text-2xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-1.5">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            {(orderStats?.total ?? 0) > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Taux de livraison</span>
                  <span className="text-xs font-semibold text-green-700">
                    {Math.round(((orderStats?.delivered || 0) / (orderStats?.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.round(((orderStats?.delivered || 0) / (orderStats?.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Link href="/admin/produits">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#1E5A8E] hover:text-white transition-colors cursor-pointer group">
                  <Package className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium">Gérer les produits</span>
                </div>
              </Link>
              <Link href="/admin/commandes">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#1E5A8E] hover:text-white transition-colors cursor-pointer group">
                  <ShoppingCart className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium">Voir les commandes</span>
                  {(orderStats?.pending ?? 0) > 0 && (
                    <span className="ml-auto bg-yellow-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5">
                      {orderStats?.pending}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/admin/categories">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#1E5A8E] hover:text-white transition-colors cursor-pointer group">
                  <FolderTree className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium">Gérer les catégories</span>
                </div>
              </Link>
              <Link href="/admin/clients">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#1E5A8E] hover:text-white transition-colors cursor-pointer group">
                  <Users className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium">Gérer les clients</span>
                </div>
              </Link>
              <Link href="/admin/marketing">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#A8D24E] hover:text-white transition-colors cursor-pointer group">
                  <MessageSquare className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="text-sm font-medium">Marketing & Messages</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Commandes récentes</h3>
            <Link href="/admin/commandes">
              <span className="text-xs text-[#A8D24E] font-semibold cursor-pointer hover:underline">
                Voir tout →
              </span>
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-4 lg:-mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 lg:px-6 text-xs font-medium text-gray-400 uppercase">#</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-400 uppercase">Produit</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Client</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-400 uppercase">Montant</th>
                    <th className="text-center py-2 px-4 lg:px-6 text-xs font-medium text-gray-400 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 lg:px-6 font-mono text-xs text-gray-400">#{order.id}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-800 truncate max-w-[150px]">{order.productName}</p>
                        <p className="text-xs text-gray-400">x{order.quantity}</p>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <p className="text-gray-600 truncate max-w-[120px]">{order.customerName || order.customerPhone || "—"}</p>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-800">
                        {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-3 px-4 lg:px-6 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Aucune commande récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
