// src/pages/ResourceCentre/StandardTenderDocuments.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import standardTenderService from '../../../services/standardTenderService';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================
// TAB BUTTON COMPONENT
// ============================================================
const TabButton = ({ label, isActive, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
        isActive
          ? 'bg-primary-purple text-white shadow-md shadow-primary-purple/20'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-0.5 text-[10px] rounded-full ${
        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {count}
      </span>
    </button>
  );
};

// ============================================================
// DOCUMENT ITEM COMPONENT
// ============================================================
const DocumentItem = ({ file, service }) => {
  const icon = service.getFileIcon(file);
  
  return (
    <div className="doc-item flex items-center justify-between gap-4 md:gap-6 flex-wrap">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
        <div className="text-xl md:text-2xl text-primary-purple shrink-0">
          {icon.type === 'image' ? (
            <img src={icon.url} alt="File icon" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
          ) : (
            icon.emoji
          )}
        </div>
        <div className="doc-info">
          <p className="text-sm md:text-base font-medium text-gray-900 leading-snug">
            {file.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 md:mt-1">
            {file.size && (
              <span className="text-xs md:text-sm text-gray-500">{file.size}</span>
            )}
            {file.fileType && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {file.fileType}
              </span>
            )}
            {file.source === 'mdocs' && file.downloads > 0 && (
              <span className="text-xs text-gray-500">📥 {file.downloads.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
      <a 
        href={file.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="doc-download inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-primary-purple hover:text-primary-purple-dark transition-colors"
        download
      >
        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </a>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const StandardTenderDocuments = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Service state
  const [state, setState] = useState(() => standardTenderService.getState());
  const { tabs, loading, error, total } = state;
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);

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
    const unsubscribe = standardTenderService.subscribe((newState) => {
      setState(newState);
    });
    standardTenderService.fetchDocuments();
    return unsubscribe;
  }, []);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.std-hero_heading'),
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
  if (loading && tabs.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Standard Tender Documents...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && tabs.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Documents</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => standardTenderService.fetchDocuments({ forceRefresh: true })}
            className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-light transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get current tab files
  const currentTab = tabs[activeTab] || { files: [], label: 'No Documents' };

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Standard Tender Documents | PPRA Kenya</title>
        <meta name="description" content="Access PPRA Standard Tender Documents - official procurement documents for public entities in Kenya." />
        <meta name="keywords" content="standard tender documents, PPRA, procurement, Kenya, public procurement, tenders" />
        <meta property="og:title" content="Standard Tender Documents - PPRA Kenya" />
        <meta property="og:description" content="Official standard tender documents for public procurement in Kenya." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/standard-tender-documents" />
      </Helmet>

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
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
        .doc-item {
          border-bottom: 1px solid #f3f4f6;
          padding: 1rem 0;
          transition: none;
        }
        .doc-item:last-child {
          border-bottom: none;
        }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        @media (max-width: 640px) {
          .doc-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.875rem 0;
          }
          .doc-item .doc-info { width: 100%; }
          .doc-item .doc-download { align-self: flex-start; }
        }
        .tab-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tab-scroll::-webkit-scrollbar {
          display: none;
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
        <section className="section-std-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="std-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 w-full h-full opacity-40">
                  <img src={corporateSky} alt="PPRA Standard Tender Documents" className="w-full h-full object-cover grayscale brightness-75" loading="eager" />
                </div>
                
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>

                <div className="std-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="mb-3 md:mb-4 hero-fade-in">
                    <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                      Public Procurement Documents
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                    Standard Tender Documents
                  </h1>
                  <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                    Official procurement documents for public entities in Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION ===== */}
        <section className="section-std-content relative bg-white">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-20">
              <div className="container-large max-w-4xl mx-auto">
                <div ref={containerRef} className="std-component">
                  
                  {/* ===== CENTERED HEADER ===== */}
                  <div className="heading-animate mb-6 md:mb-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-2">
                      About Standard Tender Documents
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                      Official tender documents developed and issued by PPRA for public procurement
                    </p>
                  </div>

                  {/* ===== TABS ===== */}
                  <div className="mb-6 md:mb-8">
                    <div className="tab-scroll flex flex-nowrap gap-2 overflow-x-auto pb-2">
                      {tabs.map((tab, index) => (
                        <TabButton
                          key={tab.id}
                          label={tab.label}
                          isActive={activeTab === index}
                          onClick={() => setActiveTab(index)}
                          count={tab.files.length}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ===== DOCUMENTS LIST ===== */}
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {currentTab.files.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <div className="text-4xl mb-3">📄</div>
                        <p className="font-medium">No documents available in this section</p>
                      </div>
                    ) : (
                      currentTab.files.map((file, index) => (
                        <DocumentItem 
                          key={`${file.id}-${index}`} 
                          file={file} 
                          service={standardTenderService}
                        />
                      ))
                    )}
                  </div>

                  {/* ===== DOCUMENT COUNT ===== */}
                  {currentTab.files.length > 0 && (
                    <div className="mt-8 md:mt-12 text-center">
                      <div className="inline-flex items-center gap-2 md:gap-3 text-gray-600">
                        <span className="text-sm md:text-base font-medium">
                          Documents in this section:
                        </span>
                        <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                          {currentTab.files.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ===== TOTAL FOOTER ===== */}
                  {total > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                      <span>Total documents across all sections: {total}</span>
                      <span className="text-xs text-gray-400">Data sourced from PPRA Standard Tender Documents page</span>
                    </div>
                  )}

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

export default StandardTenderDocuments;