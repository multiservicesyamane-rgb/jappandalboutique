import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { SocialPublisherDialog } from "@/components/SocialPublisherDialog";
import { SocialScheduleDialog } from "@/components/SocialScheduleDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Music2,
  Pin,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  SkipForward,
  XCircle,
} from "lucide-react";

type Platform = "facebook" | "instagram" | "tiktok" | "pinterest";

const PLATFORM_META: Record<Platform, { label: string; icon: typeof Facebook; color: string }> = {
  facebook: { label: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  instagram: { label: "Instagram", icon: Instagram, color: "text-[#E1306C]" },
  tiktok: { label: "TikTok", icon: Music2, color: "text-gray-800" },
  pinterest: { label: "Pinterest", icon: Pin, color: "text-[#E60023]" },
};

const statusStyles: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  published: { label: "Publié", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  scheduled: { label: "Planifié", className: "bg-blue-100 text-blue-700", icon: CalendarClock },
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  cancelled: { label: "Annulé", className: "bg-gray-100 text-gray-500", icon: Ban },
  failed: { label: "Échec", className: "bg-red-100 text-red-700", icon: XCircle },
  skipped: { label: "Ignoré", className: "bg-gray-100 text-gray-500", icon: SkipForward },
};

export default function AdminSocial() {
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [limit, setLimit] = useState(50);

  const utils = trpc.useUtils();
  const { data: status } = trpc.social.status.useQuery();
  const { data: posts, isLoading } = trpc.social.list.useQuery({ limit });
  const { data: campaigns } = trpc.social.campaigns.useQuery();
  const { data: products } = trpc.products.listAdmin.useQuery();

  const runDue = trpc.social.runDue.useMutation({
    onSuccess: (result) => {
      utils.social.list.invalidate();
      utils.social.campaigns.invalidate();
      toast.success(`${result.processed} publication(s) traitée(s)${result.failed ? `, ${result.failed} échec(s)` : ""}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelCampaign = trpc.social.cancelCampaign.useMutation({
    onSuccess: () => {
      utils.social.campaigns.invalidate();
      utils.social.list.invalidate();
      toast.success("Campagne annulée");
    },
    onError: (error) => toast.error(error.message),
  });

  const retry = trpc.social.retry.useMutation({
    onSuccess: (result) => {
      utils.social.list.invalidate();
      if (result.status === "published") toast.success("Publication relancée avec succès");
      else toast.error(`Échec : ${result.error}`);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AdminLayout
      title="Réseaux sociaux"
      subtitle="Publication automatique des produits sur Facebook, Instagram, TikTok et Pinterest"
    >
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => utils.social.status.invalidate() || utils.social.list.invalidate()}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => runDue.mutate()}
          disabled={runDue.isPending}
          className="gap-1.5"
        >
          <Play className="h-3.5 w-3.5" /> Exécuter les échéances
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScheduleOpen(true)}
          className="gap-1.5"
        >
          <CalendarClock className="h-3.5 w-3.5" /> Planifier
        </Button>
        <Button
          size="sm"
          onClick={() => setPublishOpen(true)}
          className="gap-1.5 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
        >
          <Send className="h-3.5 w-3.5" /> Publier un produit
        </Button>
      </div>

      {/* État des comptes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {(Object.keys(PLATFORM_META) as Platform[]).map((platform) => {
          const meta = PLATFORM_META[platform];
          const Icon = meta.icon;
          const info = status?.[platform];
          return (
            <div key={platform} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-6 w-6 ${meta.color}`} />
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    info?.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${info?.enabled ? "bg-green-500" : "bg-gray-400"}`} />
                  {info?.enabled ? "Connecté" : "Non configuré"}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">{meta.label}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight" title={info?.detail}>
                {info?.detail || "Chargement…"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Campagnes planifiées */}
      {campaigns && campaigns.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-gray-800">Campagnes planifiées</h3>
          </div>
          <div className="divide-y">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="h-4 w-4 text-[#1E5A8E]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{campaign.name}</p>
                  <p className="text-[11px] text-gray-500">
                    {campaign.platforms.split(",").join(" · ")} · {campaign.total} publication(s) · toutes les{" "}
                    {campaign.intervalMinutes} min
                    {campaign.nextAt && ` · prochaine le ${new Date(campaign.nextAt).toLocaleString("fr-FR")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                    {campaign.published} publié{campaign.published !== 1 ? "s" : ""}
                  </span>
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
                    {campaign.scheduled} en attente
                  </span>
                  {campaign.failed > 0 && (
                    <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
                      {campaign.failed} échec{campaign.failed !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  campaign.status === "active" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"
                }`}>
                  {campaign.status === "active" ? "Active" : "Annulée"}
                </span>
                {campaign.status === "active" && (
                  <button
                    onClick={() => {
                      if (confirm("Annuler cette campagne et toutes ses publications en attente ?")) {
                        cancelCampaign.mutate({ id: campaign.id });
                      }
                    }}
                    disabled={cancelCampaign.isPending}
                    title="Annuler la campagne"
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File d'attente */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-gray-800">File d'attente</h3>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="h-8 rounded-md border border-gray-200 px-2 text-xs"
          >
            <option value={25}>25 dernières</option>
            <option value={50}>50 dernières</option>
            <option value={100}>100 dernières</option>
            <option value={200}>200 dernières</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1E5A8E]" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="text-left py-2.5 px-4">Réseau</th>
                  <th className="text-left py-2.5 px-2">Produit</th>
                  <th className="text-left py-2.5 px-2 hidden md:table-cell">Date</th>
                  <th className="text-center py-2.5 px-2">Statut</th>
                  <th className="text-right py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const platform = post.platform as Platform;
                  const meta = PLATFORM_META[platform];
                  const Icon = meta?.icon || Send;
                  const st = statusStyles[post.status] || statusStyles.pending;
                  const StatusIcon = st.icon;
                  return (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 px-4">
                        <span className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Icon className={`h-4 w-4 ${meta?.color || ""}`} />
                          {meta?.label || post.platform}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <p className="font-medium text-gray-800 max-w-[220px] truncate">{post.productName || "—"}</p>
                        {post.error && (
                          <p className="text-[10px] text-red-500 max-w-[260px] truncate" title={post.error}>
                            {post.error}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-gray-500 hidden md:table-cell">
                        {post.scheduledAt ? (
                          <span className="text-blue-600" title="Date de publication prévue">
                            {new Date(post.scheduledAt).toLocaleString("fr-FR")}
                          </span>
                        ) : post.createdAt ? (
                          new Date(post.createdAt).toLocaleString("fr-FR")
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${st.className}`}>
                          <StatusIcon className="h-3 w-3" /> {st.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {(post.status === "failed" || post.status === "skipped") && (
                          <button
                            onClick={() => retry.mutate({ id: post.id })}
                            disabled={retry.isPending}
                            title="Réessayer"
                            className="p-2 rounded-lg hover:bg-blue-50 text-[#1E5A8E]"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Send className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Aucune publication pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">
              Les publications apparaîtront ici automatiquement à la création d'un produit avec photo.
            </p>
          </div>
        )}
      </div>

      <SocialPublisherDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        products={products || []}
      />

      <SocialScheduleDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        products={products || []}
      />
    </AdminLayout>
  );
}
