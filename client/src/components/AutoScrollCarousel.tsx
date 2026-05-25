import { useRef, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Pixels per second — default 40 (lent et doux) */
  speed?: number;
  /** Nombre d'items — le scroll ne démarre que si >= 2 */
  itemCount?: number;
}

export function AutoScrollCarousel({
  children,
  className = "",
  speed = 40,
  itemCount = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || itemCount < 2) return;

    let dir = 1;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;
    let lastTs: number | undefined;
    let raf: number;

    const step = (ts: number) => {
      if (!paused && el.scrollWidth > el.clientWidth + 2) {
        if (lastTs !== undefined) {
          const dt = Math.min(ts - lastTs, 100); // évite les sauts si onglet mis en pause
          el.scrollLeft += dir * (speed / 1000) * dt;
          if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) dir = -1;
          else if (el.scrollLeft <= 0) dir = 1;
        }
        lastTs = ts;
      } else {
        lastTs = undefined;
      }
      raf = requestAnimationFrame(step);
    };

    const handlePause = () => {
      clearTimeout(resumeTimer);
      paused = true;
    };

    const handleResume = () => {
      clearTimeout(resumeTimer);
      // Attend 2s après que l'utilisateur ait lâché pour reprendre le défilement
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 2000);
    };

    el.addEventListener("pointerdown", handlePause);
    el.addEventListener("pointerup", handleResume);
    el.addEventListener("pointercancel", handleResume);
    el.addEventListener("touchstart", handlePause, { passive: true });
    el.addEventListener("touchend", handleResume);

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      el.removeEventListener("pointerdown", handlePause);
      el.removeEventListener("pointerup", handleResume);
      el.removeEventListener("pointercancel", handleResume);
      el.removeEventListener("touchstart", handlePause);
      el.removeEventListener("touchend", handleResume);
    };
  }, [itemCount, speed]);

  return (
    <div
      ref={ref}
      className={`flex overflow-x-auto scrollbar-hide ${className}`}
      style={{ scrollBehavior: "auto" }}
    >
      {children}
    </div>
  );
}
