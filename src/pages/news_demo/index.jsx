import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { newsData, getCategories, getCategoryCount, getFilteredNews, getFeaturedNews } from './data/news_demoData';

// Import hero image
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const NewsDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredNews, setFilteredNews] = useState(newsData);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const categories = getCategories();
  const featuredNews = getFeaturedNews();
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Filter news when category changes
  useEffect(() => {
    setIsFiltering(true);
    const filtered = getFilteredNews(selectedCategory);
    setFilteredNews(filtered);
    
    // Reset filtering state after animation
    setTimeout(() => setIsFiltering(false), 300);
  }, [selectedCategory]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate news cards with stagger
      gsap.fromTo('.news-demo-item',
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

  const getCategoryColor = (category) => {
    const colors = {
      'Announcements': 'bg-blue-100 text-blue-800 border-blue-200',
      'News': 'bg-green-100 text-green-800 border-green-200',
      'Press': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div ref={containerRef} className="bg-white min-h-screen">
      
      {/* Hero Section - WITH SYMMETRICAL LINES */}
      <section className="relative py-20 md:py-32 bg-slate-950 px-4 md:px-6 overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img src={corporateSky} alt="PPRA News Demo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
            News Demo
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto text-slate-300 font-medium leading-relaxed tracking-wide">
            Demo news section - Sample data for demonstration purposes
          </p>
        </div>
      </section>

      {/* News Section - WITH SYMMETRICAL LINES */}
      <section className="relative py-12 md:py-20 px-4 md:px-6 overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Category Filter - Horizontal Scroll */}
          <div className="overflow-x-auto pb-4 mb-8 md:mb-12 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => {
                const count = getCategoryCount(category);
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
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
            {filteredNews.map((news) => (
              <article key={news.id} className="news-demo-item group bg-white border border-gray-200">
                {/* Image */}
                <Link to={`/news-demo/${news.slug}`} className="block relative h-48 md:h-56 bg-gray-200 overflow-hidden">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {news.isFeatured && (
                    <span className="absolute top-2 md:top-3 right-2 md:right-3 bg-primary-purple text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1">
                      Featured
                    </span>
                  )}
                  <span className={`absolute bottom-2 md:bottom-3 left-2 md:left-3 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 border ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-4 md:p-6">
                  <div className="text-xs md:text-base text-gray-500 mb-2 md:mb-3">
                    {formatDate(news.date)}
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5 md:mb-2 leading-tight">
                    <Link to={`/news-demo/${news.slug}`} className="text-slate-900 hover:text-primary-purple transition-colors">
                      {news.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal line-clamp-3">
                    {news.summary}
                  </p>
                  <div className="mt-3 md:mt-4 flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                    <span className="text-xs md:text-base text-gray-500">By {news.author}</span>
                    <Link 
                      to={`/news-demo/${news.slug}`} 
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
          {filteredNews.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <p className="text-gray-500 text-base md:text-lg">No demo news found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Scrollbar Hide Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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

export default NewsDemo;