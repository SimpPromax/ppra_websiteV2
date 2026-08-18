import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// Lazy load TTS component
const TextToSpeech = lazy(() => import('../components/text-to-speech/TextToSpeech'));

// Import assets with webp/avif fallback support
import corporateSky from '../assets/commonPics/ppra building.jpeg';
import adminstrativeReviewPic from '../assets/service pics/adminreviews pic.jpg';
import advisoryServicePic from '../assets/service pics/advisoryservice pic.jpg';
import capacityBuildingPic from '../assets/service pics/capacitybuilding pic.jpg';
import complianceMonitoringPic from '../assets/service pics/compliance pic.jpg';
import DebarmentPic from '../assets/service pics/debarments pic.jpg';
import investigationPic from '../assets/service pics/investigateon pic.jpg';
import ProcurementStatsPic from '../assets/service pics/ststistics pic.jpg';
import RegistrationLiscensingPic from '../assets/service pics/registration pic.jpg';
import ReserchInnovationPic from '../assets/service pics/reserch pic.jpg';
import StandardDevelopmentPic from '../assets/service pics/development pic.jpg';
import TechSupportPic from '../assets/service pics/support pic.jpg';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Memoized services data
const servicesData = [
  {
    id: 1,
    title: "Administrative Reviews",
    description: "description for administrative reviews services provided by PPRA.",
    image: adminstrativeReviewPic,
    imageAlt: "PPRA corporate building exterior",
    link: "/services/administrative-reviews"
  },
  {
    id: 2,
    title: "Advisory Services",
    description: "To improve effeciency of provision of advisory service to stakeholders",
    image: advisoryServicePic,
    imageAlt: "Educational and training facilities",
    link: "/services/advisory-services"
  },
  {
    id: 3,
    title: "Capacity Building & Training",
    description: "PPRA offers training and support to government agencies and suppliers, ensuring everyone understands procurement rules and follows fair, transparent, and efficient practices.",
    image: capacityBuildingPic,
    imageAlt: "Financial documents and newspaper",
    link: "/services/capacity-building"
  },
  {
    id: 4,
    title: "Compliance Monitoring(assesment, reviews & auditing )",
    description: "Monitoring, assessing, and auditing public procurement processes helps PPRA ensure that government agencies follow the law, maintain transparency, and achieve value for money.",
    image: complianceMonitoringPic,
    imageAlt: "Agricultural procurement documentation",
    link: "/services/compliance-monitoring"
  },
  {
    id: 5,
    title: "Debarment",
    description: "Understanding debarment - protecting the integrity of Kenya's public procurement system.",
    image: DebarmentPic,
    imageAlt: "Legal documents and regulations",
    link: "/services/debarment"
  },
  {
    id: 6,
    title: "Investigations",
    description: "description for investigations services provided by PPRA.",
    image: investigationPic,
    imageAlt: "Handshake representing advisory partnership",
    link: "/services/investigations"
  },
  {
    id: 7,
    title: "Public Procurement Statistics",
    description: "description for public procurement statistics services provided by PPRA.",
    image: ProcurementStatsPic,
    imageAlt: "Educational and training facilities",
    link: "/services/public-procurement-statistics"
  },
  {
    id: 8,
    title: "Registration & Licensing of Agents",
    description: "description for registration and licensing of agents services provided by PPRA.",
    image: RegistrationLiscensingPic,
    imageAlt: "Professional handshake representing legal review",
    link: "/services/registration-licensing-agents"
  },
  {
    id: 9,
    title: "Research & Innovation",
    description: "Conducting research and promoting innovation to strengthen procurement policies, improve practices, and enhance efficiency, transparency, accountability, competitiveness and value for money.",
    image: ReserchInnovationPic,
    imageAlt: "Educational and training facilities",
    link: "/services/research-and-innovation"
  },
  {
    id: 10,
    title: "Standards Development",
    description: "Building a strong procurement framework through standards and regulatory guidance.",
    image: StandardDevelopmentPic,
    imageAlt: "Educational and training facilities",
    link: "/services/standardDevelopment"
  },
  {
    id: 11,
    title: "Technical Support",
    description: "description for technical support services provided by PPRA.",
    image: TechSupportPic,
    imageAlt: "Agricultural documentation and reports",
    link: "/services/technical-support"
  }
];

// Memoized offices data
const officesData = [
  {
    id: 'nairobi',
    name: 'Nairobi (HQ)',
    address: ['KISM Towers, 6th Floor, Ngong Road', 'P.O Box 58535-00200', 'Nairobi, Kenya'],
    phone: [{ label: 'T', number: '+2540203244000' }],
    email: [{ label: 'E', address: 'info@ppra.go.ke' }]
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    address: ['Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive', 'P.O Box 2605-80100', 'Mombasa, Kenya'],
    phone: [
      { label: 'T', number: '0412224040' },
      { label: 'M', number: '0700195220' }
    ],
    email: [{ label: 'E', address: 'mombasa@ppra.go.ke' }]
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    address: ['Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue', 'P.O Box 2916-40100', 'Kisumu, Kenya'],
    phone: [{ label: 'T', number: '0572024000' }],
    email: [{ label: 'E', address: 'kisumu@ppra.go.ke' }]
  },
  {
    id: 'eldoret',
    name: 'Eldoret',
    address: ['Ainabkoi Sub County Offices', 'P.O Box 799-30100', 'Eldoret, Kenya'],
    email: [{ label: 'E', address: 'eldoret@ppra.go.ke' }]
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    address: ['Provincial Commissioner\'s Offices, Block B, 1st Floor, Room 1', 'P.O Box 15424-20100', 'Nakuru, Kenya'],
    email: [{ label: 'E', address: 'nakuru@ppra.go.ke' }]
  }
];

// Service Card Component with React.memo for performance
const ServiceCard = React.memo(({ service, navigate, onCardKeyDown }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div 
      className="service-card group bg-white border border-gray-200 rounded-none overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col h-full focus-visible:ring-2 focus-visible:ring-primary-purple focus-visible:outline-none will-change-transform"
      onClick={() => navigate(service.link)}
      onKeyDown={(e) => onCardKeyDown(e, service.link)}
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${service.title}`}
    >
      <div className="relative h-48 md:h-52 overflow-hidden bg-primary-purple shrink-0">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img 
          src={service.image} 
          alt={service.imageAlt}
          className={`service-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          width="400"
          height="300"
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-purple/70 via-primary-purple/20 to-transparent" aria-hidden="true"></div>
      </div>
      
      <div className="service-card-content p-4 md:p-6 flex flex-col grow">
        <h3 className="text-base md:text-lg font-bold text-primary-purple mb-2 leading-tight group-hover:text-primary-green transition-colors">
          {service.title}
        </h3>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {service.description}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs font-medium text-primary-green uppercase tracking-wider">
            Learn More
          </span>
          <svg className="w-5 h-5 text-primary-green transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

// Office Card Component
const OfficeCard = React.memo(({ office }) => (
  <div 
    className="bg-gray-900/40 p-5 lg:p-4 xl:p-6 border border-gray-900 hover:border-gray-800 transition-colors flex flex-col justify-between h-full"
    aria-label={`${office.name} - Regional Office`}
  >
    <div>
      <h3 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-gray-800 pb-2">
        {office.name}
      </h3>
      <address className="text-xs md:text-sm text-gray-300 leading-relaxed mb-4 not-italic">
        {office.address.map((line, index) => (
          <span key={index} className="block">{line}</span>
        ))}
      </address>
    </div>
    <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-gray-900/60 mt-auto">
      {office.phone?.map((phone, index) => (
        <p key={index} className="text-gray-400">
          {phone.label}: <a href={`tel:${phone.number.replace(/[^0-9+]/g, '')}`} className="text-white hover:text-sky-400 transition-colors font-medium">
            {phone.number}
          </a>
        </p>
      ))}
      {office.email?.map((email, index) => (
        <p key={index} className="text-gray-400">
          {email.label}: <a href={`mailto:${email.address}`} className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">
            {email.address}
          </a>
        </p>
      ))}
    </div>
  </div>
));

OfficeCard.displayName = 'OfficeCard';

const Services = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const servicesContainerRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationInitialized = useRef(false);
  
  // TTS State
  const [hoverModeActive, setHoverModeActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const bannerDismissedRef = useRef(false);
  const bannerTimerRef = useRef(null);

  // TTS Callbacks - memoized
  const handleTTSStart = useCallback(() => {
    setHoverModeActive(true);
    bannerDismissedRef.current = false;
    setShowBanner(true);
  }, []);

  const handleTTSEnd = useCallback(() => {
    setHoverModeActive(false);
    setShowBanner(false);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
  }, []);

  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Auto-dismiss banner with cleanup
  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current);
      }
      bannerTimerRef.current = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      return () => {
        if (bannerTimerRef.current) {
          clearTimeout(bannerTimerRef.current);
        }
      };
    }
  }, [hoverModeActive, showBanner]);

  // Escape key dismiss
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive) {
        handleDismissBanner();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [hoverModeActive, handleDismissBanner]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle keyboard navigation
  const handleCardKeyDown = useCallback((e, link) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(link);
    }
  }, [navigate]);

  // GSAP Animations - optimized
  useEffect(() => {
    // Skip if already initialized or reduced motion
    if (animationInitialized.current || prefersReducedMotion || typeof window === 'undefined') {
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // 1. Hero Reveal
        if (heroRef.current) {
          gsap.fromTo('.hero-fade-in',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
          );
        }

        // 2. Section Titles Animation - only if elements exist
        const headings = document.querySelectorAll('.heading-animate');
        if (headings.length) {
          headings.forEach((heading) => {
            gsap.fromTo(heading,
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: heading,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse',
                }
              }
            );
          });
        }

        // 3. Service Cards Animation - only if container exists
        if (servicesContainerRef.current) {
          const cards = servicesContainerRef.current.querySelectorAll('.service-card-content');
          if (cards.length) {
            gsap.fromTo(cards,
              { y: 25, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: servicesContainerRef.current,
                  start: 'top 80%',
                  toggleActions: 'play none none reverse',
                }
              }
            );
          }
        }
      });

      animationInitialized.current = true;
      
      // Cleanup function
      return () => {
        ctx.revert();
        animationInitialized.current = false;
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  // Show content immediately for reduced motion
  useEffect(() => {
    if (prefersReducedMotion) {
      document.querySelectorAll('.hero-fade-in, .heading-animate, .service-card-content')
        .forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
    }
  }, [prefersReducedMotion]);

  // Memoized components to prevent unnecessary re-renders
  const serviceCards = useMemo(() => (
    servicesData.map((service) => (
      <ServiceCard 
        key={service.id} 
        service={service} 
        navigate={navigate} 
        onCardKeyDown={handleCardKeyDown} 
      />
    ))
  ), [navigate, handleCardKeyDown]);

  const officeCards = useMemo(() => (
    officesData.map((office) => (
      <OfficeCard key={office.id} office={office} />
    ))
  ), []);

  return (
    <>
      <Helmet>
        <title>PPRA Services - Public Procurement Regulatory Authority Kenya</title>
        <meta name="description" content="Access PPRA's comprehensive public procurement services including advisory, reviews, complaints management, capacity building, and regional office contacts in Kenya." />
        <meta name="keywords" content="PPRA services, public procurement Kenya, procurement advisory, procurement reviews, complaints management, capacity building, procurement training" />
        <link rel="canonical" href="https://ppra.go.ke/services" />
        <meta property="og:title" content="PPRA Services - Public Procurement Regulatory Authority" />
        <meta property="og:description" content="Comprehensive public procurement services in Kenya - advisory, reviews, complaints, and capacity building." />
        <meta property="og:url" content="https://ppra.go.ke/services" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PPRA Services - Public Procurement Regulatory Authority" />
        <meta name="twitter:description" content="Comprehensive public procurement services in Kenya." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "PPRA Public Procurement Services",
            "provider": {
              "@type": "GovernmentOrganization",
              "name": "Public Procurement Regulatory Authority",
              "url": "https://ppra.go.ke"
            },
            "serviceType": "Public Procurement Services",
            "areaServed": "Kenya",
            "description": "Comprehensive public procurement and asset disposal services including advisory, reviews, complaints management, and capacity building."
          })}
        </script>
      </Helmet>

      <div className="page-wrapper bg-white text-gray-800 antialiased selection:bg-purple-100">
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
          /* Optimize animations */
          .will-change-transform {
            will-change: transform;
          }
          /* Prevent layout shifts */
          .service-card {
            contain: content;
          }
        `}</style>

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

        <main className="main-wrapper">
          
          {/* Floating TTS Button - Lazy loaded */}
          <div className="fixed bottom-6 left-6 z-50">
            <Suspense fallback={null}>
              <TextToSpeech 
                className="shadow-2xl"
                showSpeedControl={true}
                showVoiceSelector={false}
                onStart={handleTTSStart}
                onEnd={handleTTSEnd}
                onError={(err) => console.error('TTS Error:', err)}
              />
            </Suspense>
          </div>
          
          {/* HERO SECTION */}
          <section ref={heroRef} className="relative px-4 md:px-6 lg:px-12 pt-8">
            <div className="absolute inset-0 pointer-events-none flex" aria-hidden="true">
              <div className="w-1/5 border-r border-gray-200"></div>
              <div className="w-1/5"></div>
              <div className="w-1/5"></div>
              <div className="w-1/5 border-r border-gray-200"></div>
              <div className="w-1/5"></div>
            </div>

            <div className="max-w-7xl mx-auto relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-gray-200 overflow-hidden bg-gray-900">
              <div className="absolute inset-0 w-full h-full opacity-40">
                <img 
                  src={corporateSky} 
                  alt="PPRA Services - Public Procurement Regulatory Authority" 
                  className="hero-image w-full h-full object-cover grayscale brightness-75"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              
              <div className="absolute inset-0 pointer-events-none flex" aria-hidden="true">
                <div className="w-1/5 border-r border-white/10"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5 border-r border-white/10"></div>
                <div className="w-1/5"></div>
              </div>
              
              <div className="relative max-w-4xl mx-auto text-center z-10 px-6">
                <div className="mb-3 md:mb-4 hero-fade-in">
                  <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                    Public Service Delivery
                  </span>
                </div>
                <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                  Our Services
                </h1>
                <p className="text-gray-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                  Empowering Transparent and Efficient Public Procurement in Kenya
                </p>
              </div>
            </div>
          </section>

          {/* SERVICES OVERVIEW */}
          <section className="relative bg-soft-cream py-12 md:py-24">
            <div className="absolute inset-0 pointer-events-none flex" aria-hidden="true">
              <div className="w-1/5 border-r border-gray-200"></div>
              <div className="w-1/5"></div>
              <div className="w-1/5"></div>
              <div className="w-1/5 border-r border-gray-200"></div>
              <div className="w-1/5"></div>
            </div>

            <div className="w-full mx-auto relative z-10 px-4 md:px-6 lg:px-8">
              
              <div className="text-center mb-10 md:mb-16">
                <span className="text-xs md:text-sm font-bold text-primary-purple tracking-widest block uppercase mb-2 md:mb-3 heading-animate">
                  What We Offer
                </span>
                <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary-purple uppercase tracking-tight heading-animate">
                  Service Categories
                </h2>
                <div className="w-10 md:w-12 h-0.5 md:h-1 bg-primary-green mx-auto mt-3 md:mt-4 heading-animate" aria-hidden="true"></div>
              </div>

              <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
                <p className="text-base md:text-xl lg:text-2xl text-gray-600 leading-relaxed font-normal">
                  The Public Procurement Regulatory Authority offers a comprehensive range of services designed to ensure transparency, accountability, and efficiency in Kenya's public procurement and asset disposal systems.
                </p>
              </div>

              {/* Service Cards Grid - Memoized */}
              <div ref={servicesContainerRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {serviceCards}
              </div>

              {/* Service Statistics */}
              <dl className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                <div className="bg-white border border-gray-200 p-4 md:p-6 text-center">
                  <dt className="text-2xl md:text-4xl font-black text-primary-purple">11</dt>
                  <dd className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider mt-1">Service Lines</dd>
                </div>
                <div className="bg-white border border-gray-200 p-4 md:p-6 text-center">
                  <dt className="text-2xl md:text-4xl font-black text-primary-purple">24/7</dt>
                  <dd className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider mt-1">Support Available</dd>
                </div>
                <div className="bg-white border border-gray-200 p-4 md:p-6 text-center">
                  <dt className="text-2xl md:text-4xl font-black text-primary-purple">100%</dt>
                  <dd className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider mt-1">Compliant</dd>
                </div>
                <div className="bg-white border border-gray-200 p-4 md:p-6 text-center">
                  <dt className="text-2xl md:text-4xl font-black text-primary-purple">ISO</dt>
                  <dd className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider mt-1">Certified</dd>
                </div>
              </dl>

            </div>
          </section>

          {/* CTA SECTION - Regional Offices */}
          <section className="relative bg-gray-950 py-12 md:py-20 text-white">
            <div className="w-full mx-auto relative z-10 px-4 md:px-6 lg:px-8">
              
              <div className="text-center mb-10">
                <h2 className="sr-only">Our Regional Network</h2>
                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-400">
                  Our Regional Network
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                {officeCards}
              </div>

            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Services;