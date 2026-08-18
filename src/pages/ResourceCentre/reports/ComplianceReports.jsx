// src/pages/ResourceCentre/reports/ComplianceReports.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import complianceService from '../../../services/complianceService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';

// Import assets
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ComplianceReports = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  
  // Local state from service
  const [state, setState] = useState(() => complianceService.getState());
  
  // UI state for pills and year filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Subscribe to service changes
  useEffect(() => {
    const unsubscribe = complianceService.subscribe((newState) => {
      setState(newState);
    });
    
    // Initial fetch
    complianceService.fetchReports();
    
    return unsubscribe;
  }, []);

  // When category changes, update service and reset page
  useEffect(() => {
    complianceService.updateFilter('category', selectedCategory);
    setCurrentPage(1);
  }, [selectedCategory]);

  // When year changes, update service and reset page
  useEffect(() => {
    complianceService.updateFilter('year', selectedYear);
    setCurrentPage(1);
  }, [selectedYear]);

  // Destructure state
  const { 
    filteredFiles, 
    stats, 
    loading, 
    error, 
    filters,
    categories,
    years 
  } = state;

  // Get dynamic categories from the service with brand colors
  const getCategoryPills = () => {
    const pills = [
      { 
        id: 'All', 
        label: 'All Reports', 
        bgColor: 'bg-[#201444]', // Primary Purple
        hoverBg: 'hover:bg-[#3d2a6b]', // Primary Purple Light
        activeClass: 'active-purple',
        textColor: 'text-white',
        count: stats.total 
      }
    ];
    
    // Add each category from the service
    categories.forEach(cat => {
      const count = complianceService.getCategoryCount(cat);
      let bgColor = 'bg-[#201444]';
      let hoverBg = 'hover:bg-[#3d2a6b]';
      let activeClass = 'active-purple';
      
      if (cat === 'AUDIT REPORTS') {
        bgColor = 'bg-[#E91C23]'; // Primary Red
        hoverBg = 'hover:bg-[#b0151b]'; // Primary Red Dark
        activeClass = 'active-red';
      } else if (cat === 'ASSESSMENT REPORTS') {
        bgColor = 'bg-[#201444]'; // Primary Purple
        hoverBg = 'hover:bg-[#3d2a6b]'; // Primary Purple Light
        activeClass = 'active-purple';
      } else if (cat === 'REVIEW REPORTS') {
        bgColor = 'bg-[#00672F]'; // Primary Green
        hoverBg = 'hover:bg-[#003417]'; // Primary Green Dark
        activeClass = 'active-green';
      }
      
      pills.push({
        id: cat,
        label: cat.replace('_', ' '),
        bgColor: bgColor,
        hoverBg: hoverBg,
        activeClass: activeClass,
        textColor: 'text-white',
        count: count
      });
    });
    
    return pills;
  };

  const categoryPills = getCategoryPills();

  // Pagination calculations
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = filteredFiles.slice(startIndex, endIndex);

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    const tableElement = document.querySelector('.compliance-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) endPage = 4;
      if (currentPage >= totalPages - 1) startPage = totalPages - 3;
      
      if (startPage > 2) pages.push('...');
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }
      if (endPage < totalPages - 1) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };

  // Handle search
  const handleSearch = (e) => {
    complianceService.updateFilter('searchTerm', e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedYear('All');
    complianceService.updateFilter('searchTerm', '');
    setCurrentPage(1);
  };

  // ===== GSAP Animations - REMOVED file-item animations =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      const heroFadeElements = heroRef.current.querySelectorAll('.hero-fade-in');
      heroFadeElements.forEach((el, index) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power2.out'
          }
        );
      });
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

    // ===== REMOVED: file-item animations =====
    // The following code has been removed:
    // const fileItems = document.querySelectorAll('.file-item');
    // fileItems.forEach((item, index) => {
    //   gsap.fromTo(item,
    //     { y: 20, opacity: 0 },
    //     {
    //       y: 0,
    //       opacity: 1,
    //       duration: 0.4,
    //       delay: index * 0.04,
    //       scrollTrigger: {
    //         trigger: item,
    //         start: 'top 92%',
    //         toggleActions: 'play none none reverse',
    //       },
    //     }
    //   );
    // });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading, currentFiles]);

  // Loading State
  if (loading) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading compliance reports...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => complianceService.fetchReports()}
            className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-light transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

      {/* Global Styles - REMOVED file-item hover effects */}
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        /* ===== REMOVED: file-item styles ===== */
        /* .file-item styles and hover effects have been removed */
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Pill button styles */
        .pill-btn {
          transition: all 0.2s ease;
        }
        .pill-btn:hover:not(.active) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .pill-btn.active {
          box-shadow: 0 4px 12px rgba(32, 20, 68, 0.25);
        }
        .pill-btn.active-red {
          box-shadow: 0 4px 12px rgba(233, 28, 35, 0.25);
        }
        .pill-btn.active-green {
          box-shadow: 0 4px 12px rgba(0, 103, 47, 0.25);
        }
        .pill-btn.active-purple {
          box-shadow: 0 4px 12px rgba(32, 20, 68, 0.25);
        }
        .pill-count {
          background: rgba(255, 255, 255, 0.2);
        }
        .pill-btn:not(.active) .pill-count {
          background: rgba(0, 0, 0, 0.08);
        }
        
        /* Year filter button */
        .year-btn {
          transition: all 0.2s ease;
        }
        .year-btn:hover:not(.active) {
          background-color: #f3f4f6;
        }
        .year-btn.active {
          background-color: #201444;
          color: white;
          border-color: #201444;
        }
        
        .download-btn {
          background-color: #201444;
          transition: all 0.2s ease;
        }
        .download-btn:hover {
          background-color: #3d2a6b;
          transform: translateY(-1px);
        }

        .pagination-btn {
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          background-color: #f3f4f6;
        }
        .pagination-btn.active {
          background-color: #201444;
          color: white;
        }
        .pagination-btn.active:hover {
          background-color: #3d2a6b;
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* Main Content */}
      <main className="main-wrapper">

        {/* HERO SECTION */}
        <section className="section-compliance-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="compliance-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 w-full h-full opacity-40">
                  <img 
                    src={corporateSky} 
                    alt="PPRA Compliance Reports" 
                    className="w-full h-full object-cover grayscale brightness-75"
                    loading="eager"
                  />
                </div>
                
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>
                
                <div className="compliance-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="mb-3 md:mb-4 hero-fade-in">
                    <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                      Public Procurement Oversight
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                    Compliance Reports
                  </h1>
                  <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                    Monitoring compliance with public procurement and asset disposal regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILES SECTION */}
        <section className="section-compliance-files relative bg-white">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-none"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-20">
              <div className="container-large max-w-7xl mx-auto">
                <div ref={containerRef} className="compliance-component">
                  
                  {/* Heading - Centered */}
                  <div className="heading-animate mb-6 md:mb-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-2">
                      Compliance Reports Library
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                      Browse through our collection of compliance audit and assessment reports
                    </p>
                  </div>

                  {/* Category Pills - Dynamic from service with brand colors */}
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                    {categoryPills.map((pill) => {
                      const isActive = selectedCategory === pill.id;
                      
                      return (
                        <button
                          key={pill.id}
                          onClick={() => setSelectedCategory(pill.id)}
                          className={`pill-btn px-5 md:px-7 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                            isActive
                              ? `${pill.bgColor} ${pill.textColor} ${pill.activeClass}`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pill.label}
                          <span className={`pill-count ml-1.5 md:ml-2 inline-flex items-center justify-center rounded-full w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-xs ${
                            isActive ? 'bg-white/20' : 'bg-gray-200'
                          }`}>
                            {pill.count || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search and Year Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={filters.searchTerm || ''}
                          onChange={handleSearch}
                          placeholder="Search reports by name..."
                          className="w-full px-4 py-2.5 md:py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm md:text-base"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Year:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {years.map((year) => (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`year-btn px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                              selectedYear === year
                                ? 'active border-primary-purple'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {year === 'All' ? 'All Years' : year}
                          </button>
                        ))}
                      </div>
                      {(selectedCategory !== 'All' || selectedYear !== 'All' || filters.searchTerm) && (
                        <button
                          onClick={clearAllFilters}
                          className="text-primary-red hover:text-primary-red-dark text-sm font-medium transition-colors ml-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Files Table Container - REMOVED file-item classes */}
                  <div className="compliance-table-container">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {/* Files Table - Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Downloads</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentFiles.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                  <div className="text-4xl mb-3">📭</div>
                                  <p className="font-medium">No reports found</p>
                                  <p className="text-sm mt-1">Try adjusting your filters</p>
                                </td>
                              </tr>
                            ) : (
                              currentFiles.map((file) => {
                                const icon = complianceService.getFileIcon(file.name, file.icon);
                                return (
                                  // ===== REMOVED: file-item class =====
                                  <tr key={file.id} className="border-b border-gray-100">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="shrink-0">
                                          {icon.type === 'image' ? (
                                            <img src={icon.url} alt="File icon" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                                          ) : (
                                            <span className="text-xl md:text-2xl">{icon.emoji}</span>
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                          <p className="text-xs text-gray-400">{file.folder}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${complianceService.getCategoryColor(file.category)}`}>
                                        {file.category.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{file.year}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{file.downloads.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                      <button
                                        onClick={() => complianceService.downloadFile(file.downloadUrl, file.name)}
                                        className="download-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-purple text-white text-sm font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Files - Mobile Cards - REMOVED file-item class */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {currentFiles.length === 0 ? (
                          <div className="px-6 py-12 text-center text-gray-500">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="font-medium">No reports found</p>
                          </div>
                        ) : (
                          currentFiles.map((file) => {
                            const icon = complianceService.getFileIcon(file.name, file.icon);
                            return (
                              // ===== REMOVED: file-item class =====
                              <div key={file.id} className="p-4 border-b border-gray-100">
                                <div className="flex items-start gap-3">
                                  <div className="shrink-0 mt-0.5">
                                    {icon.type === 'image' ? (
                                      <img src={icon.url} alt="File icon" className="w-5 h-5 object-contain" />
                                    ) : (
                                      <span className="text-xl">{icon.emoji}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 leading-snug">{file.name}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${complianceService.getCategoryColor(file.category)}`}>
                                        {file.category.replace('_', ' ')}
                                      </span>
                                      <span className="text-xs text-gray-500">{file.year}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <span>📥 {file.downloads.toLocaleString()}</span>
                                    </div>
                                    <button
                                      onClick={() => complianceService.downloadFile(file.downloadUrl, file.name)}
                                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-purple text-white text-xs font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  {filteredFiles.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                        <span className="font-medium text-gray-700">
                          {Math.min(endIndex, filteredFiles.length)}
                        </span>{' '}
                        of <span className="font-medium text-gray-700">{filteredFiles.length}</span> reports
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label="Previous page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div className="flex gap-1">
                          {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">
                                …
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`pagination-btn min-w-10 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? 'active bg-primary-purple text-white border-primary-purple'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          aria-label="Next page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Info */}
                  {filteredFiles.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                      <span>Showing {filteredFiles.length} of {stats.total} reports</span>
                      <span className="text-xs text-gray-400">Data sourced from PPRA Compliance Reports page</span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION - Regional Network */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            <div>
              <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
                Our Regional Network
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-left">
                {/* Nairobi */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nairobi (HQ)</h4>
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

                {/* Mombasa */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Mombasa</h4>
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

                {/* Kisumu */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Kisumu</h4>
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

                {/* Eldoret */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Eldoret</h4>
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

                {/* Nakuru */}
                <div className="bg-slate-900/40 p-6 md:p-8 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">Nakuru</h4>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
                      Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />
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

export default ComplianceReports;