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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
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
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <AdminLayout
      title="Clients"
      subtitle={`${customers?.length || 0} client${(customers?.length || 0) !== 1 ? "s" : ""}`}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
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
              <div key={customer.id} className="bg-white rounded-lg border p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
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
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setIsOrdersDialogOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
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
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{customer.totalOrders} commande(s)</span>
                  <span className="font-semibold text-[#1E5A8E]">{customer.totalSpent} FCFA</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Nom</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Adresse</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Commandes</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Total</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{customer.name}</td>
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
                      <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                        {customer.address || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setIsOrdersDialogOpen(true);
                          }}
                          className="text-[#A8D24E] font-medium hover:underline"
                        >
                          {customer.totalOrders}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                        {customer.totalSpent} FCFA
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDialog(customer)} className="p-2 rounded-lg hover:bg-gray-100">
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2 rounded-lg hover:bg-red-50">
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
        <div className="text-center py-16 bg-white rounded-lg border">
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

      {/* Customer Dialog */}
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
                <Label htmlFor="name" className="text-xs font-medium">Nom *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">Téléphone *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-medium">Adresse</Label>
              <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
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

      {/* Orders Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Commandes du client</DialogTitle>
          </DialogHeader>
          {customerOrders && customerOrders.length > 0 ? (
            <div className="space-y-2">
              {customerOrders.map((order: any) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{order.productName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      order.status === "delivered" ? "bg-blue-100 text-blue-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">x{order.quantity} - {order.totalAmount} FCFA</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Aucune commande</p>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
