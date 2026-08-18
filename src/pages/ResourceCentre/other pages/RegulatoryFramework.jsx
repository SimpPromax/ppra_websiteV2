// src/pages/ResourceCentre/RegulatoryFramework.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import assets
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Regulatory Framework Documents Data
const regulatoryDocuments = [
  {
    id: 'act-2022',
    title: 'The Public Procurement and Asset Disposal Act (Revised Edition 2022)',
    size: '466.82 KB',
    downloadUrl: 'http://10.10.10.49/download/the-public-procurement-and-asset-disposal-act-revised-edition-2022/?wpdmdl=13095&refresh=6a310d8bc748f1781599627'
  },
  {
    id: 'regulations-2020',
    title: 'THE PUBLIC PROCUREMENT AND ASSET DISPOSAL REGULATIONS, 2020',
    size: '0.00 KB',
    downloadUrl: 'http://10.10.10.49/download/the-public-procurement-and-asset-disposal-regulations-2020/?wpdmdl=10315&refresh=6a310d8bca2c21781599627'
  },
  {
    id: 'amendments-2020',
    title: 'Amendments to the Regulations, 2020',
    size: '777.67 KB',
    downloadUrl: 'http://10.10.10.49/download/amendments-to-the-regulations-2020/?wpdmdl=11567&refresh=6a310d8bcbca41781599627'
  }
];

const RegulatoryFramework = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.rf-hero_heading'),
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

    // Document items - clean slide up stagger
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
      {/* Global Styles */}
      <style jsx global>{`

        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
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
        
        /* Document Item Styles */
        .doc-item {
          border-bottom: 1px solid #f3f4f6;
          padding: 1rem 0;
        }
        .doc-item:last-child {
          border-bottom: none;
        }
        
        @media (max-width: 640px) {
          .doc-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.875rem 0;
          }
          .doc-item .doc-info {
            width: 100%;
          }
          .doc-item .doc-download {
            align-self: flex-start;
          }
        }
      `}</style>

      {/* Main Content */}
      <main className="main-wrapper">

        {/* HERO SECTION - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section className="section-rf-hero relative">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="rf-hero_component relative h-[35vh] md:h-[45vh] lg:h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={corporateSky} 
                    alt="PPRA Regulatory Framework" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                {/* Hero Overlay Lines - Only 2nd and 4th have borders */}
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>

                <div className="rf-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      Legal & Policy Framework
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    Regulatory Framework
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    Laws, regulations, and guidelines governing public procurement in Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION - WITH SYMMETRICAL LINES (2nd and 4th visible) */}
        <section className="section-rf-content relative bg-white">
          {/* Vertical Lines - Only 2nd and 4th have borders */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-24">
              <div className="container-large max-w-4xl mx-auto">
                <div ref={containerRef} className="rf-component">
                  
                  {/* Description */}
                  <div className="mb-10 md:mb-16">
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-4 md:mb-8">
                        About the Regulatory Framework
                      </h2>
                    </div>
                    
                    <p className="description-para text-base md:text-xl text-gray-600 leading-relaxed mb-4 md:mb-6">
                      The Regulatory Framework provides the legal and policy foundation that guides public procurement and asset disposal in Kenya. It outlines the laws, regulations, guidelines, and directives that govern procurement processes to ensure transparency, fairness, competition, and value for money in the use of public resources.
                    </p>
                    <p className="description-para text-base md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8">
                      Through this section, stakeholders can access key legislative instruments and regulatory documents that support compliance with the Public Procurement and Asset Disposal framework and promote integrity and accountability in public procurement.
                    </p>
                    
                    <div className="mt-6 md:mt-8">
                      <span className="text-sm md:text-lg text-primary-purple font-semibold tracking-wide uppercase">
                        Access key legislative instruments and regulatory documents
                      </span>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {regulatoryDocuments.map((doc) => (
                      <div key={doc.id} className="doc-item flex items-center justify-between gap-4 md:gap-6 flex-wrap">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-50">
                          <div className="text-xl md:text-2xl text-primary-purple shrink-0">📄</div>
                          <div>
                            <p className="text-sm md:text-lg font-medium text-gray-900 leading-snug">{doc.title}</p>
                            <span className="text-xs md:text-sm text-gray-500 block mt-0.5 md:mt-1">{doc.size}</span>
                          </div>
                        </div>
                        <a 
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-primary-purple hover:text-primary-purple-dark transition-colors"
                          download
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Document Count */}
                  <div className="mt-10 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3 text-gray-600">
                      <span className="text-sm md:text-base font-medium">
                        Total Documents:
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                        {regulatoryDocuments.length}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION - Regional Network */}
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

export default RegulatoryFramework;