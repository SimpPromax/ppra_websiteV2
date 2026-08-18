// faq.jsx - Fully Tailwind CSS version with Text-to-Speech
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import logoImage from '../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// FAQ Data based on WordPress content
const faqData = [
  {
    id: 1,
    question: "What is the Capacity Building Levy?",
    answer: "The Capacity Building Levy (CBL) is a statutory levy collected from public procurement contracts to fund training, capacity development, and regulatory strengthening in public procurement and asset disposal."
  },
  {
    id: 2,
    question: "Why was the Capacity Building Levy Introduced?",
    answer: "The levy was introduced to:\n\n· Raise additional revenue to strengthen PPRA's regulatory function.\n\n· Develop, promote, and support training and capacity development of procurement professionals.\n\n· Enable government to collect data on all procurement contracts and determine aggregate public procurement spend."
  },
  {
    id: 3,
    question: "How can I get technical support or advisory services on public procurement and asset disposal?",
    answer: "· Requirement: Send a request through email or letter.\n\n· Charges: Free.\n\n· Timeline: Within 30 days."
  },
  {
    id: 4,
    question: "How do I register and license as a procurement or asset disposal agent?",
    answer: "· Request registration/licensing in the required class as per guidelines on PPRA's website.\n\n· Download and fill Form Annex 3 from the website.\n\n· Charges: KShs 50,000 per class; KShs 5,000 for annual license renewal.\n\n· Timeline: 30 days."
  },
  {
    id: 5,
    question: "How can I request training or capacity building from PPRA?",
    answer: "· Requirement: Submit a training request via email or letter.\n\n· Charges: As per PPRA's training/capacity building policy.\n\n· Timeline: 7 days."
  },
  {
    id: 6,
    question: "What is debarment?",
    answer: "Debarment is an administrative sanction imposed by the Public Procurement Regulatory Board that prohibits a supplier, contractor, consultant or individual from participating in public procurement and asset disposal proceedings in Kenya for a specified period."
  },
  {
    id: 7,
    question: "How much does one pay for Registration and Licensing for Procuring or Asset Disposal Agent?",
    answer: "To register to be a licensed Procuring or Asset disposal agent, you are required to pay Ksh. 50,000."
  },
  {
    id: 8,
    question: "Who can file a procurement-related complaint with PPRA?",
    answer: "Any interested party including bidders, suppliers, contractors, or members of the public, public officers—may file a complaint if they believe that processing of a tender/procurement and/or disposal or bidders/contractors violate the Constitution of Kenya 2010; Procurement Law; Contract; Codes of Ethics; Directives; Lawful Order by the Director General, PPRA or Administrative Review Board, among others."
  },
  {
    id: 9,
    question: "How do I submit a complaint?",
    answer: "You can submit a complaint through The Complaints Management System (CMS) which is accessible through the link https://cms.ppra.go.ke or Submitting an email to info@ppra.go.ke."
  }
];

const FAQ = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState([]);
  const heroRef = useRef(null);
  const faqContainerRef = useRef(null);
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

  // Toggle FAQ item
  const toggleItem = (id) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Check if item is open
  const isOpen = (id) => openItems.includes(id);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.faq-hero_heading'),
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

    // FAQ items - stagger animation
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
      gsap.fromTo(item,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: item,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Form section animation
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: formRef.current,
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

  return (
    <div className="page-wrapper bg-white">
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

      <Helmet>
        <title>FAQ | PPRA Kenya</title>
        <meta name="description" content="Frequently asked questions about PPRA's services, regulations, and public procurement in Kenya." />
        <meta name="keywords" content="PPRA, FAQ, procurement questions, capacity building levy, debarment, complaints" />
        <meta property="og:title" content="FAQ - Public Procurement Regulatory Authority" />
        <meta property="og:description" content="Find answers to commonly asked questions about PPRA's services and regulations." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/faq" />
      </Helmet>

      {/* Minimal custom styles - only for GSAP animations and accordion functionality */}
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
        
        /* FAQ Accordion - Tailwind can't handle dynamic height transitions easily */
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, padding 0.3s ease;
        }
        .faq-answer.open {
          max-height: 800px;
          padding: 0 1.5rem 1.5rem 1.5rem;
        }
        .faq-answer-content {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .faq-answer.open .faq-answer-content {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          .faq-answer.open {
            padding: 0 1rem 1rem 1rem;
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
        {/* HERO SECTION - WITH GRID LINES */}
        {/* ============================================================ */}
        <section className="section-faq-hero relative pt-8">
          <div className="px-4 md:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto relative">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex z-0">
                <div className="w-1/5 border-r border-gray-200"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5 border-r border-gray-200"></div>
                <div className="w-1/5"></div>
              </div>
              
              {/* Hero Content */}
              <div className="relative z-10">
                <div ref={heroRef} className="faq-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
                  <div className="absolute inset-0 w-full h-full opacity-40">
                    <img 
                      src={corporateSky} 
                      alt="PPRA FAQ - Frequently Asked Questions" 
                      className="w-full h-full object-cover grayscale brightness-75"
                      loading="eager"
                    />
                  </div>
                  
                  {/* Hero Lines Overlay - White border on dark background */}
                  <div className="absolute inset-0 pointer-events-none flex z-10">
                    <div className="w-1/5 border-r border-white/10"></div>
                    <div className="w-1/5"></div>
                    <div className="w-1/5"></div>
                    <div className="w-1/5 border-r border-white/10"></div>
                    <div className="w-1/5"></div>
                  </div>
                  
                  <div className="faq-hero_heading max-w-4xl mx-auto text-center z-20 px-4">
                    <div className="mb-3 md:mb-4">
                      <span className="inline-block text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-primary-purple/60 px-3 md:px-4 py-1 md:py-1.5 border border-white/20 rounded-full">
                        Frequently Asked Questions
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight animate-fadeInUp">
                      FAQ
                    </h1>
                    <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                      Find answers to commonly asked questions about PPRA's services and regulations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQ SECTION - WITH GRID LINES */}
        {/* ============================================================ */}
        <section className="section-faq relative bg-white">
          <div className="px-4 md:px-6 lg:px-12 py-10 md:py-24">
            <div className="max-w-4xl mx-auto relative">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex z-0">
                <div className="w-1/5 border-r border-gray-200"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5"></div>
                <div className="w-1/5 border-r border-gray-200"></div>
                <div className="w-1/5"></div>
              </div>
              
              {/* FAQ Content */}
              <div className="relative z-10">
                <div ref={faqContainerRef} className="faq-component">
                  
                  {/* Header */}
                  <div className="faq-header text-center mb-8 md:mb-16">
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple">
                        Frequently Asked Questions
                      </h2>
                    </div>
                    <p className="text-gray-600 mt-2 md:mt-4 text-sm md:text-lg max-w-2xl mx-auto">
                      Here is a list of frequently asked questions and their answers
                    </p>
                  </div>

                  {/* FAQ Accordion */}
                  <div className="faq-list space-y-3 md:space-y-4">
                    {faqData.map((item) => (
                      <div 
                        key={item.id} 
                        className={`faq-item border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 bg-white hover:border-primary-purple hover:shadow-md ${
                          isOpen(item.id) ? 'border-primary-purple shadow-lg' : ''
                        }`}
                      >
                        {/* Question */}
                        <div 
                          className="faq-question flex items-center justify-between p-3 md:p-6 cursor-pointer select-none hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => toggleItem(item.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleItem(item.id);
                            }
                          }}
                          aria-expanded={isOpen(item.id)}
                        >
                          <h3 className={`text-sm md:text-lg font-semibold pr-3 md:pr-4 transition-colors duration-200 ${
                            isOpen(item.id) ? 'text-primary-purple' : 'text-gray-800 hover:text-primary-purple'
                          }`}>
                            {item.question}
                          </h3>
                          <div className={`shrink-0 transition-transform duration-300 ${isOpen(item.id) ? 'rotate-180' : ''}`}>
                            <svg 
                              className="w-4 h-4 md:w-5 md:h-5 text-primary-purple" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2.5} 
                                d="M19 9l-7 7-7-7" 
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Answer */}
                        <div className={`faq-answer ${isOpen(item.id) ? 'open' : ''}`}>
                          <div className="faq-answer-content text-gray-600 text-sm md:text-base leading-relaxed">
                            {item.answer.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-1 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="relative my-10 md:my-16">
                    <div className="absolute inset-0 pointer-events-none flex">
                      <div className="w-1/5 border-r border-gray-300"></div>
                      <div className="w-1/5"></div>
                      <div className="w-1/5"></div>
                      <div className="w-1/5 border-r border-gray-300"></div>
                      <div className="w-1/5"></div>
                    </div>
                    <div className="h-0"></div>
                  </div>

                  {/* Contact Form Section */}
                  <div ref={formRef} className="faq-contact-form">
                    <div className="text-center mb-6 md:mb-10">
                      <div className="heading-animate">
                        <h3 className="text-xl md:text-3xl font-bold text-primary-purple">
                          Didn't Find the Answer?
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">
                        Submit your question below and we'll get back to you
                      </p>
                    </div>

                    <form className="max-w-2xl mx-auto space-y-4 md:space-y-6" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all duration-300 text-sm md:text-base bg-white"
                            placeholder="Your Name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Your Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all duration-300 text-sm md:text-base bg-white"
                            placeholder="Your Email"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all duration-300 text-sm md:text-base bg-white resize-vertical ../"
                          placeholder="Your question or message..."
                          required
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="agree"
                          className="w-4 h-4 accent-primary-purple cursor-pointer mt-1"
                          required
                        />
                        <label htmlFor="agree" className="text-xs md:text-sm text-gray-600">
                          I agree that my submitted data is being collected and stored <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-primary-purple text-white font-semibold rounded-lg hover:bg-primary-purple-dark transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm md:text-base"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA SECTION - Regional Offices */}
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

export default FAQ;