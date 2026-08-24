// src/pages/ResourceCentre/circulars/Circulars.jsx
// ===== COMPLETE PAGINATION WITH YEAR FILTER =====

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import circularsService from '../../../services/circularsService';
import TextToSpeech from '../../../components/text-to-speech/TextToSpeech';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";
import corporateSky from '../../../assets/commonPics/ppra building.jpeg';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Circulars = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  
  // ===== STATE =====
  const [state, setState] = useState(() => circularsService.getState());
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

  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // ===== AUTO-DISMISS BANNER =====
  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => setShowBanner(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

  // ===== ESCAPE KEY DISMISS =====
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive) handleDismissBanner();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [hoverModeActive, handleDismissBanner]);

  // ===== SUBSCRIBE TO SERVICE =====
  useEffect(() => {
    const unsubscribe = circularsService.subscribe((newState) => {
      setState(newState);
    });
    circularsService.fetchCirculars();
    return unsubscribe;
  }, []);

  // ===== RESET PAGE WHEN FILTERS CHANGE =====
  useEffect(() => {
    setCurrentPage(1);
  }, [state.filters?.searchTerm, state.filters?.sortBy, state.filters?.sortOrder, state.filters?.yearFilter]);

  // ===== DESTRUCTURE STATE =====
  const { filteredFiles, loading, error, filters, availableYears } = state;

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
    
    // Smooth scroll to table
    const tableElement = document.querySelector('.circulars-table-container');
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

  // ===== GENERATE PAGE NUMBERS WITH SMART ELLIPSIS =====
  const getPageNumbers = useCallback(() => {
    const { totalPages, currentPage } = paginationData;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);
    
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 5);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    if (startPage > 2) {
      pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [paginationData]);

  // ===== HANDLERS =====
  const handleSearch = useCallback((e) => {
    circularsService.updateFilter('searchTerm', e.target.value);
  }, []);

  const handleSort = useCallback((sortBy) => {
    if (filters.sortBy === sortBy) {
      circularsService.updateFilter('sortOrder', 
        filters.sortOrder === 'desc' ? 'asc' : 'desc'
      );
    } else {
      circularsService.updateFilter('sortBy', sortBy);
      circularsService.updateFilter('sortOrder', 'desc');
    }
  }, [filters.sortBy, filters.sortOrder]);

  const handleYearFilter = useCallback((year) => {
    circularsService.updateFilter('yearFilter', year);
  }, []);

  const clearFilters = useCallback(() => {
    circularsService.resetFilters();
  }, []);

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      heroRef.current.querySelectorAll('.hero-fade-in').forEach((el, index) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: index * 0.15, ease: 'power2.out' }
        );
      });
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [loading]);

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading circulars...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Circulars</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => circularsService.fetchCirculars()}
            className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-light"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="page-wrapper bg-white">
      {/* ===== STYLES ===== */}
      <style>{`
        .hover-mode-active * { cursor: pointer !important; }
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
        .year-filter-select {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 2rem 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          transition: all 0.2s ease;
          min-width: 140px;
        }
        .year-filter-select:focus {
          outline: none;
          ring: 2px solid #201444;
          border-color: #201444;
        }
        .year-filter-select:hover {
          border-color: #201444;
        }
        .year-badge {
          background: linear-gradient(135deg, #201444, #3d2a6b);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .active-filter-chip {
          background: #201444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .active-filter-chip button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.8;
          padding: 0;
          font-size: 0.875rem;
        }
        .active-filter-chip button:hover {
          opacity: 1;
        }
      `}</style>

      {/* ===== TTS BANNER ===== */}
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
                ✕
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
        />
      </div>

      <main className="main-wrapper">
        {/* ===== HERO SECTION ===== */}
        <section className="relative pt-8">
          <div className="padding-global px-4 md:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div ref={heroRef} className="relative h-[45vh] md:h-[50vh] lg:h-[55vh] flex items-center justify-center rounded-none border border-slate-200 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 opacity-40">
                  <img src={corporateSky} alt="PPRA Circulars" className="w-full h-full object-cover grayscale brightness-75" loading="eager" />
                </div>
                <div className="text-center z-10 px-4 max-w-4xl mx-auto">
                  <div className="mb-3 md:mb-4 hero-fade-in">
                    <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-white bg-purple-950 px-3 md:px-4 py-1 md:py-1.5 border border-purple-800">
                      Public Procurement Oversight
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight hero-fade-in">
                    Circulars
                  </h1>
                  <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium mt-3 md:mt-4 max-w-xl mx-auto hero-fade-in">
                    Official circulars from the Public Procurement Regulatory Authority
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FILES SECTION ===== */}
        <section className="relative bg-white py-10 md:py-20 px-4 md:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div ref={containerRef}>
              {/* Heading */}
              <div className="heading-animate mb-6 md:mb-8 text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-primary-purple mb-2">
                  Circulars Library
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  Browse through official PPRA circulars and guidelines
                </p>
              </div>

              {/* ===== SEARCH, FILTERS, AND SORT ===== */}
              <div className="flex flex-col gap-4 mb-6 md:mb-8">
                {/* Row 1: Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.searchTerm || ''}
                      onChange={handleSearch}
                      placeholder="Search circulars by title or description..."
                      className="w-full px-4 py-2.5 md:py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Row 2: Filters and Sort */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Year Filter Dropdown */}
                  {availableYears && availableYears.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">
                        📅 Year:
                      </span>
                      <select
                        value={filters.yearFilter || 'all'}
                        onChange={(e) => handleYearFilter(e.target.value)}
                        className="year-filter-select"
                      >
                        <option value="all">All Years</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sort Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600">Sort by:</span>
                    <button
                      onClick={() => handleSort('year')}
                      className={`px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                        filters.sortBy === 'year' 
                          ? 'border-primary-purple bg-primary-purple/5 text-primary-purple' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Year {filters.sortBy === 'year' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('name')}
                      className={`px-3 py-1.5 md:py-2 rounded-md border text-xs md:text-sm font-medium transition-all ${
                        filters.sortBy === 'name' 
                          ? 'border-primary-purple bg-primary-purple/5 text-primary-purple' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>

                  {/* Clear Filters Button */}
                  {(filters.searchTerm || (filters.yearFilter && filters.yearFilter !== 'all')) && (
                    <button
                      onClick={clearFilters}
                      className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors ml-auto"
                    >
                      ✕ Clear All Filters
                    </button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(filters.searchTerm || (filters.yearFilter && filters.yearFilter !== 'all')) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {filters.yearFilter && filters.yearFilter !== 'all' && (
                      <span className="active-filter-chip">
                        Year: {filters.yearFilter}
                        <button onClick={() => handleYearFilter('all')}>✕</button>
                      </span>
                    )}
                    {filters.searchTerm && (
                      <span className="active-filter-chip">
                        Search: {filters.searchTerm}
                        <button onClick={() => handleSearch({ target: { value: '' } })}>✕</button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ===== RESULTS CARDS ===== */}
              <div className="circulars-table-container space-y-3">
                {currentFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-medium">No circulars found</p>
                    <p className="text-sm mt-1">
                      {filters.yearFilter && filters.yearFilter !== 'all' 
                        ? `No circulars available for ${filters.yearFilter}`
                        : 'Try adjusting your search or filters'}
                    </p>
                    {(filters.searchTerm || (filters.yearFilter && filters.yearFilter !== 'all')) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-primary-purple text-sm font-medium hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  currentFiles.map((file, index) => {
                    const icon = circularsService.getFileIcon(file.name, file.icon);
                    return (
                      <div 
                        key={`${file.id}-${index}-${currentPage}`}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 md:p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="shrink-0">
                              {icon.type === 'image' ? (
                                <img src={icon.url} alt="File icon" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                              ) : (
                                <span className="text-2xl md:text-3xl">{icon.emoji}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm md:text-base font-medium text-gray-900 leading-snug">
                                {file.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {file.year && file.year !== 'Unknown' && (
                                  <span className="year-badge">
                                    📅 {file.year}
                                  </span>
                                )}
                                {file.size && (
                                  <span className="text-xs text-gray-500">📎 {file.size}</span>
                                )}
                                {file.type === 'mdocs' && file.downloads > 0 && (
                                  <span className="text-xs text-gray-500">📥 {file.downloads.toLocaleString()}</span>
                                )}
                                {file.type === 'wpdm' && (
                                  <span className="text-xs text-gray-400">📄 PDF</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => circularsService.downloadFile(file.downloadUrl, file.name)}
                            className="download-btn shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-purple text-white text-sm font-medium rounded-lg hover:bg-primary-purple-light transition-all shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ===== PAGINATION ===== */}
              {totalFiles > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Results counter */}
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                    <span className="font-medium text-gray-700">{endIndex}</span> of{' '}
                    <span className="font-medium text-gray-700">{totalFiles}</span> circulars
                    {filters.yearFilter && filters.yearFilter !== 'all' && (
                      <span className="ml-1 text-xs text-gray-400">
                        (filtered by {filters.yearFilter})
                      </span>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1 flex-wrap justify-center">
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
                  <span>Showing {totalFiles} circulars</span>
                  <span className="text-xs text-gray-400">Data sourced from PPRA Circulars</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION - Regional Network ===== */}
        <section className="relative bg-slate-950 px-4 md:px-6 lg:px-12 py-12 md:py-20 text-white">
          <div className="max-w-7xl mx-auto relative z-10">
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

export default Circulars;