import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  delivered: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  contacted: "Contacté",
  confirmed: "Confirmé",
  delivered: "Livré",
  cancelled: "Annulé",
};

export default function AdminOrders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: allOrders, isLoading } = trpc.orders.list.useQuery();
  const updateOrder = trpc.orders.update.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
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

  const orders = allOrders
    ?.filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter(
      (o) =>
        !searchQuery ||
        o.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone?.includes(searchQuery)
    );

  return (
    <AdminLayout
      title="Commandes"
      subtitle={`${orders?.length || 0} commande${(orders?.length || 0) !== 1 ? "s" : ""}`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="contacted">Contactées</SelectItem>
            <SelectItem value="confirmed">Confirmées</SelectItem>
            <SelectItem value="delivered">Livrées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      ) : orders && orders.length > 0 ? (
        <>
          {/* Mobile: card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDialog(order)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{order.productName}</p>
                    <p className="text-xs text-gray-400">x{order.quantity} - #{order.id}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} text-[10px]`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {order.customerName || order.customerPhone || "—"}
                  </div>
                  <p className="text-sm font-bold text-[#1E5A8E]">
                    {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} F
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
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
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
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
                        <Badge className={`${statusColors[order.status]} text-[10px]`}>
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {format(new Date(order.createdAt), "dd MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openDialog(order)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune commande</h3>
          <p className="text-sm text-gray-400">Les commandes apparaîtront ici</p>
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
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-800">{selectedOrder.productName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Prix unitaire:</span>
                    <p className="font-medium">{selectedOrder.productPrice} FCFA</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Quantité:</span>
                    <p className="font-medium">{selectedOrder.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#1E5A8E]">
                  Total: {parseFloat(selectedOrder.totalAmount || "0").toLocaleString("fr-FR")} FCFA
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Client</h4>
                {selectedOrder.customerName && (
                  <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                )}
                {selectedOrder.customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {selectedOrder.customerPhone}
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

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-medium">Changer le statut</Label>
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
                <Label htmlFor="notes" className="text-xs font-medium">Notes internes</Label>
                <Textarea
                  id="notes"
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
