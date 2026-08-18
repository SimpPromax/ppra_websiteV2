import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      // Use Lenis to scroll to top smoothly
      lenis.scrollTo(0, { 
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      // Fallback for when Lenis isn't available
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname, lenis]);

  return null;
}