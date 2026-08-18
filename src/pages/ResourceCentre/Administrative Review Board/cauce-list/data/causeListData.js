// src/pages/cause-list/data/causeListData.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAUSE LIST DATA PROCESSING
// Extends core blogApi.js for Cause List specific functionality
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { 
  fetchBlogPosts, 
  fetchBlogPostBySlug,
  extractBlogFileInfo, 
  extractBlogDownloadLinks,
  hasWpdmFiles,
  getWpdmFileCount,
  transformPostToBlog as coreTransformPostToBlog,
  transformPostsToBlogs as coreTransformPostsToBlogs,
  getBlogCategoryColor,
  getBlogCategories,
  getBlogCategoryCount,
  getFilteredBlogs,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogBySlug,
  getRelatedBlogs
} from '../../../../../services/blogApi';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAUSE LIST SPECIFIC CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Category ID for Cause List (Live Hearings)
export const CAUSE_LIST_CATEGORY_ID = 151;

// Default pagination for Cause List
export const CAUSE_LIST_DEFAULT_PER_PAGE = 10;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAUSE LIST SPECIFIC API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Fetch Cause List posts with specific parameters
 * Extends core fetchBlogPosts with Cause List category
 */
export const fetchCauseList = async (params = {}) => {
  try {
    console.log('Fetching Cause List...');
    
    const result = await fetchBlogPosts({
      categories: CAUSE_LIST_CATEGORY_ID,
      per_page: params.per_page || CAUSE_LIST_DEFAULT_PER_PAGE,
      page: params.page || 1,
      _embed: true,
      status: 'publish',
      ...params
    });
    
    console.log(`Fetched ${result.posts.length} Cause List posts`);
    return result;
    
  } catch (error) {
    console.error('Error fetching Cause List:', error);
    throw error;
  }
};

/**
 * Fetch a single Cause List item by slug
 */
export const fetchCauseListItemBySlug = async (slug) => {
  try {
    console.log('Fetching Cause List item by slug:', slug);
    const post = await fetchBlogPostBySlug(slug);
    return post;
  } catch (error) {
    console.error('Error fetching Cause List item:', error);
    throw error;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAUSE LIST SPECIFIC TRANSFORMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Transform a WordPress post to Cause List format
 * Extends core transformPostToBlog with Cause List specific fields
 */
export const transformPostToCauseListItem = (post) => {
  console.log('Transforming post to Cause List item:', post.id, post.title?.rendered);
  
  // First, use the core transformation from blogApi
  const base = coreTransformPostToBlog(post);
  
  // Extract Cause List specific data from post meta or content
  let hearingDate = null;
  let hearingTime = null;
  let zoomLink = null;
  let meetingId = null;
  let passcode = null;
  let caseNumber = null;
  let status = 'scheduled';
  
  // Try to extract from post meta
  if (post.meta) {
    hearingDate = post.meta.hearing_date || post.meta._hearing_date || null;
    hearingTime = post.meta.hearing_time || post.meta._hearing_time || null;
    zoomLink = post.meta.zoom_link || post.meta._zoom_link || null;
    meetingId = post.meta.meeting_id || post.meta._meeting_id || null;
    passcode = post.meta.passcode || post.meta._passcode || null;
    caseNumber = post.meta.case_number || post.meta._case_number || null;
    status = post.meta.hearing_status || post.meta._hearing_status || 'scheduled';
  }
  
  // If not in meta, try to extract from content
  if (!zoomLink && post.content?.rendered) {
    const zoomRegex = /https?:\/\/[^\s]*zoom\.us\/[^\s"']+/g;
    const zoomMatches = post.content.rendered.match(zoomRegex);
    if (zoomMatches && zoomMatches.length > 0) {
      zoomLink = zoomMatches[0];
    }
    
    // Try to extract Meeting ID
    const meetingIdRegex = /Meeting ID:?\s*([\d\s]+)/i;
    const meetingIdMatch = post.content.rendered.match(meetingIdRegex);
    if (meetingIdMatch) {
      meetingId = meetingIdMatch[1].trim();
    }
    
    // Try to extract Passcode
    const passcodeRegex = /Passcode:?\s*([^\s<]+)/i;
    const passcodeMatch = post.content.rendered.match(passcodeRegex);
    if (passcodeMatch) {
      passcode = passcodeMatch[1].trim();
    }
    
    // Try to extract Case Number
    const caseNumberRegex = /CASE\s*(?:NO\.?|NUMBER:?)\s*([^\s<]+)/i;
    const caseNumberMatch = post.content.rendered.match(caseNumberRegex);
    if (caseNumberMatch) {
      caseNumber = caseNumberMatch[1].trim();
    }
    
    // Try to extract Date and Time from content
    const dateTimeRegex = /(?:Date|Time):?\s*([^<\n]+)/gi;
    let dtMatch;
    while ((dtMatch = dateTimeRegex.exec(post.content.rendered)) !== null) {
      const value = dtMatch[1].trim();
      // Try to parse as date
      if (!hearingDate) {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate)) {
          hearingDate = parsedDate.toISOString();
        }
      }
    }
  }
  
  // Return transformed object with Cause List specific fields
  return {
    ...base,
    contentType: 'cause-list',
    hearingDate,
    hearingTime,
    zoomLink,
    meetingId,
    passcode,
    caseNumber,
    status,
    isUpcoming: status === 'scheduled' || status === 'upcoming',
    isPast: status === 'completed' || status === 'past',
    isCancelled: status === 'cancelled',
    displayTitle: caseNumber ? `Case ${caseNumber}: ${base.title}` : base.title,
  };
};

/**
 * Transform multiple posts to Cause List items
 */
export const transformPostsToCauseList = (posts) => {
  console.log('Transforming', posts.length, 'posts to Cause List');
  const transformed = posts.map(post => transformPostToCauseListItem(post));
  
  // Count items by status
  const statusCount = {
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
    past: 0
  };
  
  transformed.forEach(item => {
    if (statusCount[item.status] !== undefined) {
      statusCount[item.status]++;
    }
  });
  
  console.log('Cause List status counts:', statusCount);
  return transformed;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAUSE LIST SPECIFIC FILTER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Filter cause list items by status
 */
export const filterCauseListByStatus = (items, status) => {
  if (status === 'all') return items;
  return items.filter(item => item.status === status);
};

/**
 * Get upcoming cause list items
 */
export const getUpcomingCauseListItems = (items) => {
  const now = new Date();
  return items
    .filter(item => {
      if (!item.hearingDate) return false;
      const hearingDate = new Date(item.hearingDate);
      return hearingDate >= now && item.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));
};

/**
 * Get past cause list items
 */
export const getPastCauseListItems = (items) => {
  const now = new Date();
  return items
    .filter(item => {
      if (!item.hearingDate) return false;
      const hearingDate = new Date(item.hearingDate);
      return hearingDate < now || item.status === 'completed';
    })
    .sort((a, b) => new Date(b.hearingDate) - new Date(a.hearingDate));
};

/**
 * Get cause list items by case number
 */
export const getCauseListItemsByCaseNumber = (items, caseNumber) => {
  if (!caseNumber) return items;
  return items.filter(item => 
    item.caseNumber && item.caseNumber.toLowerCase().includes(caseNumber.toLowerCase())
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RE-EXPORT CORE FUNCTIONS FOR CONVENIENCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Re-export all core functions that are still useful
export {
  // Core data transformation
  coreTransformPostToBlog as transformPostToBlog,
  coreTransformPostsToBlogs as transformPostsToBlogs,
  
  // Core utilities
  getBlogCategoryColor,
  getBlogCategories,
  getBlogCategoryCount,
  getFilteredBlogs,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  
  // File extraction utilities
  extractBlogFileInfo,
  extractBlogDownloadLinks,
  hasWpdmFiles,
  getWpdmFileCount,
  
  // Core API functions (for flexibility)
  fetchBlogPosts,
  fetchBlogPostBySlug
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  fetchCauseList,
  fetchCauseListItemBySlug,
  transformPostToCauseListItem,
  transformPostsToCauseList,
  filterCauseListByStatus,
  getUpcomingCauseListItems,
  getPastCauseListItems,
  getCauseListItemsByCaseNumber,
  CAUSE_LIST_CATEGORY_ID,
  CAUSE_LIST_DEFAULT_PER_PAGE,
};