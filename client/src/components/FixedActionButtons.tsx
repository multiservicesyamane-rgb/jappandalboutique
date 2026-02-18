import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

interface FixedActionButtonsProps {
  whatsappUrl: string;
  phoneNumber: string;
}

export function FixedActionButtons({ whatsappUrl, phoneNumber }: FixedActionButtonsProps) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const callUrl = `tel:${cleanPhone}`;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:hidden">
      <div className="flex gap-3 max-w-md mx-auto">
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            size="lg"
            className="w-full h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xl font-semibold text-base"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Commander
          </Button>
        </a>

        {/* Call Button */}
        <a
          href={callUrl}
          className="flex-1"
        >
          <Button
            size="lg"
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white shadow-2xl font-semibold text-base"
          >
            <Phone className="h-5 w-5 mr-2" />
            Appeler
          </Button>
        </a>
      </div>
    </div>
  );
}
