// src/pages/cause-list/[slug].jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGavel,
  faCalendarAlt,
  faClock,
  faFilePdf,
  faDownload,
  faVideo,
  faTable,
  faTag,
  faUser,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faArrowLeft,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faSort,
  faTimes,
  faLink,
  faFileAlt,
  faFolderOpen,
  faMousePointer  // ===== ADD THIS =====
} from "@fortawesome/free-solid-svg-icons";
import { 
  fetchCauseListItemBySlug, 
  fetchCauseList, 
  transformPostToCauseListItem, 
  transformPostsToCauseList,
  getBlogCategoryColor 
} from './data/causeListData';
import WordPressTable from '../../../news/components/WordPressTable';

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../../../components/text-to-speech/TextToSpeech';

gsap.registerPlugin(ScrollTrigger);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR BOUNDARY COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ArticleErrorBoundary extends React.Component {
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
    console.error('ArticleErrorBoundary caught an error:', error, errorInfo);
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
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-500 mb-6" />
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Error Loading Article
            </h2>
            <p className="text-slate-600 mb-2">
              We encountered an error while loading this article.
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
                to="/administrative-review-board/cause-list"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Cause List
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
// MAIN CAUSE LIST ARTICLE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CauseListArticleContent = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [showTableInfo, setShowTableInfo] = useState(false);
  
  const articleRef = useRef(null);
  const contentRef = useRef(null);
  const relatedRef = useRef(null);
  const isMounted = useRef(true);
  const loadingRef = useRef(false);

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

  // Load article - wrapped in useCallback
  const loadArticle = useCallback(async () => {
    if (loadingRef.current) {
      console.log('Already loading, skipping duplicate request');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading Cause List article for slug:', slug);
      const post = await fetchCauseListItemBySlug(slug);
      
      if (!isMounted.current) return;
      
      console.log('Fetched post:', post);
      const transformed = transformPostToCauseListItem(post);
      console.log('Transformed cause list item:', transformed);
      console.log('Tables found:', transformed.tables);
      console.log('Files found:', transformed.files);
      setItem(transformed);
      
      // Load related items
      const relatedResult = await fetchCauseList({
        per_page: 3,
        exclude: [post.id],
        status: 'publish'
      });
      if (isMounted.current) {
        setRelatedItems(transformPostsToCauseList(relatedResult.posts));
      }
      
    } catch (error) {
      console.error('Error loading cause list article:', error);
      if (isMounted.current) {
        setError(error.message);
        setItem(null);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [slug]);

  // Load on mount and when slug changes
  useEffect(() => {
    isMounted.current = true;
    loadingRef.current = false;
    
    loadArticle();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadArticle]);

  // Handle file download
  const handleDownload = async (file) => {
    if (!file.downloadUrl) {
      setDownloadError('No download URL available for this file');
      return;
    }
    
    setDownloadingFile(file.title);
    setDownloadError(null);
    
    try {
      console.log('Downloading from URL:', file.downloadUrl);
      window.open(file.downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to download file. Please try again.');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  // GSAP animations
  useEffect(() => {
    if (!item) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const contentElements = document.querySelectorAll('.news-content > *');
        if (contentElements.length > 0) {
          gsap.fromTo('.news-content > *',
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: contentRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        }

        const tableWrappers = document.querySelectorAll('.table-responsive-wrapper');
        if (tableWrappers.length > 0) {
          gsap.fromTo('.table-responsive-wrapper',
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contentRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        }

        const relatedItems = document.querySelectorAll('.related-news-item');
        if (relatedItems.length > 0) {
          gsap.fromTo('.related-news-item',
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: relatedRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        }
      }, articleRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [item]);

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-5xl text-primary-purple animate-spin mb-4" />
          <p className="text-gray-600">Loading Cause List article...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Error Loading Article</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => loadArticle()}
            className="px-6 py-3 bg-primary-purple text-white font-semibold hover:bg-primary-purple-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Not Found State ──
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <FontAwesomeIcon icon={faGavel} className="text-5xl text-gray-300 mb-4" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Cause List Item Not Found</h2>
          <p className="text-slate-600 text-base md:text-lg lg:text-xl font-normal mb-8 max-w-xl mx-auto leading-relaxed">
            The cause list item you're looking for doesn't exist.
          </p>
          <Link to="/administrative-review-board/cause-list" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white font-semibold text-sm md:text-base hover:bg-primary-purple-dark transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Cause List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={articleRef} className="bg-white min-h-screen">
      
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
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5"></div>
          <div className="w-1/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-550/10 via-slate-550/5 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link to="/administrative-review-board/cause-list" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 md:mb-6 text-sm md:text-base font-medium">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Cause List
          </Link>
          
          {item.caseNumber && (
            <div className="mb-4 inline-flex items-center gap-2 bg-purple-600/20 text-purple-200 text-sm px-4 py-1 rounded border border-purple-500/30">
              <FontAwesomeIcon icon={faGavel} />
              Case #{item.caseNumber}
            </div>
          )}
          
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {item.title}
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section ref={contentRef} className="relative py-10 md:py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5"></div>
          <div className="w-1/5"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
            <span className={`text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 border flex items-center gap-1 ${getBlogCategoryColor(item.category)}`}>
              <FontAwesomeIcon icon={faFolderOpen} className="text-xs" />
              {item.category}
            </span>
            <span className="text-xs md:text-base text-gray-500 font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarAlt} />
              {formatDate(item.date)}
            </span>
            <span className="text-xs md:text-base text-gray-500 font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faUser} />
              {item.author}
            </span>
            
            {item.hearingDate && (
              <span className="bg-blue-100 text-blue-800 text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 border border-blue-200 flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {formatDate(item.hearingDate)} {item.hearingTime && `at ${formatTime(item.hearingTime)}`}
              </span>
            )}
            
            {item.zoomLink && (
              <a 
                href={item.zoomLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-green-100 text-green-800 text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 border border-green-200 flex items-center gap-1 hover:bg-green-200 transition-colors"
              >
                <FontAwesomeIcon icon={faVideo} />
                Join Zoom Meeting
              </a>
            )}
            
            {item.tableCount > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 border border-indigo-200 flex items-center gap-1">
                <FontAwesomeIcon icon={faTable} />
                {item.tableCount} Table{item.tableCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Featured Image */}
          {item.image && (
            <div className="mb-6 md:mb-10 overflow-hidden bg-gray-200">
              <img src={item.image} alt={item.title} className="w-full h-auto" />
            </div>
          )}

          {/* Content */}
          <div 
            className="news-content prose prose-sm md:prose-lg max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />

          {/* Tables */}
          {item.tables && item.tables.length > 0 && (
            <div className="tables-section mt-8 md:mt-12">
              {item.tables.map((table, index) => (
                <WordPressTable
                  key={index}
                  tableData={table.data}
                  tableIndex={index}
                  caption={table.caption}
                  showPagination={table.data.length > 10}
                  showSearch={table.data.length > 5}
                  pageSize={10}
                />
              ))}
            </div>
          )}

          {/* Table Info Toggle */}
          {item.tableCount > 0 && (
            <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTableInfo(!showTableInfo)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                {showTableInfo ? 'Hide' : 'Show'} table tips
              </button>
              {showTableInfo && (
                <p className="w-full text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faSort} className="text-gray-400" />
                  Click column headers to sort tables. Use search to filter data.
                </p>
              )}
            </div>
          )}

          {/* Files/Downloads Section */}
          {item.files && item.files.length > 0 && (
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilePdf} />
                Related Files &amp; Downloads
              </h4>
              
              {downloadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {downloadError}
                </div>
              )}
              
              <div className="space-y-3">
                {item.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center bg-primary-purple/10 shrink-0">
                        <FontAwesomeIcon icon={faFilePdf} className="text-primary-purple" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base font-semibold text-slate-900 truncate">{file.title}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingFile === file.title}
                      className="px-4 py-2 bg-primary-purple text-white text-sm font-semibold hover:bg-primary-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 ml-4"
                    >
                      {downloadingFile === file.title ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faDownload} />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 md:mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-slate-700 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-base font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faTag} className="text-gray-400 text-xs" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 md:mt-8">
            <Link to="/administrative-review-board/cause-list" className="inline-flex items-center gap-2 text-primary-purple font-semibold text-sm md:text-base hover:underline">
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Cause List
            </Link>
          </div>
        </div>
      </section>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section ref={relatedRef} className="relative py-10 md:py-20 bg-gray-50 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5"></div>
            <div className="w-1/5"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <h3 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-3">
              <FontAwesomeIcon icon={faGavel} className="text-primary-purple" />
              Related Cause List Items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedItems.map((related) => (
                <article key={related.id} className="related-news-item group bg-white border border-gray-200">
                  <Link to={`/administrative-review-board/cause-list/${related.slug}`} className="block p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded flex items-center gap-1 ${getBlogCategoryColor(related.category)}`}>
                        <FontAwesomeIcon icon={faFolderOpen} className="text-xs" />
                        {related.category}
                      </span>
                      {related.caseNumber && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded flex items-center gap-1">
                          <FontAwesomeIcon icon={faGavel} className="text-xs" />
                          #{related.caseNumber}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-base md:text-xl font-bold text-slate-900 mb-1 md:mb-2 leading-tight line-clamp-2">
                      <Link to={`/administrative-review-board/cause-list/${related.slug}`} className="text-slate-900 hover:text-primary-purple transition-colors">
                        {related.title}
                      </Link>
                    </h4>
                    
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal line-clamp-2">
                      {related.summary}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {related.hearingDate && (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {formatDate(related.hearingDate)}
                        </span>
                      )}
                      {related.files && related.files.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faFilePdf} />
                          {related.files.length} file{related.files.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {related.tableCount > 0 && (
                        <span className="flex items-center gap-1 text-indigo-600">
                          <FontAwesomeIcon icon={faTable} />
                          {related.tableCount} table{related.tableCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Regional Offices */}
      <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <div>
            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-10 text-center flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faBuilding} />
              Our Regional Network
              <FontAwesomeIcon icon={faBuilding} />
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
              {/* Nairobi - Head Office */}
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Nairobi (HQ)
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2" />
                    KISM Towers, 6th Floor, Ngong Road<br />
                    P.O Box 58535-00200<br />
                    Nairobi, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-500" />
                    <a href="tel:+2540203244000" className="text-white hover:text-sky-400 transition-colors font-medium">+254 020 3244000</a>
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <a href="mailto:info@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">info@ppra.go.ke</a>
                  </p>
                </div>
              </div>

              {/* Mombasa */}
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Mombasa
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2" />
                    Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive<br />
                    P.O Box 2605-80100<br />
                    Mombasa, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-500" />
                    <a href="tel:0412224040" className="text-white hover:text-sky-400 transition-colors font-medium">041 2224040</a>
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-500" />
                    <a href="tel:0700195220" className="text-white hover:text-sky-400 transition-colors font-medium">0700 195220</a>
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <a href="mailto:mombasa@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">mombasa@ppra.go.ke</a>
                  </p>
                </div>
              </div>

              {/* Kisumu */}
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Kisumu
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2" />
                    Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue<br />
                    P.O Box 2916-40100<br />
                    Kisumu, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-slate-500" />
                    <a href="tel:0572024000" className="text-white hover:text-sky-400 transition-colors font-medium">057 2024000</a>
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <a href="mailto:kisumu@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">kisumu@ppra.go.ke</a>
                  </p>
                </div>
              </div>

              {/* Eldoret */}
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Eldoret
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2" />
                    Ainabkoi Sub County Offices<br />
                    P.O Box 799-30100<br />
                    Eldoret, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <a href="mailto:eldoret@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">eldoret@ppra.go.ke</a>
                  </p>
                </div>
              </div>

              {/* Nakuru */}
              <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Nakuru
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-500 mr-2" />
                    Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />
                    P.O Box 15424-20100<br />
                    Nakuru, Kenya
                  </p>
                </div>
                <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                  <p className="text-slate-400 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <a href="mailto:nakuru@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">nakuru@ppra.go.ke</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles */}
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

        .news-content h1, .news-content h2, .news-content h3 {
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .news-content h1 { font-size: 1.75rem; }
        .news-content h2 { font-size: 1.5rem; }
        .news-content h3 { font-size: 1.25rem; }
        .news-content p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        .news-content ul, .news-content ol {
          margin: 0.75rem 0;
          padding-left: 1.25rem;
        }
        .news-content ul li, .news-content ol li {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .news-content a {
          color: #201444;
          text-decoration: underline;
        }

        /* ── HIDE WPDM BLOCKS ── */
        .news-content .w3eden {
          display: none !important;
        }
        .news-content .wpdm-link-tpl {
          display: none !important;
        }
        .news-content .link-template-default {
          display: none !important;
        }

        @media (min-width: 768px) {
          .news-content h1 { font-size: 2.25rem; }
          .news-content h2 { font-size: 1.875rem; }
          .news-content h3 { font-size: 1.5rem; }
          .news-content p {
            font-size: 1.125rem;
            line-height: 1.75;
            margin-bottom: 1rem;
          }
          .news-content ul li, .news-content ol li {
            font-size: 1.125rem;
            line-height: 1.75;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WRAPPED EXPORT WITH ERROR BOUNDARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CauseListArticle = () => {
  return (
    <ArticleErrorBoundary>
      <CauseListArticleContent />
    </ArticleErrorBoundary>
  );
};

export default CauseListArticle;