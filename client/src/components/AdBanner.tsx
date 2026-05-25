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

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isGifUrl(url: string): boolean {
  return /\.gif(\?.*)?$/i.test(url);
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** Iframe for HTML/AdSense content — isolated from React DOM */
function IsolatedHtmlBanner({ content, bannerId, onClick }: { content: string; bannerId: number; onClick: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const html = `<!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { overflow: hidden; font-family: sans-serif; } img, video { max-width: 100%; height: auto; display: block; }</style></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    iframe.src = blobUrl;

    const onLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body?.scrollHeight) setHeight(doc.body.scrollHeight);
      URL.revokeObjectURL(blobUrl);
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      title={`ad-banner-${bannerId}`}
      className="w-full border-0 rounded-xl"
      style={{ height: `${height}px`, overflow: "hidden" }}
      sandbox="allow-scripts allow-popups allow-same-origin"
      onClick={onClick}
    />
  );
}

/** Native video player with autoplay, loop, muted */
function VideoBanner({ src, linkUrl, onClick }: { src: string; linkUrl?: string | null; onClick: () => void }) {
  const video = (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-auto rounded-xl shadow-md"
      style={{ maxHeight: 300 }}
    />
  );
  return linkUrl ? (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={onClick} className="block">
      {video}
    </a>
  ) : video;
}

/** GIF with pulse glow animation */
function GifBanner({ src, alt, linkUrl, onClick }: { src: string; alt: string; linkUrl?: string | null; onClick: () => void }) {
  const img = (
    <img
      src={src}
      alt={alt}
      className="w-full h-auto rounded-xl shadow-md"
      style={{ animation: "none" }}
    />
  );
  return linkUrl ? (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={onClick} className="block">
      {img}
    </a>
  ) : img;
}

/** YouTube or Vimeo embed */
function EmbedBanner({ embedSrc, onClick }: { embedSrc: string; onClick: () => void }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-md" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={embedSrc}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video ad"
        onClick={onClick}
      />
    </div>
  );
}

function AdBannerInner({ position, className = "" }: AdBannerProps) {
  const { data: banners = [] } = trpc.adBanners.getByPosition.useQuery(
    { position },
    { staleTime: 60 * 60 * 1000, gcTime: 60 * 60 * 1000 } // 1h — les pubs changent peu souvent
  );
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
    banners.forEach((b) => handleTrackImpression(b.id));
  }, [banners, handleTrackImpression]);

  const handleClick = useCallback((bannerId: number) => {
    trackClick.mutate({ id: bannerId });
  }, [trackClick]);

  const handleImageError = useCallback((bannerId: number) => {
    setFailedImages((prev) => new Set(prev).add(bannerId));
  }, []);

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
          const content = banner.content;

          // Auto-detect YouTube embed
          const ytId = getYouTubeId(content);
          if (ytId) {
            return (
              <div key={banner.id} className="ad-banner-item mb-4">
                <EmbedBanner
                  embedSrc={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}`}
                  onClick={() => handleClick(banner.id)}
                />
              </div>
            );
          }

          // Auto-detect Vimeo embed
          const vimeoId = getVimeoId(content);
          if (vimeoId) {
            return (
              <div key={banner.id} className="ad-banner-item mb-4">
                <EmbedBanner
                  embedSrc={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1`}
                  onClick={() => handleClick(banner.id)}
                />
              </div>
            );
          }

          // Auto-detect video file
          if (isVideoUrl(content)) {
            return (
              <div key={banner.id} className="ad-banner-item mb-4">
                <VideoBanner
                  src={content}
                  onClick={() => handleClick(banner.id)}
                />
              </div>
            );
          }

          // GIF — render same as image but tagged separately for future
          if (isGifUrl(content)) {
            return (
              <div key={banner.id} className="ad-banner-item mb-4">
                <GifBanner
                  src={content}
                  alt={banner.name}
                  onClick={() => handleClick(banner.id)}
                />
              </div>
            );
          }

          // Standard image
          const imgElement = (
            <img
              src={content}
              alt={banner.name}
              className="w-full h-auto rounded-xl shadow-sm"
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
                <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => handleClick(banner.id)} className="block">
                  {imgElement}
                </a>
              ) : imgElement}
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

export const AdBanner = memo(AdBannerInner);
