// src/pages/regulatory-framework/PublicProcurementAct.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf, 
  faDownload, 
  faBook, 
  faGavel, 
  faScaleBalanced,
  faBuilding,
  faCalendarAlt,
  faArrowRight,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';

// Act Documents Data
const actDocuments = [
  {
    id: 'act-2022',
    title: 'The Public Procurement and Asset Disposal Act (Revised Edition 2022)',
    size: '466.82 KB',
    downloadUrl: 'https://ppra.go.ke/download/the-public-procurement-and-asset-disposal-act-revised-edition-2022/?wpdmdl=13095',
    date: '2022',
    icon: faFilePdf
  },
  {
    id: 'act-2016',
    title: 'Public Procurement and Asset Disposal Act (Revised Edition 2016)',
    size: '448.89 KB',
    downloadUrl: 'https://ppra.go.ke/download/public-procurement-and-asset-disposal-act-revised-edition-2016/?wpdmdl=9538',
    date: '2016',
    icon: faFilePdf
  },
  {
    id: 'act-2015',
    title: 'Public Procurement and Asset Disposal Act 2015',
    size: '0.00 KB',
    downloadUrl: 'https://ppra.go.ke/download/ppda2015/?wpdmdl=128',
    date: '2015',
    icon: faFilePdf
  },
  {
    id: 'finance-act-2017',
    title: 'Finance Act No. 15 of 2017',
    size: '322.51 KB',
    downloadUrl: 'https://ppra.go.ke/download/finance-act-no-15-of-2017/?wpdmdl=622',
    date: '2017',
    icon: faFilePdf
  }
];

// Key Features Data
const keyFeatures = [
  {
    icon: faScaleBalanced,
    title: 'Constitutional Mandate',
    description: 'Gives effect to Article 227 of the Constitution of Kenya, ensuring fair, equitable, transparent, competitive and cost-effective procurement.'
  },
  {
    icon: faBook,
    title: 'Comprehensive Framework',
    description: 'Covers all aspects of public procurement and asset disposal, from planning and tendering to contract management and disposal.'
  },
  {
    icon: faCalendarAlt,
    title: 'Regular Updates',
    description: 'Revised in 2016 and 2022 to align with emerging needs and international best practices in public procurement.'
  },
  {
    icon: faBuilding,
    title: 'Parliamentary Enactment',
    description: 'Duly enacted by the Parliament of Kenya, providing the full weight of law to all procurement and disposal proceedings.'
  }
];

const PublicProcurementAct = () => {
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

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelector('.act-hero_heading'),
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
      gsap.fromTo(
        el,
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
      gsap.fromTo(
        para,
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

    // Document items - clean slide up stagger
    const docItems = document.querySelectorAll('.doc-item');

    docItems.forEach((doc, index) => {
      gsap.fromTo(
        doc,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: doc,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
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
        <title>
          Public Procurement and Asset Disposal Act, 2015 | PPRA Kenya
        </title>

        <meta
          name="description"
          content="Download the Public Procurement and Asset Disposal Act (PPAD) 2015, Revised Edition 2016 and 2022. The legislative framework governing public procurement in Kenya."
        />

        <meta
          name="keywords"
          content="PPAD Act 2015, Public Procurement Act Kenya, PPRA, procurement law, asset disposal act"
        />

        <meta
          property="og:title"
          content="Public Procurement and Asset Disposal Act, 2015"
        />

        <meta
          property="og:description"
          content="The legislative framework governing public procurement in Kenya - Download the PPAD Act 2015, 2016 and 2022 revisions."
        />

        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />

        <link
          rel="canonical"
          href="https://ppra.go.ke/regulatory-framework/ppad-act-2015"
        />
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

              {/* Icon */}
              <div className="shrink-0">
                <FontAwesomeIcon
                  icon={faMousePointer}
                  className="text-white text-sm"
                />
              </div>

              {/* Text content */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white text-sm">
                  Hover over any text to read it aloud
                </span>

                <span
                  className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }}
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

      {/* Global Styles - Minimal */}
      <style>{`
        .heading-animate {
          overflow: hidden;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
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

      {/* Main content */}
      <main className="main-wrapper">

        {/* ============================================================ */}
        {/* HERO SECTION - 2 LINES */}
        {/* ============================================================ */}

        <section className="section_act-hero relative pt-8">

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

              <div
                ref={heroRef}
                className="act-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center"
              >

                <div className="absolute inset-0 parallax w-full h-full">
                  <img
                    src={corporateSky}
                    alt="PPRA - Public Procurement and Asset Disposal Act"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>

                <div className="act-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>

                <div className="act-hero_heading max-w-4xl mx-auto text-center z-10 px-4">

                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGavel} className="mr-2" />
                      Legal & Policy Framework
                    </span>
                  </div>

                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    The Public Procurement and Asset Disposal Act, 2015
                  </h1>

                  <p
                    className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed"
                    style={{ animationDelay: '0.2s' }}
                  >
                    The legislative framework governing public procurement in Kenya
                  </p>

                </div>
              </div>

            </div>
          </div>

        </section>


        {/* ============================================================ */}
        {/* ABOUT THE ACT SECTION - 2 LINES */}
        {/* ============================================================ */}

        <section className="section_about-act relative bg-white">

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

                <div className="about-act_component">

                  <div className="about-act_header text-center mb-10 md:mb-16">

                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">
                        ABOUT THE ACT
                      </div>
                    </div>

                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Understanding the PPAD Act
                    </h2>

                  </div>

                  <div className="about-act_content max-w-4xl mx-auto">

                    <div className="text-color-black-light">

                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">

                        <p className="text-base md:text-lg leading-relaxed">
                          An <strong>ACT of Parliament</strong> to give effect to <strong>Article 227 of The Constitution</strong>; to provide procedures for efficient public procurement and for assets disposal by public entities; and for connected purposes <strong>ENACTED by Parliament of Kenya</strong>.
                        </p>

                        <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 rounded">

                          <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                            The Public Procurement and Asset Disposal Act of 2015 has been revised twice – in <strong>2016</strong> and <strong>2022</strong>. You can download a copy of the original Act, the Revised Edition of 2016 or 2022 using the options provided below.
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
        {/* KEY FEATURES SECTION - 2 LINES */}
        {/* ============================================================ */}

        <section className="section-key-features relative bg-gray-50">

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

                <div className="key-features_component">

                  <div className="key-features_header text-center mb-10 md:mb-14">

                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">
                        KEY FEATURES
                      </div>
                    </div>

                    <div className="heading-animate">

                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        What Makes This Act Important
                      </h2>

                    </div>

                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The PPAD Act establishes the legal framework that governs public procurement and asset disposal in Kenya
                    </p>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">

                    {keyFeatures.map((feature, index) => (

                      <div
                        key={index}
                        className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 group"
                      >

                        <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                          <FontAwesomeIcon
                            icon={feature.icon}
                            className="text-primary-purple text-xl"
                          />
                        </div>

                        <h4 className="text-lg md:text-xl font-bold text-primary-purple mb-2">
                          {feature.title}
                        </h4>

                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                          {feature.description}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ============================================================ */}
        {/* DOCUMENTS SECTION - 2 LINES */}
        {/* ============================================================ */}

        <section className="section-documents relative bg-white">

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

                <div className="documents_component">

                  <div className="documents_header text-center mb-10 md:mb-14">

                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">
                        DOWNLOAD THE ACT
                      </div>
                    </div>

                    <div className="heading-animate">

                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Official Versions
                      </h2>

                    </div>

                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Download the official versions of the Public Procurement and Asset Disposal Act
                    </p>

                  </div>


                  {/* Documents List */}
                  <div className="documents_list max-w-4xl mx-auto border-t border-gray-100">

                    {actDocuments.map((doc) => (

                      <div
                        key={doc.id}
                        className="doc-item flex items-center justify-between gap-4 md:gap-6 flex-wrap border-b border-gray-100 py-4 md:py-5 hover:bg-gray-50 transition-all duration-300 hover:pl-3"
                      >

                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">

                          <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                            <FontAwesomeIcon
                              icon={doc.icon}
                              className="text-primary-purple text-lg"
                            />
                          </div>

                          <div className="doc-info">

                            <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">
                              {doc.title}
                            </p>

                            <div className="flex items-center gap-3 mt-0.5">

                              <span className="text-xs md:text-sm text-gray-500">
                                {doc.size}
                              </span>

                              <span className="text-xs text-gray-300">
                                •
                              </span>

                              <span className="text-xs md:text-sm text-gray-500">
                                Revised {doc.date}
                              </span>

                            </div>

                          </div>

                        </div>


                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doc-download inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-primary-purple hover:text-white hover:bg-primary-purple border-2 border-primary-purple rounded transition-all duration-300 hover:shadow-md"
                          download
                        >

                          <FontAwesomeIcon
                            icon={faDownload}
                            className="w-3.5 h-3.5"
                          />

                          <span>
                            Download
                          </span>

                        </a>

                      </div>

                    ))}

                  </div>


                  {/* Document Count */}
                  <div className="mt-10 md:mt-14 text-center">

                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full">

                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="text-primary-purple text-lg"
                      />

                      <span className="text-sm md:text-base font-medium text-gray-600">
                        Total Documents:
                      </span>

                      <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                        {actDocuments.length}
                      </span>

                    </div>

                  </div>


                  {/* ====================================================== */}
                  {/* MORE ACT DOCUMENTS */}
                  {/* ====================================================== */}

                  <div className="mt-8 md:mt-10 max-w-4xl mx-auto">

                    <div className="bg-primary-purple/5 border border-primary-purple/10 rounded-xl px-5 py-5 md:px-8 md:py-6 text-center">

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

                        {/* Icon */}
                        <div className="w-10 h-10 bg-primary-purple/10 rounded-full flex items-center justify-center shrink-0">
                          <FontAwesomeIcon
                            icon={faBook}
                            className="text-primary-purple text-lg"
                          />
                        </div>

                        {/* Content */}
                        <div className="text-center sm:text-left">

                          <p className="text-sm md:text-base text-gray-700">
                            Looking for more Act documents?
                          </p>

                          <a
                            href="https://ppra.go.ke/act/#/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-1 text-primary-green font-bold text-sm md:text-base hover:underline"
                          >
                            Visit PPRA for more Act documents

                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className="text-xs"
                            />

                          </a>

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
        {/* RELATED RESOURCES SECTION - 2 LINES */}
        {/* ============================================================ */}

        <section className="section-related relative bg-gray-50">

          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">

            <div className="padding-global px-4 md:px-6 lg:px-12 py-12 md:py-16">

              <div className="container-large max-w-6xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">


                  {/* Regulations */}
                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faBook}
                          className="text-primary-purple"
                        />
                      </div>

                      <h4 className="text-base md:text-lg font-bold text-primary-purple">
                        Regulations
                      </h4>

                    </div>

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      Access the Public Procurement and Asset Disposal Regulations, 2020
                    </p>

                    <a
                      href="/regulatory-framework"
                      className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm"
                    >
                      View Regulations

                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-xs"
                      />

                    </a>

                  </div>


                  {/* Circulars */}
                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faGavel}
                          className="text-primary-purple"
                        />
                      </div>

                      <h4 className="text-base md:text-lg font-bold text-primary-purple">
                        Circulars
                      </h4>

                    </div>

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      Stay updated with latest procurement circulars and guidelines
                    </p>

                    <a
                      href="/circulars/currency-based"
                      className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm"
                    >
                      View Circulars

                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-xs"
                      />

                    </a>

                  </div>


                  {/* Market Price Indices */}
                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faFilePdf}
                          className="text-primary-purple"
                        />
                      </div>

                      <h4 className="text-base md:text-lg font-bold text-primary-purple">
                        Market Price Indices
                      </h4>

                    </div>

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      Reference price guides for public procurement
                    </p>

                    <a
                      href="/market-price-indices"
                      className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm"
                    >
                      View Prices

                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-xs"
                      />

                    </a>

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

                    <p className="text-slate-400">
                      T:{' '}
                      <a
                        href="tel:+2540203244000"
                        className="text-white hover:text-sky-400 transition-colors font-medium"
                      >
                        +254 020 3244000
                      </a>
                    </p>

                    <p className="text-slate-400">
                      E:{' '}
                      <a
                        href="mailto:info@ppra.go.ke"
                        className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
                      >
                        info@ppra.go.ke
                      </a>
                    </p>

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

                    <p className="text-slate-400">
                      T:{' '}
                      <a
                        href="tel:0412224040"
                        className="text-white hover:text-sky-400 transition-colors font-medium"
                      >
                        041 2224040
                      </a>
                    </p>

                    <p className="text-slate-400">
                      M:{' '}
                      <a
                        href="tel:0700195220"
                        className="text-white hover:text-sky-400 transition-colors font-medium"
                      >
                        0700 195220
                      </a>
                    </p>

                    <p className="text-slate-400">
                      E:{' '}
                      <a
                        href="mailto:mombasa@ppra.go.ke"
                        className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
                      >
                        mombasa@ppra.go.ke
                      </a>
                    </p>

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

                    <p className="text-slate-400">
                      T:{' '}
                      <a
                        href="tel:0572024000"
                        className="text-white hover:text-sky-400 transition-colors font-medium"
                      >
                        057 2024000
                      </a>
                    </p>

                    <p className="text-slate-400">
                      E:{' '}
                      <a
                        href="mailto:kisumu@ppra.go.ke"
                        className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
                      >
                        kisumu@ppra.go.ke
                      </a>
                    </p>

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

                    <p className="text-slate-400">
                      E:{' '}
                      <a
                        href="mailto:eldoret@ppra.go.ke"
                        className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
                      >
                        eldoret@ppra.go.ke
                      </a>
                    </p>

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

                    <p className="text-slate-400">
                      E:{' '}
                      <a
                        href="mailto:nakuru@ppra.go.ke"
                        className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
                      >
                        nakuru@ppra.go.ke
                      </a>
                    </p>

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

export default PublicProcurementAct;