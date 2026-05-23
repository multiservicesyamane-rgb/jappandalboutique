import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Image, Phone, MapPin, Mail, Save, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export default function AdminAppearance() {
  const { data: settings, refetch } = trpc.settings.list.useQuery();
  const upsertSetting = trpc.settings.upsert.useMutation();
  const uploadImage = trpc.products.uploadImage.useMutation();
  const { refetchSettings } = useSettings();

  const [saving, setSaving] = useState(false);
  const [savingColors, setSavingColors] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Form states
  const [shopName, setShopName] = useState("");
  const [shopSlogan, setShopSlogan] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1E5A8E");
  const [secondaryColor, setSecondaryColor] = useState("#0D3B0D");
  const [accentColor, setAccentColor] = useState("#A8D24E");

  // Load settings
  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => {
        if (s.value) map[s.key] = s.value;
      });
      setShopName(map["shop_name"] || "");
      setShopSlogan(map["shop_slogan"] || "");
      setPhone1(map["phone_1"] || "");
      setPhone2(map["phone_2"] || "");
      setEmail(map["email"] || "");
      setAddress(map["address"] || "");
      setWhatsappNumber(map["whatsapp_number"] || "");
      setLogoUrl(map["logo_url"] || "");
      setHeroImageUrl(map["hero_image_url"] || "");
      setPrimaryColor(map["primary_color"] || "#1E5A8E");
      setSecondaryColor(map["secondary_color"] || "#0D3B0D");
      setAccentColor(map["accent_color"] || "#A8D24E");
    }
  }, [settings]);

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: "shop_name", value: shopName },
        { key: "shop_slogan", value: shopSlogan },
        { key: "phone_1", value: phone1 },
        { key: "phone_2", value: phone2 },
        { key: "email", value: email },
        { key: "address", value: address },
        { key: "whatsapp_number", value: whatsappNumber || phone1 },
      ];

      for (const s of settingsToSave) {
        if (s.value) {
          await upsertSetting.mutateAsync({ key: s.key, value: s.value });
        }
      }

      await refetch();
      refetchSettings();
      toast.success("Informations enregistrées et appliquées sur le site !");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColors = async () => {
    setSavingColors(true);
    try {
      await upsertSetting.mutateAsync({ key: "primary_color", value: primaryColor });
      await upsertSetting.mutateAsync({ key: "secondary_color", value: secondaryColor });
      await upsertSetting.mutateAsync({ key: "accent_color", value: accentColor });

      await refetch();
      refetchSettings();
      toast.success("Couleurs enregistrées et appliquées sur le site !");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setSavingColors(false);
    }
  };

  const handleImageUpload = async (file: File, type: "logo" | "hero") => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5MB)");
      return;
    }

    const setUploading = type === "logo" ? setUploadingLogo : setUploadingHero;
    setUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = base64.split(",")[1];
      const { url } = await uploadImage.mutateAsync({
        fileName: `${type}-${Date.now()}-${file.name}`,
        fileData: base64Data,
        mimeType: file.type,
      });

      const key = type === "logo" ? "logo_url" : "hero_image_url";
      await upsertSetting.mutateAsync({ key, value: url });

      if (type === "logo") {
        setLogoUrl(url);
      } else {
        setHeroImageUrl(url);
      }

      await refetch();
      refetchSettings();
      toast.success(`${type === "logo" ? "Logo" : "Image bannière"} mis à jour et appliqué !`);
    } catch (error) {
      toast.error("Erreur lors de l'upload");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Apparence" subtitle="Personnalisation visuelle de la boutique">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 flex items-start gap-2 md:gap-3 mx-2 md:mx-0">
        <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs md:text-sm font-medium text-blue-800">Modifications en temps réel</p>
          <p className="text-xs text-blue-600 mt-1">
            Toutes les modifications seront appliquées immédiatement sur le site après enregistrement.
            Le nom, slogan, logo, couleurs et contacts seront mis à jour partout.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 px-2 md:px-0">
        {/* Informations boutique */}
        <Card className="bg-white border shadow-premium">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#1B4D8F]" />
              Informations de contact
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shopName">Nom de la boutique</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Jappandal Boutique"
                />
              </div>
              <div>
                <Label htmlFor="shopSlogan">Slogan</Label>
                <Input
                  id="shopSlogan"
                  value={shopSlogan}
                  onChange={(e) => setShopSlogan(e.target.value)}
                  placeholder="Votre Supermarché de Confiance"
                />
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone1">Téléphone 1</Label>
                  <Input
                    id="phone1"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="+221 77 123 45 67"
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">Téléphone 2</Label>
                  <Input
                    id="phone2"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="+221 78 123 45 67"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+221 77 123 45 67"
                />
                <p className="text-xs text-gray-400 mt-1">Utilisé pour les commandes et demandes clients</p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@jappandal.com"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dakar, Sénégal"
                  rows={3}
                />
              </div>
                <Button
                onClick={handleSaveInfo}
                disabled={saving}
                className="w-full bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white text-sm md:text-base"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card className="bg-white border shadow-premium">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#1B4D8F]" />
              Couleurs du thème
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Couleur principale (Bleu)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#1E5A8E"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Couleur secondaire (Vert foncé)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#0D3B0D"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accentColor">Couleur d'accent (Jaune-vert)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="accentColor"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#A8D24E"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Aperçu :</p>
                <div className="flex gap-2">
                  <div
                    className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Principal
                  </div>
                  <div
                    className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondaire
                  </div>
                  <div
                    className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveColors}
                disabled={savingColors}
                className="w-full bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white text-sm md:text-base"
              >
                {savingColors ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savingColors ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card className="bg-white border shadow-premium">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-[#1B4D8F]" />
              Logo de la boutique
            </h3>
            <div className="space-y-4">
              {logoUrl && (
                <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="max-w-[200px] max-h-[120px] object-contain"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="logoUpload">Changer le logo</Label>
                <div className="relative">
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "logo");
                    }}
                  />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1E5A8E]" />
                      <span className="ml-2 text-sm text-gray-600">Upload en cours...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format PNG ou JPG, max 5MB. Le logo sera visible dans le header et le pied de page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image hero */}
        <Card className="bg-white border shadow-premium">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-[#1B4D8F]" />
              Image bannière d'accueil
            </h3>
            <div className="space-y-4">
              {heroImageUrl && (
                <div className="flex justify-center bg-gray-50 rounded-lg p-2">
                  <img
                    src={heroImageUrl}
                    alt="Hero"
                    className="max-w-full max-h-[150px] object-cover rounded"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="heroUpload">Changer l'image</Label>
                <div className="relative">
                  <Input
                    id="heroUpload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingHero}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "hero");
                    }}
                  />
                  {uploadingHero && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1E5A8E]" />
                      <span className="ml-2 text-sm text-gray-600">Upload en cours...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format PNG ou JPG, max 5MB, recommandé 1920x600px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
