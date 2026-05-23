import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to scroll to top when route changes
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
}
