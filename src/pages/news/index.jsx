// src/pages/news/News.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";
import { fetchBlogPosts } from '../../services/blogApi';
import { 
  transformPostsToBlogs, 
  getBlogCategoryColor,
  getBlogCategories,
  getBlogCategoryCount,
  getFilteredBlogs
} from './data/newsData';

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

import corporateSky from '../../assets/commonPics/ppra building.jpeg';

gsap.registerPlugin(ScrollTrigger);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR BOUNDARY COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center px-6 max-w-2xl">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Something Went Wrong
            </h2>
            <p className="text-slate-600 mb-2">
              We encountered an error while loading this page.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-6 font-mono">
                {this.state.error.toString()}
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary-purple text-white font-semibold hover:bg-primary-purple-dark transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN NEWS COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const News = () => {
  const [newsData, setNewsData] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  
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
    loadNews();
  }, []);

  const loadNews = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading news...');
      const result = await fetchBlogPosts({ 
        per_page: 9,
        page: page,
        status: 'publish'
      });
      
      console.log('API Result:', result);
      
      if (!result.posts || result.posts.length === 0) {
        console.log('No posts returned from API');
        setNewsData([]);
        setFilteredNews([]);
        setCategories(['All']);
        setIsLoading(false);
        return;
      }
      
      const transformed = transformPostsToBlogs(result.posts);
      console.log('Transformed news:', transformed);
      
      setNewsData(transformed);
      setFilteredNews(transformed);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      
      const allCategories = getBlogCategories(transformed);
      console.log('Categories:', allCategories);
      setCategories(allCategories);
      
    } catch (error) {
      console.error('Error loading news:', error);
      setError(error.message);
      setNewsData([]);
      setFilteredNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    setIsFiltering(true);
    const filtered = getFilteredBlogs(newsData, category);
    setFilteredNews(filtered);
    setTimeout(() => setIsFiltering(false), 300);
  };

  useEffect(() => {
    if (filteredNews.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo('.news-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [filteredNews]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Error Loading News</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => loadNews()}
            className="px-6 py-3 bg-primary-purple text-white font-semibold hover:bg-primary-purple-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (newsData.length === 0) {
    return (
      <div className="min-h-screen bg-white">
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
                <div className="shrink-0">
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
                  className="shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  aria-label="Dismiss"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        <section className="relative py-20 md:py-32 bg-slate-950 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <img src={corporateSky} alt="PPRA News" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
              PPRA News
            </h1>
            <p className="mt-2 md:mt-4 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto text-slate-300 font-medium leading-relaxed tracking-wide">
              Latest updates and announcements from the Public Procurement Regulatory Authority
            </p>
          </div>
        </section>
        <section className="py-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-gray-400 text-6xl mb-6">📰</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">No News Articles Found</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              There are currently no news articles available. Please check back later for updates.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white font-semibold hover:bg-primary-purple-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Homepage
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <ErrorBoundary onRetry={() => loadNews(currentPage)}>
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
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
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
                <div className="shrink-0">
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
                  className="shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  aria-label="Dismiss"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <img src={corporateSky} alt="PPRA News" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
              PPRA News
            </h1>
            <p className="mt-2 md:mt-4 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto text-slate-300 font-medium leading-relaxed tracking-wide">
              Latest updates and announcements from the Public Procurement Regulatory Authority
            </p>
            {newsData.some(blog => blog.tableCount > 0) && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 border border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Articles include data tables
              </div>
            )}
          </div>
        </section>

        {/* News Section */}
        <section className="relative py-12 md:py-20 px-4 md:px-6 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto">
            
            {/* Category Filter */}
            <div className="overflow-x-auto pb-4 mb-8 md:mb-12 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => {
                  const count = getBlogCategoryCount(newsData, category);
                  const isActive = selectedCategory === category;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => filterByCategory(category)}
                      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 text-xs md:text-sm lg:text-base font-semibold transition-colors duration-300 whitespace-nowrap ${
                        isActive 
                          ? 'bg-primary-purple text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                      }`}
                    >
                      <span>{category}</span>
                      <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* News Grid */}
            <div 
              ref={gridRef}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-opacity duration-300 ${
                isFiltering ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {filteredNews.map((newsItem) => (
                <article key={newsItem.id} className="news-item group bg-white border border-gray-200">
                  {/* Image */}
                  <Link to={`/news/${newsItem.slug}`} className="block relative h-48 md:h-56 bg-gray-200 overflow-hidden">
                    {newsItem.image ? (
                      <img 
                        src={newsItem.image} 
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-sm">No Image</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                    {newsItem.isFeatured && (
                      <span className="absolute top-2 md:top-3 right-2 md:right-3 bg-primary-purple text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1">
                        Featured
                      </span>
                    )}
                    <span className={`absolute bottom-2 md:bottom-3 left-2 md:left-3 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 border ${getBlogCategoryColor(newsItem.category)}`}>
                      {newsItem.category}
                    </span>
                    
                    {/* Table indicator badge */}
                    {newsItem.tableCount > 0 && (
                      <span className="absolute top-2 md:top-3 right-2 md:right-3 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 border border-indigo-200 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {newsItem.tableCount}
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4 md:p-6">
                    <div className="text-xs md:text-base text-gray-500 mb-2 md:mb-3">
                      {formatDate(newsItem.date)}
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5 md:mb-2 leading-tight line-clamp-2">
                      <Link to={`/news/${newsItem.slug}`} className="text-slate-900 hover:text-primary-purple transition-colors">
                        {newsItem.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal line-clamp-3">
                      {newsItem.summary}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {/* File count badge */}
                      {newsItem.files && newsItem.files.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span>{newsItem.files.length} file{newsItem.files.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {/* Table badge */}
                      {newsItem.tableCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-indigo-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{newsItem.tableCount} table{newsItem.tableCount > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 md:mt-4 flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                      <span className="text-xs md:text-base text-gray-500">By {newsItem.author}</span>
                      <Link 
                        to={`/news/${newsItem.slug}`} 
                        className="text-primary-purple font-semibold text-xs md:text-base inline-flex items-center gap-1 hover:text-primary-purple-dark transition-colors"
                      >
                        Read More
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {filteredNews.length === 0 && !isLoading && (
              <div className="text-center py-12 md:py-16">
                <p className="text-gray-500 text-base md:text-lg">No news articles found in category: <span className="font-semibold text-gray-700">{selectedCategory}</span></p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 md:mt-12">
                <button
                  onClick={() => loadNews(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-primary-purple text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => loadNews(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA SECTION - Regional Offices */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Offices Directory Grid */}
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
      </div>
    </ErrorBoundary>
  );
};

export default News;