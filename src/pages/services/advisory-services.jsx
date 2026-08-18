import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import assets
import logoImage from '../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AdvisoryServices = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
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

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messageCharCount, setMessageCharCount] = useState(0);

  // Advisory service information
  const advisoryInfo = [
    {
      title: "Who We Serve",
      items: [
        "Procuring entities",
        "Suppliers and contractors",
        "Consultants and bidders",
        "Government institutions",
        "Development partners",
        "Members of the public"
      ]
    },
    {
      title: "Service Channels",
      items: [
        "PPRA Website",
        "Email correspondence",
        "Postal services",
        "Telephone inquiries",
        "In-person visits to PPRA offices"
      ]
    }
  ];

  const serviceHighlights = [
    "Choice of Procurement Method",
    "Tender Evaluation",
    "Contract Award",
    "AGPO",
    "STDs and Formats",
    "Contract formation and management"
  ];

  // Handle message change - count ONLY non-space characters
  const handleMessageChange = (e) => {
    const value = e.target.value;
    // Remove ALL whitespace characters (spaces, tabs, newlines) and count remaining
    const nonSpaceChars = value.replace(/\s/g, '').length;
    setMessageCharCount(nonSpaceChars);
    
    const charCounter = document.getElementById('charCounter');
    if (charCounter) {
      charCounter.textContent = `${nonSpaceChars}/10 characters (minimum)`;
      charCounter.className = nonSpaceChars >= 10 
        ? 'text-primary-green text-xs mt-1 font-medium' 
        : 'text-primary-red text-xs mt-1 font-medium';
    }
  };

  // Handle form submission with file attachment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage('');

    const form = e.target;
    
    // Validate message - count only non-space characters
    const messageValue = form.message.value;
    const nonSpaceChars = messageValue.replace(/\s/g, '').length;
    
    if (nonSpaceChars < 10) {
      setIsError(true);
      setErrorMessage(`Message must have at least 10 characters (spaces not counted). Current: ${nonSpaceChars} characters`);
      setIsLoading(false);
      document.getElementById('form-error')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('fullName', form.fullName.value.trim());
    formData.append('email', form.email.value.trim());
    formData.append('organization', form.organization.value.trim());
    formData.append('stakeholderType', form.stakeholderType.value);
    formData.append('subject', form.subject.value.trim());
    formData.append('message', messageValue.trim()); // Send trimmed version
    
    // Append file if selected
    const fileInput = form.attachment;
    if (fileInput && fileInput.files[0]) {
      formData.append('attachment', fileInput.files[0]);
    }

    try {
      const response = await fetch('http://localhost:5000/api/advisory', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        form.reset();
        setSelectedFile(null);
        setMessageCharCount(0);
        // Reset character counter
        const charCounter = document.getElementById('charCounter');
        if (charCounter) {
          charCounter.textContent = '0/10 characters (minimum)';
          charCounter.className = 'text-primary-red text-xs mt-1 font-medium';
        }
        // Scroll to success message
        document.getElementById('form-success')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsError(true);
        if (data.errors && data.errors.length > 0) {
          setErrorMessage(data.errors.map(err => err.message).join(', '));
        } else {
          setErrorMessage(data.message || 'Please check your inputs and try again.');
        }
        // Scroll to error message
        document.getElementById('form-error')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setIsError(true);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      if (heroRef.current) {
        gsap.fromTo('.hero-fade-in',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
        );
      }

      // Heading animations
      document.querySelectorAll('.heading-animate').forEach((heading) => {
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

      // Service items stagger
      if (contentRef.current) {
        gsap.fromTo('.service-item',
          { x: -15, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Form animation
      gsap.fromTo('.form-container',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: '.form-container',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-wrapper bg-soft-cream text-primary-purple antialiased selection:bg-primary-purple selection:text-white">
      {/* ===== GLOBAL STYLES FOR TTS ===== */}
      <style>{`
        .heading-animate {
          overflow: hidden;
        }
        .service-item {
          transition: all 0.3s ease;
        }
        .service-item:hover {
          border-color: #201444;
          box-shadow: 0 4px 12px rgba(32, 20, 68, 0.08);
        }
        .form-input:focus {
          border-color: #201444;
          box-shadow: 0 0 0 3px rgba(32, 20, 68, 0.1);
        }
        .form-textarea:focus {
          border-color: #201444;
          box-shadow: 0 0 0 3px rgba(32, 20, 68, 0.1);
        }
        .form-select:focus {
          border-color: #201444;
          box-shadow: 0 0 0 3px rgba(32, 20, 68, 0.1);
        }
        .btn-primary {
          background-color: #201444;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #100a22;
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(32, 20, 68, 0.2);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .file-input-wrapper {
          position: relative;
        }
        .file-input-wrapper input[type="file"] {
          cursor: pointer;
        }
        .file-input-wrapper input[type="file"]::file-selector-button {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .file-input-wrapper input[type="file"]::file-selector-button:hover {
          background-color: rgba(32, 20, 68, 0.2);
        }
        .character-count {
          transition: color 0.3s ease;
        }
        
        /* TTS Hover Mode Styles */
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

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative px-4 md:px-6 lg:px-12 pt-8">
          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative h-[45vh] md:h-[50vh] lg:h-[55vh] 
            flex items-center justify-center rounded-none border border-primary-purple/10 
            overflow-hidden bg-primary-purple-dark">
            <div className="absolute inset-0 w-full h-full opacity-40">
              <img 
                src={corporateSky} 
                alt="PPRA Advisory Services" 
                className="w-full h-full object-cover grayscale brightness-75"
                loading="eager"
              />
            </div>
            
            <div className="relative max-w-4xl mx-auto text-center z-10 px-6">
              <div className="mb-3 md:mb-4 hero-fade-in">
                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest 
                  text-white bg-primary-purple-light px-3 md:px-4 py-1 md:py-1.5 border border-primary-purple">
                  Section 9(1)(g) of the Act
                </span>
              </div>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                Advisory Services
              </h1>
              <p className="text-[#999] text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 
                max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                Guidance and technical advice on public procurement and asset disposal
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW SECTION */}
        <section className="relative bg-soft-cream px-4 md:px-6 lg:px-12 py-12 md:py-20">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-xs md:text-sm font-bold text-primary-purple-light tracking-widest 
                block uppercase mb-2 md:mb-3 heading-animate">
                Statutory Mandate
              </span>
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary-purple uppercase tracking-tight heading-animate">
                Overview
              </h2>
              <div className="w-10 md:w-12 h-0.5 md:h-1 bg-primary-purple mx-auto mt-3 md:mt-4 heading-animate"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-xl lg:text-2xl text-primary-purple leading-relaxed font-normal text-center">
                The Public Procurement Regulatory Authority (PPRA), through its Advisory Services function, 
                provides guidance and technical support on matters relating to public procurement and asset 
                disposal in accordance with Section 9(1)(g) of the Public Procurement and Asset Disposal Act, 2015.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICE INFORMATION - Two Column Layout */}
        <section className="relative bg-[#f5f0e8] px-4 md:px-6 lg:px-12 py-12 md:py-24 border-t border-b border-primary-purple/10">
          <div ref={contentRef} className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary-purple uppercase tracking-tight heading-animate">
                Service Information
              </h2>
              <p className="text-xs md:text-base font-bold text-primary-purple-light tracking-widest uppercase mt-1 md:mt-2 heading-animate">
                Who We Serve &amp; How to Access
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Who We Serve - Boxed with Ticks */}
              <div className="bg-white p-6 md:p-8 border border-primary-purple/10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg md:text-xl font-black text-primary-purple uppercase tracking-wide mb-4 border-b border-primary-purple/10 pb-3">
                  Who We Serve
                </h3>
                <ul className="space-y-3">
                  {advisoryInfo[0].items.map((item, index) => (
                    <li key={index} className="service-item flex items-start gap-3 text-primary-purple text-sm md:text-base">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary-green/10 flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Service Channels - Boxed with Ticks */}
              <div className="bg-white p-6 md:p-8 border border-primary-purple/10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg md:text-xl font-black text-primary-purple uppercase tracking-wide mb-4 border-b border-primary-purple/10 pb-3">
                  Service Channels
                </h3>
                <ul className="space-y-3">
                  {advisoryInfo[1].items.map((item, index) => (
                    <li key={index} className="service-item flex items-start gap-3 text-primary-purple text-sm md:text-base">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary-green/10 flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE HIGHLIGHTS */}
        <section className="relative bg-soft-cream px-4 md:px-6 lg:px-12 py-12 md:py-20">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary-purple uppercase tracking-tight heading-animate">
                What We Advise On
              </h2>
              <p className="text-xs md:text-base font-bold text-primary-purple-light tracking-widest uppercase mt-1 md:mt-2 heading-animate">
                This are some of the advisory services we provide on PPRA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {serviceHighlights.map((item, index) => (
                <div key={index} className="service-item bg-[#f5f0e8] p-4 md:p-6 border border-primary-purple/10 
                  hover:border-primary-purple transition-colors duration-300 flex items-center gap-3">
                  <span className="text-primary-purple text-2xl font-black">0{index + 1}</span>
                  <p className="text-primary-purple text-sm md:text-base font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REQUEST FORM SECTION WITH PDF ATTACHMENT & CHARACTER COUNTER */}
        <section className="relative bg-[#f5f0e8] px-4 md:px-6 lg:px-12 py-12 md:py-24 border-t border-primary-purple/10">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-primary-purple/10"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10 form-container">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black text-primary-purple uppercase tracking-tight heading-animate">
                Request Advisory Service
              </h2>
              <p className="text-primary-purple text-sm md:text-base mt-2 max-w-2xl mx-auto">
                Submit your request for guidance and technical advice on public procurement and asset disposal matters.
                <br />
                <span className="text-xs text-primary-purple-light font-medium">
                  After submission, you will receive a response from <strong>info@ppra.go.ke</strong> with a feedback form link.
                </span>
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 md:p-8 lg:p-10 border border-primary-purple/10" encType="multipart/form-data">
              {/* Full Name */}
              <div className="mb-5">
                <label htmlFor="fullName" className="block text-sm font-medium text-primary-purple mb-2">
                  Full Name <span className="text-primary-red">*</span>
                  <span className="text-xs text-primary-purple/60 font-normal ml-2">
                    (Minimum 2 characters)
                  </span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-input w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                    text-sm md:text-base bg-white text-primary-purple"
                  placeholder="Enter your full name"
                  required
                  minLength="2"
                  disabled={isLoading}
                />
                <p className="text-xs text-primary-purple/50 mt-1">Minimum 2 characters required</p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-primary-purple mb-2">
                  Email Address <span className="text-primary-red">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                    text-sm md:text-base bg-white text-primary-purple"
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Organization */}
              <div className="mb-5">
                <label htmlFor="organization" className="block text-sm font-medium text-primary-purple mb-2">
                  Organization / Institution
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  className="form-input w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                    text-sm md:text-base bg-white text-primary-purple"
                  placeholder="Enter your organization name"
                  disabled={isLoading}
                />
              </div>

              {/* Stakeholder Type */}
              <div className="mb-5">
                <label htmlFor="stakeholderType" className="block text-sm font-medium text-primary-purple mb-2">
                  I am a: <span className="text-primary-red">*</span>
                </label>
                <select
                  id="stakeholderType"
                  name="stakeholderType"
                  className="form-select w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                    text-sm md:text-base bg-white text-primary-purple appearance-none"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select your stakeholder type</option>
                  <option value="procuring-entity">Procuring Entity</option>
                  <option value="supplier">Supplier</option>
                  <option value="contractor">Contractor</option>
                  <option value="consultant">Consultant</option>
                  <option value="bidder">Bidder</option>
                  <option value="government">Government Institution</option>
                  <option value="development-partner">Development Partner</option>
                  <option value="public">Member of the Public</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div className="mb-5">
                <label htmlFor="subject" className="block text-sm font-medium text-primary-purple mb-2">
                  Subject <span className="text-primary-red">*</span>
                  <span className="text-xs text-primary-purple/60 font-normal ml-2">
                    (Minimum 3 characters)
                  </span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                    text-sm md:text-base bg-white text-primary-purple"
                  placeholder="Brief subject of your inquiry"
                  required
                  minLength="3"
                  disabled={isLoading}
                />
                <p className="text-xs text-primary-purple/50 mt-1">Minimum 3 characters required</p>
              </div>

              {/* Message - With Character Counter (spaces not counted) */}
              <div className="mb-5">
                <label htmlFor="message" className="block text-sm font-medium text-primary-purple mb-2">
                  Message / Inquiry <span className="text-primary-red">*</span>
                  <span className="text-xs text-primary-purple/60 font-normal ml-2">
                    (Minimum 10 characters - spaces not counted)
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="form-textarea w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                    focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all resize-y
                    text-sm md:text-base bg-white text-primary-purple"
                  placeholder="Describe your query or the advisory service you require (minimum 10 characters, spaces not counted)..."
                  required
                  disabled={isLoading}
                  onChange={handleMessageChange}
                />
                <div id="charCounter" className="text-primary-red text-xs mt-1 font-medium character-count">
                  0/10 characters (minimum)
                </div>
                
              </div>

              {/* PDF ATTACHMENT */}
              <div className="mb-5">
                <label htmlFor="attachment" className="block text-sm font-medium text-primary-purple mb-2">
                  Attach PDF (Optional)
                  <span className="text-xs text-primary-purple/60 block font-normal mt-1">
                    Max file size: 10MB. Only PDF files are accepted.
                  </span>
                </label>
                <div className="file-input-wrapper">
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="form-input w-full p-3 border border-primary-purple/20 rounded-lg focus:outline-none 
                      focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all
                      text-sm md:text-base bg-white text-primary-purple file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0 file:text-sm file:font-semibold
                      file:bg-primary-purple/10 file:text-primary-purple
                      hover:file:bg-primary-purple/20"
                    disabled={isLoading}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file type
                        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                          alert('Please select a PDF file.');
                          e.target.value = '';
                          setSelectedFile(null);
                          return;
                        }
                        // Validate file size (10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File size exceeds 10MB limit. Please select a smaller file.');
                          e.target.value = '';
                          setSelectedFile(null);
                          return;
                        }
                        setSelectedFile(file);
                      } else {
                        setSelectedFile(null);
                      }
                    }}
                  />
                </div>
                
                {/* Show selected file info */}
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-primary-purple">
                    <span className="font-medium">📎 File selected:</span>
                    <span className="bg-[#f5f0e8] px-3 py-1 rounded-lg">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      className="text-primary-red hover:text-red-700 ml-2 font-bold text-lg leading-none"
                      onClick={() => {
                        const fileInput = document.getElementById('attachment');
                        if (fileInput) {
                          fileInput.value = '';
                        }
                        setSelectedFile(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Success Message */}
              {isSuccess && (
                <div id="form-success" className="mb-4 p-4 bg-primary-green/10 border border-primary-green rounded-lg text-primary-green">
                  <span className="font-bold">✅ Success!</span> Your request has been submitted successfully! You will receive a confirmation email shortly.
                </div>
              )}

              {/* Error Message */}
              {isError && (
                <div id="form-error" className="mb-4 p-4 bg-primary-red/10 border border-primary-red rounded-lg text-primary-red">
                  <span className="font-bold">❌ Error!</span> {errorMessage || 'Failed to submit request. Please try again.'}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-primary-purple text-white font-semibold rounded-lg 
                    hover:bg-primary-purple-dark transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
                    text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
                <p className="text-xs text-primary-purple/60 text-center sm:text-left">
                  Your request will be sent to <strong className="text-primary-purple">info@ppra.go.ke</strong>
                </p>
              </div>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-[#f5f0e8] border border-primary-purple/10 rounded-lg">
                <p className="text-xs text-primary-purple/70 leading-relaxed">
                  <span className="font-bold text-primary-purple">📌 How it works:</span>
                  <br />
                  1. Submit your advisory request using this form.
                  <br />
                  2. You will receive a response from <strong>info@ppra.go.ke</strong> with guidance on your inquiry.
                  <br />
                  3. After receiving the advisory service, you will be invited to provide feedback via a Google Form link.
                  <br />
                  4. Your feedback will be sent to <strong>advisory@ppra.go.ke</strong> to help improve our services.
                </p>
              </div>
            </form>
          </div>
        </section>

        {/* CTA SECTION - Regional Offices */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Offices Directory Grid */}
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

export default AdvisoryServices;