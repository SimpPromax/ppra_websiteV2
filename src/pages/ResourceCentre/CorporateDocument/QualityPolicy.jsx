// src/pages/QualityPolicy.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf,
  faDownload,
  faCertificate,
  faShieldAlt,
  faCheckCircle,
  faAward,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== IMPORT TEXT-TO-SPEECH =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import qualityPolicyImage from '../../../assets/corporate pics/quality_policy.jpg';

const QualityPolicy = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const containerRef = useRef(null);

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

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.policy-hero_heading'),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }

    // Section heading animations
    const headingAnimateElements = document.querySelectorAll('.heading-animate');
    headingAnimateElements.forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Image animation
    const policyImage = document.querySelector('.policy-image');
    if (policyImage) {
      gsap.fromTo(policyImage,
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: policyImage,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Quality Policy | PPRA Kenya</title>
        <meta name="description" content="PPRA Quality Policy - Our commitment to excellence in public procurement regulation and service delivery." />
        <meta name="keywords" content="PPRA, quality policy, procurement, public procurement, Kenya, standards" />
        <meta property="og:title" content="Quality Policy - PPRA Kenya" />
        <meta property="og:description" content="PPRA's commitment to quality, excellence and continuous improvement in public procurement regulation." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/quality-policy" />
      </Helmet>

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
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faMousePointer} className="text-white text-sm" />
              </div>
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
              <button
                onClick={handleDismissBanner}
                className="flex-shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
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

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .heading-animate {
          overflow: hidden;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .line-wrapper {
          z-index: 0;
        }
        .z-index-1 {
          z-index: 1;
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-wrapper">

        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="section-policy-hero relative pt-8">
          {/* Vertical Lines - 2nd and 4th visible */}
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="policy-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="PPRA Quality Policy" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="policy-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="policy-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faCertificate} className="mr-2" />
                      Quality Policy
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Quality Policy
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Our Commitment to Excellence in Public Procurement Regulation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* QUALITY POLICY CONTENT SECTION */}
        {/* ============================================================ */}
        <section className="section-policy-content relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-24">
              <div className="container-large max-w-7xl mx-auto">
                <div className="policy-content_component">
                  <div className="policy-content_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">QUALITY POLICY</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Our Commitment to Quality
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The Public Procurement Regulatory Authority is committed to excellence in service delivery and regulatory oversight
                    </p>
                  </div>

                  <div className="policy-content_body max-w-4xl mx-auto">
                    {/* Quality Policy Image */}
                    <div className="policy-image mb-8 md:mb-12 overflow-hidden bg-gray-100">
                      <img 
                        src={qualityPolicyImage} 
                        alt="PPRA Quality Policy Document" 
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>

                    {/* Quality Policy Description */}
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="text-base md:text-lg leading-relaxed">
                          The Public Procurement Regulatory Authority (PPRA) is committed to delivering high-quality services in the regulation and oversight of public procurement and asset disposal in Kenya. Our quality policy reflects our dedication to excellence, transparency, and continuous improvement.
                        </p>
                        
                        <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                          <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0 font-medium">
                            "We strive to ensure fairness, equity, transparency, competition and cost effectiveness in public procurement through continuous monitoring, assessment and review of the public procurement and asset disposal system."
                          </p>
                        </div>

                        <p className="text-base md:text-lg leading-relaxed">
                          Our quality policy is guided by the principles of integrity, accountability, professionalism and customer focus. We are committed to meeting the needs of our stakeholders while upholding the highest standards of regulatory excellence.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KEY PRINCIPLES SECTION */}
        {/* ============================================================ */}
        <section className="section-principles relative bg-gray-50">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
              <div className="container-large max-w-7xl mx-auto">
                <div className="principles_component">
                  <div className="principles_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR PRINCIPLES</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Guiding Quality Principles
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The principles that guide our quality management and service delivery
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                    <div className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 text-center group">
                      <div className="w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-primary-purple text-2xl" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">Integrity</h4>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Upholding the highest ethical standards in all our regulatory activities
                      </p>
                    </div>

                    <div className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 text-center group">
                      <div className="w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-primary-purple text-2xl" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">Accountability</h4>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Taking responsibility for our actions and decisions in service delivery
                      </p>
                    </div>

                    <div className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 text-center group">
                      <div className="w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                        <FontAwesomeIcon icon={faAward} className="text-primary-purple text-2xl" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">Professionalism</h4>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Maintaining the highest standards of professional competence and conduct
                      </p>
                    </div>

                    <div className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 text-center group">
                      <div className="w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                        <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple text-2xl" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">Excellence</h4>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Striving for continuous improvement and excellence in all our operations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* RELATED DOCUMENTS SECTION */}
        {/* ============================================================ */}
    {/* <section className="section-related-docs relative bg-white">
        <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
        <div className="vertical-line w-1/5 border-r border-gray-200"></div>
        <div className="vertical-line w-1/5 border-none"></div>
        <div className="vertical-line w-1/5 border-none"></div>
        <div className="vertical-line w-1/5 border-r border-gray-200"></div>
        <div className="vertical-line w-1/5 border-none"></div>
        </div>

        <div className="z-index-1 relative">
        <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="container-large max-w-7xl mx-auto">
            <div className="related-docs_component">
                <div className="related-docs_header text-center mb-10 md:mb-14">
                <div className="pill-wrapper flex justify-center mb-4">
                    <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">RELATED RESOURCES</div>
                </div>
                <div className="heading-animate">
                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                    Related Policies & Documents
                    </h2>
                </div>
                <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                    Download our quality policy and related documents
                </p>
                </div>

                <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple text-lg" />
                    </div>
                    <div>
                        <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">PPRA Quality Policy Document</p>
                        <p className="text-xs md:text-sm text-gray-500">PDF • 2024</p>
                    </div>
                    </div>
                    <a 
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-primary-purple hover:text-white hover:bg-primary-purple border-2 border-primary-purple transition-all duration-300 hover:shadow-md"
                    download
                    >
                    <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                    <span>Download</span>
                    </a>
                </div>

                <div className="mt-4 md:mt-6 bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple text-lg" />
                    </div>
                    <div>
                        <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">Service Charter</p>
                        <p className="text-xs md:text-sm text-gray-500">PDF • 2024</p>
                    </div>
                    </div>
                    <a 
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-primary-purple hover:text-white hover:bg-primary-purple border-2 border-primary-purple transition-all duration-300 hover:shadow-md"
                    download
                    >
                    <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                    <span>Download</span>
                    </a>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    </section> */}

        {/* ============================================================ */}
        {/* CTA SECTION - REGIONAL NETWORK */}
        {/* ============================================================ */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            
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

export default QualityPolicy;