import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Users,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Search,
  MessageCircle,
  UserCheck,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSettings } from "@/contexts/SettingsContext";

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

export default function AdminCustomers() {
  const settings = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: customers, isLoading } = trpc.customers.list.useQuery();
  const { data: customerOrders } = trpc.customers.getOrders.useQuery(
    { customerId: selectedCustomer?.id! },
    { enabled: !!selectedCustomer?.id }
  );
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Client créé");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Client mis à jour");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const deleteCustomer = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Client supprimé");
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const openDialog = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
    };
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, ...data });
    } else {
      createCustomer.mutate(data);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Supprimer le client "${name}" ?`)) {
      deleteCustomer.mutate({ id });
    }
  };

  const filteredCustomers = customers?.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpentAll = customers?.reduce((sum, c) => {
    const spent = typeof c.totalSpent === "string" ? parseFloat(c.totalSpent) : (c.totalSpent || 0);
    return sum + spent;
  }, 0) || 0;

  const buildWhatsAppUrl = (customer: any) => {
    const msg = encodeURIComponent(
      `Bonjour ${customer.name},\n\nMerci de faire confiance à ${settings.shopName} ! 🙏\n\nN'hésitez pas à nous contacter pour toute question.`
    );
    return `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}?text=${msg}`;
  };

  return (
    <AdminLayout
      title="Clients"
      subtitle={`${customers?.length || 0} client${(customers?.length || 0) !== 1 ? "s" : ""} · CA total ${totalSpentAll.toLocaleString("fr-FR")} FCFA`}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher (nom, téléphone, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => utils.customers.list.invalidate()}
          className="gap-1.5 shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </Button>
        <Button onClick={() => openDialog()} className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      ) : filteredCustomers && filteredCustomers.length > 0 ? (
        <>
          {/* Mobile: card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl border p-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                      {(customer as any).passwordHash && (
                        <span title="Compte en ligne" className="inline-flex items-center gap-0.5 text-[10px] bg-[#A8D24E]/15 text-[#5a8e1e] px-1.5 py-0.5 rounded-full font-semibold">
                          <UserCheck className="h-2.5 w-2.5" />
                          Connecté
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedCustomer(customer); setIsOrdersDialogOpen(true); }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Voir commandes"
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => openDialog(customer)} className="p-2 rounded-lg hover:bg-gray-100">
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <button
                    onClick={() => { setSelectedCustomer(customer); setIsOrdersDialogOpen(true); }}
                    className="text-[#A8D24E] font-medium hover:underline flex items-center gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {customer.totalOrders} commande{(customer.totalOrders || 0) !== 1 ? "s" : ""}
                  </button>
                  <span className="font-semibold text-[#1E5A8E]">
                    {typeof customer.totalSpent === "string"
                      ? parseFloat(customer.totalSpent).toLocaleString("fr-FR")
                      : (customer.totalSpent || 0).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                {customer.phone && (
                  <a href={buildWhatsAppUrl(customer)} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="w-full h-7 text-xs gap-1 bg-[#25D366] hover:bg-[#1da851] text-white">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Contacter sur WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Nom</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Adresse</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Commandes</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Total dépensé</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1E5A8E]/10 flex items-center justify-center text-[#1E5A8E] font-bold text-xs">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{customer.name}</p>
                            {(customer as any).passwordHash && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#A8D24E]/15 text-[#5a8e1e] px-1.5 py-0.5 rounded-full font-semibold">
                                <UserCheck className="h-2.5 w-2.5" />
                                Compte en ligne
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[200px]">
                        {customer.address ? (
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{customer.address}</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => { setSelectedCustomer(customer); setIsOrdersDialogOpen(true); }}
                          className="text-[#A8D24E] font-bold hover:underline text-base"
                        >
                          {customer.totalOrders}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                        {typeof customer.totalSpent === "string"
                          ? parseFloat(customer.totalSpent).toLocaleString("fr-FR")
                          : (customer.totalSpent || 0).toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={buildWhatsAppUrl(customer)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="p-2 rounded-lg hover:bg-green-50" title="WhatsApp">
                              <MessageCircle className="h-4 w-4 text-[#25D366]" />
                            </button>
                          </a>
                          <button
                            onClick={() => { setSelectedCustomer(customer); setIsOrdersDialogOpen(true); }}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Historique commandes"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button onClick={() => openDialog(customer)} className="p-2 rounded-lg hover:bg-gray-100" title="Modifier">
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2 rounded-lg hover:bg-red-50" title="Supprimer">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchQuery ? "Aucun résultat" : "Aucun client"}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {searchQuery ? `Aucun client ne correspond à "${searchQuery}"` : "Ajoutez votre premier client"}
          </p>
          {!searchQuery && (
            <Button onClick={() => openDialog()} className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un client
            </Button>
          )}
        </div>
      )}

      {/* Customer Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingCustomer ? "Modifier le client" : "Ajouter un client"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Remplissez les informations du client
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nom *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Téléphone *</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Adresse</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="h-10">Annuler</Button>
              <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending} className="h-10 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
                {(createCustomer.isPending || updateCustomer.isPending) ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
                ) : editingCustomer ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Orders History Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Historique — {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {customerOrders?.length || 0} commande{(customerOrders?.length || 1) !== 1 ? "s" : ""} ·{" "}
              {customerOrders
                ? customerOrders.reduce((sum, o: any) => sum + parseFloat(o.totalAmount || "0"), 0).toLocaleString("fr-FR")
                : "0"} FCFA
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="mb-3 flex gap-2">
              <a
                href={buildWhatsAppUrl(selectedCustomer)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button size="sm" className="w-full h-8 text-xs gap-1 bg-[#25D366] hover:bg-[#1da851] text-white">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contacter sur WhatsApp
                </Button>
              </a>
            </div>
          )}

          {customerOrders && customerOrders.length > 0 ? (
            <div className="space-y-2">
              {customerOrders.map((order: any) => (
                <div key={order.id} className="bg-gray-50 rounded-xl p-3 border">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.productName}</p>
                      <p className="text-xs text-gray-400">
                        #{order.id} · x{order.quantity} ·{" "}
                        {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy", { locale: fr }) : "—"}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#1E5A8E]">
                    {parseFloat(order.totalAmount || "0").toLocaleString("fr-FR")} FCFA
                  </p>
                  {order.deliveryLocation && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.deliveryLocation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Aucune commande trouvée</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
