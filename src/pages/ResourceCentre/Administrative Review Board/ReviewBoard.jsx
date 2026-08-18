// review-board.jsx - With Text-to-Speech integration
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGavel, 
  faListCheck, 
  faUsers, 
  faClipboardList,
  faBan,
  faClock,
  faBolt,
  faCalculator,
  faCreditCard,
  faBalanceScale,
  faPenFancy,
  faArrowRight,
  faFilePdf,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';

// Review Board Data
const reviewBoardData = {
  title: "About the Public Procurement Administrative Review Board",
  description: "The Public Procurement Administrative Review Board (PPARB) is an independent quasi-judicial body established under Section 27 of the Public Procurement and Asset Disposal Act (PPADA), 2015.",
  mandate: "Its primary mandate is to provide a central, impartial platform for reviewing and determining disputes arising from public procurement and asset disposal proceedings. By acting as an alternative to the lengthy court process, the Board ensures that grievances are resolved quickly, allowing public projects to proceed without undue delay.",
  coreFunctions: [
    "Dispute Resolution: Reviewing, hearing, and determining tendering and asset disposal disputes.",
    "Oversight of Compliance: Ensuring that procuring entities (government ministries, counties, and parastatals) adhere to the law.",
    "Alternative to Courts: Serving as a specialized tribunal to handle complex procurement technicalities before they reach the High Court."
  ],
  composition: {
    title: "Composition of the Board",
    description: "To ensure technical expertise and neutrality, the Board is composed of members nominated by various professional bodies. Under the current legal framework, the Board consists of:",
    items: [
      "15 Members: Appointed to represent diverse public interests.",
      "Professional Representation: Members are often nominated from bodies such as the Law Society of Kenya (LSK), the Institute of Certified Public Accountants of Kenya (ICPAK), and the Kenya Institute of Supplies Management (KISM), among others.",
      "Secretariat: The Public Procurement Regulatory Authority (PPRA) provides administrative and secretariat services to the Board."
    ]
  },
  requirements: [
    "The complainant must be a candidate in the procurement process he/she seeks to be reviewed. A candidate is a person who has obtained the tender documents from a public entity pursuant to an invitation notice by a procuring entity. (Section 2 of PPADA 2015)",
    "The request should be made within fourteen days of the occurrence of the breach complained of where the request is made before the making of an award or within fourteen days of the notification of award. (Section 93 of PPADA 2015 & Regulation 203(2)(c) of PPADR 2020)",
    "The Applicant seeking a review must specify the breach of duty imposed on the Procuring Entity (Respondent) by the Act and the Regulations which has or may result in the applicant suffering loss or damage. (Section 167(1) of PPADA 2015)",
    "The complainant must specify reason for the complaint and state the loss, damage or suffering, which it has or is likely to suffer as the result of the breach. [Regulation 203(2)(a) of PPADR 2020]",
    "The Request for Review shall be presented in the manner of Form RB 1 which is set forth in the Fourteenth Schedule of the Regulations and can also be downloaded from the Public Procurement Regulatory Authority's Website (www.ppra.go.ke) [Regulation 203(1) of PPADR 2020].",
    "The parties to the review are as specified in Section 170 of PPADA 2015.",
    "The request for review should be accompanied by such statements as the complainant considers necessary to support its request. The complainant should therefore forward, together with its grounds of review, information and arguments to support the grounds of the case. [Regulation 203(2)(b) of PPADR 2020]",
    "The Complaint must be accompanied by the requisite fee. The fees for reviews are found in part II of the Fourth Schedule in the Regulations. The administrative fee is Kshs. 5000 while the fee payable upon filing a request for review depends on the cost of the tender submitted by the complainant. [Regulation 73(2)(e) of PPDR 2006]",
    "The request should be submitted to the Board Secretary in six bound copies and a soft copy, pages of which should be consecutively numbered."
  ],
  notSubjectToReview: [
    "The choice of a procurement method;",
    "A termination of a procurement or asset disposal proceedings in accordance with section 62 of PPADA 2015; and",
    "Where a contract is signed in accordance with section 135 of PPADA 2015"
  ],
  filingTimeline: "An application for review must be filed within 14 days of:",
  filingTimelineItems: [
    "The notification of the award or the decision to terminate procurement proceedings.",
    "The date the applicant became aware of a breach of duty by the procuring entity."
  ],
  filingRequirements: [
    "Complete Form RB 1 (Request for Review).",
    "Submit a supporting affidavit and a list of documents/authorities.",
    "Pay the prescribed Administrative Fees (starting at roughly Ksh 5,000, depending on the tender value)."
  ],
  decisionTimeline: "The Board is legally mandated to deliver its decision within 21 days of receiving the request for review. This rapid turnaround is designed to prevent the 'freezing' of essential government services.",
  boardPowers: [
    "Annul the entire procurement proceeding or specific decisions made by the procuring entity.",
    "Order the procuring entity to redo the evaluation using the correct criteria.",
    "Substitute its own decision for that of the procuring entity (in specific circumstances).",
    "Award costs to the successful party in the review."
  ]
};

const ReviewBoard = () => {
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
      gsap.fromTo(heroRef.current.querySelector('.review-hero_heading'),
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

    // Section heading animations only - NO card animations
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
        <title>Public Procurement Administrative Review Board | PPRA Kenya</title>
        <meta name="description" content="The Public Procurement Administrative Review Board (PPARB) - Independent quasi-judicial body for procurement dispute resolution in Kenya." />
        <meta name="keywords" content="PPARB, review board, procurement disputes, administrative review, PPRA, Kenya" />
        <meta property="og:title" content="Public Procurement Administrative Review Board" />
        <meta property="og:description" content="Independent quasi-judicial body for specialized public procurement dispute resolution." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/review-board" />
      </Helmet>

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
        
        /* ===== TTS HOVER MODE STYLES ===== */
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

      {/* Main content */}
      <main className="main-wrapper">

        {/* ============================================================ */}
        {/* HERO SECTION - Consistent with PublicProcurementAct and AGPO */}
        {/* ============================================================ */}
        <section className="section-review-hero relative pt-8">
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
              <div ref={heroRef} className="review-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="PPRA - Public Procurement Administrative Review Board" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="review-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="review-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGavel} className="mr-2" />
                      Dispute Resolution
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Public Procurement Administrative Review Board
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Independent quasi-judicial body for specialized public procurement dispute resolution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ABOUT THE REVIEW BOARD SECTION - Consistent with other pages */}
        {/* ============================================================ */}
        <section className="section-about-review relative bg-white">
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
                <div className="about-review_component">
                  <div className="about-review_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">ABOUT THE REVIEW BOARD</div>
                    </div>
                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Understanding the PPARB
                    </h2>
                  </div>

                  <div className="about-review_content max-w-4xl mx-auto">
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="description-para text-base md:text-lg leading-relaxed">
                          The <strong>Public Procurement Administrative Review Board (PPARB)</strong> is an independent quasi-judicial body established under <strong>Section 27</strong> of the Public Procurement and Asset Disposal Act (PPADA), 2015.
                        </p>
                        
                        <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 rounded">
                          <p className="description-para text-base md:text-lg leading-relaxed text-gray-700 mb-0">
                            Its primary mandate is to provide a central, impartial platform for reviewing and determining disputes arising from public procurement and asset disposal proceedings. By acting as an alternative to the lengthy court process, the Board ensures that grievances are resolved quickly, allowing public projects to proceed without undue delay.
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
        {/* CORE FUNCTIONS SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-core-functions relative bg-gray-50">
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
                <div className="core-functions_component">
                  <div className="core-functions_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">CORE FUNCTIONS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        What the Board Does
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The PPARB performs critical functions in the public procurement ecosystem
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {reviewBoardData.coreFunctions.map((func, index) => (
                      <div key={index} className="bg-white p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300 group">
                        <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-purple/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={index === 0 ? faGavel : index === 1 ? faListCheck : faBalanceScale} className="text-primary-purple text-xl" />
                        </div>
                        <h4 className="text-lg md:text-xl font-bold text-primary-purple mb-2">{func.split(':')[0]}</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">{func.split(':')[1] || func}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* COMPOSITION SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-composition relative bg-white">
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
                <div className="composition_component">
                  <div className="composition_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">COMPOSITION</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        {reviewBoardData.composition.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      {reviewBoardData.composition.description}
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
                    {reviewBoardData.composition.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 md:p-5 bg-gray-50 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faUsers} className="text-primary-purple text-sm" />
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* REQUIREMENTS SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-requirements relative bg-gray-50">
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
                <div className="requirements_component">
                  <div className="requirements_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">REQUIREMENTS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Requirements for Lodging a Review
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      To file a review with the Board, the following requirements must be met
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 mb-8">
                      <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0 font-medium">
                        The Public Procurement and Disposal (Preference and Reservations) Regulations, 2011, shall apply to procurements by public entities when soliciting tenders from the following target groups
                      </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      {reviewBoardData.requirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                          <div className="w-6 h-6 bg-primary-green/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-primary-green font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">{req}</p>
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
        {/* MATTERS NOT SUBJECT TO REVIEW - No card animations */}
        {/* ============================================================ */}
        <section className="section-not-subject relative bg-white">
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
                <div className="not-subject_component">
                  <div className="not-subject_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-red-600 text-white text-sm px-4 py-1.5">EXCLUSIONS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Matters Not Subject to Review
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The Board cannot review the following matters
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-3 md:space-y-4">
                      {reviewBoardData.notSubjectToReview.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 md:p-5 bg-red-50/30 border border-red-200 hover:border-red-300 transition-all duration-300">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <FontAwesomeIcon icon={faBan} className="text-red-500 text-sm" />
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{item}</p>
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
        {/* REVIEW PROCESS SECTION - No card animations */}
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
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">PROCESS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        The Review Process
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      How to file an appeal with the Board
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                    {/* Timeline for Filing */}
                    <div className="bg-white p-5 md:p-7 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faClock} className="text-primary-purple text-lg" />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">1. Timeline for Filing</h4>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">{reviewBoardData.filingTimeline}</p>
                          <ul className="space-y-2">
                            {reviewBoardData.filingTimelineItems.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm md:text-base text-gray-600">
                                <span className="text-primary-purple font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Filing Requirements */}
                    <div className="bg-white p-5 md:p-7 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faClipboardList} className="text-primary-purple text-lg" />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">2. Filing Requirements</h4>
                          <ul className="space-y-2">
                            {reviewBoardData.filingRequirements.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm md:text-base text-gray-600">
                                <span className="text-primary-purple font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Decision Timeline */}
                    <div className="bg-white p-5 md:p-7 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-primary-green/10 rounded-lg flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faBolt} className="text-primary-green text-lg" />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-primary-green mb-2">3. Decision Timeline</h4>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">{reviewBoardData.decisionTimeline}</p>
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
        {/* BOARD POWERS SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-powers relative bg-white">
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
                <div className="powers_component">
                  <div className="powers_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">POWERS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Powers of the Board
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The Board has extensive powers to resolve procurement disputes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {reviewBoardData.boardPowers.map((power, index) => (
                      <div key={index} className="bg-gray-50 p-5 md:p-6 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center mb-4">
                          <FontAwesomeIcon icon={index === 0 ? faGavel : index === 1 ? faPenFancy : index === 2 ? faBalanceScale : faCreditCard} className="text-primary-purple text-xl" />
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{power}</p>
                      </div>
                    ))}
                  </div>

                  {/* Note */}
                  <div className="mt-8 md:mt-10 max-w-4xl mx-auto">
                    <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 rounded">
                      <p className="text-sm md:text-base leading-relaxed text-gray-700 mb-0">
                        <strong>Note:</strong> A decision by the Board is final and binding unless a party applies for a <strong>Judicial Review</strong> at the High Court within <strong>14 days</strong> of the Board's ruling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEE CALCULATOR SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-calculator relative bg-gray-50">
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
                <div className="calculator_component">
                  <div className="calculator_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">FEES CALCULATOR</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Review Fees Computation
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Use the secure regulatory mechanism tool below to calculate specialized case management rates dynamically
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 overflow-hidden">
                      <iframe 
                        src="https://ppra.go.ke/tools/arb-calculator.html"
                        title="ARB Case Filing Computation"
                        loading="lazy"
                        className="w-full h-80 md:h-96 border-none block"
                      >
                        <p className="p-4 text-sm md:text-base text-gray-500">
                          Your browser does not cleanly support embedded frame interfaces.{' '}
                          <a href="https://ppra.go.ke/tools/arb-calculator.html" target="_blank" rel="noopener noreferrer" className="text-primary-purple underline font-semibold">
                            Click here to launch computing application directly
                          </a>.
                        </p>
                      </iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PAYMENT INSTRUCTIONS SECTION - No card animations */}
        {/* ============================================================ */}
        <section className="section-payment relative bg-white">
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
                <div className="payment_component">
                  <div className="payment_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">PAYMENT</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Review Fees Payment
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      To fulfill the payment processing parameter workflows, updates must process securely via eCitizen
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto">
                    <div className="bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6 mb-6">
                      <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-0 font-medium">
                        The administrative fee is Kshs. 5,000 while the fee payable upon filing a request for review depends on the cost of the tender submitted by the complainant.
                      </p>
                    </div>

                    <div className="bg-white p-5 md:p-7 border border-gray-200">
                      <h4 className="text-base md:text-lg font-bold text-primary-purple mb-4">Payment Steps</h4>
                      <ol className="space-y-3 list-decimal list-inside text-sm md:text-base text-gray-600 font-medium">
                        <li className="pl-1">Access and authenticate your active profile inside the official eCitizen web system portal.</li>
                        <li className="pl-1">Navigate to the dynamic services registry and choose the designated PPRA Review Board application endpoint.</li>
                        <li className="pl-1">Input operational contextual records and individual target tender reference parameters.</li>
                        <li className="pl-1">Finalize balance clearings using preferred electronic billing methods (Mobile Money, Cards).</li>
                        <li className="pl-1">Generate, fetch, and archive the verified digital accounting execution receipt.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* RELATED RESOURCES SECTION - Consistent with PP Act */}
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
                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faGavel} className="text-primary-purple" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple">Review Forms</h4>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Download Form RB 1 and other review application documents</p>
                    <a href="/regulatory-framework/ppad-act-2015" className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm">
                      Download Forms <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </a>
                  </div>

                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple">Regulations</h4>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Access the Public Procurement and Asset Disposal Regulations, 2020</p>
                    <a href="/regulatory-framework" className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm">
                      View Regulations <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </a>
                  </div>

                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faBalanceScale} className="text-primary-purple" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-primary-purple">PPAD Act</h4>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Read the Public Procurement and Asset Disposal Act, 2015</p>
                    <a href="/regulatory-framework/ppad-act-2015" className="inline-flex items-center gap-2 mt-4 text-primary-green font-semibold hover:underline text-sm">
                      View Act <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA SECTION - Regional Network - Consistent with all pages */}
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

export default ReviewBoard;