import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Save,
  Phone,
  Mail,
  MessageSquare,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_phone: "+221 77 682 78 51",
    whatsapp_phone_2: "+221 76 905 51 94",
    admin_email: "multiservicesyamane@gmail.com",
    whatsapp_message_template:
      "Bonjour Jappandal Boutique, je souhaite commander : [Nom du produit] - [Prix FCFA]. Quantité : ___. Mon lieu de livraison : ___. Merci !",
    site_description: "Votre Supermarché de Confiance",
    site_values: "Qualité, Économie, Confiance",
  });

  const utils = trpc.useUtils();
  const { data: allSettings } = trpc.settings.list.useQuery();
  const upsertSetting = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      utils.settings.list.invalidate();
      toast.success("Paramètres enregistrés");
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  useEffect(() => {
    if (allSettings) {
      const settingsMap: Record<string, string> = {};
      allSettings.forEach((s) => {
        if (s.value) settingsMap[s.key] = s.value;
      });
      setSettings((prev) => ({ ...prev, ...settingsMap }));
    }
  }, [allSettings]);

  const handleSave = async () => {
    const descriptions: Record<string, string> = {
      whatsapp_phone: "Numéro WhatsApp principal",
      whatsapp_phone_2: "Numéro WhatsApp secondaire",
      admin_email: "Email administrateur",
      whatsapp_message_template: "Template de message WhatsApp",
      site_description: "Slogan du site",
      site_values: "Valeurs de la boutique",
    };
    const promises = Object.entries(settings).map(([key, value]) =>
      upsertSetting.mutateAsync({ key, value, description: descriptions[key] || "" })
    );
    await Promise.all(promises);
  };

  return (
    <AdminLayout title="Paramètres" subtitle="Configuration de la boutique">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleSave}
          disabled={upsertSetting.isPending}
          className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
        >
          {upsertSetting.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* WhatsApp */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              Paramètres WhatsApp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="wp1" className="text-xs font-medium">Téléphone WhatsApp 1</Label>
                <Input
                  id="wp1"
                  value={settings.whatsapp_phone}
                  onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wp2" className="text-xs font-medium">Téléphone WhatsApp 2</Label>
                <Input
                  id="wp2"
                  value={settings.whatsapp_phone_2}
                  onChange={(e) => setSettings({ ...settings, whatsapp_phone_2: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              Contact
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email Administrateur</Label>
              <Input
                id="email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Message Template */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-yellow-600" />
              Template de Message WhatsApp
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="template" className="text-xs font-medium">Message pré-rempli</Label>
              <Textarea
                id="template"
                value={settings.whatsapp_message_template}
                onChange={(e) => setSettings({ ...settings, whatsapp_message_template: e.target.value })}
                rows={4}
              />
              <p className="text-[10px] text-gray-400">Variables: [Nom du produit], [Prix FCFA]</p>
            </div>
          </CardContent>
        </Card>

        {/* Site Info */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              Informations du Site
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="slogan" className="text-xs font-medium">Slogan</Label>
                <Input
                  id="slogan"
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="values" className="text-xs font-medium">Valeurs</Label>
                <Input
                  id="values"
                  value={settings.site_values}
                  onChange={(e) => setSettings({ ...settings, site_values: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom save */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={upsertSetting.isPending}
          className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
        >
          {upsertSetting.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer tous les paramètres
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
