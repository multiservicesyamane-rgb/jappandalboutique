import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateLinks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    platform: "",
    categoryId: undefined as number | undefined,
    productId: undefined as number | undefined,
  });

  const { data: links = [], refetch } = trpc.affiliateLinks.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const createLink = trpc.affiliateLinks.create.useMutation();
  const updateLink = trpc.affiliateLinks.update.useMutation();
  const deleteLink = trpc.affiliateLinks.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await updateLink.mutateAsync({ id: editingLink.id, ...formData });
        toast.success("Lien affilié mis à jour");
      } else {
        await createLink.mutateAsync(formData);
        toast.success("Lien affilié créé");
      }
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || "",
      platform: link.platform || "",
      categoryId: link.categoryId,
      productId: link.productId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce lien affilié ?")) return;
    try {
      await deleteLink.mutateAsync({ id });
      toast.success("Lien affilié supprimé");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({
      name: "",
      url: "",
      description: "",
      platform: "",
      categoryId: undefined,
      productId: undefined,
    });
  };

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalRevenue = links.reduce((sum, link) => sum + parseFloat(link.revenue || "0"), 0);

  return (
    <AdminLayout title="Liens Affiliés">
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Liens Affiliés</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos liens d'affiliation pour générer des revenus
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un lien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? "Modifier le lien" : "Nouveau lien affilié"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du lien *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Amazon - Électronique"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL d'affiliation *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Plateforme</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="Amazon, Jumia, AliExpress..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du lien affilié"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie associée</Label>
                    <Select
                      value={formData.categoryId?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value && value !== "none" ? parseInt(value) : undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.emoji} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product">Produit associé</Label>
                    <Select
                      value={formData.productId?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, productId: value && value !== "none" ? parseInt(value) : undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {products.slice(0, 50).map((prod) => (
                          <SelectItem key={prod.id} value={prod.id.toString()}>
                            {prod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    {editingLink ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Liens totaux</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{links.length}</p>
              </div>
              <ExternalLink className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Clics</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{totalClicks}</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Revenus Estimés</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{totalRevenue.toFixed(0)} FCFA</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nom</TableHead>
                  <TableHead className="min-w-[120px]">Plateforme</TableHead>
                  <TableHead className="min-w-[150px]">Catégorie/Produit</TableHead>
                  <TableHead className="text-right min-w-[80px]">Clics</TableHead>
                  <TableHead className="text-right min-w-[100px]">Conversions</TableHead>
                  <TableHead className="text-right min-w-[100px]">Revenus</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun lien affilié. Cliquez sur "Ajouter un lien" pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.name}</TableCell>
                      <TableCell>{link.platform || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {link.categoryId && `Cat. #${link.categoryId}`}
                        {link.productId && `Prod. #${link.productId}`}
                        {!link.categoryId && !link.productId && "-"}
                      </TableCell>
                      <TableCell className="text-right">{link.clicks || 0}</TableCell>
                      <TableCell className="text-right">{link.conversions || 0}</TableCell>
                      <TableCell className="text-right">
                        {parseFloat(link.revenue || "0").toFixed(0)} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(link)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {links.length === 0 ? (
            <div className="bg-card rounded-lg border p-6 text-center text-muted-foreground">
              Aucun lien affilié. Cliquez sur "Ajouter un lien" pour commencer.
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="bg-card rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{link.name}</h3>
                    {link.platform && (
                      <p className="text-xs text-muted-foreground mt-0.5">{link.platform}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(link)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Clics</p>
                    <p className="text-sm font-semibold mt-0.5">{link.clicks || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conv.</p>
                    <p className="text-sm font-semibold mt-0.5">{link.conversions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenus</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {parseFloat(link.revenue || "0").toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
