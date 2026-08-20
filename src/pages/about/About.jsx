// about.jsx - Updated with hover-only TTS and brute-style banner
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faScaleBalanced, 
  faGraduationCap, 
  faChartLine, 
  faLaptopCode, 
  faMagnifyingGlass, 
  faHandshake, 
  faBuilding, 
  faShieldHalved,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Import Text-to-Speech Component (Hover-Only)
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Import assets
import logoImage from '../../assets/commonPics/circle logo for ppra.png';
import kenyanFlag from '../../assets/commonPics/kenyan flag.jpg';
import newspaperImage from '../../assets/commonPics/ppra finaicial newspaper pic.jpg';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';



// Import partner logos
import competitionAuthorityLogo from '../../assets/commonPics/Competition authority of kenya logo.png';
import ecitizenLogo from '../../assets/commonPics/E citizen logo.png';
import ethicsLogo from '../../assets/commonPics/Ethics and anti corruption logo.png';
import germanCorporationLogo from '../../assets/commonPics/German corporation logo.png';
import kisimLogo from '../../assets/commonPics/Kisim logo.png';
import officeOfAgLogo from '../../assets/commonPics/offiOf AG.png';
import openContractingLogo from '../../assets/commonPics/Open contracting partnership logo.png';
import openOwnershipLogo from '../../assets/commonPics/Open ownership logo.png';



// Import leadership images
import Mwangi_Wairia from '../../assets/board members/Mwangi-wa-Iria-284x300.jpg';
import Ali_Mohamed from '../../assets/board members/Ali-Mohamed-Haji-Habib-240x300.jpg';
import Linda_Susan from '../../assets/board members/Linda-Susan-Ingari-300x300.jpg';
import Allan_Kamau from '../../assets/board members/Allan-Kamau-233x300.jpg';
import AmosSimiyu from '../../assets/board members/Amos-Simiyu-Makokha-300x300.jpg';
import EricKorir from '../../assets/board members/Eric-Korir-300x300.jpg';
import PatrickKimemia from '../../assets/board members/Patrick-Kimemia-Ndirangu-300x300.jpg';

// Leadership team data
const leadershipTeamPreview = [
  {
    id: "Mwangi Wa Iria",
    name: "Hon. Mwangi Wa Iria",
    title: "Board Chair",
    image: Mwangi_Wairia,
    description: "Former Governor of Murang'a County with extensive experience in public and private sectors. Pioneered transformative policies in agriculture, cooperative development, and enterprise growth."
  },
  {
    id: "Ali Mohamed",
    name: "Mr. Ali Mohamed",
    title: "Board Member",
    image: Ali_Mohamed,
    description: "CEO of Nairobi Calibration Services Limited with expertise in strategic planning, operations, and business development. Achieved 30% revenue increase through client base expansion."
  },
  {
    id: "Linda Susan Ingari",
    name: "Linda Susan Ingari",
    title: "Board Member",
    image: Linda_Susan,
    description: "Supply chain management specialist with over 20 years of experience in manufacturing, education, telecommunication, and banking sectors. Led development of CPSP-K curriculum."
  },
  {
    id: "Allan Kamau",
    name: "Allan Kamau",
    title: "Board Member",
    image: Allan_Kamau,
    description: "Deputy Chief State Counsel at the Office of the Attorney General with expertise in commercial law, contract law, and constitutional matters."
  },
  {
    id: "Amos Simiyu",
    name: "Amos Simiyu",
    title: "Board Member",
    image: AmosSimiyu,
    description: "Managing Partner at Wattanga & Luyali Associates, specializing in Commercial, Human Rights, and Constitutional law. Associate Arbitrator with the Charter Institute of Arbitrators."
  },
  {
    id: "Eric Korir",
    name: "Eric Korir",
    title: "Board Member",
    image: EricKorir,
    description: "Director of Public Procurement at the National Treasury with over 25 years of experience. Chairs technical committee of the Electronic Government Procurement System."
  },
  {
    id: "Patrick Kimemia",
    name: "Patrick Kimemia",
    title: "Board Member",
    image: PatrickKimemia,
    description: "Head of Supply Chain Management at Kenya Generating Company PLC. Contributed to drafting of PPDA 2005 and 2015, and Public Procurement regulations."
  }
];

// Partner data
const partnerLogos = [
  { 
    src: competitionAuthorityLogo, 
    name: "Competition Authority of Kenya",
    website: "https://www.cak.go.ke"
  },
  { 
    src: ecitizenLogo, 
    name: "eCitizen",
    website: "https://www.ecitizen.go.ke"
  },
  { 
    src: ethicsLogo, 
    name: "Ethics and Anti-Corruption Commission",
    website: "https://www.eacc.go.ke"
  },
  { 
    src: kisimLogo, 
    name: "KISIM",
    website: "https://www.kisim.go.ke"
  },
  { 
    src: officeOfAgLogo, 
    name: "Office of the Attorney General",
    website: "https://www.statelaw.go.ke"
  },
];

// ===== IMPACT SECTION =====
const ImpactSection = () => {
  const impactContainerRef = useRef(null);

  const impactSlides = [
    {
      pill: "Regulatory Oversight",
      text: [
        "Monitoring compliance with procurement laws",
        "and regulations across all public entities",
        "including national and county governments"
      ]
    },
    {
      pill: "Supplier Network",
      text: [
        "Over 50,000 suppliers and contractors",
        "registered on the National Supplier",
        "Database"
      ]
    },
    {
      pill: "Capacity Building",
      text: [
        "Training and certification for thousands",
        "of procurement professionals annually",
        "building capacity for better governance"
      ]
    }
  ];

  useGSAP(() => {
    const container = impactContainerRef.current;
    if (!container) return;

    const slides = gsap.utils.toArray('.slide-text-block');
    const dots = gsap.utils.toArray('.pagination-dot');
    const topPills = gsap.utils.toArray('.slide-pill');
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 1,
      }
    });

    gsap.set(slides.slice(1), { opacity: 0 });
    gsap.set(slides.flatMap(slide => Array.from(slide.querySelectorAll('.line-text'))), { yPercent: 100 });
    gsap.set(slides[0].querySelectorAll('.line-text'), { yPercent: 0 });
    
    gsap.set(dots.slice(1), { 
      scale: 1, 
      backgroundColor: "rgba(5, 150, 105, 0.2)", 
      borderColor: "transparent" 
    });
    gsap.set(dots[0], { 
      scale: 1.25, 
      backgroundColor: "rgba(5, 150, 105, 1)", 
      borderColor: "#059669" 
    });

    gsap.set(topPills.slice(1), { opacity: 0, scale: 0.8 });
    gsap.set(topPills[0], { opacity: 1, scale: 1 });

    impactSlides.forEach((_, index) => {
      if (index === impactSlides.length - 1) return;

      const nextIndex = index + 1;
      const currentLines = slides[index].querySelectorAll('.line-text');
      const nextLines = slides[nextIndex].querySelectorAll('.line-text');

      tl.to(currentLines, {
        yPercent: -100,
        stagger: 0.05,
        ease: "power2.inOut"
      }, `slide-${index}`)
      .to(slides[index], {
        opacity: 0,
        duration: 0.2
      }, `slide-${index}+=0.2`)
      .to(dots[index], {
        scale: 1,
        backgroundColor: "rgba(5, 150, 105, 0.2)",
        borderColor: "transparent",
        duration: 0.3
      }, `slide-${index}`)
      .to(topPills[index], {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.inOut"
      }, `slide-${index}`)
      .to(slides[nextIndex], {
        opacity: 1,
        duration: 0.2
      }, `slide-${index}+=0.2`)
      .to(nextLines, {
        yPercent: 0,
        stagger: 0.08,
        ease: "power2.out",
        duration: 0.6
      }, `slide-${index}+=0.2`)
      .to(dots[nextIndex], {
        scale: 1.25,
        backgroundColor: "rgba(5, 150, 105, 1)",
        borderColor: "#059669",
        duration: 0.3
      }, `slide-${index}+=0.2`)
      .to(topPills[nextIndex], {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      }, `slide-${index}+=0.2`);
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, { scope: impactContainerRef });

  return (
    <section 
      ref={impactContainerRef} 
      className="section_home-about is-about relative bg-white w-full min-h-screen"
      aria-label="PPRA Impact Overview"
      id="impact-content"
    >
      {/* Decorative grid lines */}
      <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex z-0">
        <div className="vertical-line w-1/5 border-r border-gray-100"></div>
        <div className="vertical-line w-1/5 border-r border-gray-100"></div>
        <div className="vertical-line w-1/5 border-r border-gray-100"></div>
        <div className="vertical-line w-1/5 border-r border-gray-100"></div>
        <div className="vertical-line w-1/5 border-none"></div>
      </div>

      <div className="home-about_sticky h-screen w-full flex items-center justify-center relative z-10">
        <div className="padding-global px-4 md:px-6 lg:px-12 w-full">
          <div className="container-large max-w-5xl mx-auto text-center">
            <div className="home-about_content is-about flex flex-col items-center">
              
              {/* Pill indicators */}
              <div className="pill-wrapper mb-6 md:mb-8 relative h-8 w-full flex justify-center items-center">
                {impactSlides.map((slide, slideIdx) => (
                  <div 
                    key={slideIdx}
                    className="slide-pill absolute left-1/2 transform -translate-x-1/2 will-change-transform"
                  >
                    <div className="pill is-green inline-block bg-primary-green text-white text-xs font-bold tracking-widest px-4 py-1.5 uppercase whitespace-nowrap">
                      {slide.pill}
                    </div>
                  </div>
                ))}
              </div>

              {/* Text content */}
              <div className="home-about_text-wrapper relative w-full min-h-40 sm:min-h-30 md:min-h-45">
                {impactSlides.map((slide, slideIdx) => (
                  <div 
                    key={slideIdx}
                    className="slide-text-block absolute inset-0 w-full flex flex-col items-center justify-center"
                  >
                    <h3 className="text-xl md:text-3xl lg:text-4xl font-semibold text-primary-purple leading-tight tracking-tight max-w-4xl">
                      {slide.text.map((line, lineIdx) => (
                        <span 
                          key={lineIdx} 
                          className="block overflow-hidden relative h-fit py-0.5"
                        >
                          <span className="line-text block will-change-transform">
                            {line}
                          </span>
                        </span>
                      ))}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="swiper-pagination is-about flex items-center justify-center gap-4 mt-8 md:mt-12">
                {impactSlides.map((_, dotIdx) => (
                  <div 
                    key={dotIdx}
                    className="pagination-dot h-3 w-3 rounded-full border-2 border-transparent bg-primary-green origin-center will-change-transform p-0.5"
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ===== YOUTUBE VIDEO COMPONENT =====
const YouTubeVideoPlayer = () => {
  const iframeRef = useRef(null);

  return (
    <div className="w-full bg-gray-950 border border-gray-800/60 shadow-2xl overflow-hidden">
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/1-oyywT5sjc?rel=1"
          title="PPRA Kenya Official Videos"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Channel Info Bar */}
      <div className="bg-gray-900 text-white p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <img 
            src="https://yt3.googleusercontent.com/TY9zZ0NmPhjI8Bct6aLpDIPyMjGvn4Oq04p5xAIpyZ9XG6dPVk7u7CjeAoD-YggslDtlQnlyqQ=s48-c-k-c0x00ffffff-no-rj" 
            alt="PPRA Kenya" 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">PPRA Kenya Official</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">8 subscribers • 4 videos</span>
          <a 
            href="https://www.youtube.com/@pprakenyaofficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors font-medium"
          >
            Subscribe
          </a>
          <a 
            href="https://www.youtube.com/@pprakenyaofficial/videos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors font-medium"
          >
            View All
          </a>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN ABOUT COMPONENT =====
const About = () => {
  const navigate = useNavigate();
  const pageWrapperRef = useRef(null);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [hoverModeActive, setHoverModeActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const bannerDismissedRef = useRef(false);

  // Handle TTS callbacks
  const handleTTSStart = useCallback(() => {
    setHoverModeActive(true);
    bannerDismissedRef.current = false;
    setShowBanner(true);
  }, []);

  const handleTTSEnd = useCallback(() => {
    setHoverModeActive(false);
    setShowBanner(false);
  }, []);

  // Handle banner dismissal
  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    // Stop TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Auto-dismiss banner after 6 seconds
  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

  // Handle Escape key to dismiss banner
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive) {
        handleDismissBanner();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [hoverModeActive, handleDismissBanner]);

  // Leadership Carousel Scroll Handler
  const handleScroll = useCallback((direction) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 300;
    const gap = 24;
    const scrollAmount = direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // Main animations
  useGSAP(() => {
    const headingAnimateElements = document.querySelectorAll('.heading-animate');
    headingAnimateElements.forEach((el) => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
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

    const partnerLogosEl = document.querySelectorAll('.partner-logo');
    partnerLogosEl.forEach((logo, index) => {
      gsap.fromTo(logo,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.05,
          scrollTrigger: {
            trigger: logo,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);


  const mandateItems = [
  {
    title: "Monitoring & Assessment",
    description: "Monitor and review public procurement and asset disposal to ensure constitutional compliance, assess system performance, and recommend improvements to the Cabinet Secretary and county finance executives."
  },
  {
    title: "Standards Enforcement",
    description: "Enforce standards developed under the Act; prepare, issue and publicize standard procurement and asset disposal documents and formats; advise the Cabinet Secretary on national and international standards; and provide advice and technical support upon request."
  },
  {
    title: "Classified Procurement Oversight",
    description: "Monitor classified procurement information, including information relating to specific items procured by security organs, and make appropriate recommendations to the Cabinet Secretary."
  },
  {
    title: "Complaints, Investigations & Referrals",
    description: "Investigate procurement and asset disposal complaints, excluding matters under administrative review, and refer suspected civil or criminal wrongdoing identified through monitoring to relevant authorities."
  },
  {
    title: "Preference & Reservation Schemes",
    description: "Monitor, evaluate and promote the implementation of preference and reservation schemes by procuring entities. The Authority also publishes quarterly reports and collects disaggregated data showing the number of disadvantaged groups benefiting from these schemes."
  },
  {
    title: "State Portal, Central Repository & Procurement Data",
    description: "Develop and manage an accessible State portal and central repository providing procurement and asset disposal information, including complaints, debarred persons, prices, statistics, comparisons, and other public information."
  },
  {
    title: "Research & Procurement System Development",
    description: "Undertake research on the public procurement and asset disposal system and emerging developments affecting it. Research findings support evidence-based improvements and advice on appropriate national and international procurement standards."
  },
  {
    title: "Compliance Reporting, Accountability & Ethics",
    description: "Report procurement non-compliance to relevant authorities where directives are ignored, report on procurement performance to Parliament and county assemblies, and develop ethical standards for procuring entities and bidders."
  },
  {
    title: "Institutional Cooperation & Other Statutory Responsibilities",
    description: "Cooperate with State and non-State actors to obtain recommendations for improving public procurement and asset disposal. The Authority also performs any other functions and duties assigned to it under the Act or any other relevant law."
  }
];

  return (
    <div ref={pageWrapperRef} className="page-wrapper bg-white">
      <Helmet>
        <title>About PPRA | Public Procurement Regulatory Authority</title>
        <meta name="description" content="Learn about PPRA's history, vision, mission, and mandate in regulating public procurement in Kenya." />
        <meta name="keywords" content="PPRA, Kenya, public procurement, procurement regulation, about PPRA, history, mandate" />
        <meta property="og:title" content="About PPRA - Public Procurement Regulatory Authority" />
        <meta property="og:description" content="Promoting fairness, equity, transparency, competition and cost effectiveness in public procurement." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://ppra.go.ke/about" />
      </Helmet>

      {/* Global Styles */}
      <style>{`
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        .text-style-3lines {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        .text-style-2lines {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
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
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .line-wrapper {
          z-index: 0;
        }
        .z-index-1 {
          z-index: 1;
        }
        .line-wrapper .vertical-line.border-none {
          border-right: none !important;
        }

        /* Hover Mode Cursor Style */
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

      <main className="main-wrapper">
        
        {/* ===== FLOATING TEXT-TO-SPEECH BUTTON - HOVER ONLY ===== */}
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

        {/* ===== HERO SECTION ===== */}
        <section className="section_about-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="about-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="PPRA Hero - Modern cityscape representing public procurement" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="about-hero_gradient absolute inset-0 bg-primary-purple-dark/50"></div>
                
                <div className="about-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Public Procurement Regulatory Authority
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Promoting Fairness, Equity, Transparency, Competition and Cost Effectiveness in Public Procurement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HISTORY SECTION ===== */}
        <section className="section_history relative bg-white">
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
                <div className="history_component">
                  <div className="history_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR HISTORY</div>
                    </div>
                   
                    <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                      Evolution of Public Procurement in Kenya
                    </h2>
                  </div>

                  <div className="history_content max-w-4xl mx-auto">
                    <div className="text-color-black-light">
                      <div className="text-size-medium text-gray-700 space-y-4 md:space-y-5">
                        <p className="text-base md:text-lg leading-relaxed">
                          The Public Procurement System in Kenya has evolved from a crude system with no regulations to an orderly legally regulated procurement system. The Government's Procurement system was originally contained in the Supplies Manual of 1978, which was supplemented by circulars that were issued from time to time by the Treasury. The Director of Government Supply Services was responsible for ensuring the proper observance of the provisions of the Manual. The Manual created various tender boards for adjudication of tenders and their awards.
                        </p>
                        
                        <p className="text-base md:text-lg leading-relaxed">
                          A review of the country's public procurement systems was undertaken in 1999 and established that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 md:space-y-3">
                          <li className="text-base md:text-lg leading-relaxed">There was no uniform procurement system for the public sector as a whole</li>
                          <li className="text-base md:text-lg leading-relaxed">It did not have sanctions or penalties against persons who breached the regulations in the Supplies Manual, other than internal disciplinary action. Consequently application of the rules was not strict and many of the norms were not followed</li>
                          <li className="text-base md:text-lg leading-relaxed">The Supplies Manual did not cover procurement of works</li>
                          <li className="text-base md:text-lg leading-relaxed">The dispute settlement mechanisms relating to the award procedures as set out in the manual were weak and unreliable for ensuring fairness and transparency</li>
                          <li className="text-base md:text-lg leading-relaxed">Records of procurement transactions in many cases were found to be inaccurate or incomplete or absent, which led to suspicions of dishonest dealings at the tender boards</li>
                        </ul>
                        <p className="text-base md:text-lg leading-relaxed">
                          The systems had other institutional weaknesses that not only undermined its capacity for carrying out their mandates effectively but also led to a public perception that the public sector was not getting maximum value for money spent on procurement.
                        </p>
                        
                        <p className="text-base md:text-lg leading-relaxed">
                          In view of the above shortcomings, it was found necessary to have a law to govern the procurement system in the public sector and to establish the necessary institutions to ensure that all procurement entities observe the provisions of the law for the purpose of attaining the objectives of an open tender system in the sector.
                        </p>
                        
                        <p className="text-base md:text-lg leading-relaxed">
                          Consequently the establishment of the Exchequer and Audit (Public Procurement) Regulations 2001 which created the Public Procurement Directorate (PPD) and the Public Procurement Complaints, Review and Appeals Board (PPCRAB). The PPD and PPCRAB, though largely independent in carrying out their activities, had been operating as departments in the Ministry of Finance on which they relied for staff, facilities and funding. Since these institutional arrangements have a potential for undermining the impartiality of these bodies in the long run it was found necessary to create an oversight body whose existence was based on a law.
                        </p>
                        
                        <p className="text-base md:text-lg leading-relaxed">
                          The Public Procurement and Disposal Act, 2005 was thus enacted and it became operational on 1st January, 2007 with the gazettement of the Public Procurement and Disposal Regulations, 2006.
                        </p>
                        
                        <p className="text-base md:text-lg leading-relaxed font-semibold text-primary-purple">
                          In January 2016, the Public Procurement and Asset Disposal Act, 2015 (the Act) was enacted. This massively changed the mandate of the Public Procurement Oversight Authority (PPOA) as it largely assumed the regulatory function which then transited to Public Procurement Regulatory Authority (PPRA). The Act establishes the Public Procurement Regulatory Authority among other functions, to monitor, assess and review the public procurement and Asset Disposal system to ensure they respect the National values and other provisions including Article 227 of the constitution on public procurement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VISION & MISSION SECTION ===== */}
        <section className="section_vision-mission relative bg-gray-50">
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
                <div className="vision-mission_component">
                  <div className="vision-mission_header text-center mb-10 md:mb-16">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR VISION & MISSION</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Guiding Our Purpose
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
                    {/* Vision */}
                    <div className="bg-white p-6 md:p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-purple/10 flex items-center justify-center mr-4 shrink-0">
                          <svg className="w-6 h-6 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-primary-purple">Vision</h3>
                      </div>
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        A dynamic, effective and efficient public procurement and asset disposal system.
                      </p>
                    </div>

                    {/* Mission */}
                    <div className="bg-white p-6 md:p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-green/10 flex items-center justify-center mr-4 shrink-0">
                          <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-primary-green">Mission</h3>
                      </div>
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        To promote fairness, equity, transparency, competition and cost effectiveness through continuous monitoring, assessment and review of the public procurement and asset disposal system for sustainable development.
                      </p>
                    </div>
                  </div>

                  {/* Core Values */}
                  <div className="mt-10 md:mt-16 max-w-5xl mx-auto">
                    <div className="text-center mb-8 md:mb-10">
                      <h3 className="text-2xl md:text-3xl font-bold text-primary-purple">Core Values</h3>
                      <div className="w-16 h-0.5 bg-primary-green mx-auto mt-3"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                      <div className="bg-white p-6 md:p-8 text-center">
                        <div className="w-16 h-16 bg-primary-purple/10 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="text-xl md:text-2xl font-semibold text-primary-purple mb-3">Honesty</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">Upholding truthfulness and integrity in all procurement processes and interactions.</p>
                      </div>

                      <div className="bg-white p-6 md:p-8 text-center">
                        <div className="w-16 h-16 bg-primary-green/10 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                        </div>
                        <h4 className="text-xl md:text-2xl font-semibold text-primary-green mb-3">Integrity</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">Maintaining the highest ethical standards and moral principles in all operations.</p>
                      </div>

                      <div className="bg-white p-6 md:p-8 text-center">
                        <div className="w-16 h-16 bg-primary-purple/10 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="text-xl md:text-2xl font-semibold text-primary-purple mb-3">Accountability</h4>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">Taking responsibility for actions and decisions, ensuring transparency in all dealings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
{/* ===== MANDATE SECTION ===== */}
<section className="section_mandate relative bg-white">
  <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
    <div className="vertical-line w-1/5 border-r border-gray-200"></div>
    <div className="vertical-line w-1/5 border-none"></div>
    <div className="vertical-line w-1/5 border-none"></div>
    <div className="vertical-line w-1/5 border-r border-gray-200"></div>
    <div className="vertical-line w-1/5 border-none"></div>
  </div>

  <div className="padding-global padding-section-large mobile-up px-4 md:px-6 lg:px-12 py-12 md:py-24">
    <div className="container-large max-w-7xl mx-auto">
      <div className="mandate_component">
        <div className="mandate_header text-center mb-10 md:mb-16">
          <div className="pill-wrapper flex justify-center mb-4">
            <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OUR MANDATE</div>
          </div>
          <div className="heading-animate">
            <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
              Our Functions & Responsibilities
            </h2>
          </div>
          <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
            Section 9 of the Public Procurement and Asset Disposal Act, 2015 confers the Authority with the following functions:
          </p>
        </div>

        <div className="mandate_grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {mandateItems.map((item, index) => {
            const isEven = (index + 1) % 2 === 0;
            return (
              <div key={index} className="bg-gray-200 p-5 md:p-6">
                <div className="flex items-start">
                  <div className={`w-10 h-10 ${isEven ? 'bg-primary-green/10' : 'bg-primary-purple/10'} flex items-center justify-center shrink-0 mr-4`}>
                    <span className={`${isEven ? 'text-primary-green' : 'text-primary-purple'} font-bold`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-purple mb-2 text-base md:text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
</section>

        {/* ===== ORGANIZATIONAL STRUCTURE ===== */}
        <section className="section_org-structure relative bg-white">
          <div className="padding-global px-4 md:px-6 lg:px-12 py-12 md:py-20">
            <div className="container-large max-w-7xl mx-auto">
              <div className="text-center mb-10 md:mb-14">
                <div className="pill-wrapper flex justify-center mb-4">
                  <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">ORGANIZATIONAL STRUCTURE</div>
                </div>
                <div className="heading-animate">
                  <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                    How We Are Organized
                  </h2>
                </div>
                <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                  Understanding our governance and operational framework
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                  <div className="bg-primary-purple/5 p-6 md:p-8 border border-primary-purple/10 hover:border-primary-purple/30 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-primary-purple/10 flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-5 h-5 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-lg md:text-xl font-bold text-primary-purple">Public Procurement Regulatory Board</h4>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed pl-13">
                      Oversees policy implementation, compliance monitoring, and regulatory framework enforcement across all public procurement entities.
                    </p>
                  </div>

                  <div className="bg-primary-purple/5 p-6 md:p-8 border border-primary-purple/10 hover:border-primary-purple/30 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-primary-green/10 flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="text-lg md:text-xl font-bold text-primary-green">Public Procurement Administrative Review Board</h4>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed pl-13">
                      Handles complaints, reviews procurement decisions, and ensures fair dispute resolution in the procurement process.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary-purple/10 flex items-center justify-center mr-4 shrink-0">
                      <svg className="w-6 h-6 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold text-primary-purple">Director General & Nine Directorates</h4>
                      <p className="text-gray-600 text-sm">Led by the Director General, the Authority operates through specialized directorates</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { name: "LEGAL SERVICES DIRECTORATE", icon: <FontAwesomeIcon icon={faScaleBalanced} /> },
                      { name: "STANDARDS DEVELOPMENT AND CAPACITY BUILDING DIRECTORATE", icon: <FontAwesomeIcon icon={faGraduationCap} /> },
                      { name: "COMPLIANCE MONITORING DIRECTORATE", icon: <FontAwesomeIcon icon={faChartLine} /> },
                      { name: "DIGITAL TRANSFORMATION DIRECTORATE", icon: <FontAwesomeIcon icon={faLaptopCode} /> },
                      { name: "COMPLAINTS AND INVESTIGATION DIRECTORATE", icon: <FontAwesomeIcon icon={faMagnifyingGlass} /> },
                      { name: "STRATEGY AND PARTNERSHIPS DIRECTORATE", icon: <FontAwesomeIcon icon={faHandshake} /> },
                      { name: "CORPORATE SERVICE DIRECTORATE", icon: <FontAwesomeIcon icon={faBuilding} /> },
                      { name: "INTERNAL AUDIT AND RISK ASSURANCE DIRECTORATE", icon: <FontAwesomeIcon icon={faShieldHalved} /> }
                    ].map((directorate, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 p-3 md:p-4 border border-gray-100 hover:border-primary-purple/20 hover:bg-primary-purple/5 transition-all duration-200 group"
                      >
                        <div className="flex items-start">
                          <span className="text-primary-purple text-lg md:text-xl mr-2 group-hover:scale-110 transition-transform duration-200">
                            {directorate.icon}
                          </span>
                          <span className="text-gray-600 text-xs md:text-sm font-medium leading-tight group-hover:text-primary-purple transition-colors duration-200">
                            {directorate.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>The Director General provides strategic leadership across all directorates</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== IMPACT SECTION ===== */}
        <ImpactSection />

        {/* ===== LEADERSHIP SECTION ===== */}
        <section className="section_leadership relative bg-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none flex z-0">
            <div className="w-1/5 border-r border-gray-100"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-100"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="relative max-w-full mx-auto py-12 md:py-24 z-10">
            <div className="text-center max-w-4xl mx-auto px-4 md:px-6">
              <div className="mb-4">
                <span className="inline-block bg-primary-purple text-white text-[10px] font-bold tracking-widest px-4 py-1.5 uppercase">
                  Our Leadership
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-primary-purple tracking-tight leading-tight">
                Executive Leadership.<br className="hidden sm:block" />Strategic Vision.
              </h2>
              
              <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Meet the dedicated leaders driving transparency, accountability, and excellence in Kenya's public procurement.
              </p>
            </div>

            <div className="relative mt-8 md:mt-12 group/controls px-4 md:px-12 lg:px-16">
              <button 
                onClick={() => handleScroll('left')}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-primary-purple text-white p-3 hover:bg-primary-purple-dark transition-colors focus:outline-none"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button 
                onClick={() => handleScroll('right')}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-primary-purple text-white p-3 hover:bg-primary-purple-dark transition-colors focus:outline-none"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <div 
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {leadershipTeamPreview.map((member) => (
                  <div 
                    key={member.id} 
                    className="group shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
                  >
                    <div className="relative overflow-hidden bg-slate-100 aspect-3/4 w-full">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                      />
                      
                      <div className="absolute inset-0 bg-linear-to-t from-primary-purple-dark/80 via-primary-purple-dark/20 to-transparent opacity-90"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white text-left z-10">
                        <h4 className="font-bold text-base md:text-lg lg:text-xl tracking-tight leading-snug">{member.name}</h4>
                        <p className="text-xs uppercase tracking-wider text-white/70 mt-1 font-semibold">{member.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8 md:mt-12 px-4">
              <div>
                <button
                  onClick={() => navigate('/leadership')}
                  className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary-green text-white text-sm md:text-base font-bold hover:bg-primary-green-dark transition-colors"
                >
                  <span>Learn More About Our Leaders</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-6">
                7 executive board members governing PPRA
              </p>
            </div>
          </div>
        </section>

        {/* ===== VIDEO & NEWS SECTION ===== */}
        <section className="section_cta relative bg-white overflow-hidden pb-12 md:pb-16">
          <div className="padding-global z-index-1 px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                <div className="w-full bg-gray-950 border border-gray-800/60 shadow-2xl overflow-hidden">
                  <YouTubeVideoPlayer />
                </div>

                <div className="bg-gray-100 overflow-hidden">
                  <img 
                    src={newspaperImage} 
                    alt="PPRA Financial News Coverage" 
                    className="w-full h-56 md:h-64 object-cover"
                    loading="lazy"
                  />
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-semibold text-primary-purple mb-2">PPRA in the News</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Coverage of PPRA's initiatives and impact on public financial management.</p>
                    <a href="/news" className="inline-block mt-3 md:mt-4 text-primary-green hover:text-primary-green-dark font-medium transition-colors">
                      Read more →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION - Regional Offices ===== */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            <div>
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
                Our Regional Network
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
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

export default About;