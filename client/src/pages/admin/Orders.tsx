import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Eye,
  ShoppingCart,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  Search,
  MessageCircle,
  DollarSign,
  ArrowUpDown,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { useSettings } from "@/contexts/SettingsContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  contacted: "Contacté",
  confirmed: "Confirmé",
  delivered: "Livré",
  cancelled: "Annulé",
};

const PAGE_SIZE = 20;

function buildWhatsAppMessage(order: any, shopName: string): string {
  const amount = parseFloat(order.totalAmount || "0").toLocaleString("fr-FR");
  const status = statusLabels[order.status] || order.status;
  return encodeURIComponent(
    `Bonjour ${order.customerName || ""},\n\nVotre commande #${order.id} chez ${shopName} :\n` +
    `• Produit : ${order.productName} x${order.quantity}\n` +
    `• Montant : ${amount} FCFA\n` +
    `• Statut : ${status}\n\n` +
    `Merci de votre confiance ! 🙏`
  );
}

export default function AdminOrders() {
  const settings = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();
  const { data: allOrders, isLoading } = trpc.orders.list.useQuery();
  const updateOrder = trpc.orders.update.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      utils.orders.stats.invalidate();
      utils.statistics.dashboard.invalidate();
      toast.success("Commande mise à jour");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const openDialog = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNotes(order.notes || "");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    updateOrder.mutate({
      id: selectedOrder.id,
      status: newStatus as any,
      notes: notes || undefined,
    });
  };

  const filteredAndSorted = useMemo(() => {
    if (!allOrders) return [];
    let result = allOrders.filter((o) => {
      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      // Date filter
      if (dateFilter !== "all") {
        const d = new Date(o.createdAt);
        if (dateFilter === "today" && !isToday(d)) return false;
        if (dateFilter === "week" && !isThisWeek(d, { weekStartsOn: 1 })) return false;
        if (dateFilter === "month" && !isThisMonth(d)) return false;
      }
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toString().includes(q);
        const matchesProduct = o.productName?.toLowerCase().includes(q);
        const matchesName = o.customerName?.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone?.includes(q);
        if (!matchesId && !matchesProduct && !matchesName && !matchesPhone) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "date_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount_desc") return parseFloat(b.totalAmount || "0") - parseFloat(a.totalAmount || "0");
      if (sortBy === "amount_asc") return parseFloat(a.totalAmount || "0") - parseFloat(b.totalAmount || "0");
      return 0;
    });

    return result;
  }, [allOrders, statusFilter, dateFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const orders = filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalRevenue = filteredAndSorted.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);
  const deliveredRevenue = filteredAndSorted
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

  const handleSearch = (v: string) => { setSearchQuery(v); setPage(1); };
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(1); };
  const handleDateFilter = (v: string) => { setDateFilter(v); setPage(1); };

  return (
    <AdminLayout
      title="Commandes"
      subtitle={`${filteredAndSorted.length} commande${filteredAndSorted.length !== 1 ? "s" : ""} — ${totalRevenue.toLocaleString("fr-FR")} FCFA`}
    >
      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">CA (filtre)</p>
            <p className="text-sm font-bold text-gray-800">{totalRevenue.toLocaleString("fr-FR")} F</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Livrées</p>
            <p className="text-sm font-bold text-green-700">{deliveredRevenue.toLocaleString("fr-FR")} F</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Résultats</p>
            <p className="text-sm font-bold text-gray-800">{filteredAndSorted.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Filter className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Page</p>
            <p className="text-sm font-bold text-gray-800">{currentPage}/{totalPages}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher (#id, produit, client, téléphone)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => utils.orders.list.invalidate()}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white h-9 text-sm">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="contacted">Contactées</SelectItem>
              <SelectItem value="confirmed">Confirmées</SelectItem>
              <SelectItem value="delivered">Livrées</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={handleDateFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white h-9 text-sm">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white h-9 text-sm">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Plus récentes</SelectItem>
              <SelectItem value="date_asc">Plus anciennes</SelectItem>
              <SelectItem value="amount_desc">Montant ↓</SelectItem>
              <SelectItem value="amount_asc">Montant ↑</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      ) : orders.length > 0 ? (
        <>
          {/* Mobile: card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border p-3 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{order.productName}</p>
                    <p className="text-xs text-gray-400">x{order.quantity} · #{order.id}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} text-[10px] border`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">
                    {order.customerName || order.customerPhone || "—"}
                  </div>
                  <p className="text-sm font-bold text-[#1E5A8E]">
                    {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => openDialog(order)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Détails
                  </Button>
                  {order.customerPhone && (
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${buildWhatsAppMessage(order, settings.shopName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full h-8 text-xs gap-1 bg-[#25D366] hover:bg-[#1da851] text-white">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Produit</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Client</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Montant</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Statut</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">#{order.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{order.productName}</p>
                        <p className="text-xs text-gray-400">x{order.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-600">{order.customerName || "—"}</p>
                        <p className="text-xs text-gray-400">{order.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                        {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`${statusColors[order.status]} text-[10px] border`}>
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {format(new Date(order.createdAt), "dd MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDialog(order)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${buildWhatsAppMessage(order, settings.shopName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button
                                className="p-2 rounded-lg hover:bg-green-50"
                                title="Contacter via WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                              </button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)} sur {filteredAndSorted.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 gap-1"
                >
                  Suivant
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune commande</h3>
          <p className="text-sm text-gray-400">
            {searchQuery || statusFilter !== "all" || dateFilter !== "all"
              ? "Aucun résultat pour ces filtres"
              : "Les commandes apparaîtront ici"}
          </p>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Commande #{selectedOrder?.id}</DialogTitle>
            <DialogDescription className="text-xs">
              Gérer le statut et les notes
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Product info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-800">{selectedOrder.productName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Prix unitaire :</span>
                    <p className="font-medium">{parseFloat(selectedOrder.productPrice || "0").toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Quantité :</span>
                    <p className="font-medium">{selectedOrder.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#1E5A8E]">
                  Total : {parseFloat(selectedOrder.totalAmount || "0").toLocaleString("fr-FR")} FCFA
                </p>
                {selectedOrder.notes && (
                  <p className="text-xs text-gray-500 italic border-t pt-2">Note client : {selectedOrder.notes}</p>
                )}
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Client</h4>
                {selectedOrder.customerName && (
                  <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                )}
                {selectedOrder.customerPhone && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {selectedOrder.customerPhone}
                    </div>
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, "")}?text=${buildWhatsAppMessage(selectedOrder, settings.shopName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto"
                    >
                      <Button size="sm" className="h-7 text-xs gap-1 bg-[#25D366] hover:bg-[#1da851] text-white px-2">
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>
                )}
                {selectedOrder.deliveryLocation && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                    {selectedOrder.deliveryLocation}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(selectedOrder.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              </div>

              {/* Status update */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Changer le statut</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="contacted">Contacté</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes internes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ajouter des notes..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeDialog} className="h-10">
              Fermer
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateOrder.isPending}
              className="h-10 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
            >
              {updateOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
