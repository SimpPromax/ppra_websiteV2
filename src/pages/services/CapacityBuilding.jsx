// src/pages/CapacityBuilding.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChalkboardTeacher,
  faGraduationCap,
  faUsers,
  faBuilding,
  faUserTie,
  faUserGroup,
  faHandshake,
  faLaptop,
  faFileAlt,
  faCheckCircle,
  faMousePointer,
  faBookOpen,
  faClipboardCheck,
  faRocket,
  faLightbulb,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== IMPORT TEXT-TO-SPEECH =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../assets/commonPics/circle logo for ppra.png';

// Services Data with detail headers
const services = [
  {
    id: 1,
    title: 'Procuring Entity-Specific Training',
    icon: faBuilding,
    description: 'PPRA provides targeted capacity-building programmes to Procuring Entities upon request.',
    detailHeader: 'Training may be customized to address:',
    details: [
      'Specific institutional needs',
      'Emerging compliance challenges',
      'Identified knowledge and skills gaps in the application of public procurement and asset disposal requirements'
    ],
    note: null
  },
  {
    id: 2,
    title: 'PPRA-Organized Training Programmes',
    icon: faChalkboardTeacher,
    description: 'The Authority organizes training and sensitization programmes for persons participating in the public procurement and asset disposal system.',
    detailHeader: 'The programmes focus on improving understanding and practical application of the legal and regulatory framework and may cover areas such as:',
    details: [
      'Procurement planning',
      'Procurement methods and procedures',
      'Preparation and use of Standard Tender Documents',
      'Tender evaluation and contract award',
      'Contract management',
      'Asset disposal',
      'Preference and reservation schemes, including AGPO',
      'Procurement reporting and disclosure requirements',
      'Electronic Government Procurement (e-GP)',
      'Capacity Building Levy requirements',
      'Emerging public procurement reforms and regulatory requirements'
    ],
    note: null
  },
  {
    id: 3,
    title: 'E-Learning, Webinars and Sensitization',
    icon: faLaptop,
    description: 'PPRA uses virtual learning platforms, webinars and stakeholder sensitization forums to expand access to procurement knowledge and regulatory information.',
    detailHeader: 'These channels enable the Authority to:',
    details: [
      'Reach stakeholders across the country',
      'Provide timely guidance on new requirements, reforms and emerging issues in public procurement and asset disposal'
    ],
    note: null
  },
  {
    id: 4,
    title: 'Technical Support and Knowledge Sharing',
    icon: faHandshake,
    description: 'PPRA provides technical support and knowledge-sharing interventions aimed at strengthening the practical application of procurement laws, regulations, standards and procedures.',
    detailHeader: 'Capacity-building interventions may also respond to weaknesses identified through:',
    details: [
      'Compliance monitoring',
      'Assessments',
      'Audits',
      'Research',
      'Stakeholder engagement'
    ],
    note: null
  }
];

// Who We Serve - Data
const whoWeServe = [
  {
    icon: faBuilding,
    title: 'Procuring Entities',
    description: 'At National and County Government levels'
  },
  {
    icon: faUserTie,
    title: 'Accounting Officers',
    description: 'Members of management and leadership'
  },
  {
    icon: faUsers,
    title: 'Heads of Procurement Functions',
    description: 'Procurement practitioners and professionals'
  },
  {
    icon: faUserGroup,
    title: 'Procurement-Related Committees',
    description: 'Members of procurement and evaluation committees'
  },
  {
    icon: faBuilding,
    title: 'User and Technical Departments',
    description: 'Departments involved in procurement processes'
  },
  {
    icon: faHandshake,
    title: 'Suppliers, Contractors and Consultants',
    description: 'Businesses providing goods, services and works'
  },
  {
    icon: faUserGroup,
    title: 'Youth, Women and Persons with Disabilities',
    description: 'Participating in public procurement'
  },
  {
    icon: faUsers,
    title: 'Other Stakeholders',
    description: 'All persons involved in public procurement and asset disposal'
  }
];

// Objectives Data
const objectives = [
  'Strengthen understanding of public procurement and asset disposal laws and regulations',
  'Improve the practical application of procurement procedures and standards',
  'Address identified capacity and compliance gaps',
  'Promote consistent and standardized procurement practices',
  'Strengthen institutional procurement and contract-management capacity',
  'Enhance implementation of preference and reservation programmes',
  'Promote awareness of procurement reforms and emerging requirements',
  'Support improved compliance, accountability and value for money in public procurement'
];

const CapacityBuilding = () => {
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

  // ===== GSAP ANIMATIONS (Only for headings and paragraphs - NO CARD ANIMATIONS) =====
  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.capacity-hero_heading'),
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

    // NO CARD ANIMATIONS - Cards will be static

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Capacity Building & Training | PPRA Kenya</title>
        <meta name="description" content="PPRA develops, promotes and supports training and capacity development for persons involved in public procurement and asset disposal in Kenya." />
        <meta name="keywords" content="PPRA, capacity building, training, procurement training, capacity development, Kenya" />
        <meta property="og:title" content="Capacity Building & Training - PPRA Kenya" />
        <meta property="og:description" content="Strengthening knowledge, skills and competencies in public procurement and asset disposal." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/capacity-building" />
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
        <section className="section-capacity-hero relative pt-8">
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
              <div ref={heroRef} className="capacity-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="Capacity Building & Training - PPRA Kenya" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="capacity-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="capacity-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                      Capacity Building & Training
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Capacity Building & Training
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Strengthening knowledge, skills and competencies in public procurement and asset disposal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* OVERVIEW SECTION */}
        {/* ============================================================ */}
        <section className="section-overview relative bg-white">
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
                <div className="overview_component">
                  <div className="overview_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OVERVIEW</div>
                    </div>
                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Building Capacity for Effective Procurement
                    </h2>
                  </div>

                  <div className="overview_content max-w-4xl mx-auto">
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          The Public Procurement Regulatory Authority (PPRA) is mandated under Section 9(1)(s) of the Public Procurement and Asset Disposal Act, 2015 to develop, promote and support the training and capacity development of persons involved in public procurement and asset disposal.
                        </p>
                        
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          Through capacity-building programmes, PPRA strengthens the knowledge, skills and competencies of stakeholders to support effective implementation of the public procurement and asset disposal legal and regulatory framework.
                        </p>
                        
                        <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                          <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                            The programmes are designed to promote compliance, improve procurement practices and contribute to a fair, transparent, competitive, accountable and cost-effective public procurement system.
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
        {/* OUR SERVICES SECTION - WITH DETAIL HEADERS */}
        {/* ============================================================ */}
        <section className="section-services relative bg-gray-50">
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
                <div className="services_component">
                  <div className="services_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR SERVICES</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Capacity-Building Services
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Comprehensive training and capacity development programmes
                    </p>
                  </div>

                  <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={service.icon} className="text-primary-purple text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg md:text-xl font-bold text-primary-purple mb-2">
                              {service.id}. {service.title}
                            </h4>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-3">
                              {service.description}
                            </p>
                            
                            {/* Detail Header */}
                            {service.detailHeader && (
                              <p className="text-gray-800 text-sm md:text-base font-semibold mt-3 mb-2">
                                {service.detailHeader}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                              {service.details.map((detail, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-4 h-4 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-primary-green text-[10px]" />
                                  </div>
                                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{detail}</p>
                                </div>
                              ))}
                            </div>
                            
                            {service.note && (
                              <div className="mt-3 p-3 bg-primary-purple/5 border-l-2 border-primary-purple">
                                <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                                  <span className="font-semibold">Note:</span> {service.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* WHO WE SERVE SECTION */}
        {/* ============================================================ */}
        <section className="section-serve relative bg-white">
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
                <div className="serve_component">
                  <div className="serve_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">WHO WE SERVE</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Our Target Audience
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Capacity-building services are intended for persons and institutions participating in the public procurement and asset disposal system
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {whoWeServe.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 text-center">
                        <div className="w-14 h-14 bg-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FontAwesomeIcon icon={item.icon} className="text-primary-purple text-2xl" />
                        </div>
                        <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* OUR OBJECTIVES SECTION */}
        {/* ============================================================ */}
        <section className="section-objectives relative bg-gray-50">
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
                        What We Aim to Achieve
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      PPRA's capacity-building programmes seek to achieve the following objectives
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                          <div className="w-6 h-6 bg-primary-purple/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-purple font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">{objective}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* WHY CAPACITY BUILDING MATTERS SECTION */}
        {/* ============================================================ */}
        <section className="section-importance relative bg-white">
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
                <div className="importance_component">
                  <div className="importance_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">WHY CAPACITY BUILDING MATTERS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        The Impact of Capacity Building
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-4 md:space-y-5">
                      <div className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-primary-purple text-xl" />
                          </div>
                          <div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                              An effective public procurement system depends on stakeholders having the knowledge and skills required to correctly apply procurement laws, procedures and standards.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faRocket} className="text-primary-purple text-xl" />
                          </div>
                          <div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                              Capacity building helps reduce errors and non-compliance, strengthens institutional procurement practices and improves the management of public resources. It also enables stakeholders to respond effectively to changes in the legal, regulatory and digital procurement environment.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faLightbulb} className="text-primary-purple text-xl" />
                          </div>
                          <div>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                              Through continuous training, sensitization and technical support, PPRA contributes to a more professional, compliant, transparent and efficient public procurement and asset disposal system.
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

export default CapacityBuilding;