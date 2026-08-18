
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMicroscope,
  faFlask,
  faLightbulb,
  faChartLine,
  faBookOpen,
  faUsers,
  faHandshake,
  faBuilding,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== IMPORT TEXT-TO-SPEECH =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../assets/commonPics/circle logo for ppra.png';

const ResearchAndInnovation = () => {
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
      gsap.fromTo(heroRef.current.querySelector('.research-hero_heading'),
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

    // Description paragraph animation
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Research and Innovation | PPRA Kenya</title>
        <meta name="description" content="PPRA's research and innovation initiatives in public procurement - policy research, market price surveys, innovation studies, and impact assessments." />
        <meta name="keywords" content="PPRA, research, innovation, public procurement, policy research, market surveys, Kenya" />
        <meta property="og:title" content="Research and Innovation - PPRA Kenya" />
        <meta property="og:description" content="Supporting evidence-based decision-making in public procurement through research and innovation." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/research-and-innovation" />
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
        <section className="section-research-hero relative pt-8">
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
              <div ref={heroRef} className="research-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="Research and Innovation - PPRA Kenya" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="research-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="research-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faMicroscope} className="mr-2" />
                      Research & Innovation
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Research and Innovation
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Driving evidence-based policy and regulatory development in public procurement
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
                      Advancing Procurement Through Research
                    </h2>
                  </div>

                  <div className="introduction_content max-w-4xl mx-auto">
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          The Public Procurement Regulatory Authority undertakes policy research, market price surveys, innovation studies and other analytical initiatives to support the continuous improvement of Kenya's public procurement and asset disposal system. These activities help inform policy and regulatory development, improve service delivery and strengthen evidence-based decision-making.
                        </p>
                        
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          The Authority monitors emerging trends, benchmarks national and international good practices, assesses the implementation and impact of procurement laws, regulations and policies, and generates research evidence to inform appropriate regulatory and policy interventions.
                        </p>
                        
                        <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                          <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                            Research publications, reports and related resources are accessible through the PPRA website at www.ppra.go.ke and the PPRA Resource Centre at KISM Towers. Research findings are also disseminated through stakeholder forums, workshops, training programmes, conferences and other knowledge-sharing platforms.
                          </p>
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
        {/* RESEARCH ACTIVITIES SECTION */}
        {/* ============================================================ */}
        <section className="section-research-activities relative bg-gray-50">
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
                <div className="research-activities_component">
                  <div className="research-activities_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">RESEARCH ACTIVITIES</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Ongoing Research & Innovation
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Research and innovation activities are undertaken on an ongoing basis in response to emerging policy, regulatory and market needs
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-4 md:space-y-5">
                      <p className="description-para text-base md:text-lg leading-relaxed text-gray-700">
                        Public entities, procurement professionals, suppliers, researchers, academic institutions, development partners and other stakeholders may participate in surveys, consultations and research initiatives undertaken by the Authority.
                      </p>
                      
                      <div className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <FontAwesomeIcon icon={faHandshake} className="text-primary-purple text-lg" />
                          </div>
                          <div>
                            <h4 className="text-base md:text-lg font-bold text-primary-purple mb-1">Collaboration Opportunities</h4>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                              Stakeholders may also submit requests for relevant research information and data through the Authority's official channels. Institutions interested in collaborative research may submit a formal request together with a concept note or research proposal addressed to the <strong>Director General, Public Procurement Regulatory Authority</strong>, outlining the proposed area of collaboration, objectives and expected outcomes.
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
        {/* OBJECTIVES SECTION */}
        {/* ============================================================ */}
        <section className="section-objectives relative bg-white">
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
                <div className="objectives_component">
                  <div className="objectives_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR OBJECTIVES</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Driving Impact Through Research
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <p className="description-para text-base md:text-lg leading-relaxed text-gray-700 mb-6">
                      Through research and innovation, PPRA seeks to:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-gray-50 p-4 md:p-5 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-green font-bold text-sm">1</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            Identify emerging issues and gaps within the public procurement and asset disposal framework
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 md:p-5 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-green font-bold text-sm">2</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            Promote innovation and continuous improvement in public procurement
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 md:p-5 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-green font-bold text-sm">3</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            Enhance efficiency, transparency, accountability, competitiveness and value for money in public procurement and asset disposal
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 md:p-5 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-green font-bold text-sm">4</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            Strengthen evidence-based policy and regulatory development
                          </p>
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

export default ResearchAndInnovation;