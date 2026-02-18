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
import { Plus, Pencil, Trash2, FolderTree, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    emoji: "",
    description: "",
  });

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Catégorie créée avec succès");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Catégorie mise à jour");
      closeDialog();
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });
  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Catégorie supprimée");
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        emoji: category.emoji || "",
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", emoji: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      emoji: formData.emoji || undefined,
      description: formData.description || undefined,
    };
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data });
    } else {
      createCategory.mutate(data);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Supprimer la catégorie "${name}" ?`)) {
      deleteCategory.mutate({ id });
    }
  };

  return (
    <AdminLayout
      title="Catégories"
      subtitle={`${categories?.length || 0} catégorie${(categories?.length || 0) !== 1 ? "s" : ""}`}
    >
      <div className="flex justify-end mb-4">
        <Button onClick={() => openDialog()} className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5A8E]" />
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{category.emoji || "📦"}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-800">{category.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">/{category.slug}</p>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openDialog(category)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune catégorie</h3>
          <p className="text-sm text-gray-400 mb-4">Commencez par ajouter votre première catégorie</p>
          <Button onClick={() => openDialog()} className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Remplissez les informations de la catégorie
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emoji" className="text-xs font-medium">Emoji</Label>
                <Input
                  id="emoji"
                  placeholder="🛒"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs font-medium">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="categorie-exemple"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="h-10">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="h-10 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
              >
                {(createCategory.isPending || updateCategory.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : editingCategory ? (
                  "Mettre à jour"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
