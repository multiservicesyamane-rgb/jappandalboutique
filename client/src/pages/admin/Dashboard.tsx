import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Package,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: products } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: orderStats } = trpc.orders.stats.useQuery();
  const { data: dashStats } = trpc.statistics.dashboard.useQuery();
  const { data: recentOrders } = trpc.statistics.recentOrders.useQuery({ limit: 5 });

  const inStockCount = products?.filter((p) => p.inStock > 0).length || 0;
  const outOfStockCount = products?.filter((p) => p.inStock === 0).length || 0;

  return (
    <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {inStockCount}
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{products?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total Produits</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{categories?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Catégories</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
              </div>
              {orderStats?.pending ? (
                <span className="text-xs font-medium text-yellow-600 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {orderStats.pending} en attente
                </span>
              ) : null}
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{orderStats?.total || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Commandes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              {outOfStockCount > 0 && (
                <span className="text-xs font-medium text-red-500 flex items-center gap-0.5">
                  <ArrowDownRight className="h-3 w-3" />
                  {outOfStockCount} rupture
                </span>
              )}
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">
              {orderStats?.delivered || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Livrées</p>
          </CardContent>
        </Card>
      </div>

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
                { label: "Livrées", value: orderStats?.delivered || 0, color: "bg-blue-100 text-blue-700" },
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
                Voir tout
              </span>
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-4 lg:-mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 lg:px-6 text-xs font-medium text-gray-400 uppercase">Produit</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Client</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-gray-400 uppercase">Montant</th>
                    <th className="text-center py-2 px-4 lg:px-6 text-xs font-medium text-gray-400 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 lg:px-6">
                        <p className="font-medium text-gray-800 truncate max-w-[150px]">{order.productName}</p>
                        <p className="text-xs text-gray-400">x{order.quantity}</p>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <p className="text-gray-600 truncate max-w-[120px]">{order.customerName || "—"}</p>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-800">
                        {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-3 px-4 lg:px-6 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.status === "delivered"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "confirmed"
                              ? "bg-indigo-100 text-indigo-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "contacted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status === "pending"
                            ? "En attente"
                            : order.status === "contacted"
                            ? "Contacté"
                            : order.status === "confirmed"
                            ? "Confirmé"
                            : order.status === "delivered"
                            ? "Livré"
                            : "Annulé"}
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
