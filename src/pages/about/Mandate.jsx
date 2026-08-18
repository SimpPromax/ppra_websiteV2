import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import mandatory assets
import logoImage from '../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const mandateFunctions = [
  "Monitor, assess and review the public procurement and asset disposal system to ensure that they respect the national values and other provisions of the Constitution, including Article 227 and make recommendations for improvements",
  "Monitor the public procurement system and report on the overall functioning of it and present to the Cabinet Secretary and the county executive member for finance in each county, such other reports and recommendations for improvements",
  "Enforce any standards developed under the Act",
  "Monitor classified procurement information, including that of specific items of security organs and making recommendations to the Cabinet Secretary",
  "Monitor the implementation of the preference and reservation schemes by procuring entities",
  "Prepare, issue and publicize standard public procurement and asset disposal documents and formats to be used by public entities and other stakeholders",
  "Provide advice and technical support upon request",
  "Investigate and act on complaints received on procurement and asset disposal proceedings from procuring entities, tenderers, contractors or the general public that are not subject of administrative review",
  "Research on the public procurement and asset disposal system and any developments arising from the same",
  "Advise the Cabinet Secretary on the setting of standards including international public procurement and asset disposal standards",
  "Develop and manage the State portal on procurement and asset disposal and ensure that it is available and easily accessible",
  "Monitor and evaluate the preference and reservations provided for under the Act and provide quarterly reports",
  "Create a central repository or database that includes— complaints made on procuring entities; record of those prohibited from participating in tenders or those debarred; market prices of goods, services and works; benchmarked prices; State organs and public entities that are non-compliant with procurement laws; statistics related to public procurement and asset disposal; price comparisons for goods, services and works; and any information related to procurement that may be necessary for the public",
  "Inform as applicable, the Cabinet Secretary, Parliament, the relevant County Executive member for finance, the relevant County Assembly or Auditor-General on issues on non-compliance with procurement laws once the relevant State organ or public entity ignores the written directives of the Authority, including material breaches of the measures established under the Act",
  "Generally report to Parliament and the relevant county assembly",
  "Develop a code of ethics to guide procuring entities and winning bidders when undertaking public procurement and disposal with State organs and public entities",
  "In undertaking its functions, co-operate with state and non-state actors with a view to obtaining recommendations on how public procurement and disposal can be improved",
  "Ensure the procurement entities implement the preference and reservations and provide data to the Authority disaggregated to indicate the number of disadvantaged groups that have benefited",
  "Perform such other functions and duties as are provided for under the Act and any other relevant law"
];

const Mandate = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const functionsContainerRef = useRef(null);
  
  // ===== TTS STATE =====
  const [hoverModeActive, setHoverModeActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const bannerDismissedRef = useRef(false);

  // ===== TTS CALLBACKS =====
  const handleTTSStart = useCallback(() => {
    setHoverModeActive(true);
    bannerDismissedRef.current = false;
    setShowBanner(true);
  }, []);

  const handleTTSEnd = useCallback(() => {
    setHoverModeActive(false);
    setShowBanner(false);
  }, []);

  // ===== BANNER DISMISS =====
  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // ===== AUTO-DISMISS BANNER =====
  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

  // ===== ESCAPE KEY DISMISS =====
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive) {
        handleDismissBanner();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [hoverModeActive, handleDismissBanner]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Reveal
      if (heroRef.current) {
        gsap.fromTo('.hero-fade-in',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
        );
      }

      // 2. Structural Section Title Animates
      document.querySelectorAll('.heading-animate').forEach((heading) => {
        gsap.fromTo(heading,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });

      // 3. Detailed Functions List Staggered Animation
      if (functionsContainerRef.current) {
        gsap.fromTo('.function-item',
          { x: -15, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.04,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: functionsContainerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-wrapper bg-white text-slate-800 antialiased selection:bg-purple-100">
      {/* ===== GLOBAL STYLES FOR TTS ===== */}
      <style>{`
        .hover-mode-active * {
          cursor: pointer !important;
        }
        .hover-mode-active p:hover,
        .hover-mode-active h1:hover,
        .hover-mode-active h2:hover,
        .hover-mode-active h3:hover,
        .hover-mode-active h4:hover,
        .hover-mode-active h5:hover,
        .hover-mode-active h6:hover,
        .hover-mode-active li:hover,
        .hover-mode-active a:hover,
        .hover-mode-active button:hover,
        .hover-mode-active label:hover {
          cursor: pointer !important;
        }
      `}</style>

      {/* ===== HOVER MODE INSTRUCTION BANNER ===== */}
      {hoverModeActive && !bannerDismissedRef.current && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          style={{ 
            maxWidth: 'calc(100% - 2rem)',
            width: 'auto'
          }}
        >
          <div 
            className="px-5 py-3 rounded-2xl shadow-2xl"
            style={{ 
              backgroundColor: 'rgba(0, 103, 47, 0.95)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center gap-4 text-sm">
              {/* Icon */}
              <div className="shrink-0">
                <FontAwesomeIcon icon={faMousePointer} className="text-white text-sm" />
              </div>
              
              {/* Text content */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white text-sm">
                  Hover over any text to read it aloud
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <span>ESC</span>
                  <span className="opacity-70">to stop</span>
                </span>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleDismissBanner}
                className="shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                aria-label="Dismiss"
              >
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-wrapper">
        
        {/* ===== FLOATING TEXT-TO-SPEECH BUTTON ===== */}
        <div className="fixed bottom-6 left-6 z-50">
          <TextToSpeech 
            className="shadow-2xl"
            showSpeedControl={true}
            showVoiceSelector={false}
            onStart={handleTTSStart}
            onEnd={handleTTSEnd}
            onError={(err) => console.error('TTS Error:', err)}
          />
        </div>

        {/* HERO SECTION  */}
        <section ref={heroRef} className="relative px-4 md:px-6 lg:px-12 pt-8">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
            <div className="absolute inset-0 w-full h-full opacity-40">
              <img 
                src={corporateSky} 
                alt="PPRA Regulatory Authority" 
                className="w-full h-full object-cover grayscale brightness-75"
                loading="eager"
              />
            </div>
            
            <div className="absolute inset-0 pointer-events-none flex"></div>
            
            <div className="relative max-w-4xl mx-auto text-center z-10 px-6">
              <div className="mb-3 md:mb-4 hero-fade-in">
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                  Section 9 of the Act
                </span>
              </div>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                Our Mandate
              </h1>
              <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                Regulating Public Procurement and Asset Disposal in the Republic of Kenya
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW SECTION */}
        <section className="relative bg-white px-4 md:px-6 lg:px-12 py-12 md:py-20">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-xs md:text-sm font-bold text-purple-900 tracking-widest block uppercase mb-2 md:mb-3 heading-animate">
                Statutory Mandate
              </span>
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight heading-animate">
                Core Functions Overview
              </h2>
              <div className="w-10 md:w-12 h-0.5 md:h-1 bg-purple-900 mx-auto mt-3 md:mt-4 heading-animate"></div>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <p className="text-base md:text-xl lg:text-2xl text-slate-600 leading-relaxed font-normal">
                The mandate of the Authority is to regulate the public procurement and asset disposal system, and report on its overall functioning. This is undertaken through monitoring, assessing, reviewing, training, technical support, issuance of regulatory documents, and acting on complaints to realize an effective and efficient system that delivers value for money and quality services to the citizens.
              </p>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE FUNCTIONS LIST - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section className="relative bg-slate-50 px-4 md:px-6 lg:px-12 py-12 md:py-24 border-t border-b border-slate-200">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight heading-animate">
                Our Mandate Under the Act
              </h2>
              <p className="text-xs md:text-base font-bold text-slate-500 tracking-widest uppercase mt-1 md:mt-2 heading-animate">
               Section 9 of the Act confers the Authority with the following functions
              </p>
            </div>

            {/* Sharp High-Density List Matrix */}
            <div ref={functionsContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
              {mandateFunctions.map((func, index) => (
                <div 
                  key={index} 
                  className="function-item bg-white p-4 md:p-6 lg:p-8 rounded-none flex items-start gap-3 md:gap-4 transition-colors duration-150 hover:bg-slate-50"
                >
                  <span className="text-xs md:text-base font-bold font-mono tracking-tight text-purple-900 bg-purple-50 border border-purple-100 px-2 md:px-3 py-0.5 md:py-1 shrink-0 mt-0.5 rounded-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-slate-600 text-sm md:text-lg lg:text-xl leading-relaxed font-normal">
                    {func}
                  </p>
                </div>
              ))}
            </div>



          </div>
        </section>

        {/* CTA SECTION - Regional Offices */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Offices Directory Grid */}
            <div>
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
                Our Regional Network
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
                
                {/* Nairobi - Head Office */}
                <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Nairobi (HQ)
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      KISM Towers, 6th Floor, Ngong Road<br />
                      P.O Box 58535-00200<br />
                      Nairobi, Kenya
                    </p>
                  </div>
                  <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                    <p className="text-slate-400">T: <a href="tel:+2540203244000" className="text-white hover:text-sky-400 transition-colors font-medium">+254 020 3244000</a></p>
                    <p className="text-slate-400">E: <a href="mailto:info@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">info@ppra.go.ke</a></p>
                  </div>
                </div>

                {/* Coast Regional Office */}
                <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Mombasa
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive<br />
                      P.O Box 2605-80100<br />
                      Mombasa, Kenya
                    </p>
                  </div>
                  <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                    <p className="text-slate-400">T: <a href="tel:0412224040" className="text-white hover:text-sky-400 transition-colors font-medium">041 2224040</a></p>
                    <p className="text-slate-400">M: <a href="tel:0700195220" className="text-white hover:text-sky-400 transition-colors font-medium">0700 195220</a></p>
                    <p className="text-slate-400">E: <a href="mailto:mombasa@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">mombasa@ppra.go.ke</a></p>
                  </div>
                </div>

                {/* Western Kenya Regional Office */}
                <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Kisumu
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue<br />
                      P.O Box 2916-40100<br />
                      Kisumu, Kenya
                    </p>
                  </div>
                  <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                    <p className="text-slate-400">T: <a href="tel:0572024000" className="text-white hover:text-sky-400 transition-colors font-medium">057 2024000</a></p>
                    <p className="text-slate-400">E: <a href="mailto:kisumu@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">kisumu@ppra.go.ke</a></p>
                  </div>
                </div>

                {/* North Rift Regional Office */}
                <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Eldoret
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      Ainabkoi Sub County Offices<br />
                      P.O Box 799-30100<br />
                      Eldoret, Kenya
                    </p>
                  </div>
                  <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                    <p className="text-slate-400">E: <a href="mailto:eldoret@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">eldoret@ppra.go.ke</a></p>
                  </div>
                </div>

                {/* South Rift Regional Office */}
                <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Nakuru
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />
                      P.O Box 15424-20100<br />
                      Nakuru, Kenya
                    </p>
                  </div>
                  <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                    <p className="text-slate-400">E: <a href="mailto:nakuru@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">nakuru@ppra.go.ke</a></p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Mandate;