import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Local transparent image imports
import imgP from '../assets/commonPics/p transparent.png'
import imgR from '../assets/commonPics/r transparent.png'
import imgA from '../assets/commonPics/a transparent.png'

// Your PPRA marquee asset import
import ppraMarqueeLogo from '../assets/commonPics/text and logo ppra.png'

export default function Footer() {
  const letterPRef = useRef(null)
  const letterP2Ref = useRef(null)
  const letterRRef = useRef(null)
  const letterARef = useRef(null)

  useGSAP(() => {
    const letters = [
      letterPRef.current, 
      letterP2Ref.current, 
      letterRRef.current, 
      letterARef.current
    ].filter(el => el !== null)
    
    if (letters.length === 0) return

    const masterTl = gsap.timeline()

    masterTl.fromTo(letters,
      { opacity: 0, y: 30, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.4)" }
    )

    const pulseTimeline = gsap.timeline({ repeat: -1, repeatDelay: 5.0 })
    pulseTimeline.to(letters, {
      scale: 1.12,
      filter: "brightness(1.4)",
      duration: 0.2,
      stagger: { each: 0.08, yoyo: true, repeat: 1 },
      ease: "power1.out"
    })

    masterTl.add(pulseTimeline, "-=0.2")
  }, [])

  return (
    <footer className="footer_component bg-primary-purple-dark text-soft-cream relative overflow-hidden">
      
      {/* 1. MARQUEE CAROUSEL DIV */}
      <div 
        className="w-full h-20 bg-white flex items-center overflow-hidden relative select-none"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      >
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-slow {
            display: flex;
            width: max-content;
            animation: marquee 25s linear infinite;
          }
        `}</style>

        <div className="animate-marquee-slow gap-16 items-center px-4">
          {/* TRACK 1: Original Set */}
          {[...Array(6)].map((_, i) => (
            <div key={`track1-${i}`} className="flex items-center justify-center shrink-0 h-12 w-48 mx-4">
              <img 
                src={ppraMarqueeLogo} 
                alt="PPRA Kenya" 
                className="h-full w-auto object-contain"
              />
            </div>
          ))}

          {/* TRACK 2: Duplicate Set for Seamless Loop */}
          {[...Array(6)].map((_, i) => (
            <div key={`track2-${i}`} className="flex items-center justify-center shrink-0 h-12 w-48 mx-4">
              <img 
                src={ppraMarqueeLogo} 
                alt="PPRA Kenya" 
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. BODY LINK GRID ARCHITECTURE */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 relative z-10">
        <div className="xl:grid xl:grid-cols-12 xl:gap-8">
          
          {/* Brand/Identity Segment */}
          <div className="xl:col-span-3 flex flex-col items-center xl:items-start mb-10 xl:mb-0">
            <Link 
              to="/" 
              className="grid grid-cols-4 items-center gap-1 max-w-40 w-full transition-opacity hover:opacity-60"
            >
              <img ref={letterPRef} loading="lazy" src={imgP} alt="P" className="w-full h-auto object-contain block will-change-transform" />
              <img ref={letterP2Ref} loading="lazy" src={imgP} alt="P" className="w-full h-auto object-contain block will-change-transform" />
              <img ref={letterRRef} loading="lazy" src={imgR} alt="R" className="w-full h-auto object-contain block will-change-transform" />
              <img ref={letterARef} loading="lazy" src={imgA} alt="A" className="w-full h-auto object-contain block will-change-transform" />
            </Link>
            <div className="mt-6 text-center xl:text-left text-xs font-mono tracking-wide leading-relaxed text-soft-cream/60">
              1° 17' S &bull; 36° 49' E<br />
              Nairobi, Kenya
            </div>
          </div>

          {/* Nested Navigation & Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:col-span-9">
            
            {/* Column A: About Us */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-soft-cream uppercase tracking-wider mb-4">
                About Us
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-soft-cream/70 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about-us" className="text-soft-cream/70 hover:text-white transition-colors">Who We Are</Link></li>
                <li><Link to="/about-us" className="text-soft-cream/70 hover:text-white transition-colors">Our History</Link></li>
                <li><Link to="/about-us" className="text-soft-cream/70 hover:text-white transition-colors">Our Management</Link></li>
              </ul>
            </div>

            {/* Column B: Portals */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-soft-cream uppercase tracking-wider mb-4">
                Our Portals
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="http://tenders.go.ke" target="_blank" rel="noopener noreferrer" className="text-soft-cream/70 hover:text-white transition-colors flex items-center gap-0.5">
                    PPIP <span className="text-xs opacity-60">↗</span>
                  </a>
                </li>
                <li>
                  <a href="http://cms.ppra.go.ke" target="_blank" rel="noopener noreferrer" className="text-soft-cream/70 hover:text-white transition-colors flex items-center gap-0.5">
                    CMS Portal <span className="text-xs opacity-60">↗</span>
                  </a>
                </li>
                <li>
                  <a href="http://arcms.ppra.go.ke" target="_blank" rel="noopener noreferrer" className="text-soft-cream/70 hover:text-white transition-colors flex items-center gap-0.5">
                    ARCMS <span className="text-xs opacity-60">↗</span>
                  </a>
                </li>
                <li><Link to="/portfolio-page" className="text-soft-cream/70 hover:text-white transition-colors">EGP System</Link></li>
                <li><Link to="/all-posts" className="text-soft-cream/70 hover:text-white transition-colors">National Treasury</Link></li>
              </ul>
            </div>

            {/* Column C: Legal & Policies */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-soft-cream uppercase tracking-wider mb-4">
                Policies
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal/privacy-policy" className="text-soft-cream/70 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal/data-privacy-policy" className="text-soft-cream/70 hover:text-white transition-colors">Data Privacy</Link></li>
                <li><Link to="/legal/service-charter" className="text-soft-cream/70 hover:text-white transition-colors">Service Charter</Link></li>
                <li><Link to="/legal/information-security-policy" className="text-soft-cream/70 hover:text-white transition-colors">Info Security</Link></li>
                <li><Link to="/legal/terms-conditions" className="text-soft-cream/70 hover:text-white transition-colors">Terms of Use</Link></li>
              </ul>
            </div>

            {/* Column D: Contact & Platforms */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xs sm:text-sm font-bold text-soft-cream uppercase tracking-wider mb-4">
                Contact Us
              </h3>
              <p className="text-xs sm:text-sm text-soft-cream/70 leading-relaxed space-y-1">
                <span>Support Center Desk:</span> <br />
                <a href="tel:020-3244000" className="text-white hover:underline font-medium">020-3244000</a> <br />
                <span>Email Infrastructure:</span> <br />
                <a href="mailto:info@ppra.go.ke" className="text-white hover:underline font-medium break-all">info@ppra.go.ke</a>
              </p>

              {/* Vector Networks */}
              <div className="flex items-center gap-4 mt-6">
                <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/391925254206979?ref=embed_page" className="text-soft-cream/40 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com" className="text-soft-cream/40 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://x.com/intent/follow?original_referer=https%3A%2F%2Fppra.go.ke%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5EPPRAKenya&region=follow_link&screen_name=PPRAKenya" className="text-soft-cream/40 hover:text-white transition-colors" aria-label="Twitter">
                  <svg height="16" viewBox="0 0 300 300" fill="currentColor">
                    <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"></path>
                  </svg>
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/search/results/all/?keywords=PPRA%20Kenya&origin=RICH_QUERY_SUGGESTION&heroEntityKey=urn%3Ali%3Aorganization%3A92493735&position=0" className="text-soft-cream/40 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>



            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: COPYRIGHT */}
      <div className="footer_bottom border-t border-white/10">
        <div className="padding-global px-4 sm:px-6 lg:px-8">
          <div className="container-large max-w-7xl mx-auto">
            <div className="footer_bottom-wrapper flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 text-xs sm:text-sm py-4">
              <div className="footer_credit-text text-soft-cream/50 text-center md:text-left">
                © 2026 PPRA Kenya. All rights reserved.
              </div>
              
<span className="footer_legal-link no-underline text-soft-cream/50 hover:text-soft-cream transition-colors text-center">
  Website by Leon Odhiambo
</span>
              
              <div className="footer_legal-list flex gap-3 md:gap-4">
                <Link to="/legal/privacy-policy" className="footer_legal-link text-soft-cream/50 hover:text-soft-cream transition-colors text-xs sm:text-sm">Privacy</Link>
                <span className="text-soft-cream/20">|</span>
                <Link to="/legal/terms-conditions" className="footer_legal-link text-soft-cream/50 hover:text-soft-cream transition-colors text-xs sm:text-sm">Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}