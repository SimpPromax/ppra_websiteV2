// src/pages/news/data/newsData.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPLETE NEWS DATA PROCESSING WITH CATEGORY FILTERING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import * as blogApi from '../../../services/blogApi';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY CONFIGURATION - YOUR FILTER MAP
// ⚠️ ONLY categories in this map will be fetched!
// Add/remove categories here to control what gets fetched
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORY_ID_MAP = {
  'news': 26,              // 72 posts
  'blog': 149,             // 1 post
  // 'tenders': 147,       // ❌ EXCLUDED
  // 'addendum': 148,      // ❌ EXCLUDED
  // 'circulars': 155,     // ❌ EXCLUDED
  // 'live-hearings': 151, // ❌ EXCLUDED
  // 'reports': 24,        // ❌ EXCLUDED
  // 'speeches': 28,       // ❌ EXCLUDED
  // 'cbl': 165,           // ❌ EXCLUDED
  // 'supplier-registration': 150, // ❌ EXCLUDED
};

// ━━━ DERIVED CONFIGURATIONS ━━━
export const VISIBLE_CATEGORY_SLUGS = Object.keys(CATEGORY_ID_MAP);
export const VISIBLE_CATEGORY_IDS = Object.values(CATEGORY_ID_MAP);
export const ACTIVE_CATEGORY_SLUGS = VISIBLE_CATEGORY_SLUGS;

// ━━━ CATEGORY DISPLAY NAMES ━━━
export const CATEGORY_DISPLAY_MAP = {
  'news': 'NEWS',
  'blog': 'BLOG',
  'tenders': 'TENDERS',
  'addendum': 'ADDENDUM',
  'circulars': 'CIRCULARS',
  'live-hearings': 'LIVE HEARINGS',
  'reports': 'REPORTS',
  'speeches': 'SPEECHES',
  'cbl': 'CBL',
  'supplier-registration': 'SUPPLIER REGISTRATION',
};

// ━━━ FULL CONFIG FOR UI ━━━
export const VISIBLE_CATEGORIES_CONFIG = VISIBLE_CATEGORY_SLUGS.map(slug => ({
  id: CATEGORY_ID_MAP[slug],
  slug: slug,
  displayName: CATEGORY_DISPLAY_MAP[slug] || slug,
  count: 0, // Will be updated dynamically
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get category ID from slug
 */
export const getCategoryId = (slug) => CATEGORY_ID_MAP[slug] || null;

/**
 * Get category display name from slug
 */
export const getCategoryDisplayName = (slug) => CATEGORY_DISPLAY_MAP[slug] || slug;

/**
 * Get category config by slug
 */
export const getCategoryConfig = (slug) => {
  const id = getCategoryId(slug);
  if (!id) return null;
  return {
    id,
    slug,
    displayName: getCategoryDisplayName(slug),
  };
};

/**
 * Get all category IDs from your map
 * ⚠️ This ONLY returns categories in your CATEGORY_ID_MAP
 */
export const getAllCategoryIds = () => Object.values(CATEGORY_ID_MAP);

/**
 * Get all category slugs from your map
 * ⚠️ This ONLY returns categories in your CATEGORY_ID_MAP
 */
export const getAllCategorySlugs = () => Object.keys(CATEGORY_ID_MAP);

/**
 * Check if category is visible (in your map)
 */
export const isCategoryVisible = (slug) => CATEGORY_ID_MAP.hasOwnProperty(slug);

/**
 * Get total count of categories in your map
 */
export const getTotalCategoriesCount = () => Object.keys(CATEGORY_ID_MAP).length;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE FETCH FUNCTIONS WITH CATEGORY FILTERING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Fetch posts from ALL visible categories (optimized parallel fetch)
 * ⚠️ ONLY fetches categories from your CATEGORY_ID_MAP
 * 
 * @param {Object} options - Fetch options
 * @param {number} options.per_page - Number of posts per category (default: 100)
 * @param {boolean} options.forceRefresh - Bypass cache (default: false)
 * @returns {Promise<Array>} Array of post objects
 */
export const fetchAllVisibleCategoryPosts = async (options = {}) => {
  const { per_page = 100, forceRefresh = false } = options;
  const cacheKey = `all_visible_posts_${per_page}`;
  
  // Check cache first
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`📦 Using cached visible posts: ${parsed.length} posts from ${VISIBLE_CATEGORY_SLUGS.length} categories`);
        return parsed;
      }
    } catch (e) {
      // Cache invalid, continue
    }
  }
  
  // ━━━ CRITICAL: Get category IDs from your map ONLY ━━━
  const categoryIds = getAllCategoryIds();
  const categorySlugs = getAllCategorySlugs();
  
  if (categoryIds.length === 0) {
    console.warn('⚠️ No categories configured in CATEGORY_ID_MAP');
    return [];
  }
  
  console.log(`📡 Fetching ${categoryIds.length} categories from map:`, categorySlugs.join(', '));
  console.log(`📡 Category IDs:`, categoryIds);
  
  try {
    // Fetch all categories in parallel
    const results = await Promise.all(
      categoryIds.map(id => 
        blogApi.fetchBlogPosts({ 
          per_page,
          page: 1,
          categories: id,  // ← THIS FILTERS BY CATEGORY ID
          status: 'publish'
        })
      )
    );
    
    // Combine all posts
    const allPosts = results.flatMap(r => r.posts || []);
    
    // Log per-category counts
    results.forEach((result, index) => {
      const slug = categorySlugs[index];
      const count = result.posts?.length || 0;
      console.log(`   📊 ${slug}: ${count} posts`);
    });
    
    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(allPosts));
    } catch (e) {
      // Session storage full
    }
    
    console.log(`✅ Fetched ${allPosts.length} total posts from ${categoryIds.length} categories`);
    return allPosts;
    
  } catch (error) {
    console.error('❌ Error fetching visible category posts:', error);
    throw error;
  }
};

/**
 * Fetch paginated posts for a specific category
 * ⚠️ ONLY fetches if category is in your CATEGORY_ID_MAP
 * 
 * @param {Object} options - Fetch options
 * @param {string} options.categorySlug - Category slug (must be in map)
 * @param {number} options.per_page - Posts per page (default: 9)
 * @param {number} options.page - Page number (default: 1)
 * @param {boolean} options.forceRefresh - Bypass cache (default: false)
 * @returns {Promise<Object>} { posts, total, totalPages, currentPage }
 */
export const fetchVisibleCategoryPosts = async (options = {}) => {
  const { categorySlug, per_page = 9, page = 1, forceRefresh = false } = options;
  
  if (!categorySlug) {
    throw new Error('categorySlug is required');
  }
  
  // ━━━ CRITICAL: Check if category is in your map ━━━
  const categoryId = getCategoryId(categorySlug);
  if (!categoryId) {
    console.warn(`⚠️ Category "${categorySlug}" not found in CATEGORY_ID_MAP`);
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }
  
  const cacheKey = `category_${categorySlug}_${per_page}_${page}`;
  
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`📦 Using cached ${categorySlug} page ${page}: ${parsed.posts?.length || 0} posts`);
        return parsed;
      }
    } catch (e) {
      // Cache invalid
    }
  }
  
  console.log(`📡 Fetching category: ${categorySlug} (ID: ${categoryId}), page ${page}`);
  
  try {
    const result = await blogApi.fetchBlogPosts({
      per_page,
      page,
      categories: categoryId,  // ← THIS FILTERS BY CATEGORY ID
      status: 'publish'
    });
    
    console.log(`   ✅ ${categorySlug}: ${result.posts?.length || 0} posts, total: ${result.total || 0}`);
    
    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      // Cache storage issue
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error fetching ${categorySlug}:`, error);
    throw error;
  }
};

/**
 * Get category counts from API (dynamic, updates in real-time)
 * ⚠️ ONLY counts categories in your CATEGORY_ID_MAP
 * 
 * @returns {Promise<Object>} { 'news': 72, 'blog': 1, ... }
 */
export const getCategoryCounts = async () => {
  const cacheKey = 'category_counts';
  
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Only use cache if less than 5 minutes old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        console.log('📦 Using cached category counts');
        return parsed.counts;
      }
    }
  } catch (e) {
    // Cache invalid
  }
  
  console.log('📡 Fetching category counts...');
  
  try {
    const counts = {};
    // ━━━ CRITICAL: Get category IDs from your map ONLY ━━━
    const categoryIds = getAllCategoryIds();
    const categorySlugs = getAllCategorySlugs();
    
    if (categoryIds.length === 0) {
      console.warn('⚠️ No categories in map');
      return {};
    }
    
    // Fetch count for each category in your map
    await Promise.all(
      categorySlugs.map(async (slug, index) => {
        const id = categoryIds[index];
        try {
          const result = await blogApi.fetchBlogPosts({
            per_page: 1,
            categories: id,  // ← FILTER BY CATEGORY
            _fields: 'id'    // Only fetch IDs to save bandwidth
          });
          counts[slug] = result.total || 0;
          console.log(`   📊 ${slug}: ${counts[slug]} posts`);
        } catch (e) {
          console.warn(`   ⚠️ Failed to get count for ${slug}:`, e);
          counts[slug] = 0;
        }
      })
    );
    
    // Cache the counts
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        counts,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Cache storage issue
    }
    
    return counts;
    
  } catch (error) {
    console.error('❌ Error getting category counts:', error);
    // Return empty counts as fallback
    return VISIBLE_CATEGORY_SLUGS.reduce((acc, slug) => {
      acc[slug] = 0;
      return acc;
    }, {});
  }
};

/**
 * Get visible categories with counts for UI
 * ⚠️ ONLY returns categories in your CATEGORY_ID_MAP
 * 
 * @returns {Promise<Array>} Array of category objects with counts
 */
export const getVisibleCategoriesWithCounts = async () => {
  const counts = await getCategoryCounts();
  
  return VISIBLE_CATEGORY_SLUGS.map(slug => ({
    slug,
    id: getCategoryId(slug),
    displayName: getCategoryDisplayName(slug),
    count: counts[slug] || 0,
  }));
};

/**
 * Get visible categories from posts (client-side)
 * ⚠️ ONLY returns categories that are in your CATEGORY_ID_MAP
 * 
 * @param {Array} posts - Array of post objects
 * @returns {Array} Array of category names with 'All' prepended
 */
export const getVisibleCategoriesFromPosts = (posts) => {
  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(cat => {
        // Check if category slug is in your map
        const slug = cat.toLowerCase().replace(/\s+/g, '-');
        if (isCategoryVisible(slug) || VISIBLE_CATEGORY_SLUGS.includes(slug)) {
          categories.add(cat);
        }
      });
    }
  });
  return ['All', ...Array.from(categories).sort()];
};

/**
 * Get total post count across all visible categories
 * 
 * @param {Array} posts - Array of post objects
 * @returns {number} Total count
 */
export const getTotalVisiblePosts = (posts) => {
  return posts?.length || 0;
};

/**
 * Debug function to verify what's in your map
 */
export const debugCategoryMap = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CATEGORY MAP DEBUG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total categories in map: ${getTotalCategoriesCount()}`);
  console.log('Categories:');
  VISIBLE_CATEGORY_SLUGS.forEach(slug => {
    const id = getCategoryId(slug);
    const display = getCategoryDisplayName(slug);
    console.log(`   ✅ ${slug} (${display}) → ID: ${id}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Category IDs: ${VISIBLE_CATEGORY_IDS.join(', ')}`);
  console.log(`Category Slugs: ${VISIBLE_CATEGORY_SLUGS.join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return {
    ids: VISIBLE_CATEGORY_IDS,
    slugs: VISIBLE_CATEGORY_SLUGS,
    count: getTotalCategoriesCount()
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RE-EXPORT BLOG API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const transformPostToBlog = blogApi.transformPostToBlog;
export const transformPostsToBlogs = blogApi.transformPostsToBlogs;
export const getBlogCategoryColor = blogApi.getBlogCategoryColor;
export const getBlogCategories = blogApi.getBlogCategories;
export const getBlogCategoryCount = blogApi.getBlogCategoryCount;
export const getFilteredBlogs = blogApi.getFilteredBlogs;
export const getBlogBySlug = blogApi.getBlogBySlug;
export const getRelatedBlogs = blogApi.getRelatedBlogs;
export const getFeaturedBlogs = blogApi.getFeaturedBlogs;
export const getLatestBlogs = blogApi.getLatestBlogs;
export const extractBlogFileInfo = blogApi.extractBlogFileInfo;
export const extractBlogDownloadLinks = blogApi.extractBlogDownloadLinks;
export const hasWpdmFiles = blogApi.hasWpdmFiles;
export const getWpdmFileCount = blogApi.getWpdmFileCount;
export const processTables = blogApi.processTables;
export const parseTableToData = blogApi.parseTableToData;
export const parseAllTables = blogApi.parseAllTables;
export const removeTablesFromContent = blogApi.removeTablesFromContent;
export const cleanWpdmContent = blogApi.cleanWpdmContent;
export const finalContentCleanup = blogApi.finalContentCleanup;
export const fetchBlogPosts = blogApi.fetchBlogPosts;
export const fetchBlogPostBySlug = blogApi.fetchBlogPostBySlug;
export const fetchBlogPostsByCategory = blogApi.fetchBlogPostsByCategory;
export const searchBlogPosts = blogApi.searchBlogPosts;
export const fetchFeaturedBlogPosts = blogApi.fetchFeaturedBlogPosts;
export const BLOG_API_ENDPOINTS = blogApi.BLOG_API_ENDPOINTS;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const newsData = {
  // Category configuration
  CATEGORY_ID_MAP,
  VISIBLE_CATEGORY_SLUGS,
  VISIBLE_CATEGORY_IDS,
  CATEGORY_DISPLAY_MAP,
  VISIBLE_CATEGORIES_CONFIG,
  
  // Helper functions
  getCategoryId,
  getCategoryDisplayName,
  getCategoryConfig,
  getAllCategoryIds,
  getAllCategorySlugs,
  isCategoryVisible,
  getTotalCategoriesCount,
  getTotalVisiblePosts,
  
  // Fetch functions - ONLY from your map
  fetchAllVisibleCategoryPosts,
  fetchVisibleCategoryPosts,
  getCategoryCounts,
  getVisibleCategoriesWithCounts,
  getVisibleCategoriesFromPosts,
  
  // Debug
  debugCategoryMap,
  
  // Blog API re-exports
  transformPostToBlog,
  transformPostsToBlogs,
  getBlogCategoryColor,
  getBlogCategories,
  getBlogCategoryCount,
  getFilteredBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getFeaturedBlogs,
  getLatestBlogs,
  extractBlogFileInfo,
  extractBlogDownloadLinks,
  hasWpdmFiles,
  getWpdmFileCount,
  processTables,
  parseTableToData,
  parseAllTables,
  removeTablesFromContent,
  cleanWpdmContent,
  finalContentCleanup,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchBlogPostsByCategory,
  searchBlogPosts,
  fetchFeaturedBlogPosts,
  BLOG_API_ENDPOINTS,
};

export default newsData;