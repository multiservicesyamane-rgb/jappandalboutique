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
import { Plus, Edit, Trash2, Eye, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

export default function AdBanners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "homepage_top",
    type: "image" as "image" | "html" | "adsense",
    content: "",
    linkUrl: "",
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    displayOrder: 0,
  });

  const { data: banners = [], refetch } = trpc.adBanners.list.useQuery();
  const createBanner = trpc.adBanners.create.useMutation();
  const updateBanner = trpc.adBanners.update.useMutation();
  const deleteBanner = trpc.adBanners.delete.useMutation();
  const uploadImage = trpc.adBanners.uploadImage.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({ id: editingBanner.id, ...formData });
        toast.success("Bannière mise à jour");
      } else {
        await createBanner.mutateAsync(formData);
        toast.success("Bannière créée");
      }
      refetch();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];
        const result = await uploadImage.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
        });
        setFormData({ ...formData, content: result.url });
        toast.success("Image uploadée");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      position: banner.position,
      type: banner.type,
      content: banner.content,
      linkUrl: banner.linkUrl || "",
      width: banner.width,
      height: banner.height,
      displayOrder: banner.displayOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    try {
      await deleteBanner.mutateAsync({ id });
      toast.success("Bannière supprimée");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      name: "",
      position: "homepage_top",
      type: "image",
      content: "",
      linkUrl: "",
      width: undefined,
      height: undefined,
      displayOrder: 0,
    });
  };

  const totalImpressions = banners.reduce((sum, b) => sum + (b.impressions || 0), 0);
  const totalClicks = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);
  const totalRevenue = banners.reduce((sum, b) => sum + parseFloat(b.revenue || "0"), 0);

  return (
    <AdminLayout title="Publicités">
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Publicités</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos espaces publicitaires pour générer des revenus
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="truncate">Ajouter une bannière</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Modifier la bannière" : "Nouvelle bannière publicitaire"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la bannière *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Google AdSense Header"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage_top">Homepage - Haut</SelectItem>
                        <SelectItem value="homepage_sidebar">Homepage - Sidebar</SelectItem>
                        <SelectItem value="homepage_middle">Homepage - Milieu</SelectItem>
                        <SelectItem value="homepage_bottom">Homepage - Bas</SelectItem>
                        <SelectItem value="homepage_floating">🎬 Homepage - Flottant (vidéo/GIF)</SelectItem>
                        <SelectItem value="launch_top">Page Lancement - Haut</SelectItem>
                        <SelectItem value="launch_middle">Page Lancement - Milieu</SelectItem>
                        <SelectItem value="launch_floating">🎬 Page Lancement - Flottant (vidéo/GIF)</SelectItem>
                        <SelectItem value="products_top">Produits - Haut</SelectItem>
                        <SelectItem value="products_sidebar">Produits - Sidebar</SelectItem>
                        <SelectItem value="product_detail_top">Détail Produit - Haut</SelectItem>
                        <SelectItem value="product_detail_bottom">Détail Produit - Bas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="html">Code HTML</SelectItem>
                        <SelectItem value="adsense">Google AdSense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === "image" && (
                  <>
                    <div>
                      <Label htmlFor="image">Image de la bannière *</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {formData.content && (
                        <div className="mt-2">
                          <img
                            src={formData.content}
                            alt="Preview"
                            className="max-h-32 rounded border"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="linkUrl">URL de destination</Label>
                      <Input
                        id="linkUrl"
                        type="url"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}

                {(formData.type === "html" || formData.type === "adsense") && (
                  <div>
                    <Label htmlFor="content">
                      {formData.type === "adsense" ? "Code Google AdSense *" : "Code HTML *"}
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder={
                        formData.type === "adsense"
                          ? '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>...'
                          : "<div>...</div>"
                      }
                      rows={6}
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <Label htmlFor="width" className="text-xs sm:text-sm">Largeur (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, width: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      placeholder="728"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs sm:text-sm">Hauteur (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      placeholder="90"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayOrder" className="text-xs sm:text-sm">Ordre</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="text-sm"
                    />
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
                    {editingBanner ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-card rounded-lg border p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{banners.length}</p>
              </div>
              <Eye className="w-5 h-5 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Impressions</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="w-5 h-5 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Clics</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{totalClicks.toLocaleString()}</p>
              </div>
              <MousePointerClick className="w-5 h-5 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Revenus</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{totalRevenue.toFixed(0)} FCFA</p>
              </div>
              <MousePointerClick className="w-5 h-5 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nom</TableHead>
                  <TableHead className="min-w-[140px]">Position</TableHead>
                  <TableHead className="min-w-[80px]">Type</TableHead>
                  <TableHead className="text-right min-w-[100px]">Impressions</TableHead>
                  <TableHead className="text-right min-w-[80px]">Clics</TableHead>
                  <TableHead className="text-right min-w-[80px]">CTR</TableHead>
                  <TableHead className="text-right min-w-[100px]">Revenus</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune bannière. Cliquez sur "Ajouter une bannière" pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => {
                    const ctr =
                      banner.impressions > 0
                        ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
                        : "0.00";
                    return (
                      <TableRow key={banner.id}>
                        <TableCell className="font-medium">{banner.name}</TableCell>
                        <TableCell className="text-sm">{banner.position}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                            {banner.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{banner.impressions || 0}</TableCell>
                        <TableCell className="text-right">{banner.clicks || 0}</TableCell>
                        <TableCell className="text-right">{ctr}%</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(banner.revenue || "0").toFixed(0)} FCFA
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(banner)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(banner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {banners.length === 0 ? (
            <div className="bg-card rounded-lg border p-6 text-center text-muted-foreground">
              Aucune bannière. Cliquez sur "Ajouter une bannière" pour commencer.
            </div>
          ) : (
            banners.map((banner) => {
              const ctr =
                banner.impressions > 0
                  ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
                  : "0.00";
              return (
                <div key={banner.id} className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{banner.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{banner.position}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {banner.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(banner)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(banner.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Impr.</p>
                      <p className="text-sm font-semibold mt-0.5">{banner.impressions || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clics</p>
                      <p className="text-sm font-semibold mt-0.5">{banner.clicks || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="text-sm font-semibold mt-0.5">{ctr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rev.</p>
                      <p className="text-sm font-semibold mt-0.5">
                        {parseFloat(banner.revenue || "0").toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
