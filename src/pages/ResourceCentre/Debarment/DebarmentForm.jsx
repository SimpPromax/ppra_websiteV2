// src/pages/downloads/CapacityBuildingLevyReturn.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf,
  faDownload,
  faCalendarAlt,
  faClock,
  faFileAlt,
  faEye,
  faDatabase,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ===== IMPORT TEXT-TO-SPEECH =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';

// WordPress data extracted from the template
const downloadData = {
  id: 14883,
  title: "The Capacity Building Levy Return Form",
  downloadCount: 559,
  viewCount: 9,
  fileSize: "102.05 KB",
  fileType: "pdf",
  createDate: "December 2, 2025",
  updateDate: "December 2, 2025",
  downloadUrl: "https://ppra.go.ke/download/the-capacity-building-levy-return-form/?wpdmdl=14883"
};

const CapacityBuildingLevyReturn = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentRef = useRef(null);

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

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.download-hero_heading'),
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

    // Content animations
    const contentElements = document.querySelectorAll('.content-animate');
    contentElements.forEach((el, index) => {
      gsap.fromTo(el,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // File info animations
    const fileInfoItems = document.querySelectorAll('.file-info-item');
    fileInfoItems.forEach((item, index) => {
      gsap.fromTo(item,
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: item,
            start: 'top 95%',
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
        <title>Capacity Building Levy Return Form | PPRA Kenya</title>
        <meta name="description" content="Download the Capacity Building Levy Return Form. This form is used for reporting and remitting the capacity building levy to PPRA." />
        <meta name="keywords" content="capacity building levy, levy return form, PPRA, procurement, form download" />
        <meta property="og:title" content="Capacity Building Levy Return Form - PPRA Kenya" />
        <meta property="og:description" content="Download the Capacity Building Levy Return Form for reporting and remitting the capacity building levy." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/download/the-capacity-building-levy-return-form" />
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
              <div className="flex-shrink-0">
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
                className="flex-shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
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
        <section className="section-download-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="download-hero_component relative h-[40vh] md:h-[45vh] lg:h-[50vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="PPRA - Capacity Building Levy Return Form" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="download-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="download-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                      Downloadable Form
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold animate-fadeInUp leading-tight">
                    {downloadData.title}
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Form for reporting and remitting the capacity building levy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DOWNLOAD CONTENT - CENTERED */}
        {/* ============================================================ */}
        <section className="relative bg-white py-8 md:py-12 lg:py-16">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-4xl mx-auto">
              <div ref={contentRef} className="download-content">
                
                {/* Title */}
                <h1 className="content-animate text-2xl sm:text-3xl md:text-4xl font-bold text-primary-purple mb-4 md:mb-6">
                  {downloadData.title}
                </h1>

                {/* File Information Table - WordPress style */}
                <div className="content-animate bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6 md:mb-8">
                  <table className="w-full">
                    <tbody>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 w-1/3">
                          <FontAwesomeIcon icon={faDownload} className="mr-2 text-primary-purple" />
                          Download
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {downloadData.downloadCount}
                        </td>
                      </tr>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faEye} className="mr-2 text-primary-purple" />
                          Total Views
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {downloadData.viewCount}
                        </td>
                      </tr>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faDatabase} className="mr-2 text-primary-purple" />
                          Stock
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          ∞
                        </td>
                      </tr>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-primary-purple" />
                          File Size
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {downloadData.fileSize}
                        </td>
                      </tr>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-primary-purple" />
                          File Type
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          <img 
                            alt="pdf" 
                            title="pdf" 
                            className="inline-block w-5 h-5" 
                            src="https://ppra.go.ke/wp-content/plugins/download-manager/assets/file-type-icons/pdf.svg" 
                          />
                        </td>
                      </tr>
                      <tr className="file-info-item border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary-purple" />
                          Create Date
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {downloadData.createDate}
                        </td>
                      </tr>
                      <tr className="file-info-item">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600">
                          <FontAwesomeIcon icon={faClock} className="mr-2 text-primary-purple" />
                          Last Updated
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {downloadData.updateDate}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Download Button */}
                <div className="content-animate text-center mb-6 md:mb-8">
                  <a 
                    href={downloadData.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary-green text-white font-bold text-base md:text-lg hover:bg-primary-green-dark transition-colors shadow-lg hover:shadow-xl"
                    download
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-xl" />
                    Download
                  </a>
                </div>

                {/* Description / Additional Info */}
                <div className="content-animate bg-primary-purple/5 border-l-4 border-primary-purple p-4 md:p-6">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    This form is used for reporting and remitting the capacity building levy to the Public Procurement Regulatory Authority (PPRA). Please download, fill, and submit the completed form through the official channels.
                  </p>
                </div>

                {/* Back Link */}
                <div className="content-animate mt-6 md:mt-8">
                  <Link to="/downloads" className="inline-flex items-center gap-2 text-primary-purple font-semibold hover:underline text-sm md:text-base">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Downloads
                  </Link>
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

export default CapacityBuildingLevyReturn;