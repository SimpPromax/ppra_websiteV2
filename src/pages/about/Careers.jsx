// careers.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import logoImage from '../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Career structural data
const careerSections = [
  {
    id: 'why-ppra',
    title: 'Why Public Procurement Regulatory Authority',
    content: 'At PPRA, we are driven with the values of honesty, integrity and accountability to facilitate access to procurement opportunities through enabling regulations that fosters value for money for national socio-economic development. We provide our employees with a conducive environment and opportunities to grow and help discover their talents. This not only enables them to make better professional contributions but also enhances their personal growth and development.'
  },
  {
    id: 'filling-vacancies',
    title: 'Filling for Vacancies',
    content: 'Like any other public sector institution and based on the needs or demands of the Authority, PPRA periodically seeks for talents/professionals in different fields to fill vacant positions within its approved staff establishment. Candidates with relevant experience and expertise who are interested in joining the ranks of the organization are encouraged to submit applications to any specific roles that may be advertised in the print media or this platform from time to time. Interested candidates may also make blind applications whose information shall be captured and maintained in the organization\'s people database for potential consideration as and when vacancies arise and are advertised through the print media or this platform.'
  }
];

const Careers = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentContainerRef = useRef(null);
  const methodsContainerRef = useRef(null);
  
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
      // 1. Hero Content Reveal
      if (heroRef.current) {
        gsap.fromTo('.hero-fade-in',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
        );
      }

      // 2. Global Section Header Animations
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

      // 3. Staggered Core Content Section Grid Elements
      if (contentContainerRef.current) {
        gsap.fromTo('.career-content-card',
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentContainerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // 4. Staggered Application Method Columns
      if (methodsContainerRef.current) {
        gsap.fromTo('.application-method-item',
          { x: -15, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: methodsContainerRef.current,
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

        {/* HERO SECTION - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section ref={heroRef} className="relative px-4 md:px-6 lg:px-12 pt-8">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative h-[40vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
            <div className="absolute inset-0 w-full h-full opacity-40">
              <img 
                src={corporateSky} 
                alt="PPRA Careers - Institutional Growth" 
                className="w-full h-full object-cover grayscale brightness-75"
                loading="eager"
              />
            </div>
            
            {/* Hero Overlay Lines - Only 2nd and 4th have borders */}
            <div className="absolute inset-0 pointer-events-none flex">
              <div className="w-1/5 border-r border-white/10"></div>
              <div className="w-1/5 border-none"></div>
              <div className="w-1/5 border-none"></div>
              <div className="w-1/5 border-r border-white/10"></div>
              <div className="w-1/5 border-none"></div>
            </div>
            
            <div className="relative max-w-4xl mx-auto text-center z-10 px-6">
              <div className="mb-3 md:mb-4 hero-fade-in">
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                  PPRA careers
                </span>
              </div>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                Careers at PPRA
              </h1>
              <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                Build your professional capacity with Kenya's Public Procurement Regulatory Authority
              </p>
            </div>
          </div>
        </section>

        {/* CORE INSTITUTIONAL PRINCIPLES - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section className="relative bg-white px-4 md:px-6 lg:px-12 py-10 md:py-24">
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
              <span className="text-xs md:text-sm font-bold text-purple-900 tracking-widest block uppercase mb-2 md:mb-3 heading-animate">
                PPRA careers
              </span>
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight heading-animate">
                Working With Us
              </h2>
              <div className="w-10 md:w-12 h-0.5 md:h-1 bg-purple-900 mx-auto mt-3 md:mt-4 heading-animate"></div>
            </div>

            {/* Flat high-density layout matrix with sharp structural grid boundaries */}
            <div ref={contentContainerRef} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
              {careerSections.map((section) => (
                <div 
                  key={section.id} 
                  className="career-content-card bg-slate-50 p-4 md:p-8 lg:p-10 rounded-none flex flex-col justify-between transition-colors duration-200 hover:bg-white"
                >
                  <div>
                    <div className="mb-3 md:mb-4 text-purple-900 shrink-0">
                      {section.id === 'why-ppra' ? (
                        <svg className="w-6 h-6 md:w-10 md:h-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 md:w-10 md:h-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-base md:text-xl lg:text-2xl font-bold text-slate-900 uppercase tracking-wider mb-2 md:mb-3">
                      {section.title}
                    </h3>
                    <p className="text-slate-600 text-sm md:text-lg lg:text-xl leading-relaxed font-normal">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* APPLICATION METRIC & METHODS - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section className="relative bg-slate-50 px-4 md:px-6 lg:px-12 py-10 md:py-24 border-t border-b border-slate-200">
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
                Submission Guidelines
              </h2>
              <p className="text-xs md:text-base font-bold text-slate-500 tracking-widest uppercase mt-1 md:mt-2 heading-animate">
                Formal Channels for Recruitment & Inquiries
              </p>
            </div>

            <div ref={methodsContainerRef} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
              
              {/* Online Method */}
              <div className="application-method-item bg-white p-4 md:p-8 lg:p-10 rounded-none flex flex-col justify-between transition-colors duration-150 hover:bg-slate-50">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-900 flex items-center justify-center text-white shrink-0 rounded-none font-mono text-sm md:text-lg font-bold">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm md:text-lg lg:text-xl font-bold uppercase tracking-wider text-slate-900 mb-1 md:mb-2">
                      Online Infrastructure
                    </h4>
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal mb-3 md:mb-4">
                      All competitive roles are run and processed directly through the administrative ERP engine.
                    </p>
                    <a 
                      href="https://erp.ppra.go.ke" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-purple-950 hover:bg-purple-900 text-white text-xs md:text-sm font-bold uppercase tracking-wider transition-all rounded-none border border-purple-900"
                    >
                      <span>E-Recruitment Portal</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Method */}
              <div className="application-method-item bg-white p-4 md:p-8 lg:p-10 rounded-none flex flex-col justify-between transition-colors duration-150 hover:bg-slate-50">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-900 flex items-center justify-center text-white shrink-0 rounded-none font-mono text-sm md:text-lg font-bold">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm md:text-lg lg:text-xl font-bold uppercase tracking-wider text-slate-900 mb-1 md:mb-2">
                      Direct Inquiries
                    </h4>
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal mb-3 md:mb-4">
                      Dedicated portal for mandatory internship allocations, institutional attachments, and systemic inquiries.
                    </p>
                    <a 
                      href="mailto:info@ppra.go.ke"
                      className="inline-flex items-center gap-2 text-purple-900 hover:text-purple-950 text-sm md:text-base font-bold tracking-wide transition-colors"
                    >
                      <span>info@ppra.go.ke</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Flat high-density warning note box */}
            <div className="max-w-4xl mx-auto mt-6 md:mt-8 bg-white p-4 md:p-8 border-l-4 border-purple-900 rounded-none border-t border-r border-b">
              <div className="flex items-start gap-3 md:gap-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-900 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal">
                  <span className="font-bold text-slate-900 uppercase tracking-wide mr-1">Statutory Notice:</span> 
                  Upon rendering submissions to the Authority, whether solicited via public print medium notices or unsolicited database profiles, only candidates chosen for evaluation protocols will receive direct correspondence.
                </p>
              </div>
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

export default Careers;