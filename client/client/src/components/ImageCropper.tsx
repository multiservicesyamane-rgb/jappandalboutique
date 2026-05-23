import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
  title?: string;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.9
    );
  });
}

export function ImageCropper({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  title = "Recadrer l'image",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
      onClose();
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {/* Crop area */}
        <div className="relative w-full h-[300px] sm:h-[350px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1E5A8E]"
            />
            <ZoomIn className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>

          {/* Rotation */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="text-xs gap-1"
            >
              <RotateCw className="h-3 w-3" />
              Rotation
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 gap-1">
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white gap-1"
          >
            <Check className="h-4 w-4" />
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
