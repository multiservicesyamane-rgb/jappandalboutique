import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ImageCropper } from "@/components/ImageCropper";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Search,
  ImageIcon,
  X,
  Crop,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ImageSlot {
  file: File | null;
  preview: string;
  existingUrl: string;
}

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    categoryId: "",
    badge: "",
    inStock: "1",
  });
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    Array.from({ length: 5 }, () => ({ file: null, preview: "", existingUrl: "" }))
  );
  const [isUploading, setIsUploading] = useState(false);

  // Crop state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropSlotIndex, setCropSlotIndex] = useState(0);

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.listAdmin.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const toggleActive = trpc.products.toggleActive.useMutation({
    onSuccess: () => utils.products.listAdmin.invalidate(),
    onError: (e) => toast.error(`Erreur: ${e.message}`),
  });
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      toast.success("Produit créé avec succès");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      toast.success("Produit mis à jour");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      toast.success("Produit supprimé");
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const uploadImage = trpc.products.uploadImage.useMutation();

  const filteredProducts = useMemo(() => {
    return products?.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.categoryId.toString() !== categoryFilter) return false;
      if (stockFilter === "inactive") return p.inStock === -1;
      if (p.inStock === -1) return false; // hide disabled from other filters
      if (stockFilter === "in_stock" && p.inStock === 0) return false;
      if (stockFilter === "out_of_stock" && p.inStock > 0) return false;
      if (stockFilter === "low_stock" && (p.inStock === 0 || p.inStock > 5)) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const activeCount = products?.filter((p) => p.inStock !== -1).length || 0;
  const inactiveCount = products?.filter((p) => p.inStock === -1).length || 0;
  const outOfStockCount = products?.filter((p) => p.inStock === 0).length || 0;

  const openDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        unit: product.unit || "",
        categoryId: product.categoryId.toString(),
        badge: product.badge || "",
        inStock: product.inStock.toString(),
      });
      setImageSlots([
        { file: null, preview: product.imageUrl || "", existingUrl: product.imageUrl || "" },
        { file: null, preview: product.image2Url || "", existingUrl: product.image2Url || "" },
        { file: null, preview: product.image3Url || "", existingUrl: product.image3Url || "" },
        { file: null, preview: product.image4Url || "", existingUrl: product.image4Url || "" },
        { file: null, preview: product.image5Url || "", existingUrl: product.image5Url || "" },
      ]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        unit: "",
        categoryId: "",
        badge: "",
        inStock: "1",
      });
      setImageSlots(
        Array.from({ length: 5 }, () => ({ file: null, preview: "", existingUrl: "" }))
      );
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setImageSlots(
      Array.from({ length: 5 }, () => ({ file: null, preview: "", existingUrl: "" }))
    );
    setIsUploading(false);
  };

  const handleImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo");
      return;
    }
    // Open crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
      setCropSlotIndex(index);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `image-${cropSlotIndex + 1}.jpg`, {
      type: "image/jpeg",
    });
    const preview = URL.createObjectURL(croppedBlob);
    setImageSlots((prev) => {
      const updated = [...prev];
      updated[cropSlotIndex] = { file, preview, existingUrl: "" };
      return updated;
    });
  };

  const removeImage = (index: number) => {
    setImageSlots((prev) => {
      const updated = [...prev];
      updated[index] = { file: null, preview: "", existingUrl: "" };
      return updated;
    });
  };

  const uploadSingleImage = async (slot: ImageSlot): Promise<string> => {
    if (slot.file) {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          if (base64) resolve(base64);
          else reject(new Error("Failed to read file"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(slot.file!);
      });
      const result = await uploadImage.mutateAsync({
        fileName: slot.file.name,
        fileData: base64Data,
        mimeType: slot.file.type || "image/jpeg",
      });
      return result.url;
    }
    return slot.existingUrl || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setIsUploading(true);

      // Upload all images
      const imageUrls: string[] = [];
      for (const slot of imageSlots) {
        const url = await uploadSingleImage(slot);
        imageUrls.push(url);
      }

      const data = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        unit: formData.unit || undefined,
        imageUrl: imageUrls[0] || undefined,
        image2Url: imageUrls[1] || undefined,
        image3Url: imageUrls[2] || undefined,
        image4Url: imageUrls[3] || undefined,
        image5Url: imageUrls[4] || undefined,
        categoryId: parseInt(formData.categoryId),
        badge: formData.badge || undefined,
        inStock: parseInt(formData.inStock),
      };

      if (editingProduct) {
        updateProduct.mutate({ id: editingProduct.id, ...data });
      } else {
        createProduct.mutate(data);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Erreur lors de l'upload: ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) {
      deleteProduct.mutate({ id });
    }
  };

  const isBusy = createProduct.isPending || updateProduct.isPending || isUploading;

  return (
    <AdminLayout
      title="Produits"
      subtitle={`${activeCount} actif${activeCount !== 1 ? "s" : ""} · ${inactiveCount} désactivé${inactiveCount !== 1 ? "s" : ""} · ${outOfStockCount} rupture${outOfStockCount !== 1 ? "s" : ""}`}
    >

      {/* Top actions */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => utils.products.listAdmin.invalidate()}
            className="shrink-0 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            onClick={() => openDialog()}
            className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 text-sm">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(v) => setStockFilter(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white h-9 text-sm">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stocks</SelectItem>
              <SelectItem value="in_stock">En stock</SelectItem>
              <SelectItem value="low_stock">Stock faible (≤5)</SelectItem>
              <SelectItem value="out_of_stock">Rupture</SelectItem>
              <SelectItem value="inactive">Désactivés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <>
          {/* Mobile: card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredProducts.map((product) => {
              const category = categories?.find((c) => c.id === product.categoryId);
              return (
                <div key={product.id} className={`bg-white rounded-lg border p-3 flex gap-3 ${product.inStock === -1 ? "opacity-60" : ""}`}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm font-bold text-[#1E5A8E]">
                      {parseFloat(product.price).toLocaleString("fr-FR")} FCFA
                      {product.unit ? <span className="text-xs text-gray-400">/{product.unit}</span> : null}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {category && (
                        <span className="text-[10px] text-gray-400">
                          {category.emoji} {category.name}
                        </span>
                      )}
                      {product.inStock === -1 ? (
                        <span className="text-[10px] text-gray-400 font-medium">Désactivé</span>
                      ) : product.inStock > 0 ? (
                        <span className="text-[10px] text-green-600 font-medium">En stock</span>
                      ) : (
                        <span className="text-[10px] text-red-500 font-medium">Rupture</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleActive.mutate({ id: product.id, active: product.inStock === -1 })}
                      title={product.inStock === -1 ? "Activer" : "Désactiver"}
                      className={`p-2 rounded-lg transition-colors ${product.inStock === -1 ? "hover:bg-green-50 text-gray-400" : "hover:bg-gray-100 text-green-600"}`}
                    >
                      {product.inStock === -1 ? <ToggleLeft className="h-5 w-5" /> : <ToggleRight className="h-5 w-5" />}
                    </button>
                    <button onClick={() => openDialog(product)} className="p-2 rounded-lg hover:bg-gray-100">
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="p-2 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Image</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Produit</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Prix</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Catégorie</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Badge</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Stock</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-xs">Statut</th>
                    <th className="py-3 px-4 text-right font-medium text-gray-500 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const category = categories?.find((c) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className={`border-b last:border-0 hover:bg-gray-50 ${product.inStock === -1 ? "opacity-60 bg-gray-50/50" : ""}`}>
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{product.name}</p>
                          {product.unit && <p className="text-xs text-gray-400">Par {product.unit}</p>}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1E5A8E]">
                          {parseFloat(product.price).toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {category ? `${category.emoji} ${category.name}` : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {product.badge && (
                            <Badge className="bg-[#A8D24E] text-white text-xs">{product.badge}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {product.inStock === -1 ? (
                            <Badge className="bg-gray-100 text-gray-500 text-xs border border-gray-200">—</Badge>
                          ) : product.inStock === 0 ? (
                            <Badge className="bg-red-100 text-red-700 text-xs border border-red-200">Rupture</Badge>
                          ) : product.inStock <= 5 ? (
                            <Badge className="bg-amber-100 text-amber-700 text-xs border border-amber-200">
                              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                              {product.inStock} restant{product.inStock > 1 ? "s" : ""}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 text-xs border border-green-200">
                              En stock ({product.inStock})
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleActive.mutate({ id: product.id, active: product.inStock === -1 })}
                            title={product.inStock === -1 ? "Activer le produit" : "Désactiver le produit"}
                            className="flex items-center gap-1.5 group"
                          >
                            {product.inStock === -1 ? (
                              <>
                                <ToggleLeft className="h-6 w-6 text-gray-300 group-hover:text-green-500 transition-colors" />
                                <span className="text-xs text-gray-400 group-hover:text-green-600">Inactif</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-6 w-6 text-green-500 group-hover:text-gray-400 transition-colors" />
                                <span className="text-xs text-green-600 group-hover:text-gray-400">Actif</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openDialog(product)} className="p-2 rounded-lg hover:bg-gray-100">
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(product.id, product.name)} className="p-2 rounded-lg hover:bg-red-50">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchQuery ? "Aucun résultat" : "Aucun produit"}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {searchQuery
              ? `Aucun produit ne correspond à "${searchQuery}"`
              : "Commencez par ajouter votre premier produit"}
          </p>
          {!searchQuery && (
            <Button onClick={() => openDialog()} className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          )}
        </div>
      )}

      {/* Product Dialog with 5 image slots + crop */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Remplissez les informations du produit
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nom du produit *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-medium">
                  Prix (FCFA) *
                </Label>
                <Input
                  id="price"
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-medium">
                  Unité
                </Label>
                <Input
                  id="unit"
                  placeholder="Kg, Litre..."
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-medium">
                Catégorie *
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="badge" className="text-xs font-medium">
                  Badge
                </Label>
                <Input
                  id="badge"
                  placeholder="Frais, Premium..."
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inStock" className="text-xs font-medium">
                  Quantité en stock *
                </Label>
                <Input
                  id="inStock"
                  type="number"
                  min="0"
                  placeholder="Ex: 50"
                  value={formData.inStock === "-1" ? "0" : formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.value })}
                  className="h-10"
                />
                <p className="text-[10px] text-gray-400">0 = rupture de stock</p>
              </div>
            </div>

            {/* 5 Image Slots with Crop */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Crop className="h-3.5 w-3.5" />
                Images du produit (5 max)
              </Label>
              <p className="text-[10px] text-gray-400">
                Sélectionnez une image puis recadrez-la avant l'upload. JPG, PNG, WebP. Max 10 Mo.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {imageSlots.map((slot, index) => (
                  <div key={index} className="relative">
                    {slot.preview ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#1E5A8E]/30 bg-gray-50">
                        <img
                          src={slot.preview}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5">
                          {index === 0 ? "Principale" : `Image ${index + 1}`}
                        </div>
                      </div>
                    ) : (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1E5A8E] hover:bg-blue-50/50 transition-colors">
                        <ImageIcon className="h-4 w-4 text-gray-300 mb-0.5" />
                        <span className="text-[8px] text-gray-400">
                          {index === 0 ? "Principale" : `Image ${index + 1}`}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleImageSelect(index, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="h-10">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                className="h-10 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploading ? "Upload en cours..." : "Enregistrement..."}
                  </>
                ) : editingProduct ? (
                  "Mettre à jour"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Dialog */}
      <ImageCropper
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        title={`Recadrer l'image ${cropSlotIndex + 1}`}
      />
    </AdminLayout>
  );
}
