// src/pages/news/data/newsData.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEWS DATA PROCESSING
// Extends blogApi.js with news-specific functionality
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import * as blogApi from '../../../services/blogApi';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RE-EXPORT ALL BLOG API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Core transform functions
export const transformPostToBlog = blogApi.transformPostToBlog;
export const transformPostsToBlogs = blogApi.transformPostsToBlogs;

// Core utilities
export const getBlogCategoryColor = blogApi.getBlogCategoryColor;
export const getBlogCategories = blogApi.getBlogCategories;
export const getBlogCategoryCount = blogApi.getBlogCategoryCount;
export const getFilteredBlogs = blogApi.getFilteredBlogs;
export const getFeaturedBlogs = blogApi.getFeaturedBlogs;
export const getLatestBlogs = blogApi.getLatestBlogs;
export const getBlogBySlug = blogApi.getBlogBySlug;
export const getRelatedBlogs = blogApi.getRelatedBlogs;

// File extraction utilities
export const extractBlogFileInfo = blogApi.extractBlogFileInfo;
export const extractBlogDownloadLinks = blogApi.extractBlogDownloadLinks;
export const hasWpdmFiles = blogApi.hasWpdmFiles;
export const getWpdmFileCount = blogApi.getWpdmFileCount;

// Table processing
export const processTables = blogApi.processTables;
export const parseTableToData = blogApi.parseTableToData;
export const parseAllTables = blogApi.parseAllTables;
export const removeTablesFromContent = blogApi.removeTablesFromContent;

// Content cleaning
export const cleanWpdmContent = blogApi.cleanWpdmContent;
export const finalContentCleanup = blogApi.finalContentCleanup;

// API functions
export const fetchBlogPosts = blogApi.fetchBlogPosts;
export const fetchBlogPostBySlug = blogApi.fetchBlogPostBySlug;
export const fetchBlogPostsByCategory = blogApi.fetchBlogPostsByCategory;
export const searchBlogPosts = blogApi.searchBlogPosts;
export const fetchFeaturedBlogPosts = blogApi.fetchFeaturedBlogPosts;

// API endpoints
export const BLOG_API_ENDPOINTS = blogApi.BLOG_API_ENDPOINTS;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEWS-SPECIFIC EXTENSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Fetch only news posts (alias for fetchBlogPosts with news filter)
 */
export const fetchNewsPosts = async (params = {}) => {
  // Add news-specific category filter if not already present
  const newsParams = {
    ...params,
    // You can add category filtering here if needed
    // categories: params.categories || NEWS_CATEGORY_ID,
  };
  return blogApi.fetchBlogPosts(newsParams);
};

/**
 * Fetch featured news posts
 */
export const fetchFeaturedNews = async (params = {}) => {
  return blogApi.fetchFeaturedBlogPosts({
    per_page: params.per_page || 6,
    ...params
  });
};

/**
 * Fetch latest news posts with pagination
 */
export const fetchLatestNews = async (limit = 9, page = 1) => {
  return blogApi.fetchBlogPosts({
    per_page: limit,
    page: page,
    ...(limit > 0 ? {} : {}) // Additional filters can be added here
  });
};

/**
 * Get news by category with enhanced metadata
 */
export const fetchNewsByCategory = async (categorySlug, params = {}) => {
  // First, fetch all categories to get the ID
  try {
    const response = await fetch(blogApi.BLOG_API_ENDPOINTS.categories);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const categories = await response.json();
    const category = categories.find(cat => cat.slug === categorySlug);
    
    if (!category) {
      console.warn(`Category "${categorySlug}" not found`);
      return { posts: [], total: 0, totalPages: 0, currentPage: 1 };
    }
    
    return blogApi.fetchBlogPostsByCategory(category.id, params);
  } catch (error) {
    console.error('Error fetching category:', error);
    return { posts: [], total: 0, totalPages: 0, currentPage: 1 };
  }
};

/**
 * Search news posts with enhanced filtering
 */
export const searchNews = async (searchTerm, params = {}) => {
  return blogApi.searchBlogPosts(searchTerm, {
    per_page: params.per_page || 9,
    page: params.page || 1,
    ...params
  });
};

/**
 * Get news archive by date
 */
export const fetchNewsArchive = async (year, month, params = {}) => {
  const date = new Date(year, month - 1);
  const startDate = date.toISOString();
  const endDate = new Date(year, month, 0).toISOString();
  
  return blogApi.fetchBlogPosts({
    after: startDate,
    before: endDate,
    ...params
  });
};

/**
 * Get related news posts (enhanced version with category matching)
 */
export const getRelatedNews = (newsPosts, currentId, limit = 3) => {
  const current = newsPosts.find(item => item.id === currentId);
  if (!current) return blogApi.getRelatedBlogs(newsPosts, currentId, limit);
  
  // Prioritize posts with same categories
  const sameCategory = newsPosts.filter(item => 
    item.id !== currentId && 
    item.categories.some(cat => current.categories.includes(cat))
  );
  
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  
  // Fill remaining with other posts
  const others = newsPosts.filter(item => 
    item.id !== currentId && 
    !sameCategory.some(same => same.id === item.id)
  );
  
  return [...sameCategory, ...others].slice(0, limit);
};

/**
 * Get news statistics
 */
export const getNewsStats = (newsPosts) => {
  const stats = {
    total: newsPosts.length,
    withImages: 0,
    withTables: 0,
    withFiles: 0,
    categories: {},
    authors: {},
    monthlyCounts: {}
  };
  
  newsPosts.forEach(post => {
    // Image stats
    if (post.image) stats.withImages++;
    
    // Table stats
    if (post.hasTables) stats.withTables++;
    
    // File stats
    if (post.files && post.files.length > 0) stats.withFiles++;
    
    // Category stats
    post.categories.forEach(cat => {
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
    });
    
    // Author stats
    stats.authors[post.author] = (stats.authors[post.author] || 0) + 1;
    
    // Monthly stats
    const month = post.date.substring(0, 7);
    stats.monthlyCounts[month] = (stats.monthlyCounts[month] || 0) + 1;
  });
  
  return stats;
};

/**
 * Get news timeline data
 */
export const getNewsTimeline = (newsPosts, limit = 10) => {
  return [...newsPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map(post => ({
      ...post,
      summary: post.summary || post.content?.substring(0, 150) || '',
    }));
};

/**
 * Format news for RSS feed
 */
export const formatNewsForRSS = (newsPosts) => {
  return newsPosts.map(post => ({
    title: post.title,
    link: post.link,
    pubDate: new Date(post.date).toUTCString(),
    description: post.summary || '',
    content: post.content || '',
    categories: post.categories,
    author: post.author,
    guid: post.link || `urn:uuid:${post.id}`,
  }));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEWS-SPECIFIC CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NEWS_CONSTANTS = {
  // Default pagination
  DEFAULT_PER_PAGE: 9,
  DEFAULT_PAGE: 1,
  
  // Featured count
  FEATURED_COUNT: 6,
  
  // Related posts
  RELATED_COUNT: 3,
  
  // Cache keys
  CACHE_KEYS: {
    NEWS_LIST: 'news_list',
    NEWS_DETAIL: 'news_detail_',
    FEATURED_NEWS: 'featured_news',
    NEWS_CATEGORIES: 'news_categories',
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT - EXTENDS BLOG API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Create extension object with all blogApi functions + news-specific functions
const newsDataExtension = {
  // All blogApi functions
  transformPostToBlog: blogApi.transformPostToBlog,
  transformPostsToBlogs: blogApi.transformPostsToBlogs,
  getBlogCategoryColor: blogApi.getBlogCategoryColor,
  getBlogCategories: blogApi.getBlogCategories,
  getBlogCategoryCount: blogApi.getBlogCategoryCount,
  getFilteredBlogs: blogApi.getFilteredBlogs,
  getFeaturedBlogs: blogApi.getFeaturedBlogs,
  getLatestBlogs: blogApi.getLatestBlogs,
  getBlogBySlug: blogApi.getBlogBySlug,
  getRelatedBlogs: blogApi.getRelatedBlogs,
  extractBlogFileInfo: blogApi.extractBlogFileInfo,
  extractBlogDownloadLinks: blogApi.extractBlogDownloadLinks,
  hasWpdmFiles: blogApi.hasWpdmFiles,
  getWpdmFileCount: blogApi.getWpdmFileCount,
  processTables: blogApi.processTables,
  parseTableToData: blogApi.parseTableToData,
  parseAllTables: blogApi.parseAllTables,
  removeTablesFromContent: blogApi.removeTablesFromContent,
  cleanWpdmContent: blogApi.cleanWpdmContent,
  finalContentCleanup: blogApi.finalContentCleanup,
  fetchBlogPosts: blogApi.fetchBlogPosts,
  fetchBlogPostBySlug: blogApi.fetchBlogPostBySlug,
  fetchBlogPostsByCategory: blogApi.fetchBlogPostsByCategory,
  searchBlogPosts: blogApi.searchBlogPosts,
  fetchFeaturedBlogPosts: blogApi.fetchFeaturedBlogPosts,
  BLOG_API_ENDPOINTS: blogApi.BLOG_API_ENDPOINTS,
  
  // News-specific extensions
  fetchNewsPosts,
  fetchFeaturedNews,
  fetchLatestNews,
  fetchNewsByCategory,
  searchNews,
  fetchNewsArchive,
  getRelatedNews,
  getNewsStats,
  getNewsTimeline,
  formatNewsForRSS,
  NEWS_CONSTANTS,
};

export default newsDataExtension;