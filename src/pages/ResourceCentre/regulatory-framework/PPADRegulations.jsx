// src/pages/ResourceCentre/Regulations.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMousePointer, 
  faFilePdf, 
  faFileWord, 
  faFileExcel,
  faFileAlt,
  faSearch,
  faDownload,
  faCalendarDay,
  faCloudDownloadAlt,
  faSort,
  faSortUp,
  faSortDown
} from "@fortawesome/free-solid-svg-icons";
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import logoImage from '../../../assets/commonPics/circle logo for ppra.png';
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';
import ppadRegulationsService from '../../../services/PPADregulationsService';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Regulations = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Service state
  const [state, setState] = useState(() => ppadRegulationsService.getState());
  const { files, loading, error, total } = state;

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== FILTERED AND SORTED FILES =====
  const getFilteredAndSortedFiles = useCallback(() => {
    let result = [...files];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(f => 
        f.name.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'downloads') {
        valA = a.downloads || 0;
        valB = b.downloads || 0;
      } else {
        valA = a.modified || '';
        valB = b.modified || '';
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [files, searchTerm, sortBy, sortOrder]);

  const filteredFiles = getFilteredAndSortedFiles();

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredFiles.length);
  const currentFiles = filteredFiles.slice(startIndex, endIndex);

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

  // ===== SUBSCRIBE TO SERVICE =====
  useEffect(() => {
    const unsubscribe = ppadRegulationsService.subscribe((newState) => {
      setState(newState);
    });
    ppadRegulationsService.fetchRegulations();
    return unsubscribe;
  }, []);

  // ===== RESET PAGE WHEN FILTERS CHANGE =====
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // ===== GSAP Animations =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelector('.regulations-hero_heading'),
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

  // ===== PAGINATION CONTROLS =====
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    const tableElement = document.querySelector('.regulations-table-container');
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

  // ===== GET FILE ICON =====
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const icons = {
      'pdf': { icon: faFilePdf, color: 'text-red-600' },
      'doc': { icon: faFileWord, color: 'text-blue-600' },
      'docx': { icon: faFileWord, color: 'text-blue-600' },
      'xls': { icon: faFileExcel, color: 'text-green-600' },
      'xlsx': { icon: faFileExcel, color: 'text-green-600' },
    };
    return icons[ext] || { icon: faFileAlt, color: 'text-gray-600' };
  };

  // ===== TOGGLE SORT =====
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // ===== GET SORT ICON =====
  const getSortIcon = (field) => {
    if (sortBy !== field) return faSort;
    return sortOrder === 'asc' ? faSortUp : faSortDown;
  };

  // ===== LOADING STATE =====
  if (loading && files.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading PPAD Regulations...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && files.length === 0) {
    return (
      <div className="page-wrapper bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4 text-red-500">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Regulations</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => ppadRegulationsService.fetchRegulations({ forceRefresh: true })}
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
        <title>PPAD Regulations | PPRA Kenya</title>
        <meta name="description" content="Access PPRA PPAD Regulations - Public Procurement and Asset Disposal regulations, legal notices, and regulatory frameworks for procurement in Kenya." />
        <meta name="keywords" content="regulations, PPRA, PPAD, procurement, Kenya, public procurement, legal notices, procurement regulations" />
        <meta property="og:title" content="PPAD Regulations - PPRA Kenya" />
        <meta property="og:description" content="Public Procurement and Asset Disposal regulations and legal frameworks." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={logoImage} />
        <link rel="canonical" href="https://ppra.go.ke/regulations" />
      </Helmet>

      {/* ===== GLOBAL STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
        .line-wrapper { z-index: 0; }
        .z-index-1 { z-index: 1; }
        
        .regulation-row {
          transition: background-color 0.2s ease;
        }
        .regulation-row:hover {
          background-color: #f8fafc;
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

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @media (max-width: 640px) {
          .regulation-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 1rem 0;
          }
          .regulation-row .regulation-name {
            font-size: 0.875rem;
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

        {/* ===== HERO SECTION - MINIMAL DESIGN ===== */}
        <section className="section-regulations-hero relative pt-8">
          <div className="line-wrapper is-invert absolute inset-0 pointer-events-none flex">
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-none"></div>
            <div className="vertical-line w-1/5 border-r border-gray-200"></div>
            <div className="vertical-line w-1/5 border-none"></div>
          </div>

          <div className="padding-global z-index-1 relative px-4 md:px-6 lg:px-12">
            <div className="container-large max-w-7xl mx-auto">
              <div ref={heroRef} className="regulations-hero_component relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                  <img src={corporateSky} alt="PPRA PPAD Regulations" className="w-full h-full object-cover" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-primary-purple-dark/60"></div>
                
                <div className="regulations-hero_heading max-w-4xl mx-auto text-center z-10 px-4">
                  {/* ===== RECTANGULAR PILL BADGE - NO ICON ===== */}
                  <div className="pill-wrapper mb-3 md:mb-4">
                    <span className="pill is-white inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 uppercase border border-white/30">
                      Public Procurement Framework
                    </span>
                  </div>
                  <h1 className="heading-style-h1 text-white text-3xl md:text-5xl lg:text-6xl font-bold animate-fadeInUp">
                    PPAD Regulations
                  </h1>
                  <p className="text-white text-sm md:text-xl mt-2 md:mt-4 opacity-90 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    Public Procurement and Asset Disposal regulations and legal frameworks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION - MINIMAL DESIGN ===== */}
        <section className="section-regulations-content relative bg-white">
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
                <div ref={containerRef} className="regulations-component">
                  
                  {/* ===== CENTERED HEADER - NO ICONS ===== */}
                  <div className="text-center mb-8 md:mb-12">
                    {/* ===== RECTANGULAR PILL BADGE - NO ICON ===== */}
                    <div className="pill-wrapper flex justify-center mb-4">
                      <div className="pill is-black inline-block bg-primary-purple text-white text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 uppercase tracking-wider font-bold">
                        PPAD Regulations Library
                      </div>
                    </div>
                    <div className="heading-animate">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-purple leading-tight">
                        PPAD Regulations Library
                      </h2>
                    </div>
                    <div className="w-16 h-0.5 bg-primary-green mx-auto mt-3 md:mt-4"></div>
                  </div>
                  
                  {/* ===== DESCRIPTION - NO ICONS ===== */}
                  <div>
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6">
                      The Public Procurement and Asset Disposal Act, 2015 provides the legal framework for public procurement in Kenya. The regulations below provide detailed procedures, guidelines, and requirements for the implementation of the Act.
                    </p>
                    
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6">
                      These regulations cover various aspects including procurement planning, tender procedures, evaluation criteria, contract management, and dispute resolution mechanisms.
                    </p>
                    
                    <p className="description-para text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                      All procuring entities are required to comply with these regulations to ensure transparency, fairness, and value for money in public procurement.
                    </p>
                  </div>

                  {/* ===== SEARCH AND FILTERS ===== */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search PPAD regulations by name..."
                          className="w-full px-4 py-2.5 md:py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent text-sm md:text-base"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Sort:</span>
                      <button
                        onClick={() => toggleSort('name')}
                        className={`px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                          sortBy === 'name'
                            ? 'border-primary-purple bg-primary-purple/5 text-primary-purple'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Name <FontAwesomeIcon icon={getSortIcon('name')} className="ml-1" />
                      </button>
                      <button
                        onClick={() => toggleSort('downloads')}
                        className={`px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                          sortBy === 'downloads'
                            ? 'border-primary-purple bg-primary-purple/5 text-primary-purple'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Downloads <FontAwesomeIcon icon={getSortIcon('downloads')} className="ml-1" />
                      </button>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-red-600 text-sm font-medium hover:text-red-700"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ===== FILES TABLE ===== */}
                  <div className="regulations-table-container">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {/* Files Table - Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                                PPAD Regulation Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FontAwesomeIcon icon={faCloudDownloadAlt} className="mr-2" />
                                Downloads
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                                Last Modified
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentFiles.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                  <div className="text-4xl mb-3">
                                    <FontAwesomeIcon icon={faFileAlt} className="text-gray-300" />
                                  </div>
                                  <p className="font-medium">No PPAD regulations found</p>
                                  <p className="text-sm mt-1">Try adjusting your search</p>
                                </td>
                              </tr>
                            ) : (
                              currentFiles.map((file, index) => {
                                const iconInfo = getFileIcon(file.name);
                                return (
                                  <tr key={`${file.id}-${index}`} className="regulation-row">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="shrink-0">
                                          <FontAwesomeIcon 
                                            icon={iconInfo.icon} 
                                            className={`text-lg ${iconInfo.color}`} 
                                          />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                          {file.source === 'wpdm' && file.size && (
                                            <span className="text-xs text-gray-400">{file.size}</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {file.downloads > 0 ? file.downloads.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                      {file.modified || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                      <button
                                        onClick={() => ppadRegulationsService.downloadFile(file.downloadUrl, file.name)}
                                        className="download-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-purple text-white text-sm font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                                      >
                                        <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
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
                            <div className="text-4xl mb-3">
                              <FontAwesomeIcon icon={faFileAlt} className="text-gray-300" />
                            </div>
                            <p className="font-medium">No PPAD regulations found</p>
                          </div>
                        ) : (
                          currentFiles.map((file, index) => {
                            const iconInfo = getFileIcon(file.name);
                            return (
                              <div key={`${file.id}-${index}`} className="p-4 border-b border-gray-100">
                                <div className="flex items-start gap-3">
                                  <div className="shrink-0 mt-0.5">
                                    <FontAwesomeIcon icon={iconInfo.icon} className={`text-lg ${iconInfo.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 leading-snug">{file.name}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                      {file.source === 'wpdm' && file.size && (
                                        <span>{file.size}</span>
                                      )}
                                      {file.downloads > 0 && (
                                        <span>📥 {file.downloads.toLocaleString()}</span>
                                      )}
                                      {file.modified && (
                                        <span>{file.modified}</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => ppadRegulationsService.downloadFile(file.downloadUrl, file.name)}
                                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-purple text-white text-xs font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                                    >
                                      <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
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

                  {/* ===== PAGINATION ===== */}
                  {filteredFiles.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                        <span className="font-medium text-gray-700">{endIndex}</span> of{' '}
                        <span className="font-medium text-gray-700">{filteredFiles.length}</span> PPAD regulations
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

                  {/* ===== FOOTER INFO ===== */}
                  {filteredFiles.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                      <span>Showing {filteredFiles.length} of {total} PPAD regulations</span>
                      <span className="text-xs text-gray-400">Data sourced from PPRA PPAD Regulations page</span>
                    </div>
                  )}

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

export default Regulations;