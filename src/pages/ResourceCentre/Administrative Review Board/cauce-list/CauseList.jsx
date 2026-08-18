// src/pages/cause-list/CauseList.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGavel, 
  faScaleBalanced,
  faCalendarAlt,
  faClock,
  faFilePdf,
  faVideo,
  faSearch,
  faChevronRight,
  faChevronLeft,
  faSpinner,
  faExclamationTriangle,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faTable,
  faTag,
  faUser,
  faFilter,
  faTimes,
  faMousePointer
} from "@fortawesome/free-solid-svg-icons";
import { 
  fetchCauseList, 
  transformPostsToCauseList,
  getBlogCategoryColor,
  getUpcomingCauseListItems,
  getPastCauseListItems
} from './data/causeListData';

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../../components/text-to-speech/TextToSpeech';

gsap.registerPlugin(ScrollTrigger);

const CauseList = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const containerRef = useRef(null);
  const gridRef = useRef(null);

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

  useEffect(() => {
    loadCauseList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, activeFilter, searchTerm]);

  const loadCauseList = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCauseList({ 
        per_page: 10,
        page: page,
        status: 'publish'
      });
      
      const transformed = transformPostsToCauseList(result.posts);
      setItems(transformed);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      
    } catch (error) {
      console.error('Error loading Cause List:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];
    
    switch (activeFilter) {
      case 'upcoming':
        filtered = getUpcomingCauseListItems(items);
        break;
      case 'past':
        filtered = getPastCauseListItems(items);
        break;
      default:
        filtered = items;
        break;
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        (item.caseNumber && item.caseNumber.toLowerCase().includes(term)) ||
        item.summary.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-5xl text-primary-purple animate-spin mb-4" />
          <p className="text-gray-600">Loading Cause List...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Cause List</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => loadCauseList()}
            className="px-6 py-3 bg-primary-purple text-white font-semibold hover:bg-primary-purple-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white min-h-screen">
      
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

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-slate-950 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FontAwesomeIcon icon={faGavel} className="text-5xl md:text-6xl text-white/20 mb-4" />
          <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white">
            Cause List
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Public Procurement Administrative Review Board cause list
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-6 px-4 md:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-semibold rounded transition-colors flex items-center gap-2 ${
                activeFilter === 'all' 
                  ? 'bg-primary-purple text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faScaleBalanced} />
              All Items
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 text-sm font-semibold rounded transition-colors flex items-center gap-2 ${
                activeFilter === 'upcoming' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              Upcoming
            </button>
            <button
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-2 text-sm font-semibold rounded transition-colors flex items-center gap-2 ${
                activeFilter === 'past' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faClock} />
              Past
            </button>
          </div>
          
          <div className="flex-1 min-w-50 relative">
            <input
              type="text"
              placeholder="Search by case number or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded focus:outline-none focus:border-primary-purple"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cause List Grid */}
      <section ref={gridRef} className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faScaleBalanced} className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No items found for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <article key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/administrative-review-board/cause-list/${item.slug}`} className="block p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 border rounded flex items-center gap-1 ${
                        item.isUpcoming 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : item.isPast 
                            ? 'bg-gray-100 text-gray-800 border-gray-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        <FontAwesomeIcon icon={item.isUpcoming ? faCalendarAlt : faClock} className="text-xs" />
                        {item.isUpcoming ? 'Upcoming' : item.isPast ? 'Completed' : item.status}
                      </span>
                      {item.caseNumber && (
                        <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded flex items-center gap-1">
                          <FontAwesomeIcon icon={faGavel} className="text-xs" />
                          Case #{item.caseNumber}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {item.hearingDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        <span>{formatDate(item.hearingDate)}</span>
                        {item.hearingTime && (
                          <>
                            <span className="text-gray-300">|</span>
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            <span>{item.hearingTime}</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                        {item.author}
                      </span>
                      <div className="flex items-center gap-3">
                        {item.files && item.files.length > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faFilePdf} />
                            {item.files.length}
                          </span>
                        )}
                        {item.zoomLink && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <FontAwesomeIcon icon={faVideo} />
                            Live
                          </span>
                        )}
                        <span className="text-primary-purple text-sm font-semibold flex items-center gap-1">
                          View
                          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => loadCauseList(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors rounded flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
                Previous
              </button>
              <span className="px-4 py-2 bg-primary-purple text-white rounded flex items-center gap-2">
                <FontAwesomeIcon icon={faGavel} className="text-xs" />
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => loadCauseList(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors rounded flex items-center gap-2"
              >
                Next
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .line-clamp-3 {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default CauseList;