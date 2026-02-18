import { useEffect, useRef, useState, useCallback, memo } from "react";
import { trpc } from "@/lib/trpc";

interface AdBannerProps {
  position: string;
  className?: string;
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

/**
 * Renders HTML/AdSense banners inside an isolated iframe
 * to prevent third-party scripts from modifying React's DOM tree.
 */
function IsolatedHtmlBanner({
  content,
  bannerId,
  onClick,
}: {
  content: string;
  bannerId: number;
  onClick: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { overflow: hidden; font-family: sans-serif; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    doc.close();

    // Adjust iframe height to content
    const resizeObserver = new ResizeObserver(() => {
      const body = doc.body;
      if (body) {
        const newHeight = body.scrollHeight;
        if (newHeight > 0) setHeight(newHeight);
      }
    });

    if (doc.body) {
      resizeObserver.observe(doc.body);
      // Initial height
      setTimeout(() => {
        if (doc.body) {
          const newHeight = doc.body.scrollHeight;
          if (newHeight > 0) setHeight(newHeight);
        }
      }, 500);
    }

    return () => resizeObserver.disconnect();
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      title={`ad-banner-${bannerId}`}
      className="w-full border-0 rounded-lg"
      style={{ height: `${height}px`, overflow: "hidden" }}
      sandbox="allow-scripts allow-popups allow-same-origin"
      onClick={onClick}
    />
  );
}

function AdBannerInner({ position, className = "" }: AdBannerProps) {
  const { data: banners = [] } = trpc.adBanners.getByPosition.useQuery({ position });
  const trackImpression = trpc.adBanners.trackImpression.useMutation();
  const trackClick = trpc.adBanners.trackClick.useMutation();
  const trackedRef = useRef<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleTrackImpression = useCallback((bannerId: number) => {
    if (!trackedRef.current.has(bannerId)) {
      trackedRef.current.add(bannerId);
      trackImpression.mutate({ id: bannerId });
    }
  }, [trackImpression]);

  useEffect(() => {
    banners.forEach((banner) => {
      handleTrackImpression(banner.id);
    });
  }, [banners, handleTrackImpression]);

  const handleClick = useCallback((bannerId: number) => {
    trackClick.mutate({ id: bannerId });
  }, [trackClick]);

  const handleImageError = useCallback((bannerId: number) => {
    setFailedImages((prev) => new Set(prev).add(bannerId));
  }, []);

  // Filter out banners with invalid image URLs or failed loads
  const validBanners = banners.filter((banner) => {
    if (banner.type === "image") {
      return isValidImageUrl(banner.content) && !failedImages.has(banner.id);
    }
    return true;
  });

  if (validBanners.length === 0) return null;

  return (
    <div className={`ad-banner-container ${className}`}>
      {validBanners.map((banner) => {
        if (banner.type === "image") {
          const imgElement = (
            <img
              src={banner.content}
              alt={banner.name}
              className="w-full h-auto rounded-lg shadow-sm"
              style={{
                maxWidth: banner.width ? `${banner.width}px` : "100%",
                maxHeight: banner.height ? `${banner.height}px` : "auto",
              }}
              onError={() => handleImageError(banner.id)}
            />
          );

          return (
            <div key={banner.id} className="ad-banner-item mb-4">
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => handleClick(banner.id)}
                  className="block"
                >
                  {imgElement}
                </a>
              ) : (
                imgElement
              )}
            </div>
          );
        }

        if (banner.type === "html" || banner.type === "adsense") {
          return (
            <div key={banner.id} className="ad-banner-item mb-4">
              <IsolatedHtmlBanner
                content={banner.content}
                bannerId={banner.id}
                onClick={() => handleClick(banner.id)}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// Memo to prevent unnecessary re-renders
export const AdBanner = memo(AdBannerInner);
