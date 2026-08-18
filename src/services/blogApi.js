// src/services/blogApi.js
//const API_BASE = 'http://10.10.10.49/wp-json';
const API_BASE = 'http://ppra.go.ke/wp-json';

// WordPress API endpoints for blogs
export const BLOG_API_ENDPOINTS = {
  posts: `${API_BASE}/wp/v2/posts`,
  media: `${API_BASE}/wp/v2/media`,
  categories: `${API_BASE}/wp/v2/categories`,
  users: `${API_BASE}/wp/v2/users`,
  search: `${API_BASE}/wp/v2/search`,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TABLE PROCESSING UTILITIES - CLEAN FLAT STYLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Enhanced table processor for WordPress content
 * Clean, flat design - No rounded edges, no hover, no shadows
 */
export const processTables = (htmlContent) => {
  if (!htmlContent) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const tables = doc.querySelectorAll('table');
  
  if (tables.length === 0) {
    return htmlContent;
  }
  
  console.log(`Processing ${tables.length} tables in content`);
  
  tables.forEach((table, index) => {
    // ── 1. Wrap in responsive container ──
    const wrapper = doc.createElement('div');
    wrapper.className = 'table-responsive-wrapper';
    wrapper.setAttribute('data-table-index', index);
    
    // Check if table is wide (needs horizontal scroll)
    const hasWideColumns = table.querySelectorAll('thead th, thead td').length > 4;
    if (hasWideColumns) {
      wrapper.classList.add('table-scrollable');
    }
    
    table.parentNode.replaceChild(wrapper, table);
    wrapper.appendChild(table);
    
    // ── 2. Add caption if missing ──
    if (!table.querySelector('caption')) {
      const caption = doc.createElement('caption');
      caption.className = 'sr-only';
      
      const figure = table.closest('figure');
      const figcaption = figure?.querySelector('figcaption');
      if (figcaption) {
        caption.textContent = figcaption.textContent;
        figcaption.setAttribute('aria-hidden', 'true');
      } else {
        const prevElement = table.previousElementSibling;
        if (prevElement && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(prevElement.tagName)) {
          caption.textContent = prevElement.textContent;
        } else {
          caption.textContent = `Table ${index + 1}`;
        }
      }
      table.prepend(caption);
    }
    
    // ── 3. Add accessibility attributes ──
    const headers = table.querySelectorAll('thead th, thead td');
    headers.forEach(th => {
      if (!th.hasAttribute('scope')) {
        th.setAttribute('scope', 'col');
      }
    });
    
    // Convert first column to row headers
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const firstCell = row.querySelector('td:first-child');
      if (firstCell && !firstCell.hasAttribute('scope')) {
        const th = doc.createElement('th');
        th.setAttribute('scope', 'row');
        th.innerHTML = firstCell.innerHTML;
        th.className = firstCell.className;
        
        Array.from(firstCell.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            th.setAttribute(attr.name, attr.value);
          }
        });
        
        firstCell.parentNode.replaceChild(th, firstCell);
      }
    });
    
    // ── 4. Add data labels for mobile ──
    const headerTexts = [];
    headers.forEach(th => {
      headerTexts.push(th.textContent.trim());
    });
    
    table.querySelectorAll('tbody tr').forEach(row => {
      row.querySelectorAll('td, th').forEach((cell, cellIndex) => {
        if (headerTexts[cellIndex]) {
          cell.setAttribute('data-label', headerTexts[cellIndex]);
        }
      });
    });
    
    // ── 5. Add WordPress and custom classes ──
    table.classList.add('wp-block-table', 'ppra-table');
    
    // Preserve WordPress stripe style
    const figure = table.closest('figure');
    if (figure?.classList.contains('is-style-stripes')) {
      table.classList.add('is-style-stripes');
    }
    
    // Preserve fixed layout
    if (table.classList.contains('has-fixed-layout')) {
      table.classList.add('ppra-table-fixed');
    }
    
    // ── 6. Enhance numeric data ──
    enhanceNumericData(table);
    
    // ── 7. Add sorting capability ──
    if (table.querySelectorAll('tbody tr').length > 2) {
      addSortingCapability(table, doc);
    }
  });
  
  return doc.body.innerHTML;
};

/**
 * Enhance numeric data with visual indicators
 */
const enhanceNumericData = (table) => {
  const numericPatterns = [
    /^\d+\.?\d*%?$/,      // Numbers with optional %
    /^[+-]?\d+\.?\d*%?$/, // With +/- prefix
    /^KES\s*[\d,]+/,      // Currency
    /^[\d,]+\.?\d*$/,     // Comma separated
    /^[+-]?[\d,]+\.?\d*%?$/ // Combined
  ];

  table.querySelectorAll('tbody td, tbody th').forEach(cell => {
    const text = cell.textContent.trim();
    
    const isNumeric = numericPatterns.some(pattern => pattern.test(text));
    
    if (isNumeric) {
      cell.classList.add('numeric');
      
      // Highlight positive/negative changes
      if (text.startsWith('+')) {
        cell.classList.add('positive');
      } else if (text.startsWith('-')) {
        cell.classList.add('negative');
      }
      
      // Highlight percentages
      if (text.includes('%')) {
        cell.classList.add('percentage');
      }
      
      // Highlight currency
      if (text.includes('KES') || text.includes('KSh')) {
        cell.classList.add('currency');
      }
    }
    
    // Highlight status indicators
    if (text.includes('✅') || text.includes('On Track')) {
      cell.classList.add('status-success');
    }
    if (text.includes('⚠️') || text.includes('Needs Improvement')) {
      cell.classList.add('status-warning');
    }
    if (text.includes('❌') || text.includes('Failed')) {
      cell.classList.add('status-danger');
    }
  });
};

/**
 * Add sorting capability to table
 */
const addSortingCapability = (table, doc) => {
  const headers = table.querySelectorAll('thead th, thead td');
  
  headers.forEach((th, index) => {
    const headerText = th.textContent.trim();
    if (!headerText) return;
    
    const sortBtn = doc.createElement('button');
    sortBtn.className = 'sort-btn';
    sortBtn.setAttribute('aria-label', `Sort by ${headerText}`);
    sortBtn.setAttribute('data-sort-key', index);
    sortBtn.innerHTML = '↕';
    
    sortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sortTable(table, index);
    });
    
    th.appendChild(sortBtn);
  });
};

/**
 * Sort table by column
 */
const sortTable = (table, columnIndex) => {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  const currentDirection = table.dataset.sortDirection || 'asc';
  const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
  table.dataset.sortDirection = newDirection;
  
  rows.sort((a, b) => {
    const aCell = a.children[columnIndex];
    const bCell = b.children[columnIndex];
    const aValue = aCell?.textContent?.trim() || '';
    const bValue = bCell?.textContent?.trim() || '';
    
    const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
    const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    return newDirection === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });
  
  rows.forEach(row => tbody.appendChild(row));
  
  const headers = table.querySelectorAll('thead th, thead td');
  headers.forEach((th, index) => {
    const btn = th.querySelector('.sort-btn');
    if (btn) {
      if (index === columnIndex) {
        btn.textContent = newDirection === 'asc' ? '▲' : '▼';
      } else {
        btn.textContent = '↕';
      }
    }
  });
};
// src/services/blogApi.js
// ... (keep everything before the file extraction section)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE EXTRACTION UTILITIES - CONSOLIDATED & IMPROVED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract WPDM download links from HTML content
 */
export const extractBlogDownloadLinks = (htmlContent) => {
  if (!htmlContent) return [];
  const links = [];
  const regex = /data-downloadurl="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    links.push(match[1]);
  }
  
  return links;
};

/**
 * Enhanced: Extract file information from WPDM embed with better parsing
 * CONSOLIDATED VERSION - Single source of truth
 * Handles multiple WPDM structures including:
 * - wpdm-link-tpl with data-durl
 * - link-template-default with data-downloadurl
 * - Generic download URLs with wpdm-download-link
 */
export const extractBlogFileInfo = (htmlContent) => {
  const fileInfo = [];
  
  if (!htmlContent) {
    console.log('No HTML content provided for file extraction');
    return fileInfo;
  }

  console.log('Extracting files from HTML content...');
  console.log('HTML content length:', htmlContent.length);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 1: Find all WPDM blocks and extract data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // First, find all wpdm-link-tpl divs
  const blockRegex = /<div[^>]*class="[^"]*wpdm-link-tpl[^"]*"[^>]*data-durl="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<div style="clear[^>]*><\/div>/g;
  
  let match;
  let foundFiles = 0;
  
  while ((match = blockRegex.exec(htmlContent)) !== null) {
    foundFiles++;
    const downloadUrl = match[1];
    const blockContent = match[2];
    
    // Extract title from the block
    let title = `File ${foundFiles}`;
    let size = 'Unknown size';
    
    // Try to find the title in the block
    const titleMatch = blockContent.match(/<strong class="ptitle">([\s\S]*?)<\/strong>/);
    if (titleMatch) {
      // Clean up the title (remove size span and extra whitespace)
      let rawTitle = titleMatch[1];
      // Remove the size span from the title
      rawTitle = rawTitle.replace(/<span[^>]*>[\s\S]*?<\/span>/, '').trim();
      title = rawTitle;
    }
    
    // Extract size from the block
    const sizeMatch = blockContent.match(/<span[^>]*>([\d.]+\s*(MB|KB))<\/span>/);
    if (sizeMatch) {
      size = sizeMatch[1];
    }
    
    // Also try to find the onclick attribute for the download link
    let downloadUrlFromOnclick = null;
    const onclickMatch = blockContent.match(/onclick="location\.href='([^']+)'/);
    if (onclickMatch) {
      downloadUrlFromOnclick = onclickMatch[1];
    }
    
    const finalUrl = downloadUrl || downloadUrlFromOnclick;
    
    if (finalUrl) {
      fileInfo.push({
        title: title,
        downloadUrl: finalUrl,
        size: size
      });
      console.log(`Found file via wpdm-link-tpl: "${title}" (${size})`);
    }
  }
  
  console.log(`Method 1 found ${foundFiles} files via wpdm-link-tpl`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 2: Look for w3eden blocks
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fileInfo.length === 0) {
    console.log('Method 1 found no files, trying method 2 (w3eden)...');
    
    const w3edenRegex = /<div class="w3eden">([\s\S]*?)<\/div>/g;
    let w3edenMatch;
    
    while ((w3edenMatch = w3edenRegex.exec(htmlContent)) !== null) {
      const blockContent = w3edenMatch[1];
      
      // Look for the download URL in onclick
      const onclickMatch = blockContent.match(/onclick="location\.href='([^']+)'/);
      const downloadUrl = onclickMatch ? onclickMatch[1] : null;
      
      if (downloadUrl) {
        // Extract title
        let title = `File ${fileInfo.length + 1}`;
        const titleMatch = blockContent.match(/<strong class="ptitle">([\s\S]*?)<\/strong>/);
        if (titleMatch) {
          let rawTitle = titleMatch[1];
          rawTitle = rawTitle.replace(/<span[^>]*>[\s\S]*?<\/span>/, '').trim();
          title = rawTitle;
        }
        
        // Extract size
        let size = 'Unknown size';
        const sizeMatch = blockContent.match(/<span[^>]*>([\d.]+\s*(MB|KB))<\/span>/);
        if (sizeMatch) {
          size = sizeMatch[1];
        }
        
        fileInfo.push({
          title: title,
          downloadUrl: downloadUrl,
          size: size
        });
        console.log(`Found file via w3eden: "${title}" (${size})`);
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 3: Look for wpdm-download-link with onclick
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fileInfo.length === 0) {
    console.log('Method 2 found no files, trying method 3 (wpdm-download-link)...');
    
    const downloadLinkRegex = /<a[^>]*class="[^"]*wpdm-download-link[^"]*"[^>]*onclick="location\.href='([^']+)'[^>]*>[\s\S]*?<\/a>/g;
    let linkMatch;
    
    while ((linkMatch = downloadLinkRegex.exec(htmlContent)) !== null) {
      const downloadUrl = linkMatch[1];
      
      // Find the surrounding context to get title and size
      const startPos = Math.max(0, linkMatch.index - 300);
      const endPos = Math.min(htmlContent.length, linkMatch.index + 500);
      const context = htmlContent.substring(startPos, endPos);
      
      let title = `File ${fileInfo.length + 1}`;
      const titleMatch = context.match(/<strong class="ptitle">([\s\S]*?)<\/strong>/);
      if (titleMatch) {
        let rawTitle = titleMatch[1];
        rawTitle = rawTitle.replace(/<span[^>]*>[\s\S]*?<\/span>/, '').trim();
        title = rawTitle;
      }
      
      let size = 'Unknown size';
      const sizeMatch = context.match(/<span[^>]*>([\d.]+\s*(MB|KB))<\/span>/);
      if (sizeMatch) {
        size = sizeMatch[1];
      }
      
      // Check if we already have this file
      const exists = fileInfo.some(f => f.downloadUrl === downloadUrl);
      if (!exists && downloadUrl) {
        fileInfo.push({
          title: title,
          downloadUrl: downloadUrl,
          size: size
        });
        console.log(`Found file via download link: "${title}" (${size})`);
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 4: Look for the media-body structure (your specific case)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fileInfo.length === 0) {
    console.log('Method 3 found no files, trying method 4 (media-body)...');
    
    // Look for the media-body structure which contains the title and size
    const mediaBodyRegex = /<div class="media-body">[\s\S]*?<strong class="ptitle">([\s\S]*?)<\/strong>[\s\S]*?<span[^>]*>([\d.]+\s*(MB|KB))<\/span>[\s\S]*?onclick="location\.href='([^']+)'/g;
    
    while ((match = mediaBodyRegex.exec(htmlContent)) !== null) {
      const rawTitle = match[1].trim();
      const size = match[2];
      const downloadUrl = match[4];
      
      // Clean up the title
      const title = rawTitle.replace(/<span[^>]*>[\s\S]*?<\/span>/, '').trim();
      
      if (downloadUrl) {
        fileInfo.push({
          title: title,
          downloadUrl: downloadUrl,
          size: size
        });
        console.log(`Found file via media-body: "${title}" (${size})`);
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 5: Generic fallback - look for data-durl with better context
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fileInfo.length === 0) {
    console.log('Method 4 found no files, trying method 5 (data-durl with context)...');
    
    const dataDurlRegex = /data-durl="([^"]+)"/g;
    const durlMatches = [...htmlContent.matchAll(dataDurlRegex)];
    
    if (durlMatches.length > 0) {
      console.log(`Found ${durlMatches.length} data-durl attributes`);
      
      durlMatches.forEach((durlMatch, index) => {
        const downloadUrl = durlMatch[1];
        const matchIndex = durlMatch.index;
        
        // Get the surrounding context - look for the media-body or ptitle
        const startPos = Math.max(0, matchIndex - 500);
        const endPos = Math.min(htmlContent.length, matchIndex + 100);
        const context = htmlContent.substring(startPos, endPos);
        
        // Try to find title from ptitle
        let title = `File ${index + 1}`;
        const titleMatch = context.match(/<strong class="ptitle">([\s\S]*?)<\/strong>/);
        if (titleMatch) {
          let rawTitle = titleMatch[1];
          // Remove HTML tags and trim
          rawTitle = rawTitle.replace(/<[^>]*>/g, '').trim();
          // Remove size from title if present
          rawTitle = rawTitle.replace(/\d+\.\d+\s*(MB|KB)/, '').trim();
          if (rawTitle) title = rawTitle;
        }
        
        // Try to find size
        let size = 'Unknown size';
        const sizeMatch = context.match(/(\d+\.\d+)\s*(MB|KB)/);
        if (sizeMatch) {
          size = `${sizeMatch[1]} ${sizeMatch[2]}`;
        }
        
        fileInfo.push({
          title: title,
          downloadUrl: downloadUrl,
          size: size
        });
        console.log(`Found file via data-durl: "${title}" (${size})`);
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Method 6: Look for wpdm-download-link without onclick
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (fileInfo.length === 0) {
    console.log('Method 5 found no files, trying method 6...');
    
    // Look for the link that contains the download URL pattern
    const genericUrlRegex = /https:\/\/ppra\.go\.ke\/download\/[^'"\s]+\?wpdmdl=\d+/g;
    const genericMatches = [...htmlContent.matchAll(genericUrlRegex)];
    
    if (genericMatches.length > 0) {
      console.log(`Found ${genericMatches.length} generic download URLs`);
      
      genericMatches.forEach((urlMatch, index) => {
        const downloadUrl = urlMatch[0];
        const matchIndex = urlMatch.index;
        
        // Find the surrounding context
        const startPos = Math.max(0, matchIndex - 300);
        const endPos = Math.min(htmlContent.length, matchIndex + 50);
        const context = htmlContent.substring(startPos, endPos);
        
        let title = `File ${index + 1}`;
        // Look for ptitle in the context
        const titleMatch = context.match(/<strong class="ptitle">([\s\S]*?)<\/strong>/);
        if (titleMatch) {
          let rawTitle = titleMatch[1];
          rawTitle = rawTitle.replace(/<[^>]*>/g, '').trim();
          rawTitle = rawTitle.replace(/\d+\.\d+\s*(MB|KB)/, '').trim();
          if (rawTitle) title = rawTitle;
        }
        
        let size = 'Unknown size';
        const sizeMatch = context.match(/(\d+\.\d+)\s*(MB|KB)/);
        if (sizeMatch) {
          size = `${sizeMatch[1]} ${sizeMatch[2]}`;
        }
        
        // Check if we already have this file
        const exists = fileInfo.some(f => f.downloadUrl === downloadUrl);
        if (!exists) {
          fileInfo.push({
            title: title,
            downloadUrl: downloadUrl,
            size: size
          });
        }
      });
    }
  }

  console.log(`Successfully extracted ${fileInfo.length} files:`, fileInfo.map(f => ({ title: f.title, size: f.size })));
  return fileInfo;
};

/**
 * Helper function to check if content has WPDM files
 */
export const hasWpdmFiles = (htmlContent) => {
  if (!htmlContent) return false;
  return htmlContent.includes('data-downloadurl="') || 
         htmlContent.includes('wpdm-download-link') ||
         htmlContent.includes('class="w3eden"') ||
         htmlContent.includes('data-durl="') ||
         htmlContent.includes('wpdm-link-tpl');
};

/**
 * Helper function to get file count from HTML
 */
export const getWpdmFileCount = (htmlContent) => {
  if (!htmlContent) return 0;
  
  let count = 0;
  const patterns = [
    /data-downloadurl="([^"]+)"/g,
    /data-durl="([^"]+)"/g,
    /wpdm-download-link/g,
    /wpdmdl=\d+/g
  ];
  
  patterns.forEach(pattern => {
    const matches = htmlContent.match(pattern);
    if (matches && matches.length > count) {
      count = matches.length;
    }
  });
  
  return count;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORIGINAL API FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Fetch blog posts with optional parameters
export const fetchBlogPosts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      per_page: params.per_page || 9,
      page: params.page || 1,
      _embed: true,
      status: 'publish',
      ...params
    });

    const url = `${BLOG_API_ENDPOINTS.posts}?${queryParams}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Raw API data count:', data.length);
    
    const total = parseInt(response.headers.get('X-WP-Total')) || 0;
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages')) || 0;
    
    return {
      posts: data,
      total,
      totalPages,
      currentPage: params.page || 1
    };
  } catch (error) {
    console.error('Error in fetchBlogPosts:', error);
    throw error;
  }
};

// Fetch a single blog post by slug
export const fetchBlogPostBySlug = async (slug) => {
  const response = await fetch(`${BLOG_API_ENDPOINTS.posts}?slug=${slug}&_embed=true`);
  if (!response.ok) throw new Error(`Failed to fetch blog post: ${response.status}`);
  
  const posts = await response.json();
  if (posts.length === 0) throw new Error('Blog post not found');
  
  return posts[0];
};

// Fetch blog posts by category
export const fetchBlogPostsByCategory = async (categoryId, params = {}) => {
  return fetchBlogPosts({
    categories: categoryId,
    ...params
  });
};

// Fetch featured blog posts
export const fetchFeaturedBlogPosts = async (params = {}) => {
  return fetchBlogPosts({
    sticky: true,
    ...params
  });
};

// Search blog posts
export const searchBlogPosts = async (searchTerm, params = {}) => {
  return fetchBlogPosts({
    search: searchTerm,
    ...params
  });
};

/**
 * Remove WPDM blocks from content
 */
export const cleanWpdmContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  let cleaned = htmlContent;
  
  // Remove entire WPDM div blocks
  cleaned = cleaned.replace(/<div class="w3eden">[\s\S]*?<\/div>/g, '');
  cleaned = cleaned.replace(/<div class="link-template-default[^"]*">[\s\S]*?<\/div>/g, '');
  cleaned = cleaned.replace(/<div class="wpdm-link-tpl[^"]*"[\s\S]*?<\/div>/g, '');
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*wpdm-link-tpl[^"]*"[^>]*>[\s\S]*?<\/div>\s*<div style="clear[^>]*><\/div>/g, '');
  
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
  cleaned = cleaned.replace(/<p><\/p>/g, '');
  
  // Remove leftover WPDM classes and attributes
  cleaned = cleaned.replace(/class="[^"]*wpdm[^"]*"/g, '');
  cleaned = cleaned.replace(/data-downloadurl="[^"]*"/g, '');
  cleaned = cleaned.replace(/data-durl="[^"]*"/g, '');
  cleaned = cleaned.replace(/data-[\w-]+="[^"]*"/g, '');
  
  // Remove download-related text
  cleaned = cleaned.replace(/To download the[\s\S]*?use the link below:/g, '');
  cleaned = cleaned.replace(/\s*Download\s*/g, '');
  
  return cleaned;
};

/**
 * Final content cleanup
 */
export const finalContentCleanup = (htmlContent) => {
  if (!htmlContent) return '';
  
  let cleaned = htmlContent;
  
  // Remove multiple line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Remove empty divs
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');
  
  // Fix spacing around tables
  cleaned = cleaned.replace(/<\/table>\s*<p>/g, '</table><p>');
  cleaned = cleaned.replace(/<\/p>\s*<table/g, '</p><table');
  
  return cleaned;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TABLE PARSING FOR REACT-TABLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Parse HTML table into structured data for React-Table
 */
export const parseTableToData = (tableElement) => {
  if (!tableElement) return { headers: [], data: [] };
  
  const headerRow = tableElement.querySelector('thead tr');
  const headers = [];
  
  if (headerRow) {
    headerRow.querySelectorAll('th, td').forEach(th => {
      headers.push(th.textContent.trim());
    });
  }
  
  if (headers.length === 0) {
    const firstRow = tableElement.querySelector('tbody tr');
    if (firstRow) {
      firstRow.querySelectorAll('td, th').forEach((cell, index) => {
        if (index === 0) {
          headers.push(cell.textContent.trim());
        }
      });
    }
  }
  
  const data = [];
  const rows = tableElement.querySelectorAll('tbody tr');
  
  rows.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td, th');
    
    cells.forEach((cell, index) => {
      const headerKey = headers[index] || `column_${index}`;
      rowData[headerKey] = cell.textContent.trim();
    });
    
    data.push(rowData);
  });
  
  return { headers, data };
};

// Cache for parsed tables
const tableParseCache = new Map();

/**
 * Parse all tables in HTML content with caching
 */
export const parseAllTables = (htmlContent) => {
  if (!htmlContent) return [];
  
  const cacheKey = htmlContent.substring(0, 100) + htmlContent.length;
  if (tableParseCache.has(cacheKey)) {
    console.log('Returning cached table parse result');
    return tableParseCache.get(cacheKey);
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const tables = doc.querySelectorAll('table');
  
  const parsedTables = [];
  
  tables.forEach((table, index) => {
    let caption = '';
    const captionElement = table.querySelector('caption');
    if (captionElement) {
      caption = captionElement.textContent.trim();
    } else {
      const figure = table.closest('figure');
      const figcaption = figure?.querySelector('figcaption');
      if (figcaption) {
        caption = figcaption.textContent.trim();
      } else {
        const prevElement = table.previousElementSibling;
        if (prevElement && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(prevElement.tagName)) {
          caption = prevElement.textContent.trim();
        } else {
          caption = `Table ${index + 1}`;
        }
      }
    }
    
    const { headers, data } = parseTableToData(table);
    
    if (data.length > 0) {
      parsedTables.push({
        index,
        caption,
        headers,
        data,
        rawHtml: table.outerHTML,
      });
    }
  });
  
  tableParseCache.set(cacheKey, parsedTables);
  
  if (tableParseCache.size > 50) {
    const firstKey = tableParseCache.keys().next().value;
    tableParseCache.delete(firstKey);
  }
  
  return parsedTables;
};

/**
 * Remove tables from HTML content
 */
export const removeTablesFromContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const tables = doc.querySelectorAll('table');
  tables.forEach(table => table.remove());
  return doc.body.innerHTML;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE TRANSFORM FUNCTIONS (MOVED FROM NEWS DATA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Transform WordPress post to blog format
 * This is the CORE transform function used by all content types
 */
export const transformPostToBlog = (post) => {
  console.log('Transforming post:', post.id, post.title?.rendered);
  
  // Extract featured image URL
  const featuredImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                          post._embedded?.['wp:featuredmedia']?.[0]?.guid?.rendered ||
                          '';

  // Get author name
  let authorName = 'PPRA Staff';
  if (post._embedded?.author?.[0]?.name) {
    authorName = post._embedded.author[0].name;
  } else if (post.author) {
    const authorMap = {
      1: 'PPRA Admin',
      3: 'PPRA Staff',
      4: 'PPRA Communications'
    };
    authorName = authorMap[post.author] || `PPRA Staff (ID: ${post.author})`;
  }

  // Get categories
  let categories = [];
  let categoryNames = [];
  let primaryCategory = 'Blog';
  
  if (post._embedded?.['wp:term']) {
    const termData = post._embedded['wp:term'];
    
    if (Array.isArray(termData) && termData.length > 0) {
      const categoryTerms = termData[0] || [];
      categoryNames = categoryTerms.map(cat => cat.name).filter(Boolean);
      
      categories = categoryTerms.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      }));
      
      if (categoryNames.length > 0) {
        primaryCategory = categoryNames[0];
      }
    }
  }
  
  if (categoryNames.length === 0 && post.categories && post.categories.length > 0) {
    if (post._embedded?.['wp:term']?.[0]) {
      const terms = post._embedded['wp:term'][0];
      const matchedTerms = terms.filter(term => post.categories.includes(term.id));
      categoryNames = matchedTerms.map(term => term.name);
      categories = matchedTerms.map(term => ({
        id: term.id,
        name: term.name,
        slug: term.slug
      }));
      if (categoryNames.length > 0) {
        primaryCategory = categoryNames[0];
      }
    }
  }

  // Process content
  let processedContent = post.content?.rendered || '';
  
  // Extract files BEFORE removing WPDM blocks
  const files = extractBlogFileInfo(processedContent);
  const downloadLinks = extractBlogDownloadLinks(processedContent);
  
  // Remove WPDM blocks from content
  processedContent = cleanWpdmContent(processedContent);
  
  // Parse tables for React-Table
  const parsedTables = parseAllTables(processedContent);
  
  // Remove tables from content
  const contentWithoutTables = removeTablesFromContent(processedContent);
  
  // Final cleanup
  const finalContent = finalContentCleanup(contentWithoutTables);
  
  const hasTable = parsedTables.length > 0;
  const tableCount = parsedTables.length;

  const transformed = {
    id: post.id,
    title: post.title?.rendered || 'Untitled',
    slug: post.slug || `blog-post-${post.id}`,
    categories: categoryNames,
    category: primaryCategory,
    date: post.date || new Date().toISOString(),
    author: authorName,
    image: featuredImageUrl,
    summary: post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || 
             post.content?.rendered?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
    content: finalContent,
    tables: parsedTables,
    tags: post.tags || [],
    isFeatured: post.sticky || false,
    featuredMedia: post.featured_media,
    files: files,
    downloadLinks: downloadLinks,
    link: post.link || '',
    status: post.status,
    raw: post,
    hasTables: hasTable,
    tableCount: tableCount,
  };
  
  console.log(`Transformed blog: ${transformed.id}, Tables: ${transformed.tableCount}, Files: ${transformed.files.length}`);
  return transformed;
};

/**
 * Transform multiple posts
 */
export const transformPostsToBlogs = (posts) => {
  console.log('Transforming', posts.length, 'posts to blogs');
  const transformed = posts.map(post => transformPostToBlog(post));
  console.log('Transformed blogs:', transformed.length);
  return transformed;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getBlogCategoryColor = (category) => {
  const colors = {
    'Blog': 'bg-blue-100 text-blue-800 border-blue-200',
    'News': 'bg-green-100 text-green-800 border-green-200',
    'Reports': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Announcements': 'bg-purple-100 text-purple-800 border-purple-200',
    'Tenders': 'bg-orange-100 text-orange-800 border-orange-200',
    'Circulars': 'bg-red-100 text-red-800 border-red-200',
    'Addendum': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getBlogCategories = (blogs) => {
  const allCategories = new Set();
  blogs.forEach(blog => {
    blog.categories.forEach(cat => allCategories.add(cat));
  });
  return ['All', ...Array.from(allCategories).sort()];
};

export const getBlogCategoryCount = (blogs, category) => {
  if (category === 'All') return blogs.length;
  return blogs.filter(blog => blog.categories.includes(category)).length;
};

export const getFilteredBlogs = (blogs, category) => {
  if (category === 'All') return blogs;
  return blogs.filter(blog => blog.categories.includes(category));
};

export const getFeaturedBlogs = (blogs) => {
  return blogs.filter(item => item.isFeatured);
};

export const getLatestBlogs = (blogs, limit = 6) => {
  return [...blogs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getBlogBySlug = (blogs, slug) => {
  return blogs.find(item => item.slug === slug);
};

export const getRelatedBlogs = (blogs, currentId, limit = 3) => {
  return blogs
    .filter(item => item.id !== currentId)
    .slice(0, limit);
};