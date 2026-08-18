// capacity-building-levy.jsx - Updated with FontAwesome icons and Tailwind CSS
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf, 
  faDownload, 
  faMoneyBillWave, 
  faLaptop, 
  faChartLine, 
  faBuilding, 
  faShieldAlt, 
  faInfoCircle,
  faChevronDown,
  faPhone,
  faEnvelope,
  faGlobe,
  faMousePointer  // <-- ADD THIS
} from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../components/text-to-speech/TextToSpeech';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Import assets
import logoImage from '../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../assets/commonPics/ppra building.jpeg';


// FAQ/Accordion Data - Fixed content with proper paragraph breaks
const levyAccordionData = [
  {
    id: 'legal-background',
    title: 'Legal Background',
    content: `Vide legal notice no. 206 dated 6th November 2023, the Cabinet Secretary, The National Treasury and Economic Planning pursuant to the provisions of sections 24(5)(d) and 180 of the Public Procurement and Asset Disposal Act (the Act) issued the Public Procurement Capacity Building Levy Order (the Levy Order), 2023 which provided among others that:

"there shall be a levy by a supplier on all procurement contracts signed between the supplier and a procuring entity, at the rate of zero-point zero three percent (0.03%) of the value of the signed contracts exclusive of applicable taxes."`
  },
  {
    id: 'purpose',
    title: 'Purpose of the Levy',
    content: 'The purpose of the Levy shall be to provide funds for the development of capacity through training, technical support and mentoring of the persons involved in the public procurement and asset disposal system in order to facilitate achievement of value for money in public procurement and enhance quality of public service.'
  },
  {
    id: 'commencement',
    title: 'Commencement of the Levy',
    content: 'The Authority through circular no. 1 of 2024 dated 30th August, 2024 notified all the procuring entities of the commencement and operationalization date for the Levy Order to be 1st September, 2024.'
  },
  {
    id: 'deduction-remittances',
    title: 'Deduction and Remittances',
    content: `The levy is deducted at the rate of 0.03% of the contract sum exclusive of taxes and remitted to the Authority by the Procuring Entity on behalf of the supplier, contractor and/or service provider by the 20th day of the following month failure to which a penalty of 5% shall be applied for every month the Levy remains unremitted.

The remittances are done by the Procuring Entity through e-Citizen platform: https://ppra.ecitizen.go.ke`
  },
  {
    id: 'how-to-remit',
    title: 'How to remit the levy on eCitizen',
    content: `To remit the Levy, follow the steps below:

1. Visit https://ppra.ecitizen.go.ke

2. On the Capacity Building Levy return homepage, click Apply Now.

3. Log into your e-Citizen account.

4. On the bottom right corner after instructions, click Next.

5. Select the procuring entity category, procuring entity name, telephone number, email and physical address.

In the event that the procuring entity name is unavailable, select "other" in the Procuring Entity category then on the Procuring Entity name, specify the Procuring Entity by writing in full the name of the Procuring Entity, add contact details of the Procuring Entity and click Next.

6. On the next page, Select Add GOK Funded Details then in the window, fill in contract number, supplier name, and the sub-total amount of the contract which is the contract value exclusive of applicable taxes and click save.

7. If there are several contracts being paid for, continue adding GOK Funded Details following the step 6 until all the contracts are captured then click next.

8. Tick declaration and preview then click complete.

9. Select payment mode and download the payment instructions and proceed to make payment as per the payment instructions downloaded.`
  },
  {
    id: 'research-innovations',
    title: 'Research, Innovations & Business Systems Directorate',
    content: `This Directorate provides the platform to promote and utilize effective strategies in ICT, align technology with the Authority's mandate, conduct research, act as organization central database and continuously re-engineer business processes.

The Directorate manages three core areas:

1. Develops and implements the ICT strategy, policies, and robust infrastructure (including security and disaster recovery) to support automation, analyze business needs, and maintain essential business applications and reporting systems for public procurement performance.

2. Conducts quality research as mandated by the Act, develops and disseminates the public procurement market price reference guide, generates official statistics, and prepares all statutory reports for submission to Parliament and County Assemblies.

3. Manages the Public Procurement State Portal and Resource Centre, overseeing the central repository and database that includes complaints, debarred contractors, market prices, and non-compliant entities, while actively fostering a culture of knowledge management and innovation.`
  },
  {
    id: 'how-to-file',
    title: 'How to file the Levy on PPIP',
    content: `Pursuant to the provisions of paragraph 9(1) and (2) of the Levy Order, Procuring Entities are expected to file the returns of the remitted Levy through PPIP using the form SL.1 available in the Levy Order.

Before filing on PPIP, ensure you have already uploaded details of the contract as they are loaded when filing the return.

To file the returns, follow the following steps:

Step 1
Go to PPIP Dashboard and select Capacity Building Levy and select create new.

Step 2
Populate the Contract Number, Levy Payable, Amount Paid, and attach the evidence of payment or e-Citizen Receipt and form SL.1 scanned as one pdf document with the Remittance advice/Payee advice/e-Citizen receipt being the first page and the form SL. 1 following thereafter.

Step 3
Click save and complete.`
  }
];

// Collection Methods
const collectionMethods = [
  {
    id: 'deduction',
    title: 'Deduction at Source',
    description: 'The Procuring Entity is responsible for deducting the 0.03% levy from the contract price at the time of making payment to the supplier.',
    icon: faMoneyBillWave
  },
  {
    id: 'ecitizen',
    title: 'eCitizen Integration',
    description: 'Remittance is made directly to the PPRA through eCitizen. Alternative payment arrangements can be made after seeking guidance from the PPRA Finance Section.',
    icon: faLaptop,
    link: 'https://ppra.ecitizen.go.ke',
    linkText: 'Visit eCitizen Portal'
  },
  {
    id: 'progressive',
    title: 'Progressive Remittance',
    description: 'For multi-year or milestone-based contracts, the levy is determined on the total contract price but deducted and remitted progressively as payments are made.',
    icon: faChartLine
  }
];

// Documents with real download links
const documents = [
  {
    id: 'levy-order',
    title: 'THE PUBLIC PROCUREMENT CAPACITY BUILDING LEVY ORDER, 2023',
    size: '91.15 KB',
    icon: faFilePdf,
    downloadUrl: 'http://10.10.10.49/download/the-public-procurement-capacity-building-levy-order-2023-2/?wpdmdl=13937&refresh=6a30fedf2c04e1781595871'
  }
];

const CapacityBuildingLevy = () => {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState(null);
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

  // Toggle accordion
  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.levy-hero_heading'),
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Capacity Building Levy | PPRA Kenya</title>
        <meta name="description" content="Learn about the Public Procurement Capacity Building Levy (CBL) - a strategic investment to strengthen public procurement capacity in Kenya." />
        <meta name="keywords" content="capacity building levy, CBL, PPRA, procurement levy, public procurement, Kenya" />
        <meta property="og:title" content="Capacity Building Levy - Public Procurement Regulatory Authority" />
        <meta property="og:description" content="Strengthening public procurement capacity through strategic investment." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/capacity-building-levy" />
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
        
        /* Accordion Styles */
        .accordion-item {
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
          margin-bottom: 0.5rem;
        }
        .accordion-item:hover {
          border-color: #4A148C;
          box-shadow: 0 4px 12px rgba(74, 20, 140, 0.08);
        }
        .accordion-item.open {
          border-color: #4A148C;
          box-shadow: 0 4px 16px rgba(74, 20, 140, 0.1);
        }
        
        .accordion-header {
          cursor: pointer;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          transition: all 0.3s ease;
        }
        .accordion-header:hover .accordion-title {
          color: #4A148C;
        }
        .accordion-header .accordion-title {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 1rem;
          letter-spacing: -0.01em;
          transition: color 0.3s ease;
        }
        .accordion-header .accordion-icon {
          transition: transform 0.3s ease;
          flex-shrink: 0;
          color: #4A148C;
        }
        .accordion-header .accordion-icon.open {
          transform: rotate(180deg);
        }
        
        /* Content expansion */
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, padding 0.3s ease;
        }
        .accordion-content.open {
          max-height: 1200px;
          padding: 0 1.25rem 1.5rem 1.25rem;
        }
        
        /* Inner content fade-in */
        .accordion-content-inner {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .accordion-content.open .accordion-content-inner {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Paragraph styles */
        .accordion-content-inner p {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.8;
          white-space: pre-line;
          margin-bottom: 0.25rem;
        }
        .accordion-content-inner p:last-child {
          margin-bottom: 0;
        }
        .accordion-content-inner br {
          display: none;
        }

        @media (max-width: 640px) {
          .accordion-header {
            padding: 0.875rem 1rem;
          }
          .accordion-header .accordion-title {
            font-size: 0.9rem;
          }
          .accordion-content.open {
            padding: 0 1rem 1.25rem 1rem;
          }
          .accordion-content-inner p {
            font-size: 0.875rem;
            line-height: 1.7;
          }
        }
      `}</style>

      {/* Main Content */}
      <main className="main-wrapper">

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

        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="section-levy-hero relative pt-8">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div ref={heroRef} className="relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 w-full h-full opacity-40">
                  <img 
                    src={corporateSky} 
                    alt="PPRA Capacity Building Levy" 
                    className="w-full h-full object-cover grayscale brightness-75"
                    loading="eager"
                  />
                </div>
                
                {/* Hero Overlay Lines */}
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>
                
                <div className="levy-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="mb-3 md:mb-4">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                      Public Procurement Capacity Building Levy
                    </span>
                  </div>
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Capacity Building Levy
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Strengthening public procurement capacity through strategic investment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CONTENT SECTION */}
        {/* ============================================================ */}
        <section className="section-levy-content relative bg-white">
          <div className="line-wrapper absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12 py-12 md:py-24">
            <div className="max-w-4xl mx-auto">
              <div ref={containerRef} className="levy-component">
                
                {/* ============================================================ */}
                {/* INTRODUCTION */}
                {/* ============================================================ */}
                <div className="levy-intro mb-10 md:mb-16">
                  <div className="heading-animate">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-4 md:mb-6 leading-tight">
                      The Public Procurement Capacity Building Levy (CBL)
                    </h2>
                  </div>
                  <div className="space-y-4 md:space-y-5">
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      To ensure the integrity, efficiency, and sustainability of Kenya's public procurement system, the Public Procurement Regulatory Authority (PPRA) operationalized the Public Procurement Capacity Building Levy in 2024.
                    </p>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      The levy is paid by the <strong className="text-primary-purple">supplier</strong> on all procurement contracts signed with a <strong className="text-primary-purple">Procuring Entity.</strong>
                    </p>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      This levy is a strategic investment aimed at enhancing the skills and technical competencies of all stakeholders—including public entities and private suppliers—participating in the public procurement and asset disposal ecosystem.
                    </p>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* HOW IT'S COLLECTED */}
                {/* ============================================================ */}
                <div className="mb-10 md:mb-16">
                  <div className="heading-animate">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary-purple mb-6 md:mb-8">
                      How is it Collected?
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {collectionMethods.map((method) => (
                      <div key={method.id} className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 bg-primary-purple/10 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={method.icon} className="text-primary-purple text-lg" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2 text-base md:text-lg">
                              {method.title}
                            </h4>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                              {method.description}
                            </p>
                            {method.link && (
                              <a 
                                href={method.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 md:mt-3 text-primary-purple font-medium text-sm hover:underline"
                              >
                                {method.linkText} →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================================ */}
                {/* EXEMPTIONS */}
                {/* ============================================================ */}
                <div className="mb-10 md:mb-16 bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-primary-purple text-xl shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        <strong className="text-primary-purple">Exemptions:</strong> The levy does <strong className="text-red-600">not</strong> apply to contracts that are fully funded by <strong className="text-primary-purple">development partners</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* LEGAL DOCUMENTS */}
                {/* ============================================================ */}
                <div className="mb-10 md:mb-16">
                  <div className="heading-animate">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary-purple mb-6 md:mb-8">
                      Legal Documents
                    </h3>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-4 md:gap-6 flex-wrap border border-gray-200 p-4 md:p-5 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
                          <div className="w-10 h-10 bg-primary-purple/10 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={doc.icon} className="text-primary-purple text-lg" />
                          </div>
                          <div>
                            <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug">{doc.title}</p>
                            <span className="text-xs md:text-sm text-gray-500">{doc.size}</span>
                          </div>
                        </div>
                        <a 
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-primary-purple hover:text-white hover:bg-primary-purple border-2 border-primary-purple transition-all duration-300 hover:shadow-md"
                          download
                        >
                          <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================================ */}
                {/* ACCORDION SECTION - DETAILED INFORMATION */}
                {/* ============================================================ */}
                <div className="mb-10 md:mb-16">
                  <div className="heading-animate">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary-purple mb-6 md:mb-8">
                      Detailed Information
                    </h3>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {levyAccordionData.map((item) => (
                      <div 
                        key={item.id} 
                        className={`accordion-item ${openAccordion === item.id ? 'open' : ''}`}
                      >
                        <div 
                          className="accordion-header"
                          onClick={() => toggleAccordion(item.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleAccordion(item.id);
                            }
                          }}
                          aria-expanded={openAccordion === item.id}
                        >
                          <span className="accordion-title">{item.title}</span>
                          <FontAwesomeIcon 
                            icon={faChevronDown}
                            className={`accordion-icon w-5 h-5 md:w-6 md:h-6 ${openAccordion === item.id ? 'open' : ''}`}
                          />
                        </div>
                        <div className={`accordion-content ${openAccordion === item.id ? 'open' : ''}`}>
                          <div className="accordion-content-inner">
                            {item.content.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-1 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
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
        {/* CTA SECTION - Regional Offices */}
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

export default CapacityBuildingLevy;