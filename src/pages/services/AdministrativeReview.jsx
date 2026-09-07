// src/pages/services/AdministrativeReview.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGavel,
  faClock,
  faFileAlt,
  faUsers,
  faCheckCircle,
  faList,
  faMousePointer,
  faScaleBalanced,
  faBuilding,
  faCalendarAlt,
  faFileSignature
} from "@fortawesome/free-solid-svg-icons";

gsap.registerPlugin(ScrollTrigger);

import TextToSpeech from '../../components/text-to-speech/TextToSpeech';
import corporateSky from '../../assets/commonPics/ppra building.jpeg';
import logoImage from '../../assets/commonPics/circle logo for ppra.png';

const AdministrativeReview = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [hoverModeActive, setHoverModeActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const bannerDismissedRef = useRef(false);

  const handleTTSStart = useCallback(() => {
    setHoverModeActive(true);
    bannerDismissedRef.current = false;
    setShowBanner(true);
  }, []);

  const handleTTSEnd = useCallback(() => {
    setHoverModeActive(false);
    setShowBanner(false);
  }, []);

  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

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
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.service-hero_heading'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.3 }
      );
    }

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

    // REMOVED: contentBlocks animation - list cards no longer animate

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Filing steps
  const filingSteps = [
    'Confirm that you qualify as a candidate or tenderer',
    'Complete the prescribed Request for Review form',
    'Identify the procuring entity, tender or disposal proceeding',
    'Clearly state the decision, act or omission being challenged',
    'Specify the alleged breach of the Constitution, Act or Regulations',
    'Explain the loss or damage suffered or likely to be suffered',
    'State the orders or remedies sought',
    'Attach supporting statements, affidavits and relevant evidence',
    'Pay the applicable filing fees and meet any other current filing requirements',
    'Submit the application through the Administrative Review Case Management System within the statutory period'
  ];

  // Post-filing process
  const postFilingProcess = [
    'Filing of responses and procurement records',
    'Notification of affected tenderers',
    'Consideration of preliminary objections',
    'Preparation of electronic or physical case bundles',
    'Scheduling and conduct of hearings',
    'Delivery and publication of the Board\'s determination'
  ];

  // Possible orders
  const possibleOrders = [
    'Annul all or part of the procurement or disposal proceedings',
    'Direct the accounting officer to take or repeat specified action',
    'Substitute its decision for a decision made by the accounting officer',
    'Order termination and commencement of a new procurement process',
    'Make appropriate orders on costs'
  ];

  return (
    <div className="page-wrapper bg-white">
      <Helmet>
        <title>Administrative Review | PPRA Kenya</title>
        <meta name="description" content="Independent and timely mechanism for resolving procurement and asset disposal disputes through the Public Procurement Administrative Review Board (PPARB)." />
        <meta name="keywords" content="PPRA, administrative review, PPARB, procurement disputes, Kenya, review board" />
        <meta property="og:title" content="Administrative Review - PPRA Kenya" />
        <meta property="og:description" content="Independent dispute resolution for public procurement and asset disposal." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/services/administrative-review" />
      </Helmet>

      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
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
        .heading-animate { overflow: hidden; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
      `}</style>

      {hoverModeActive && !bannerDismissedRef.current && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50" style={{ maxWidth: 'calc(100% - 2rem)', width: 'auto' }}>
          <div className="px-5 py-3 rounded-2xl shadow-2xl" style={{ backgroundColor: 'rgba(0, 103, 47, 0.95)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div className="flex items-center gap-4 text-sm">
              <div className="shrink-0">
                <FontAwesomeIcon icon={faMousePointer} className="text-white text-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white text-sm">Hover over any text to read it aloud</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <span>ESC</span>
                  <span className="opacity-70">to stop</span>
                </span>
              </div>
              <button onClick={handleDismissBanner} className="shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

      <main className="main-wrapper">

        {/* HERO SECTION */}
        <section className="section-service-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="service-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center">
                <div className="absolute inset-0 parallax w-full h-full">
                  <img src={corporateSky} alt="Administrative Review" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="service-hero_gradient absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="service-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-4 py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faGavel} className="mr-2" />
                        Administrative Review
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp leading-tight">
                    Administrative Review
                  </h1>
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mt-3 md:mt-4 opacity-90 animate-fadeInUp leading-relaxed" style={{ animationDelay: '0.2s' }}>
                    Independent and timely mechanism for resolving procurement and asset disposal disputes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION SECTION */}
        <section className="section-introduction relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-24">
              <div className="container-large max-w-4xl mx-auto">
                <div className="introduction_component">
                  <div className="introduction_header text-center mb-10 md:mb-12">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">OVERVIEW</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Independent Dispute Resolution
                      </h2>
                    </div>
                  </div>

                  <div>
                    <p className="text-base md:text-lg leading-relaxed text-gray-700">
                      Administrative review is conducted by the <strong>Public Procurement Administrative Review Board (PPARB)</strong>, a central independent appeals review board established under section 27 of the Public Procurement and Asset Disposal Act, 2015.
                    </p>
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 mt-4">
                      The Board reviews, hears and determines disputes arising from public procurement and asset disposal proceedings. PPRA provides secretariat and administrative support while preserving the Board's functional independence, confidentiality and decision-making authority.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHO MAY APPLY & DEADLINE */}
        <section className="section-apply relative bg-gray-50">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
              <div className="container-large max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Who May Apply */}
                  <div className="bg-white p-6 md:p-8 border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUsers} className="text-primary-purple text-xl" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-primary-purple">Who May Apply?</h3>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      A candidate or tenderer may seek administrative review where they claim to have suffered, or risk suffering, loss or damage because of an alleged breach of a duty imposed on a procuring entity by the Act or Regulations.
                    </p>
                  </div>

                  {/* Statutory Deadline */}
                  <div className="bg-primary-red/5 border-2 border-primary-red p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-red/10 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faClock} className="text-primary-red text-xl" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-primary-red">Statutory Deadline</h3>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      A Request for Review must be filed within <strong>14 days</strong> of:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700 text-sm md:text-base">
                      <li>The occurrence of the alleged breach before an award is made</li>
                      <li>Notification of the award</li>
                      <li>The occurrence of an alleged breach after an award has been made</li>
                    </ul>
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-primary-red">
                      <p className="text-sm md:text-base text-primary-red font-medium">
                        ⚠️ The 14-day deadline is statutory and strictly applied. Writing to the procuring entity, lodging a general complaint or requesting clarification should not be assumed to stop or extend this period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO FILE */}
        <section className="section-filing relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
              <div className="container-large max-w-4xl mx-auto">
                <div className="filing_component">
                  <div className="filing_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">HOW TO FILE</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        How to File a Request for Review
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      Follow these steps to file your Request for Review
                    </p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {filingSteps.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 hover:bg-primary-purple/5 transition-colors duration-300">
                        <div className="w-8 h-8 bg-primary-purple/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-primary-purple font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 md:p-6 bg-primary-purple/5 border-l-4 border-primary-purple">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      <strong>Note:</strong> Applicants should consult the current Act, Regulations and official fee schedule before filing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POST-FILING PROCESS */}
        <section className="section-post-filing relative bg-gray-50">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
              <div className="container-large max-w-4xl mx-auto">
                <div className="post-filing_component">
                  <div className="post-filing_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">PROCESS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        What Happens After Filing?
                      </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
                      The Review Board Secretariat registers the application and notifies the relevant parties. Where applicable, the procurement proceedings are suspended in accordance with the law.
                    </p>
                    <p className="text-gray-600 text-base md:text-lg mt-2">
                      The Board is required to complete its review within <strong>21 days</strong> after receiving the Request for Review.
                    </p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {postFilingProcess.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200 hover:border-primary-purple/30 hover:shadow-md transition-all duration-300">
                        <div className="w-8 h-8 bg-primary-green/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-primary-green text-sm" />
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POSSIBLE ORDERS */}
        <section className="section-orders relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-12 md:py-20">
              <div className="container-large max-w-4xl mx-auto">
                <div className="orders_component">
                  <div className="orders_header text-center mb-10 md:mb-14">
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-sm px-4 py-1.5">POSSIBLE ORDERS</div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Possible Orders from the Board
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {possibleOrders.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 hover:bg-primary-purple/5 transition-colors duration-300">
                        <div className="w-8 h-8 bg-primary-purple/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faGavel} className="text-primary-purple text-sm" />
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 md:p-6 bg-primary-purple/5 border-l-4 border-primary-purple">
                    <h4 className="text-base md:text-lg font-bold text-primary-purple mb-2">Excluded Matters</h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Certain matters are excluded from administrative review under section 167(4) of the Act. These include the choice of a procurement method, a lawful termination of proceedings and a matter where a contract has already been signed in accordance with the Act.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REGIONAL NETWORK */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
              Our Regional Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nairobi (HQ)</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    KISM Towers, 6th Floor, Ngong Road<br />P.O Box 58535-00200<br />Nairobi, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400">T: <a href="tel:+2540203244000" className="text-white hover:text-sky-400 transition-colors font-medium">+254 020 3244000</a></p>
                  <p className="text-slate-400">E: <a href="mailto:info@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">info@ppra.go.ke</a></p>
                </div>
              </div>
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Mombasa</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive<br />P.O Box 2605-80100<br />Mombasa, Kenya
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
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Kisumu</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue<br />P.O Box 2916-40100<br />Kisumu, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400">T: <a href="tel:0572024000" className="text-white hover:text-sky-400 transition-colors font-medium">057 2024000</a></p>
                  <p className="text-slate-400">E: <a href="mailto:kisumu@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">kisumu@ppra.go.ke</a></p>
                </div>
              </div>
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Eldoret</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    Ainabkoi Sub County Offices<br />P.O Box 799-30100<br />Eldoret, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400">E: <a href="mailto:eldoret@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">eldoret@ppra.go.ke</a></p>
                </div>
              </div>
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nakuru</h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />P.O Box 15424-20100<br />Nakuru, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400">E: <a href="mailto:nakuru@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">nakuru@ppra.go.ke</a></p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdministrativeReview;