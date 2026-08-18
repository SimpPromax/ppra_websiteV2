// src/pages/AGPO.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf, 
  faDownload, 
  faUsers, 
  faUserTie,
  faUserGroup,
  faBuilding,
  faPhone,
  faEnvelope,
  faGlobe,
  faArrowRight,
  faCheckCircle,
  faFileAlt,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';

// AGPO Documents Data
const agpoDocuments = [
  {
    id: 'agpo-2017',
    title: 'AGPO List as at 10th November 2017',
    size: '54.21 MB',
    downloadUrl: 'https://ppra.go.ke/download/agpo-list-as-at-10th-november-2017/?wpdmdl=2630',
    date: '2017'
  },
  {
    id: 'agpo-2018-missing',
    title: 'AGPO List for missing companies January 2018',
    size: '1.67 MB',
    downloadUrl: 'https://ppra.go.ke/download/agpo-list-for-missing-companies-january-2018/?wpdmdl=2171',
    date: '2018'
  },
  {
    id: 'agpo-2019',
    title: 'AGPO List as at 17th September 2019',
    size: '39.87 MB',
    downloadUrl: 'https://ppra.go.ke/download/agpo-list-as-at-17th-september-2019/?wpdmdl=7958',
    date: '2019'
  }
];

// Target Groups Data
const targetGroups = [
  {
    icon: faUserGroup,
    title: 'Disadvantaged Groups',
    description: 'Youth, Women, and Persons with Disability'
  },
  {
    icon: faBuilding,
    title: 'Small Enterprises',
    description: 'Small scale business enterprises'
  },
  {
    icon: faBuilding,
    title: 'Micro Enterprises',
    description: 'Micro scale business enterprises'
  },
  {
    icon: faUserTie,
    title: 'Citizen Contractors',
    description: 'Kenyan citizen owned contracting firms'
  },
  {
    icon: faUsers,
    title: 'Local Contractors',
    description: 'Locally based contracting firms'
  },
  {
    icon: faUserGroup,
    title: 'Joint-Venture Partners',
    description: 'Citizen Contractors in Joint-venture or Sub-contracting arrangements with foreign suppliers'
  }
];

// Required Documents Data
const requiredDocuments = [
  'National Identity Card / Kenyan Passport (Youth: ages 18 to 34)',
  'Business Registration Certificate / Certificate of Incorporation',
  'CR12 for Limited Company from Registrar of Companies (System-generated soft copy)',
  'Partnership Deed for partnership business',
  'Tax Compliance Certificate',
  'Registration Document from the National Council for Persons with Disabilities'
];

const AGPO = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);

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
      gsap.fromTo(heroRef.current.querySelector('.agpo-hero_heading'),
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

    // Document items animation - ONLY for AGPO List documents
    const docItems = document.querySelectorAll('.doc-item');
    docItems.forEach((doc, index) => {
      gsap.fromTo(doc,
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>AGPO - Access to Government Procurement Opportunities | PPRA Kenya</title>
        <meta name="description" content="Access Government Procurement Opportunities (AGPO) program for youth, women and persons with disabilities. Learn about registration, requirements and download AGPO lists." />
        <meta name="keywords" content="AGPO, government procurement, youth, women, persons with disabilities, PPRA, Kenya" />
        <meta property="og:title" content="AGPO - Access to Government Procurement Opportunities" />
        <meta property="og:description" content="Empowering youth, women and persons with disabilities through government procurement opportunities." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/agpo" />
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

      {/* Minimal custom styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .heading-animate {
          overflow: hidden;
        }
      `}</style>

      {/* Main content */}
      <main className="main-wrapper">

        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="section-agpo-hero relative pt-8">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div ref={heroRef} className="relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="AGPO - Access to Government Procurement Opportunities" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="agpo-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="mb-3 md:mb-4">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faUsers} className="mr-2" />
                      Access to Government Procurement Opportunities
                    </span>
                  </div>
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    AGPO Program
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Empowering Youth, Women and Persons with Disabilities in Government Procurement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ABOUT AGPO SECTION */}
        {/* ============================================================ */}
        <section className="section-about-agpo relative bg-white">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-24">
            <div className="max-w-7xl mx-auto">
              <div>
                <div className="text-center mb-10 md:mb-16">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      About AGPO
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                    What is the aim of the Access to Government Procurement Opportunities (AGPO) Program?
                  </h2>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="text-gray-700 space-y-4 md:space-y-5">
                    <p className="description-para text-base md:text-lg leading-relaxed">
                      The aim of the AGPO Program is to facilitate the youth, women and persons with disability-owned enterprises to be able to participate in government procurement. This will be made possible through the implementation of the <strong>Presidential Directive that 30% of government procurement opportunities be set aside specifically for these enterprises</strong>. It is affirmative action aimed at empowering youth, women and persons with disability-owned enterprises by giving them more opportunities to do business with Government.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TARGET GROUPS SECTION - NO ANIMATION */}
        {/* ============================================================ */}
        <section className="section-target-groups relative bg-gray-50">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div>
                <div className="text-center mb-10 md:mb-14">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      Target Groups
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Who Can Benefit?
                    </h2>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                    The Public Procurement and Disposal (Preference and Reservations) Regulations, 2011, shall apply to procurements by public entities when soliciting tenders from the following target groups
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                  {targetGroups.map((group, index) => (
                    <div key={index} className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                      <div className="w-12 h-12 bg-primary-purple/10 rounded flex items-center justify-center mb-4">
                        <FontAwesomeIcon icon={group.icon} className="text-primary-purple text-xl" />
                      </div>
                      <h4 className="text-lg md:text-xl font-bold text-primary-purple mb-2">{group.title}</h4>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">{group.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* QUALIFICATION & REQUIREMENTS SECTION */}
        {/* ============================================================ */}
        <section className="section-requirements relative bg-white">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div>
                <div className="text-center mb-10 md:mb-14">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      Qualification Requirements
                    </span>
                  </div>
                  <div className="heading-animate">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      How to Qualify
                    </h2>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 mb-8">
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0 font-medium">
                      For the purpose of benefiting from preference and reservations schemes, an enterprise owned by youth, women or persons with disabilities shall be a legal entity that:
                    </p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                      <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-primary-green font-bold text-sm">1</span>
                      </div>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                        is registered with the relevant government body;
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                      <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-primary-green font-bold text-sm">2</span>
                      </div>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                        and has at least <strong>seventy percent membership</strong> of youth, women or persons with disabilities and the leadership shall be <strong>one hundred percent</strong> youth, women and persons with disability, respectively.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* REQUIRED DOCUMENTS SECTION - NO ANIMATION */}
        {/* ============================================================ */}
        <section className="section-required-docs relative bg-gray-50">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div>
                <div className="text-center mb-10 md:mb-14">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      Required Documents
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Documents You Need
                    </h2>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                    For eligibility, you will need the following documents
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="space-y-2 md:space-y-3">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="w-6 h-6 bg-primary-purple/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-primary-green text-sm" />
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{doc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* AGPO LIST SECTION */}
        {/* ============================================================ */}
        <section className="section-agpo-list relative bg-white">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div>
                <div className="text-center mb-10 md:mb-14">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      AGPO LIST
                    </span>
                  </div>
                  <div className="heading-animate">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Registered Enterprises
                    </h2>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                    List of Enterprises registered to benefit from the Preference and Reservations Scheme.
                  </p>
                  <div className="mt-4 p-3 md:p-4 bg-amber-50 border border-amber-200 max-w-3xl mx-auto">
                    <p className="text-sm md:text-base text-amber-800 leading-relaxed">
                      <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                      Please note that companies older than two years that have not renewed the certificate are not listed, and the list is updated every one or two months.
                    </p>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto border-t border-gray-100">
                  {agpoDocuments.map((doc) => (
                    <div key={doc.id} className="doc-item flex items-center justify-between gap-4 md:gap-6 flex-wrap border-b border-gray-100 py-4 md:py-5 hover:bg-gray-50 transition-all duration-300 hover:pl-3">
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
                        <div className="w-10 h-10 bg-primary-purple/10 rounded flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple text-lg" />
                        </div>
                        <div className="doc-info">
                          <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">{doc.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs md:text-sm text-gray-500">{doc.size}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs md:text-sm text-gray-500">{doc.date}</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-download inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-primary-purple hover:text-white hover:bg-primary-purple border-2 border-primary-purple transition-all duration-300 hover:shadow-md"
                        download
                      >
                        <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Document Count */}
                <div className="mt-10 md:mt-14 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50">
                    <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple text-lg" />
                    <span className="text-sm md:text-base font-medium text-gray-600">
                      Total Documents:
                    </span>
                    <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                      {agpoDocuments.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CONTACT SECTION */}
        {/* ============================================================ */}
        <section className="section-agpo-contact relative bg-gray-50">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-6 md:p-10 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-center mb-8 md:mb-10">
                  <div className="flex justify-center mb-4">
                    <span className="inline-block bg-primary-purple text-white text-sm px-4 py-1.5 uppercase tracking-wider font-bold">
                      Contact AGPO
                    </span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-primary-purple">
                    Get In Touch
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mt-2">
                    For more information about the AGPO program
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faBuilding} className="text-primary-purple" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Location</h4>
                      <p className="text-sm text-gray-600">Treasury Building 6th Floor, Harambee Avenue</p>
                      <p className="text-sm text-gray-600">P.O Box 30007, Nairobi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faPhone} className="text-primary-purple" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Phone</h4>
                      <p className="text-sm text-gray-600">Tel: +254-20 2252299/316433</p>
                      <p className="text-sm text-gray-600">Mobile: +254 728338111/733660606</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faEnvelope} className="text-primary-purple" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Email</h4>
                      <a href="mailto:info@agpo.go.ke" className="text-sm text-primary-purple hover:underline">
                        info@agpo.go.ke
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50">
                    <div className="w-10 h-10 bg-primary-purple/10 rounded flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faGlobe} className="text-primary-purple" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Website</h4>
                      <a href="https://www.agpo.go.ke" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-purple hover:underline">
                        www.agpo.go.ke
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA SECTION - Regional Network */}
        {/* ============================================================ */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            
            <div>
              <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
                Our Regional Network
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-left">
                
                {/* Nairobi - Head Office */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Nairobi (HQ)
                    </h4>
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

                {/* Coast Regional Office */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Mombasa
                    </h4>
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

                {/* Western Kenya Regional Office */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Kisumu
                    </h4>
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

                {/* North Rift Regional Office */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Eldoret
                    </h4>
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

                {/* South Rift Regional Office */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                      Nakuru
                    </h4>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                      Provincial Commissioner's Offices, <br />
                      Block B, 1st Floor, Room 1<br />
                      Nakuru, Kenya
                    </p>
                  </div>
                  <div className="text-sm md:text-base pt-2 border-t border-slate-900">
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

export default AGPO;