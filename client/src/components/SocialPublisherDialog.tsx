import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Facebook, Instagram, Loader2, Music2, Pin, Search, Send } from "lucide-react";

type Platform = "facebook" | "instagram" | "tiktok" | "pinterest";

const PLATFORMS: { id: Platform; label: string; icon: typeof Facebook }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "pinterest", label: "Pinterest", icon: Pin },
];

interface SocialPublisherDialogProps {
  open: boolean;
  onClose: () => void;
  products?: any[];
  defaultProductId?: number | null;
}

export function SocialPublisherDialog({
  open,
  onClose,
  products = [],
  defaultProductId = null,
}: SocialPublisherDialogProps) {
  const [productId, setProductId] = useState<number | "">("");
  const [productSearch, setProductSearch] = useState("");
  const [selected, setSelected] = useState<Platform[]>(["facebook"]);

  const { data: status } = trpc.social.status.useQuery(undefined, { enabled: open });
  const publish = trpc.social.publish.useMutation();

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const effectiveProductId = productId || defaultProductId || "";
  const chosenProduct = products.find((p) => p.id === Number(effectiveProductId));

  const toggle = (platform: Platform) => {
    setSelected((current) =>
      current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform]
    );
  };

  const handlePublish = async () => {
    if (!effectiveProductId) {
      toast.error("Choisissez un produit");
      return;
    }
    if (!selected.length) {
      toast.error("Choisissez au moins un réseau");
      return;
    }
    try {
      const results = await publish.mutateAsync({
        productId: Number(effectiveProductId),
        platforms: selected,
      });
      const published = results.filter((r) => r.status === "published").length;
      const failed = results.filter((r) => r.status === "failed");
      if (published) toast.success(`${published} publication(s) effectuée(s)`);
      if (failed.length) {
        toast.error(`Échec sur ${failed.length} réseau(x) : ${failed[0].error}`);
      }
      if (!published && !failed.length) toast.warning("Aucune publication effectuée");
      onClose();
    } catch (error: any) {
      toast.error(`Erreur : ${error?.message || "inconnue"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-[#1E5A8E]" />
            Publier un produit
          </DialogTitle>
          <DialogDescription className="text-xs">
            Le produit sera publié avec sa photo, son prix et un lien vers sa fiche.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!defaultProductId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Produit</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <select
                value={effectiveProductId}
                onChange={(e) => setProductId(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="">— Sélectionner un produit —</option>
                {filteredProducts.slice(0, 200).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {chosenProduct && (
                <p className="text-[11px] text-gray-500">
                  {chosenProduct.imageUrl ? "✅ Photo disponible" : "⚠️ Aucune photo — publication en texte"}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Réseaux sociaux</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(({ id, label, icon: Icon }) => {
                const isEnabled = status?.[id]?.enabled ?? false;
                const isSelected = selected.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    title={status?.[id]?.detail}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "border-[#1E5A8E] bg-blue-50 text-[#1E5A8E] font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    <span className={`h-2 w-2 rounded-full ${isEnabled ? "bg-green-500" : "bg-gray-300"}`} />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400">
              ● vert = compte configuré · gris = non configuré (la tentative sera marquée « ignorée »)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={publish.isPending}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={publish.isPending || !effectiveProductId || !selected.length}
              className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
            >
              {publish.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publication…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Publier</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
