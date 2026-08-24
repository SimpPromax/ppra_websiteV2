// src/pages/ResourceCentre/ServiceCharter.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faFilePdf,
  faDownload,
  faClock,
  faMoneyBillWave,
  faClipboardList,
  faBuilding,
  faGavel,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faInfoCircle,
  faCheckCircle,
  faHeadset,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import serviceCharterService from '../../../services/serviceCharterService';

// ✅ Define browser check
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const ServiceCharter = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  const isMounted = useRef(false);

  // Service state
  const [state, setState] = useState(() => serviceCharterService.getState());
  const { services, document: doc, loading, error, total } = state;

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
    if (isBrowser && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // ===== MOUNT TRACKING =====
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===== AUTO-DISMISS BANNER =====
  useEffect(() => {
    if (!isMounted.current || !isBrowser) return;
    
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setShowBanner(false);
        }
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

  // ===== ESCAPE KEY DISMISS =====
  useEffect(() => {
    if (!isMounted.current || !isBrowser) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive && isMounted.current) {
        handleDismissBanner();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => {
      if (isBrowser) {
        document.removeEventListener('keydown', handleEsc);
      }
    };
  }, [hoverModeActive, handleDismissBanner]);

  // ===== SUBSCRIBE TO SERVICE =====
  useEffect(() => {
    const unsubscribe = serviceCharterService.subscribe((newState) => {
      if (isMounted.current) {
        setState(newState);
      }
    });
    serviceCharterService.fetchCharter();
    return () => {
      unsubscribe();
    };
  }, []);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (!isMounted.current || !isBrowser) return;
    if (loading) return;

    const runAnimations = async () => {
      try {
        const gsap = await import('gsap');
        const ScrollTrigger = await import('gsap/ScrollTrigger');
        
        gsap.default.registerPlugin(ScrollTrigger.default || ScrollTrigger);

        if (heroRef.current) {
          const heroHeading = heroRef.current.querySelector('.charter-hero_heading');
          if (heroHeading) {
            gsap.default.fromTo(heroHeading,
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
        }

        const headingAnimateElements = document.querySelectorAll('.heading-animate');
        headingAnimateElements.forEach((el) => {
          gsap.default.fromTo(el,
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
          if (ScrollTrigger.default) {
            ScrollTrigger.default.getAll().forEach(trigger => trigger.kill());
          }
        };
      } catch (err) {
        console.warn('GSAP animations skipped:', err.message);
      }
    };

    runAnimations();
  }, [loading]);

  // ===== LOADING STATE =====
  if (loading && services.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Service Charter...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && services.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4 text-red-500">
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Service Charter</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => serviceCharterService.fetchCharter({ forceRefresh: true })}
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
        <title>Service Charter | PPRA Kenya</title>
        <meta name="description" content="PPRA Service Charter - Our commitment to timely, efficient, and effective service delivery in public procurement and asset disposal." />
        <meta name="keywords" content="service charter, PPRA, procurement, Kenya, public procurement, service delivery" />
        <meta property="og:title" content="Service Charter - PPRA Kenya" />
        <meta property="og:description" content="PPRA's commitment to timely, efficient, and effective service delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/service-charter" />
      </Helmet>

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        
        .service-row {
          transition: background-color 0.2s ease;
        }
        .service-row:hover {
          background-color: #f8fafc;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @media (max-width: 640px) {
          .service-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 1rem 0;
          }
          .service-row .service-name {
            font-size: 0.875rem;
          }
          .service-row .service-detail {
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

        {/* ===== HERO SECTION - MINIMAL ===== */}
        <section className="section-charter-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="charter-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img src={corporateSky} alt="PPRA Service Charter" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="charter-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  {/* ===== RECTANGULAR PILL BADGE - NO ICON ===== */}
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      Service Delivery Commitment
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    Service Charter
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    PPRA is committed to Timely, Efficient and Effective service delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION - MINIMAL ===== */}
        <section className="section-charter-content relative bg-white">
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
                <div ref={containerRef} className="charter-component">
                  
                  {/* ===== CENTERED HEADER - NO ICON ===== */}
                  <div className="text-center mb-8 md:mb-12">
                    {/* ===== RECTANGULAR PILL BADGE - NO ICON ===== */}
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 uppercase tracking-wider font-bold">
                        Our Service Commitment
                      </div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Our Service Commitment
                      </h2>
                    </div>
                    <div className="w-16 h-0.5 bg-primary-green mx-auto mt-3 md:mt-4"></div>
                  </div>
                  
                  {/* ===== DESCRIPTION - NO ICON ===== */}
                  <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      The Public Procurement Regulatory Authority (PPRA) is committed to providing 
                      timely, efficient, and effective services to all stakeholders. Below is a 
                      comprehensive list of our services, requirements, charges, and timelines.
                    </p>
                  </div>

                  {/* ===== DOCUMENT DOWNLOAD - KEPT ICONS (functional) ===== */}
                  {doc && (
                    <div className="mb-8 md:mb-12 p-4 md:p-6 bg-primary-purple/5 border border-primary-purple/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl md:text-4xl text-primary-purple">
                          <FontAwesomeIcon icon={faFilePdf} />
                        </div>
                        <div>
                          <p className="text-sm md:text-base font-semibold text-gray-800">{doc.title}</p>
                          <p className="text-xs md:text-sm text-gray-500">{doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => serviceCharterService.downloadDocument(doc.downloadUrl, doc.title)}
                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-primary-purple text-white text-sm md:text-base font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Download Service Charter
                      </button>
                    </div>
                  )}

{/* ===== SERVICES TABLE ===== */}
<div className="mt-8 md:mt-12 overflow-x-auto">
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <table className="w-full">
      <thead>
        <tr className="bg-primary-purple text-white">
          <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
            <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
            Service
          </th>
          <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Requirement
          </th>
          <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
            <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
            Charges (KSHS)
          </th>
          <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Timelines
          </th>
        </tr>
      </thead>
      <tbody>
        {services.length === 0 ? (
          <tr>
            <td colSpan="4" className="px-4 md:px-6 py-8 text-center text-gray-500">
              <div className="text-4xl mb-3">
                <FontAwesomeIcon icon={faClipboardList} className="text-gray-300" />
              </div>
              <p className="font-medium">No services found</p>
            </td>
          </tr>
        ) : (
          services.map((item, index) => (
            <tr 
              key={`${item.id}-${index}`}
              className={`service-row border-b border-gray-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {/* Service Name */}
              <td className="px-3 md:px-6 py-3 md:py-4">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faGavel} className="text-primary-purple mt-1 text-xs md:text-sm" />
                  <span className="service-name text-xs md:text-sm font-medium text-gray-900">
                    {item.service}
                  </span>
                </div>
              </td>

              {/* Requirements - With Bullet Points */}
              <td className="px-3 md:px-6 py-3 md:py-4">
                <div className="service-detail text-xs md:text-sm text-gray-600 space-y-1">
                  {item.requirements && item.requirements.length > 0 ? (
                    item.requirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-start gap-1.5">
                        <span className="text-primary-purple mt-0.5">•</span>
                        <span>{req}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </td>

              {/* Charges */}
              <td className="px-3 md:px-6 py-3 md:py-4">
                <span className={`service-detail text-xs md:text-sm font-medium ${
                  item.charges?.toLowerCase().includes('free') 
                    ? 'text-green-600' 
                    : 'text-gray-700'
                }`}>
                  {item.charges || '—'}
                </span>
              </td>

              {/* Timelines - With Bullet Points */}
              <td className="px-3 md:px-6 py-3 md:py-4">
                <div className="space-y-1">
                  {item.timelines && item.timelines.length > 0 ? (
                    item.timelines.map((time, timeIndex) => {
                      const isImmediate = time.toLowerCase().includes('immediate') || 
                                          time.toLowerCase().includes('1 day');
                      return (
                        <span 
                          key={timeIndex}
                          className={`service-detail inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isImmediate
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faClock} className="text-xs" />
                          {time}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

                  {/* ===== SERVICES COUNT - NO ICON ===== */}
                  <div className="mt-10 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3 text-gray-600">
                      <span className="text-sm md:text-base font-medium">
                        Total Services:
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                        {total}
                      </span>
                    </div>
                    {total > 0 && (
                      <p className="text-xs md:text-sm text-gray-400 mt-2">
                        Last updated: {new Date().toLocaleDateString('en-KE', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>

                  {/* ===== CONTACT INFORMATION - KEPT ICONS (functional) ===== */}
                  <div className="mt-10 md:mt-16 p-6 md:p-8 bg-gray-50 rounded-xl border border-gray-200">
                    {/* ===== RECTANGULAR PILL BADGE - NO ICON ===== */}
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 uppercase tracking-wider font-bold">
                        Need Help?
                      </div>
                    </div>
                    <div className="text-sm md:text-base text-gray-600 mb-4 text-center">
                      For any service that does not conform to the above standards or any officer who does not live up to the commitment of courtesy and excellence in service delivery, please contact:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">The Director General</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><FontAwesomeIcon icon={faBuilding} className="text-primary-purple mr-2 w-4" />PPRA, KISM Towers, 6th Floor, Ngong Road</div>
                          <div><FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-purple mr-2 w-4" />P.O Box 58535-00200 Nairobi</div>
                          <div><FontAwesomeIcon icon={faPhone} className="text-primary-purple mr-2 w-4" />+254 20 3244000, 2213106/7</div>
                          <div><FontAwesomeIcon icon={faEnvelope} className="text-primary-purple mr-2 w-4" /><a href="mailto:info@ppra.go.ke" className="text-primary-purple hover:underline">info@ppra.go.ke</a></div>
                          <div><FontAwesomeIcon icon={faGlobe} className="text-primary-purple mr-2 w-4" /><a href="https://ppra.go.ke" className="text-primary-purple hover:underline">www.ppra.go.ke</a></div>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">OR</h4>
                        <h4 className="font-bold text-gray-800 mb-2">Commission on Administrative Justice</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><FontAwesomeIcon icon={faBuilding} className="text-primary-purple mr-2 w-4" />West End Towers, 2nd Floor</div>
                          <div><FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-purple mr-2 w-4" />Opposite Aga Khan High School, off Waiyaki Way</div>
                          <div><FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-purple mr-2 w-4" />P.O Box 20414-00200 Nairobi</div>
                          <div><FontAwesomeIcon icon={faPhone} className="text-primary-purple mr-2 w-4" />+254 20 2270000/2303000</div>
                          <div><FontAwesomeIcon icon={faEnvelope} className="text-primary-purple mr-2 w-4" /><a href="mailto:certificationpc@ombudsman.go.ke" className="text-primary-purple hover:underline">certificationpc@ombudsman.go.ke</a></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== MOTTO - NO ICON ===== */}
                  <div className="mt-6 text-center">
                    <p className="text-lg md:text-xl font-bold text-primary-purple">
                      Huduma Bora ni Haki Yako
                    </p>
                    <p className="text-sm text-gray-500 mt-1">(Quality Service is Your Right)</p>
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

export default ServiceCharter;