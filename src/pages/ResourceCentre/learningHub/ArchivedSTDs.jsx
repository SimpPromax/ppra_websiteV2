// src/pages/ResourceCentre/ArchivedSTDs.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faFilePdf, 
  faFileWord, 
  faFileAlt,
  faFile,
  faDownload,
  faSearch,
  faTimes,
  faFileArchive,
  faList,
  faTable,
  faCalendarAlt,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import standardTenderDocumentsService from '../../../services/standardTenderDocumentsService';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ArchivedSTDs = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Service state
  const [state, setState] = useState(() => standardTenderDocumentsService.getState());
  const { archivedDocuments, loading, error } = state;

  // ===== UI STATE =====
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  // ===== TTS STATE =====
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
      const timer = setTimeout(() => setShowBanner(false), 6000);
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

  // ===== SUBSCRIBE TO SERVICE =====
  useEffect(() => {
    const unsubscribe = standardTenderDocumentsService.subscribe((newState) => {
      setState(newState);
    });
    standardTenderDocumentsService.fetchDocuments();
    return unsubscribe;
  }, []);

  // ===== EXTRACT YEAR FROM DOCUMENT =====
  const extractYear = (doc) => {
    // Try to extract year from title
    const yearMatch = doc.title.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    // Try from modified date
    if (doc.modified) {
      const dateMatch = doc.modified.match(/\b(20\d{2})\b/);
      if (dateMatch) {
        return parseInt(dateMatch[1]);
      }
    }
    return 0;
  };

  // ===== GET UNIQUE YEARS FROM DOCUMENTS =====
  const getAvailableYears = useMemo(() => {
    const years = new Set();
    (archivedDocuments || []).forEach(doc => {
      const year = extractYear(doc);
      if (year > 0) {
        years.add(year);
      }
    });
    return ['All', ...Array.from(years).sort((a, b) => b - a)];
  }, [archivedDocuments]);

  // ===== FILTERED AND SORTED DOCUMENTS =====
  const filteredDocuments = useMemo(() => {
    let filtered = [...(archivedDocuments || [])];
    
    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(term)
      );
    }
    
    // Filter by year
    if (selectedYear !== 'All') {
      const yearNum = parseInt(selectedYear);
      filtered = filtered.filter(doc => {
        const docYear = extractYear(doc);
        return docYear === yearNum;
      });
    }
    
    // Sort by year (newest first)
    filtered.sort((a, b) => {
      const yearA = extractYear(a);
      const yearB = extractYear(b);
      return yearB - yearA;
    });
    
    return filtered;
  }, [archivedDocuments, searchTerm, selectedYear]);

  // ===== YEAR DROPDOWN HANDLERS =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.archived-std-hero_heading'),
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  // ===== RENDER FILE ICON =====
  const renderFileIcon = (doc) => {
    const icon = standardTenderDocumentsService.getFileIcon(doc.title, doc.icon, doc.fileType);
    
    if (icon.type === 'image') {
      return <img src={icon.url} alt="File icon" className="w-6 h-6 md:w-8 md:h-8 object-contain" />;
    }
    
    const fileType = doc.fileType || 'unknown';
    const iconMap = {
      'pdf': faFilePdf,
      'doc': faFileWord,
      'docx': faFileWord,
      'xls': faFileAlt,
      'xlsx': faFileAlt,
    };
    
    const faIcon = iconMap[fileType] || faFile;
    const colorMap = {
      'pdf': 'text-red-500',
      'doc': 'text-blue-500',
      'docx': 'text-blue-500',
      'xls': 'text-green-500',
      'xlsx': 'text-green-500',
    };
    const color = colorMap[fileType] || 'text-gray-400';
    
    return <FontAwesomeIcon icon={faIcon} className={`text-2xl md:text-3xl ${color}`} />;
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Archived Standard Tender Documents...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Archived Documents</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => standardTenderDocumentsService.fetchDocuments({ forceRefresh: true })}
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
      <Helmet>
        <title>Archived Standard Tender Documents | PPRA Kenya</title>
        <meta name="description" content="Access archived Standard Tender Documents - historical procurement documents from PPRA Kenya." />
        <meta name="keywords" content="archived standard tender documents, old STDs, PPRA, procurement, Kenya" />
        <meta property="og:title" content="Archived Standard Tender Documents - PPRA Kenya" />
        <meta property="og:description" content="Archived standard tender documents for historical reference." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/archived-standard-tender-documents" />
      </Helmet>

      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        
        .view-btn {
          transition: all 0.2s ease;
        }
        .view-btn.active {
          background-color: #201444;
          color: white;
        }
        
        .search-input:focus {
          border-color: #201444;
          ring: 2px solid rgba(32, 20, 68, 0.2);
        }
        
        .archived-doc-item {
          transition: background-color 0.2s ease;
        }
        .archived-doc-item:hover {
          background-color: #f8fafc;
        }
        
        .year-dropdown-btn {
          transition: all 0.2s ease;
        }
        .year-dropdown-btn:hover {
          background-color: #f3f4f6;
        }
        .year-dropdown-btn.active {
          background-color: #201444;
          color: white;
        }
        
        .year-option {
          transition: all 0.1s ease;
        }
        .year-option:hover {
          background-color: #f3f4f6;
        }
        .year-option.selected {
          background-color: #201444;
          color: white;
        }
        
        @media (max-width: 640px) {
          .archived-doc-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.875rem 0;
          }
          .archived-doc-item .doc-info {
            width: 100%;
          }
          .archived-doc-item .doc-download {
            align-self: flex-start;
          }
        }
      `}</style>

      {/* ===== HOVER MODE BANNER ===== */}
      {hoverModeActive && !bannerDismissedRef.current && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-[calc(100%-2rem)]">
          <div className="px-5 py-3 rounded-2xl shadow-2xl" style={{ 
            backgroundColor: 'rgba(0, 103, 47, 0.95)', 
            color: 'white' 
          }}>
            <div className="flex items-center gap-4 text-sm">
              <FontAwesomeIcon icon={faMousePointer} className="text-white" />
              <span className="font-semibold">Hover over any text to read it aloud</span>
              <button onClick={handleDismissBanner} className="ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TTS BUTTON ===== */}
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

        {/* ===== HERO SECTION ===== */}
        <section className="section-archived-std-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="archived-std-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img src={corporateSky} alt="Archived Standard Tender Documents" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="absolute inset-0 pointer-events-none flex">
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-none"></div>
                  <div className="w-1/5 border-r border-white/10"></div>
                  <div className="w-1/5 border-none"></div>
                </div>

                <div className="archived-std-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      <FontAwesomeIcon icon={faFileArchive} className="mr-2" />
                      Archived Documents
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    Archived Standard Tender Documents
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    Historical procurement documents for reference
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION ===== */}
        <section className="section-archived-std-content relative bg-white">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="z-index-1 relative">
            <div className="padding-global padding-section-large px-4 md:px-6 lg:px-12 py-10 md:py-24">
              <div className="container-large max-w-5xl mx-auto">
                <div ref={containerRef} className="archived-std-component">
                  
                  {/* ===== HEADER ===== */}
                  <div className="text-center mb-8 md:mb-12">
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        Archived Standard Tender Documents
                      </h2>
                    </div>
                    <div className="w-16 h-0.5 bg-primary-green mx-auto mt-3 md:mt-4"></div>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                      Browse through archived standard tender documents for historical reference
                    </p>
                  </div>

                  {/* ===== TOOLBAR ===== */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search archived documents..."
                        className="search-input w-full px-4 py-2.5 md:py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm md:text-base"
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      )}
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative" ref={yearDropdownRef}>
                      <button
                        onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        className="year-dropdown-btn inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all min-w-35 justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-purple" />
                          {selectedYear === 'All' ? 'All Years' : selectedYear}
                        </span>
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className={`text-gray-400 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>

                      {isYearDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full min-w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
                          {getAvailableYears.map((year) => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year);
                                setIsYearDropdownOpen(false);
                              }}
                              className={`year-option w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                                selectedYear === year 
                                  ? 'selected bg-primary-purple text-white' 
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span>{year === 'All' ? 'All Years' : year}</span>
                              {selectedYear === year && (
                                <span className="text-xs">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`view-btn px-3 py-2 text-sm transition-all ${
                          viewMode === 'list' ? 'active bg-primary-purple text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title="List View"
                      >
                        <FontAwesomeIcon icon={faList} />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`view-btn px-3 py-2 text-sm transition-all ${
                          viewMode === 'grid' ? 'active bg-primary-purple text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Grid View"
                      >
                        <FontAwesomeIcon icon={faTable} />
                      </button>
                    </div>
                  </div>

                  {/* ===== DOCUMENTS ===== */}
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-3">
                        <FontAwesomeIcon icon={faFileArchive} className="text-gray-300" />
                      </div>
                      <p className="font-medium">No archived documents found</p>
                      <p className="text-sm mt-1">Try adjusting your search or year filter</p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                      {filteredDocuments.map((doc, index) => {
                        const year = extractYear(doc);
                        return (
                          viewMode === 'grid' ? (
                            <div 
                              key={`${doc.id}-${index}`}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-4 md:p-5 flex flex-col"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className="shrink-0 mt-1">
                                  {renderFileIcon(doc)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 leading-snug">
                                    {doc.title}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {year > 0 && (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                        {year}
                                      </span>
                                    )}
                                    {doc.downloads > 0 && (
                                      <span className="text-xs text-gray-500">📥 {doc.downloads.toLocaleString()}</span>
                                    )}
                                    {doc.fileType && (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                                        {doc.fileType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <a 
                                href={doc.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-purple text-white text-sm font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm w-full"
                                download
                              >
                                <FontAwesomeIcon icon={faDownload} />
                                Download
                              </a>
                            </div>
                          ) : (
                            <div 
                              key={`${doc.id}-${index}`}
                              className="archived-doc-item bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-4 md:p-5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="shrink-0">
                                    {renderFileIcon(doc)}
                                  </div>
                                  <div className="doc-info min-w-0">
                                    <p className="text-sm md:text-base font-medium text-gray-900 leading-snug">
                                      {doc.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      {year > 0 && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                          {year}
                                        </span>
                                      )}
                                      {doc.downloads > 0 && (
                                        <span className="text-xs text-gray-500">📥 {doc.downloads.toLocaleString()}</span>
                                      )}
                                      {doc.fileType && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                                          {doc.fileType}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <a 
                                  href={doc.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="doc-download shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-purple text-white text-sm font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                                  download
                                >
                                  <FontAwesomeIcon icon={faDownload} />
                                  Download
                                </a>
                              </div>
                            </div>
                          )
                        );
                      })}
                    </div>
                  )}

                  {/* ===== DOCUMENT COUNT ===== */}
                  <div className="mt-10 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3 text-gray-600">
                      <span className="text-sm md:text-base font-medium">
                        Total Archived Documents:
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-primary-purple">
                        {filteredDocuments.length}
                      </span>
                    </div>
                    {selectedYear !== 'All' && (
                      <div className="mt-1 text-sm text-gray-400">
                        Filtered by year: {selectedYear}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION - Regional Network ===== */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
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
        </section>

      </main>
    </div>
  );
};

export default ArchivedSTDs;