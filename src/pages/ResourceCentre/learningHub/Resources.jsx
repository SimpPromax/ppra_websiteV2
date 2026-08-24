// src/pages/ResourceCentre/Resources.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faLink,
  faGlobe,
  faGraduationCap,
  faDatabase,
  faMoneyBillWave,
  faFlask,
  faNewspaper,
  faInfoCircle,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import resourcesService from '../../../services/resourcesService';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Icon mapping for categories
const categoryIcons = {
  'International Databases': faGlobe,
  'Academic Publishers': faGraduationCap,
  'Research Databases': faDatabase,
  'Financial Resources': faMoneyBillWave,
  'Scientific & Technical': faFlask,
  'Journals & Publications': faNewspaper,
  'Other': faLink,
};

const Resources = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Service state
  const [state, setState] = useState(() => resourcesService.getState());
  const { resources, loading, error, total } = state;

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

  // ===== SUBSCRIBE TO SERVICE =====
  useEffect(() => {
    const unsubscribe = resourcesService.subscribe((newState) => {
      setState(newState);
    });
    resourcesService.fetchResources();
    return unsubscribe;
  }, []);

  // ===== GSAP Animations - Only for hero and section headings =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.resources-hero_heading'),
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  // ===== LOADING STATE =====
  if (loading && resources.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Resources...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && resources.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4 text-red-500">
            <FontAwesomeIcon icon={faLink} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Resources</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => resourcesService.fetchResources({ forceRefresh: true })}
            className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-light transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {});

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Resources | PPRA Kenya</title>
        <meta name="description" content="Access a curated collection of research databases, academic publishers, and scientific resources for procurement professionals." />
        <meta name="keywords" content="resources, databases, journals, research, procurement, PPRA, Kenya" />
        <meta property="og:title" content="Resources - PPRA Kenya" />
        <meta property="og:description" content="Curated collection of research and academic resources." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/resources" />
      </Helmet>

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        
        .resource-card {
          border: 1px solid #e8e8e8;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .resource-card:hover {
          border-color: #201444;
          box-shadow: 0 4px 16px rgba(32, 20, 68, 0.06);
        }
        
        .resource-card .resource-icon {
          color: #6b6b6b;
          background: #f5f5f5;
          transition: all 0.2s ease;
        }
        .resource-card:hover .resource-icon {
          color: #ffffff;
          background: #201444;
        }

        .category-icon-wrapper {
          background: rgba(32, 20, 68, 0.08);
          color: #201444;
          transition: background 0.2s ease;
        }

        .text-primary-purple-dark {
          color: #201444;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @media (max-width: 640px) {
          .resource-card {
            padding: 0.75rem;
          }
        }
      `}</style>

      {/* ===== HOVER MODE BANNER ===== */}
      {hoverModeActive && !bannerDismissedRef.current && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-[calc(100%-2rem)]">
          <div className="px-5 py-3 rounded-2xl shadow-2xl" style={{ 
            backgroundColor: 'rgba(0, 103, 47, 0.95)', 
            color: 'white' 
          }}>
            <div className="flex items-center gap-4 text-sm">
              <FontAwesomeIcon icon={faMousePointer} className="text-white" />
              <span className="font-semibold">Hover over any text to read it aloud</span>
              <button onClick={handleDismissBanner} className="ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TTS BUTTON ===== */}
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

      <main className="main-wrapper">

        {/* ===== HERO SECTION ===== */}
        <section className="section-resources-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="resources-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img src={corporateSky} alt="PPRA Resources" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="resources-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      Knowledge Resources
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    Resources
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    Curated collection of research databases and academic resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION ===== */}
        <section className="section-resources-content relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-24">
              <div className="container-large max-w-7xl mx-auto">
                <div ref={containerRef} className="resources-component">
                  
                  {/* ===== CENTERED HEADER ===== */}
                  <div className="text-center mb-8 md:mb-12">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 uppercase tracking-wider font-bold">
                        Resource Links
                      </div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Resource Links
                      </h2>
                    </div>
                    <div className="w-16 h-0.5 bg-primary-green mx-auto mt-3 md:mt-4"></div>
                  </div>
                  
                  {/* ===== DESCRIPTION - DARK PURPLISH TEXT ===== */}
                  <div className="text-center max-w-4xl mx-auto">
                    <p className="text-base md:text-lg text-primary-purple-dark leading-relaxed mb-4">
                      The Public Procurement Regulatory Authority (PPRA) provides access to a curated collection of 
                      research databases, academic publishers, and scientific resources. These resources support 
                      evidence-based decision making and research in public procurement.
                    </p>
                    
                    <p className="text-base md:text-lg text-primary-purple-dark leading-relaxed mb-6 md:mb-8">
                      Below is a comprehensive list of external resources organized by category for easy reference.
                    </p>
                  </div>

                  {/* ===== RESOURCES GRID ===== */}
                  <div className="mt-8 md:mt-12">
                    {Object.keys(groupedResources).length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-3">
                          <FontAwesomeIcon icon={faLink} className="text-gray-300" />
                        </div>
                        <p className="font-medium">No resources available</p>
                      </div>
                    ) : (
                      Object.entries(groupedResources).map(([category, items]) => {
                        const icon = categoryIcons[category] || faLink;
                        
                        return (
                          <div key={category} className="mb-10 md:mb-14">
                            {/* ===== CENTERED CATEGORY HEADER ===== */}
                            <div className="text-center mb-5 md:mb-6">
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="category-icon-wrapper w-11 h-11 rounded-lg flex items-center justify-center text-base">
                                  <FontAwesomeIcon icon={icon} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-primary-purple">
                                  {category}
                                </h3>
                              </div>
                              <div className="w-12 h-0.5 bg-primary-purple/20 mx-auto"></div>
                            </div>
                            
                            {/* ===== RESOURCE CARDS - NO ANIMATION ===== */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                              {items.map((resource, index) => (
                                <a
                                  key={`${resource.id}-${index}`}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="resource-card group flex items-center gap-3 p-3 md:p-4 rounded-lg"
                                >
                                  <div className="resource-icon w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-base md:text-lg shrink-0">
                                    <FontAwesomeIcon icon={icon} />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm md:text-base font-medium text-primary-purple-dark group-hover:text-primary-purple transition-colors truncate">
                                      {resource.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {resource.domain}
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-gray-400 group-hover:text-primary-purple transition-colors">
                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ===== RESOURCES COUNT ===== */}
                  <div className="mt-10 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3">
                      <span className="text-sm md:text-base font-medium text-primary-purple-dark">
                        Total Resources:
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                        {total}
                      </span>
                    </div>
                    {total > 0 && (
                      <p className="text-xs md:text-sm text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleDateString('en-KE', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION - Regional Network ===== */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
              Our Regional Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-left">
              {/* Nairobi */}
              <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nairobi (HQ)</h4>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                    KISM Towers, 6th Floor, Ngong Road<br />
                    P.O Box 58535-00200
                  </p>
                </div>
                <div className="text-sm md:text-base space-y-1.5 pt-2 border-t border-slate-900">
                  <p className="text-slate-400">T: <a href="tel:+2540203244000" className="text-white hover:text-sky-400 transition-colors font-medium">+254 020 3244000</a></p>
                  <p className="text-slate-400">E: <a href="mailto:info@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">info@ppra.go.ke</a></p>
                </div>
              </div>

              {/* Mombasa */}
              <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Mombasa</h4>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                    Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive<br />
                    P.O Box 2605-80100
                  </p>
                </div>
                <div className="text-sm md:text-base space-y-1.5 pt-2 border-t border-slate-900">
                  <p className="text-slate-400">T: <a href="tel:0412224040" className="text-white hover:text-sky-400 transition-colors font-medium">041 2224040</a></p>
                  <p className="text-slate-400">M: <a href="tel:0700195220" className="text-white hover:text-sky-400 transition-colors font-medium">0700 195220</a></p>
                  <p className="text-slate-400">E: <a href="mailto:mombasa@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">mombasa@ppra.go.ke</a></p>
                </div>
              </div>

              {/* Kisumu */}
              <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Kisumu</h4>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                    Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue<br />
                    P.O Box 2916-40100
                  </p>
                </div>
                <div className="text-sm md:text-base space-y-1.5 pt-2 border-t border-slate-900">
                  <p className="text-slate-400">T: <a href="tel:0572024000" className="text-white hover:text-sky-400 transition-colors font-medium">057 2024000</a></p>
                  <p className="text-slate-400">E: <a href="mailto:kisumu@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">kisumu@ppra.go.ke</a></p>
                </div>
              </div>

              {/* Eldoret */}
              <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Eldoret</h4>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                    Ainabkoi Sub County Offices<br />
                    P.O Box 799-30100<br />
                    Eldoret, Kenya
                  </p>
                </div>
                <div className="text-sm md:text-base pt-2 border-t border-slate-900">
                  <p className="text-slate-400">E: <a href="mailto:eldoret@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">eldoret@ppra.go.ke</a></p>
                </div>
              </div>

              {/* Nakuru */}
              <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nakuru</h4>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                    Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />
                    Nakuru, Kenya
                  </p>
                </div>
                <div className="text-sm md:text-base pt-2 border-t border-slate-900">
                  <p className="text-slate-400">E: <a href="mailto:nakuru@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">nakuru@ppra.go.ke</a></p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Resources;