// src/pages/Debarment.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGavel,
  faFileAlt,
  faUsers,
  faBuilding,
  faScaleBalanced,
  faBookOpen,
  faListCheck,
  faUserSlash,
  faClipboardCheck,
  faSearch,
  faExclamationTriangle,
  faMousePointer,
  faFilePdf,
  faDownload
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== IMPORT TEXT-TO-SPEECH =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../assets/commonPics/circle logo for ppra.png';

// Resources and Documents Data
const resources = [
  {
    title: 'Request for Debarment Form (DC1)',
    description: 'Prescribed form for submitting a request for debarment',
    icon: faFileAlt
  },
  {
    title: 'Debarment Manual',
    description: 'Guidance on procedures applicable to debarment proceedings',
    icon: faBookOpen
  },
  {
    title: 'List of Debarred Persons',
    description: 'Published list of persons and entities that have been debarred',
    icon: faListCheck
  }
];

const Debarment = () => {
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
      gsap.fromTo(heroRef.current.querySelector('.debarment-hero_heading'),
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

    // Section heading animations only
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

    // Description paragraph animation - KEEP THIS
    const descriptionParas = document.querySelectorAll('.description-para');
    descriptionParas.forEach((para, index) => {
      gsap.fromTo(para,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: para,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // REMOVED: Process steps animation
    // REMOVED: Resource cards animation

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Debarment | PPRA Kenya</title>
        <meta name="description" content="Debarment process in Kenya's public procurement - legal basis, requesting debarment, process overview, and list of debarred persons." />
        <meta name="keywords" content="PPRA, debarment, procurement debarment, supplier debarment, contractor debarment, Kenya" />
        <meta property="og:title" content="Debarment - PPRA Kenya" />
        <meta property="og:description" content="Protecting the integrity of Kenya's public procurement system through the debarment process." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/debarment" />
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
              <div className="shrink-0">
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
        <section className="section-debarment-hero relative pt-8">
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
              <div ref={heroRef} className="debarment-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="Debarment - PPRA Kenya" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="debarment-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="debarment-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGavel} className="mr-2" />
                      Debarment
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Debarment
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Protecting the integrity of Kenya's public procurement system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INTRODUCTION SECTION */}
        {/* ============================================================ */}
        <section className="section-introduction relative bg-white">
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
                <div className="introduction_component">
                  <div className="introduction_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OVERVIEW</div>
                    </div>
                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Understanding Debarment in Public Procurement
                    </h2>
                  </div>

                  <div className="introduction_content max-w-4xl mx-auto">
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          Debarment is a regulatory measure through which a contractor, supplier, consultant or other person is prohibited from participating in public procurement and asset disposal proceedings for a specified period due to conduct that falls within the grounds prescribed by law.
                        </p>
                        
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          The debarment process helps to protect the integrity of Kenya's public procurement and asset disposal system, deter misconduct, promote accountability and compliance, safeguard public resources, and ensure that procuring entities engage credible, responsible and compliant suppliers, contractors and other service providers.
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
        {/* LEGAL BASIS SECTION */}
        {/* ============================================================ */}
        <section className="section-legal-basis relative bg-gray-50">
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
                <div className="legal-basis_component">
                  <div className="legal-basis_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">LEGAL BASIS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Statutory Framework
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                      <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                        In Kenya, debarment proceedings are undertaken by the <strong>Public Procurement Regulatory Board</strong> pursuant to <strong>Section 41 of the Public Procurement and Asset Disposal Act, 2015</strong>. The Board may debar a person where the conduct or circumstances established fall within the statutory grounds for debarment provided under the Act.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* REQUESTING DEBARMENT SECTION */}
        {/* ============================================================ */}
        <section className="section-requesting relative bg-white">
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
                <div className="requesting_component">
                  <div className="requesting_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">REQUESTING DEBARMENT</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        How to Request Debarment
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-4 md:space-y-5">
                      <p className="description-para text-base md:text-lg leading-relaxed text-gray-700">
                        A person or entity seeking to initiate debarment proceedings is required to submit a <strong>Request for Debarment</strong> to the Public Procurement Regulatory Authority (PPRA) using the prescribed <strong>Request for Debarment Form (DC1)</strong>.
                      </p>
                      
                      <div className="bg-gray-50 p-4 md:p-6 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <FontAwesomeIcon icon={faClipboardCheck} className="text-primary-purple text-lg" />
                          </div>
                          <div>
                            <h4 className="text-base md:text-lg font-bold text-primary-purple mb-1">Supporting Documentation</h4>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                              The request should be accompanied by relevant supporting documents and evidence demonstrating the alleged conduct or circumstances giving rise to the request for debarment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* HOW THE DEBARMENT PROCESS WORKS SECTION */}
        {/* ============================================================ */}
        <section className="section-process relative bg-gray-50">
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
                <div className="process_component">
                  <div className="process_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">HOW THE DEBARMENT PROCESS WORKS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        The Debarment Process
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Debarment proceedings are conducted in accordance with the Public Procurement and Asset Disposal Act, 2015, the applicable Regulations, and the Authority's Debarment Manual
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-3 md:space-y-4">
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">1</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Submission and consideration of requests for debarment
                        </p>
                      </div>
                      
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">2</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Preliminary review of requests and supporting evidence
                        </p>
                      </div>
                      
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">3</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Issuance of notices to affected parties
                        </p>
                      </div>
                      
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">4</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Submission of responses by the affected parties
                        </p>
                      </div>
                      
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">5</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Hearing and consideration of debarment matters
                        </p>
                      </div>
                      
                      <div className="process-step flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200">
                        <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">6</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          Determination of debarment cases
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-8 bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                      <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                        The process provides affected parties with an opportunity to respond to allegations made against them before a determination is made in accordance with the applicable law and procedures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* LIST OF DEBARRED PERSONS SECTION */}
        {/* ============================================================ */}
        <section className="section-debarred-list relative bg-white">
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
                <div className="debarred-list_component">
                  <div className="debarred-list_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">LIST OF DEBARRED PERSONS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Debarred Persons Registry
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-4 md:space-y-5">
                      <p className="description-para text-base md:text-lg leading-relaxed text-gray-700">
                        The Authority publishes and maintains a <strong>List of Debarred Persons</strong>, indicating persons and entities that have been debarred and the corresponding debarment period.
                      </p>
                      
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 md:p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 text-lg" />
                          </div>
                          <div>
                            <h4 className="text-base md:text-lg font-bold text-amber-800 mb-1">Important Notice</h4>
                            <p className="text-amber-700 text-sm md:text-base leading-relaxed">
                              A person who has been debarred is <strong>prohibited</strong> from participating in public procurement and asset disposal proceedings for the duration of the debarment period.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* RESOURCES AND DOCUMENTS SECTION */}
        {/* ============================================================ */}
        <section className="section-resources relative bg-gray-50">
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
                <div className="resources_component">
                  <div className="resources_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">RESOURCES AND DOCUMENTS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Debarment Resources
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The following debarment resources are available on the PPRA website
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {resources.map((resource, index) => (
                      <div key={index} className="resource-card bg-white p-6 md:p-8 border border-gray-200">
                        <div className="w-16 h-16 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FontAwesomeIcon icon={resource.icon} className="text-primary-purple text-2xl" />
                        </div>
                        <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">{resource.title}</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">{resource.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 md:mt-14 text-center">
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                      These resources provide information and guidance to procuring entities, suppliers, contractors and other stakeholders on the debarment process and applicable requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

export default Debarment;