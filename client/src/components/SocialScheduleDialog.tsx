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
import { CalendarClock, Facebook, Instagram, Loader2, Music2, Pin, Search } from "lucide-react";

type Platform = "facebook" | "instagram" | "tiktok" | "pinterest";

const PLATFORMS: { id: Platform; label: string; icon: typeof Facebook }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "pinterest", label: "Pinterest", icon: Pin },
];

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface SocialScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  products?: any[];
  onCreated?: () => void;
}

export function SocialScheduleDialog({ open, onClose, products = [], onCreated }: SocialScheduleDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["facebook"]);
  const [startAt, setStartAt] = useState(() => toLocalInput(new Date(Date.now() + 5 * 60_000)));
  const [intervalValue, setIntervalValue] = useState(2);
  const [intervalUnit, setIntervalUnit] = useState<"minutes" | "hours" | "days">("hours");

  const utils = trpc.useUtils();
  const createCampaign = trpc.social.createCampaign.useMutation();

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const intervalMinutes =
    intervalUnit === "minutes" ? intervalValue : intervalUnit === "hours" ? intervalValue * 60 : intervalValue * 1440;

  const lastAt = useMemo(() => {
    const count = Math.max(0, selectedIds.length - 1);
    return new Date(new Date(startAt).getTime() + count * intervalMinutes * 60_000);
  }, [selectedIds.length, startAt, intervalMinutes]);

  const toggleProduct = (id: number) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const togglePlatform = (id: Platform) =>
    setPlatforms((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const reset = () => {
    setSelectedIds([]);
    setSearch("");
    setPlatforms(["facebook"]);
  };

  const handleCreate = async () => {
    if (!selectedIds.length) {
      toast.error("Choisissez au moins un produit");
      return;
    }
    if (!platforms.length) {
      toast.error("Choisissez au moins un réseau");
      return;
    }
    const startDate = new Date(startAt);
    if (Number.isNaN(startDate.getTime())) {
      toast.error("Date de début invalide");
      return;
    }
    try {
      const result = await createCampaign.mutateAsync({
        name: `Campagne du ${startDate.toLocaleDateString("fr-FR")}`,
        productIds: selectedIds,
        platforms,
        startAt: startDate,
        intervalMinutes,
      });
      toast.success(`${result.posts} publication(s) planifiée(s)`);
      utils.social.list.invalidate();
      utils.social.campaigns.invalidate();
      onCreated?.();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(`Erreur : ${error?.message || "inconnue"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[#1E5A8E]" />
            Planifier les publications
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choisissez vos produits : ils seront publiés les uns après les autres, à l'intervalle choisi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Produits */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">
                Produits ({selectedIds.length} sélectionné{selectedIds.length !== 1 ? "s" : ""})
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedIds(filtered.map((p) => p.id))}
                  className="text-[#1E5A8E] font-semibold hover:underline"
                >
                  Tout sélectionner
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-gray-500 hover:underline"
                >
                  Effacer
                </button>
              </div>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit…"
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
              {filtered.slice(0, 300).map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4 accent-[#1E5A8E]"
                  />
                  <span className="flex-1 truncate text-gray-700">{product.name}</span>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400">sans photo</span>
                  )}
                </label>
              ))}
              {!filtered.length && (
                <p className="p-4 text-center text-xs text-gray-400">Aucun produit trouvé</p>
              )}
            </div>
          </div>

          {/* Réseaux */}
          <div>
            <label className="text-xs font-medium text-gray-700">Réseaux sociaux</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {PLATFORMS.map(({ id, label, icon: Icon }) => {
                const active = platforms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePlatform(id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                      active
                        ? "border-[#1E5A8E] bg-blue-50 text-[#1E5A8E] font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date et intervalle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-gray-700">Première publication</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="mt-1.5 w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-700">Ensuite, tous les</label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="number"
                  min={1}
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(Math.max(1, Number(e.target.value)))}
                  className="w-24 h-10 rounded-md border border-gray-300 px-3 text-sm"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as typeof intervalUnit)}
                  className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Heures</option>
                  <option value="days">Jours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-gray-700 space-y-1">
            <p className="font-bold text-[#1E5A8E]">Récapitulatif</p>
            <p>
              <strong>{selectedIds.length}</strong> produit(s) × <strong>{platforms.length}</strong> réseau(x) ={" "}
              <strong>{selectedIds.length * platforms.length}</strong> publication(s)
            </p>
            <p>
              Première : <strong>{new Date(startAt).toLocaleString("fr-FR")}</strong>
            </p>
            {selectedIds.length > 1 && (
              <p>
                Dernière : <strong>{lastAt.toLocaleString("fr-FR")}</strong>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={createCampaign.isPending}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createCampaign.isPending || !selectedIds.length || !platforms.length}
              className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
            >
              {createCampaign.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création…</>
              ) : (
                <><CalendarClock className="h-4 w-4 mr-2" /> Planifier</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
