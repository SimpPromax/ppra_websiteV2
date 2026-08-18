// src/pages/news/[slug].jsx
import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getNewsBySlug, getRelatedNews } from './data/news_demoData';

// Import hero image
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const NewsArticle = () => {
  const { slug } = useParams();
  const articleRef = useRef(null);
  const contentRef = useRef(null);
  const relatedRef = useRef(null);

  const news = getNewsBySlug(slug);
  const relatedArticles = news ? getRelatedNews(news.id) : [];

  // GSAP animations
  useEffect(() => {
    if (!news) return;

    const ctx = gsap.context(() => {
      // Animate article content
      gsap.fromTo('.article-content > *',
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

      // Animate related articles
      gsap.fromTo('.related-item',
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
    }, articleRef);

    return () => ctx.revert();
  }, [news]);

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Article Not Found</h2>
          <p className="text-slate-600 text-base md:text-lg lg:text-xl font-normal mb-8 max-w-xl mx-auto leading-relaxed">
            The news article you're looking for doesn't exist.
          </p>
          <Link to="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white font-semibold text-sm md:text-base hover:bg-primary-purple-dark transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </Link>
        </div>
      </div>
    );
  }

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
    <div ref={articleRef} className="bg-white min-h-screen">
      
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
          <img src={corporateSky} alt="PPRA News" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link to="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 md:mb-6 text-sm md:text-base font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </Link>
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {news.title}
          </h1>
        </div>
      </section>

      {/* Article Content - WITH SYMMETRICAL LINES */}
      <section ref={contentRef} className="relative py-10 md:py-20 px-4 md:px-6 overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
            <span className={`text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 border ${getCategoryColor(news.category)}`}>
              {news.category}
            </span>
            <span className="text-xs md:text-base text-gray-500 font-medium">{formatDate(news.date)}</span>
            <span className="text-xs md:text-base text-gray-500 font-medium">By {news.author}</span>
            {news.isFeatured && (
              <span className="bg-primary-purple text-white text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1">
                Featured
              </span>
            )}
          </div>

          {/* Featured Image */}
          <div className="mb-6 md:mb-10 overflow-hidden bg-gray-200">
            <img src={news.image} alt={news.title} className="w-full h-auto" />
          </div>

          {/* Article Body */}
          <div 
            className="article-content prose prose-sm md:prose-lg max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 md:mb-3">Tags</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {news.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-slate-700 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-base font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to News */}
          <div className="mt-6 md:mt-8">
            <Link to="/news" className="inline-flex items-center gap-2 text-primary-purple font-semibold text-sm md:text-base hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All News
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles - WITH SYMMETRICAL LINES */}
      {relatedArticles.length > 0 && (
        <section ref={relatedRef} className="relative py-10 md:py-20 bg-gray-50 px-4 md:px-6 overflow-hidden">
          {/* Vertical Lines */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5 border-r border-gray-200"></div>
            <div className="w-1/5"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <h3 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedArticles.map((related) => (
                <article key={related.id} className="related-item group bg-white border border-gray-200">
                  <Link to={`/news/${related.slug}`} className="block relative h-40 md:h-48 bg-gray-200 overflow-hidden">
                    <img src={related.image} alt={related.title} className="w-full h-full object-cover" loading="lazy" />
                    <span className={`absolute bottom-2 md:bottom-3 left-2 md:left-3 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 border ${getCategoryColor(related.category)}`}>
                      {related.category}
                    </span>
                  </Link>
                  <div className="p-3 md:p-5">
                    <div className="text-xs md:text-base text-gray-500 font-medium mb-1 md:mb-2">{formatDate(related.date)}</div>
                    <h4 className="text-base md:text-xl font-bold text-slate-900 mb-1 md:mb-2 leading-tight">
                      <Link to={`/news/${related.slug}`} className="text-slate-900 hover:text-primary-purple transition-colors">
                        {related.title}
                      </Link>
                    </h4>
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-normal line-clamp-2">
                      {related.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - WITH SYMMETRICAL LINES */}
      <section className="relative bg-slate-950 px-4 md:px-6 py-10 md:py-20 text-white text-center overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex opacity-10">
          <div className="w-1/5 border-r border-white"></div>
          <div className="w-1/5 border-r border-white"></div>
          <div className="w-1/5 border-r border-white"></div>
          <div className="w-1/5 border-r border-white"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-2 md:mb-4">
            Stay Updated with PPRA
          </h2>
          <p className="text-slate-400 text-sm md:text-lg lg:text-xl font-normal mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
            Subscribe to our newsletter for the latest news and updates on public procurement in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary-purple"
            />
            <button className="px-4 md:px-6 py-2.5 md:py-3 bg-primary-purple text-white font-semibold text-xs md:text-sm uppercase tracking-wider hover:bg-primary-purple-dark transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        /* Article content styling */
        .article-content h1, .article-content h2, .article-content h3 {
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .article-content h1 {
          font-size: 1.75rem;
        }
        .article-content h2 {
          font-size: 1.5rem;
        }
        .article-content h3 {
          font-size: 1.25rem;
        }
        .article-content p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 0.75rem;
        }
        .article-content ul, .article-content ol {
          margin: 0.75rem 0;
          padding-left: 1.25rem;
        }
        .article-content ul li, .article-content ol li {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .article-content a {
          color: #201444;
          text-decoration: underline;
        }
        @media (min-width: 768px) {
          .article-content h1 {
            font-size: 2.25rem;
          }
          .article-content h2 {
            font-size: 1.875rem;
          }
          .article-content h3 {
            font-size: 1.5rem;
          }
          .article-content p {
            font-size: 1.125rem;
            line-height: 1.75;
            margin-bottom: 1rem;
          }
          .article-content ul li, .article-content ol li {
            font-size: 1.125rem;
            line-height: 1.75;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsArticle;