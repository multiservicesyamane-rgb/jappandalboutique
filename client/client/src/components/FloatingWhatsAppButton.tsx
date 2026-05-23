import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { BOUTIQUE_INFO } from "@shared/constants";

export function FloatingWhatsAppButton() {
  const whatsappUrl = `https://wa.me/${BOUTIQUE_INFO.phone1.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour Jappandal Boutique, je souhaite des informations sur vos produits.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 md:hidden"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BA5A] text-white animate-bounce"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </a>
  );
}
