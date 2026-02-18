import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageCircle, Search, Send } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface ProductNotFoundProps {
  searchQuery?: string;
}

export function ProductNotFound({ searchQuery }: ProductNotFoundProps) {
  const settings = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productName, setProductName] = useState(searchQuery || "");
  const [details, setDetails] = useState("");

  const handleSendWhatsApp = () => {
    const phone = settings.phone1.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `🔍 *Recherche de produit*\n\n` +
      `Bonjour, je recherche un produit que je n'ai pas trouvé sur votre boutique :\n\n` +
      `📦 *Produit recherché :* ${productName}\n` +
      (details ? `📝 *Détails :* ${details}\n` : "") +
      `\nPouvez-vous m'aider à le trouver ? Merci !`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    setDialogOpen(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#1E5A8E]/5 to-[#0D3B0D]/5 rounded-xl p-6 text-center border border-[#1E5A8E]/10">
        <Search className="h-10 w-10 mx-auto text-[#1E5A8E]/40 mb-3" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Vous ne trouvez pas votre produit ?
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Dites-nous ce que vous recherchez et nous le trouverons pour vous !
          Nous pouvons commander n'importe quel produit sur demande.
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
          Je recherche un produit
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Search className="h-5 w-5 text-[#1E5A8E]" />
              Rechercher un produit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Quel produit recherchez-vous ? *
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Huile d'argan bio, Couscous..."
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Détails supplémentaires (optionnel)
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Quantité souhaitée, marque préférée, budget..."
                rows={3}
              />
            </div>

            <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
              <MessageCircle className="h-5 w-5 text-[#25D366] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Votre demande sera envoyée directement sur notre WhatsApp.
                Nous vous répondrons dans les plus brefs délais !
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={!productName.trim()}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
            >
              <Send className="h-4 w-4" />
              Envoyer sur WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
