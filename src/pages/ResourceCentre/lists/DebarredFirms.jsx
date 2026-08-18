// src/pages/ResourceCentre/DebarredFirms.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faTriangleExclamation,
  faBuilding,
  faCalendarDay,
  faClock,
  faInfoCircle,
  faBan,
  faGavel,
  faScaleBalanced
} from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import debarredFirmsService from '../../../services/debarredFirmsService';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const DebarredFirms = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Service state
  const [state, setState] = useState(() => debarredFirmsService.getState());
  const { firms, loading, error, total } = state;

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
    const unsubscribe = debarredFirmsService.subscribe((newState) => {
      setState(newState);
    });
    debarredFirmsService.fetchFirms();
    return unsubscribe;
  }, []);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.debarred-hero_heading'),
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
  if (loading && firms.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Debarred Firms...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && firms.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4 text-red-500">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Firms</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => debarredFirmsService.fetchFirms({ forceRefresh: true })}
            className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-light transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Debarred Firms | PPRA Kenya</title>
        <meta name="description" content="List of firms debarred from participating in public procurement in Kenya by the Public Procurement Regulatory Authority." />
        <meta name="keywords" content="debarred firms, PPRA, procurement, Kenya, public procurement, blacklisted firms" />
        <meta property="og:title" content="Debarred Firms - PPRA Kenya" />
        <meta property="og:description" content="List of firms debarred from public procurement in Kenya." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/debarred-firms" />
      </Helmet>

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        
        .firm-row {
          transition: background-color 0.2s ease;
        }
        .firm-row:hover {
          background-color: #f8fafc;
        }
        
        @media (max-width: 640px) {
          .firm-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 1rem 0;
          }
          .firm-row .firm-name {
            font-size: 0.875rem;
          }
          .firm-row .firm-date,
          .firm-row .firm-period {
            font-size: 0.75rem;
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
        <section className="section-debarred-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="debarred-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img src={corporateSky} alt="PPRA Debarred Firms" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                {/* Hero Overlay Lines */}
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>

                <div className="debarred-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGavel} className="mr-2" />
                      Public Procurement Oversight
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    <FontAwesomeIcon icon={faBan} className="text-red-400 mr-4" />
                    Debarred Firms
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    List of firms debarred from public procurement in Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION ===== */}
        <section className="section-debarred-content relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-24">
              <div className="container-large max-w-4xl mx-auto">
                <div ref={containerRef} className="debarred-component">
                  
                  {/* ===== CENTERED HEADER ===== */}
                  <div className="text-center mb-8 md:mb-12">
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        <FontAwesomeIcon icon={faScaleBalanced} className="text-primary-red mr-3" />
                        Debarred Firms List
                      </h2>
                    </div>
                    <div className="w-16 h-0.5 bg-primary-red mx-auto mt-3 md:mt-4"></div>
                  </div>
                  
                  {/* ===== DESCRIPTION ===== */}
                  <div>
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-primary-purple mr-2" />
                      The Public Procurement Regulatory Authority (PPRA) maintains a list of firms that have been debarred from participating in public procurement and asset disposal activities in Kenya. Debarment is a serious administrative sanction imposed on firms that have contravened the provisions of the Public Procurement and Asset Disposal Act, 2015.
                    </p>
                    
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6">
                      <FontAwesomeIcon icon={faBuilding} className="text-primary-purple mr-2" />
                      Firms listed below are prohibited from entering into any procurement contracts with public entities for the specified period. This list serves as a critical reference for procuring entities to ensure compliance with procurement regulations and to uphold integrity in the public procurement system.
                    </p>
                    
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                      <FontAwesomeIcon icon={faClock} className="text-primary-purple mr-2" />
                      The debarment period is typically three (3) years from the date of the debarment order, unless otherwise specified.
                    </p>
                  </div>

                  {/* ===== FIRMS TABLE ===== */}
                  <div className="mt-8 md:mt-12 overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary-purple text-white">
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
                            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                            Firm Name
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                            Date of Debarment
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                            Debarment Period
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {firms.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-4 md:px-6 py-8 text-center text-gray-500">
                              <div className="text-4xl mb-3">
                                <FontAwesomeIcon icon={faBuilding} className="text-gray-300" />
                              </div>
                              <p className="font-medium">No firms currently debarred</p>
                            </td>
                          </tr>
                        ) : (
                          firms.map((firm, index) => (
                            <tr 
                              key={`${firm.id}-${index}`}
                              className={`firm-row border-b border-gray-100 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <div className="flex items-center gap-3">
                                  <FontAwesomeIcon 
                                    icon={faTriangleExclamation} 
                                    className="text-red-500 text-lg" 
                                  />
                                  <span className="firm-name text-sm md:text-base font-medium text-gray-900">
                                    {firm.firmName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <span className="firm-date text-sm md:text-base text-gray-700">
                                  <FontAwesomeIcon icon={faCalendarDay} className="text-gray-400 mr-2" />
                                  {firm.dateOfDebarment}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <span className="firm-period inline-flex items-center px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                                  <FontAwesomeIcon icon={faClock} className="mr-1.5 text-red-600" />
                                  {firm.debarmentPeriod}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ===== FIRMS COUNT ===== */}
                  <div className="mt-10 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3 text-gray-600">
                      <span className="text-sm md:text-base font-medium">
                        Total Debarred Firms:
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-primary-red">
                        {total}
                      </span>
                    </div>
                    {total > 0 && (
                      <p className="text-xs md:text-sm text-gray-400 mt-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        Last updated: {new Date().toLocaleDateString('en-KE', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>

                  {/* ===== NOTE ===== */}
                  <div className="mt-6 md:mt-8 p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 text-lg mt-0.5" />
                      <div>
                        <p className="text-sm md:text-base text-gray-700">
                          <strong className="text-gray-900">Note:</strong> This list is provided for informational purposes. 
                          Procuring entities are advised to verify the debarment status of firms through the official 
                          PPRA channels before entering into any procurement contracts.
                        </p>
                      </div>
                    </div>
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

export default DebarredFirms;