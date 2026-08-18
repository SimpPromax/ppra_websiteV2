import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './Header'
import Footer from './Footer'

// Make sure the base Lenis smooth scrolling layout styles are loaded
import 'lenis/dist/lenis.css'

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Sub-component to seamlessly update GSAP ScrollTrigger 
 * positions while Lenis performs its smooth dampening calculation.
 */
function ScrollConfiguration() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Direct binding: updates trigger calculations on every smooth frame change
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

export default function Layout() {
  return (
    // Options configuration: adjust lerp (0.05 = heavier/slower, 0.15 = snappier)
<ReactLenis root options={{ duration: 2.5, ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: true }}>
      {/* Syncs Lenis positions with GSAP */}
      <ScrollConfiguration />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  )
}