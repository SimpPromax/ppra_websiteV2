import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import arbService from '../../../services/arbService';

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// Import assets (adjust path as needed)
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ===== YEAR DROPDOWN COMPONENT WITH LENIS SUPPORT =====
// Following the same pattern as AccessibilityToolbar
const YearDropdown = ({ selectedYear, onYearChange, years, stats, arbService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const ROW_HEIGHT = 36; // pixels per row
  const MAX_ROWS = 10;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedLabel = () => {
    if (selectedYear === 'All') {
      return `📅 All Years (${stats.total})`;
    }
    const count = arbService.getYearCount(selectedYear);
    return `📅 ${selectedYear} (${count})`;
  };

  // Get all year options sorted
  const getYearOptions = () => {
    const options = [];
    
    // Add "All Years" option
    options.push({ id: 'All', label: 'All Years', count: stats.total });
    
    // Add year options sorted newest first
    const sortedYears = years
      .filter(y => y !== 'All')
      .sort((a, b) => parseInt(b) - parseInt(a));
    
    sortedYears.forEach(year => {
      options.push({
        id: year,
        label: year,
        count: arbService.getYearCount(year)
      });
    });
    
    return options;
  };

  const yearOptions = getYearOptions();
  const totalOptions = yearOptions.length;
  const maxHeight = Math.min(totalOptions, MAX_ROWS) * ROW_HEIGHT;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-2 min-w-37.5 md:min-w-42.5 justify-between border ${
          selectedYear === 'All'
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
            : 'bg-primary-purple text-white hover:bg-primary-purple-light border-primary-purple'
        }`}
      >
        <span className="truncate">{getSelectedLabel()}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-full min-w-45 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Scrollable container - Following AccessibilityToolbar pattern */}
          <div 
            ref={scrollContainerRef}
            className="overflow-y-auto"
            style={{ 
              maxHeight: `${maxHeight}px`,
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
            }}
            // data-lenis-prevent attribute prevents Lenis from hijacking scroll
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {yearOptions.map((option, index) => {
              const isSelected = selectedYear === option.id;
              const isAll = option.id === 'All';
              
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onYearChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    !isAll ? 'border-t border-gray-50' : ''
                  } ${
                    isSelected 
                      ? 'bg-primary-purple/5 text-primary-purple font-semibold' 
                      : 'text-gray-700'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className={`ml-3 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    isSelected
                      ? 'bg-primary-purple/20 text-primary-purple'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Footer indicator showing total years if more than 10 */}
          {totalOptions > MAX_ROWS && (
            <div className="px-4 py-1.5 text-center text-[10px] text-gray-400 border-t border-gray-100 bg-gray-50">
              Showing {MAX_ROWS} of {totalOptions} years
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ARBDecisions = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  
  // Local state from service
  const [state, setState] = useState(() => arbService.getState());
  
  // ===== GET CURRENT YEAR =====
  const currentYear = new Date().getFullYear().toString();
  
  // UI state for year filter and sorting - DEFAULT TO CURRENT YEAR
  const [selectedYear, setSelectedYear] = useState(currentYear);
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
    const unsubscribe = arbService.subscribe((newState) => {
      setState(newState);
    });
    
    // Initial fetch
    arbService.fetchDecisions();
    
    return unsubscribe;
  }, []);

  // ===== DESTRUCTURE STATE HERE =====
  // This must come BEFORE the useEffect that uses loading and years
  const { 
    filteredFiles, 
    stats, 
    loading, 
    error, 
    filters,
    years 
  } = state;

  // ===== UPDATE YEAR FILTER WHEN DATA LOADS =====
  // This useEffect must come AFTER the destructuring
  useEffect(() => {
    if (!loading && years.length > 0) {
      // Check if current year exists in the data
      const hasCurrentYear = years.some(y => y === currentYear);
      if (hasCurrentYear) {
        // If current year exists, set it as selected
        if (selectedYear === currentYear) {
          arbService.updateFilter('year', currentYear);
        }
      } else {
        // If current year doesn't exist, default to 'All'
        setSelectedYear('All');
        arbService.updateFilter('year', 'All');
      }
    }
  }, [loading, years, currentYear]);

  // When year changes, update service and reset page
  useEffect(() => {
    arbService.updateFilter('year', selectedYear);
    setCurrentPage(1);
  }, [selectedYear]);

  // ===== RESET PAGE WHEN SEARCH OR SORT CHANGES =====
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.sortBy, filters.sortOrder]);

  // ===== MEMOIZED PAGINATION CALCULATIONS =====
  const paginationData = useMemo(() => {
    const totalFiles = filteredFiles?.length || 0;
    const totalPages = Math.ceil(totalFiles / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalFiles);
    const currentFiles = filteredFiles?.slice(startIndex, endIndex) || [];
    
    return {
      totalFiles,
      totalPages,
      startIndex,
      endIndex,
      currentFiles,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages || totalPages === 0,
    };
  }, [filteredFiles, currentPage, itemsPerPage]);

  // ===== PAGINATION CONTROLS =====
  const goToPage = useCallback((page) => {
    const { totalPages } = paginationData;
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
    const tableElement = document.querySelector('.arb-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [paginationData]);

  const goToPreviousPage = useCallback(() => {
    if (paginationData.currentPage > 1) {
      goToPage(paginationData.currentPage - 1);
    }
  }, [paginationData.currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    if (paginationData.currentPage < paginationData.totalPages) {
      goToPage(paginationData.currentPage + 1);
    }
  }, [paginationData.currentPage, paginationData.totalPages, goToPage]);

  // ===== ✅ FIXED: GENERATE PAGE NUMBERS WITH SMART ELLIPSIS =====
  const getPageNumbers = useCallback(() => {
    const { totalPages, currentPage } = paginationData;
    
    // If 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Adjust for edge cases
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 5);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [paginationData]);

  // Handle search
  const handleSearch = (e) => {
    arbService.updateFilter('searchTerm', e.target.value);
  };

  // Clear all filters - Reset to current year
  const clearAllFilters = () => {
    // Check if current year exists in data
    const hasCurrentYear = years.some(y => y === currentYear);
    if (hasCurrentYear) {
      setSelectedYear(currentYear);
      arbService.updateFilter('year', currentYear);
    } else {
      setSelectedYear('All');
      arbService.updateFilter('year', 'All');
    }
    arbService.updateFilter('searchTerm', '');
  };

  // Sort handlers
  const handleSort = (sortBy) => {
    if (filters.sortBy === sortBy) {
      arbService.toggleSortOrder();
    } else {
      arbService.updateFilter('sortBy', sortBy);
      arbService.updateFilter('sortOrder', 'asc');
    }
  };

  // Get sort icon
  const getSortIcon = (sortBy) => {
    if (filters.sortBy !== sortBy) {
      return (
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  // ===== GSAP Animations =====
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  // ===== 🐛 DEBUG: Auto-log stats when data loads =====
  useEffect(() => {
    if (!loading && state.files.length > 0) {
      console.log('='.repeat(60));
      console.log('📊 ARB DECISIONS - DATA LOADED');
      console.log('='.repeat(60));
      
      // Log year distribution
      const yearCounts = {};
      const misplacedFiles = [];
      const filesWithNoYear = [];
      
      state.files.forEach(file => {
        const year = file.year || 'Unknown';
        yearCounts[year] = (yearCounts[year] || 0) + 1;
        
        // Check for misplaced files
        if (file.tableYear && file.tableYear !== 'Unknown' && file.year !== file.tableYear && file.year !== 'Unknown') {
          misplacedFiles.push({
            name: file.name.substring(0, 60) + (file.name.length > 60 ? '...' : ''),
            year: file.year,
            tableYear: file.tableYear,
            folder: file.folder
          });
        }
        
        if (file.year === 'Unknown' || !file.year) {
          filesWithNoYear.push({
            name: file.name.substring(0, 60) + (file.name.length > 60 ? '...' : ''),
            folder: file.folder,
            tableYear: file.tableYear
          });
        }
      });
      
      console.log('📊 Year Counts:');
      console.table(yearCounts);
      
      console.log(`📊 Total Files: ${state.files.length}`);
      console.log(`📊 Total Years: ${Object.keys(yearCounts).length}`);
      
      if (misplacedFiles.length > 0) {
        console.warn(`⚠️ Found ${misplacedFiles.length} potentially misplaced files:`);
        console.table(misplacedFiles);
      } else {
        console.log('✅ No misplaced files detected');
      }
      
      if (filesWithNoYear.length > 0) {
        console.warn(`⚠️ Found ${filesWithNoYear.length} files with no year:`);
        console.table(filesWithNoYear);
      } else {
        console.log('✅ All files have a year assigned');
      }
      
      console.log('📊 Valid Years:', state.stats.years);
      console.log('='.repeat(60));
      console.log('💡 Tip: Check the "tableYear" field for year source');
      console.log('='.repeat(60));
    }
  }, [loading, state.files, state.stats.years]);

  // ===== DESTRUCTURE PAGINATION DATA =====
  const { 
    totalFiles, 
    totalPages, 
    startIndex, 
    endIndex, 
    currentFiles,
    isFirstPage,
    isLastPage
  } = paginationData;

  // Loading State
  if (loading) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ARB decisions...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Decisions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => arbService.fetchDecisions()}
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
        
        /* Custom scrollbar for dropdown - following AccessibilityToolbar pattern */
        .dropdown-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .dropdown-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .dropdown-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dropdown-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
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

      {/* Global Styles */}
      <style>{`
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
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
          border-color: #201444;
          box-shadow: 0 2px 8px rgba(32, 20, 68, 0.25);
        }
        .pagination-btn.active:hover {
          background-color: #3d2a6b;
        }
        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagination-btn.ellipsis {
          cursor: default;
          border: none;
          background: transparent;
          color: #9ca3af;
        }
        .pagination-btn.ellipsis:hover {
          background: transparent;
        }

        .sort-btn {
          transition: all 0.2s ease;
        }
        .sort-btn:hover {
          color: #201444;
        }
        .sort-btn.active {
          color: #201444;
        }
        
        /* Prevent Lenis from hijacking dropdown scroll */
        [data-lenis-prevent] {
          overscroll-behavior: contain;
          touch-action: pan-y;
          scroll-behavior: auto;
        }
      `}</style>

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

      {/* Main Content */}
      <main className="main-wrapper">

        {/* HERO SECTION */}
        <section className="section-arb-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="arb-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 w-full h-full opacity-40">
                  <img 
                    src={corporateSky} 
                    alt="PPRA ARB Decisions" 
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
                
                <div className="arb-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="mb-3 md:mb-4 hero-fade-in">
                    <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                      Public Procurement Oversight
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                    ARB Decisions
                  </h1>
                  <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed tracking-wide hero-fade-in">
                    Access Administrative Review Board decisions from 2004 to present
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILES SECTION */}
        <section className="section-arb-files relative bg-white">
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
                <div ref={containerRef} className="arb-component">
                  
                  {/* Heading - Centered */}
                  <div className="heading-animate mb-6 md:mb-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-2">
                      ARB Decisions Library
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                      Browse through Administrative Review Board decisions organized by year
                    </p>
                  </div>

                  {/* Search and Filters with Year Dropdown */}
                  <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                    {/* Search Bar - Left */}
                    <div className="flex-1 min-w-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={filters.searchTerm || ''}
                          onChange={handleSearch}
                          placeholder="Search decisions by name or folder..."
                          className="w-full px-4 py-2.5 md:py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm md:text-base"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Right Section: Year Dropdown + Sort + Clear */}
                    <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                      {/* Year Dropdown */}
                      <YearDropdown 
                        selectedYear={selectedYear} 
                        onYearChange={setSelectedYear} 
                        years={years} 
                        stats={stats} 
                        arbService={arbService}
                      />

                      {/* Sort Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap hidden sm:inline">Sort:</span>
                        <button
                          onClick={() => handleSort('date')}
                          className={`sort-btn px-2.5 md:px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                            filters.sortBy === 'date'
                              ? 'active border-primary-purple bg-primary-purple/5 text-primary-purple'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Date {getSortIcon('date')}
                        </button>
                        <button
                          onClick={() => handleSort('name')}
                          className={`sort-btn px-2.5 md:px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                            filters.sortBy === 'name'
                              ? 'active border-primary-purple bg-primary-purple/5 text-primary-purple'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Name {getSortIcon('name')}
                        </button>
                        <button
                          onClick={() => handleSort('downloads')}
                          className={`sort-btn px-2.5 md:px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                            filters.sortBy === 'downloads'
                              ? 'active border-primary-purple bg-primary-purple/5 text-primary-purple'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Downloads {getSortIcon('downloads')}
                        </button>
                      </div>

                      {/* Clear Button */}
                      {(selectedYear !== currentYear || filters.searchTerm) && (
                        <button
                          onClick={clearAllFilters}
                          className="text-primary-red hover:text-primary-red-dark text-sm font-medium transition-colors ml-1 px-2 py-1"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Files Table Container */}
                  <div className="arb-table-container">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {/* Files Table - Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Decision Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Folder</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Downloads</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentFiles.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                  <div className="text-4xl mb-3">⚖️</div>
                                  <p className="font-medium">No decisions found</p>
                                  <p className="text-sm mt-1">Try adjusting your filters</p>
                                </td>
                              </tr>
                            ) : (
                              currentFiles.map((file, index) => {
                                const icon = arbService.getFileIcon(file.name, file.icon);
                                return (
                                  <tr key={`${file.id}-${index}-${currentPage}`} className="border-b border-gray-100">
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
                                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                                        file.tableYear && file.tableYear !== file.year && file.year !== 'Unknown'
                                          ? 'bg-red-100 text-red-800 border-red-200' // Misplaced file
                                          : 'bg-purple-100 text-purple-800 border-purple-200'
                                      }`}>
                                        {file.year}
                                        {file.tableYear && file.tableYear !== file.year && file.year !== 'Unknown' && (
                                          <span className="ml-1 text-[10px] text-red-600">⚠️</span>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{file.folder}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{file.downloads.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                      <button
                                        onClick={() => arbService.downloadFile(file.downloadUrl, file.name)}
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

                      {/* Files - Mobile Cards */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {currentFiles.length === 0 ? (
                          <div className="px-6 py-12 text-center text-gray-500">
                            <div className="text-4xl mb-3">⚖️</div>
                            <p className="font-medium">No decisions found</p>
                          </div>
                        ) : (
                          currentFiles.map((file, index) => {
                            const icon = arbService.getFileIcon(file.name, file.icon);
                            return (
                              <div key={`${file.id}-${index}-${currentPage}`} className="p-4 border-b border-gray-100">
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
                                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                        file.tableYear && file.tableYear !== file.year && file.year !== 'Unknown'
                                          ? 'bg-red-100 text-red-800 border-red-200'
                                          : 'bg-purple-100 text-purple-800 border-purple-200'
                                      }`}>
                                        {file.year}
                                      </span>
                                      <span className="text-xs text-gray-500">{file.folder}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <span>📥 {file.downloads.toLocaleString()}</span>
                                    </div>
                                    <button
                                      onClick={() => arbService.downloadFile(file.downloadUrl, file.name)}
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
                  {totalFiles > 0 && totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                        <span className="font-medium text-gray-700">{endIndex}</span> of{' '}
                        <span className="font-medium text-gray-700">{totalFiles}</span> decisions
                      </div>

                      <div className="flex items-center gap-1">
                        {/* First Page */}
                        <button
                          onClick={() => goToPage(1)}
                          disabled={isFirstPage}
                          className="pagination-btn px-2.5 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          aria-label="First page"
                          title="First page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Previous */}
                        <button
                          onClick={goToPreviousPage}
                          disabled={isFirstPage}
                          className="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          aria-label="Previous page"
                          title="Previous page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {getPageNumbers().map((page, index) => {
                            if (page === '...') {
                              return (
                                <span 
                                  key={`ellipsis-${index}`} 
                                  className="pagination-btn ellipsis px-2 py-2 text-sm text-gray-400 select-none"
                                >
                                  …
                                </span>
                              );
                            }
                            return (
                              <button
                                key={`page-${page}`}
                                onClick={() => goToPage(page)}
                                className={`pagination-btn min-w-10 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? 'active bg-primary-purple text-white border-primary-purple shadow-md shadow-primary-purple/20'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                                aria-label={`Go to page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next */}
                        <button
                          onClick={goToNextPage}
                          disabled={isLastPage}
                          className="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          aria-label="Next page"
                          title="Next page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={() => goToPage(totalPages)}
                          disabled={isLastPage}
                          className="pagination-btn px-2.5 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          aria-label="Last page"
                          title="Last page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Info */}
                  {totalFiles > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                      <span>Showing {totalFiles} of {stats.total} decisions</span>
                      <span className="text-xs text-gray-400">Data sourced from PPRA ARB Decisions page</span>
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

export default ARBDecisions;