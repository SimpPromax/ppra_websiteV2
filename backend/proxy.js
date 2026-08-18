// proxy.js - COMPLETE WORKING VERSION WITH CORS FIX & CACHE
// ============================================
// CORS PROXY ROUTES FOR PPRA PAGES
// ============================================

// ============================================
// CACHE SYSTEM
// ============================================
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const MAX_CACHE_SIZE = 20; // Maximum number of cached responses

/**
 * Clean up old cache entries when cache gets too large
 */
function cleanCache() {
  if (cache.size > MAX_CACHE_SIZE) {
    console.log(`🧹 [Cache] Cleaning old entries (${cache.size} entries)`);
    const entries = Array.from(cache.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Remove oldest 30%
    const toRemove = Math.floor(entries.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0]);
    }
    console.log(`🧹 [Cache] Removed ${toRemove} old entries, ${cache.size} remaining`);
  }
}

/**
 * Get cached response if valid
 */
function getCachedResponse(url) {
  if (cache.has(url)) {
    const cached = cache.get(url);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ [Cache] HIT for ${url} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
      return cached;
    } else {
      console.log(`⏰ [Cache] EXPIRED for ${url} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
      cache.delete(url);
    }
  }
  return null;
}

/**
 * Store response in cache
 */
function setCachedResponse(url, html) {
  cleanCache();
  cache.set(url, {
    html: html,
    timestamp: Date.now(),
    size: html.length
  });
  console.log(`💾 [Cache] Stored ${html.length} bytes for ${url}`);
}

// ============================================
// SET CORS HEADERS (Helper Function)
// ============================================
function setCORSHeaders(res) {
  const origin = res.req?.headers?.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Cache, X-Cache-Age');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ============================================
// HELPER: FETCH PPRA PAGE WITH IMPROVED PERFORMANCE
// ============================================
async function fetchPPRAPage(url, res, options = {}) {
  const {
    timeout = 45000, // Increased to 45 seconds
    forceRefresh = false,
    compress = true,
  } = options;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedResponse(url);
    if (cached) {
      // Set CORS headers
      setCORSHeaders(res);
      
      // Send cached response
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', Math.round((Date.now() - cached.timestamp) / 1000) + 's');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      
      return res.send(cached.html);
    }
  }

  console.log(`🔄 [Proxy] Fetching: ${url}`);
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ [Proxy] Status: ${response.status} for ${url}`);
      setCORSHeaders(res);
      return res.status(response.status).json({
        error: `PPRA returned ${response.status}`,
        status: response.status,
        url: url,
        timestamp: new Date().toISOString()
      });
    }

    // Get the response as text
    const html = await response.text();
    const size = html.length;
    console.log(`✅ [Proxy] Fetched ${size} bytes from ${url}`);

    // Store in cache (if not too small)
    if (size > 1000) {
      setCachedResponse(url, html);
    }

    // Set CORS headers
    setCORSHeaders(res);
    
    // Set response headers
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', size);
    
    // Send the HTML
    res.send(html);
    
  } catch (error) {
    console.error('❌ [Proxy] Error:', error.message);
    
    // Set CORS headers even on error
    setCORSHeaders(res);
    
    // Check if it was a timeout
    if (error.name === 'AbortError') {
      console.error('⏰ [Proxy] Request timed out after', timeout, 'ms');
      return res.status(504).json({
        error: 'Request timed out',
        details: `The request to ${url} took longer than ${timeout}ms to complete`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch page from PPRA',
      details: error.message,
      url: url,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================
// SETUP PROXY ROUTES
// ============================================
function setupProxyRoutes(app) {
  console.log('🔧 [Proxy] Setting up routes...');

  // ✅ FIXED CORS middleware for all proxy routes
  app.use('/api/proxy', (req, res, next) => {
    setCORSHeaders(res);
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ============================================
  // PROXY ENDPOINTS
  // ============================================

  /**
   * GET /api/proxy/arb-decisions
   * Proxy for ARB Decisions page with caching
   */
  app.get('/api/proxy/arb-decisions', (req, res) => {
    console.log('📥 [Proxy] ARB Decisions request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/arb-decisions/', res, {
      timeout: 60000, // 60 seconds for ARB decisions (large page)
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  /**
   * GET /api/proxy/compliance-reports
   * Proxy for Compliance Reports page with caching
   */
  app.get('/api/proxy/compliance-reports', (req, res) => {
    console.log('📥 [Proxy] Compliance Reports request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/compliance-reports/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  /**
 * GET /api/proxy/market-price-index
 * Proxy for Market Price Index page with caching
 */
app.get('/api/proxy/market-price-index', (req, res) => {
  console.log('📥 [Proxy] Market Price Index request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/market-price-index/', res, {
    timeout: 45000,
    forceRefresh: forceRefresh,
    compress: true
  });
});

  // ============================================
  // ✅ NEW: Circulars Endpoint
  // ============================================
  /**
   * GET /api/proxy/circulars
   * Proxy for Circulars page with caching
   * Handles both WPDM (card-style) and MDocs (table-style) files
   */
  app.get('/api/proxy/circulars', (req, res) => {
    console.log('📥 [Proxy] Circulars request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/circulars/', res, {
      timeout: 45000, // 45 seconds
      forceRefresh: forceRefresh,
      compress: true
    });
  });


  /**
 * GET /api/proxy/annual-reports
 * Proxy for Annual Reports page with caching
 */
app.get('/api/proxy/annual-reports', (req, res) => {
  console.log('📥 [Proxy] Annual Reports request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/annual-reports/', res, {
    timeout: 45000,
    forceRefresh: forceRefresh,
    compress: true
  });
});


/**
 * GET /api/proxy/standard-tender-documents
 * Proxy for Standard Tender Documents page with caching
 */
app.get('/api/proxy/standard-tender-documents', (req, res) => {
  console.log('📥 [Proxy] Standard Tender Documents request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/standard-tender-documents/', res, {
    timeout: 60000, // 60 seconds for large page
    forceRefresh: forceRefresh,
    compress: true
  });
});


/**
 * GET /api/proxy/tender-security-providers
 * Proxy for Tender Security Providers page with caching
 */
app.get('/api/proxy/tender-security-providers', (req, res) => {
  console.log('📥 [Proxy] Tender Security Providers request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/tender-security-providers/', res, {
    timeout: 30000,
    forceRefresh: forceRefresh,
    compress: true
  });
});



/**
 * GET /api/proxy/strategic-plan
 * Proxy for Strategic Plan page with caching
 */
app.get('/api/proxy/strategic-plan', (req, res) => {
  console.log('📥 [Proxy] Strategic Plan request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/strategc-plan/', res, {
    timeout: 30000,
    forceRefresh: forceRefresh,
    compress: true
  });
});


/**
 * GET /api/proxy/debarred-firms
 * Proxy for Debarred Firms page with caching
 */
app.get('/api/proxy/debarred-firms', (req, res) => {
  console.log('📥 [Proxy] Debarred Firms request received');
  const forceRefresh = req.query.refresh === 'true';
  fetchPPRAPage('https://ppra.go.ke/debarred-firms/', res, {
    timeout: 30000,
    forceRefresh: forceRefresh,
    compress: true
  });
});

  /**
   * GET /api/proxy/ppra/:page
   * Generic proxy for any PPRA page with caching
   */
  app.get('/api/proxy/ppra/:page', (req, res) => {
    const page = req.params.page;
    const forceRefresh = req.query.refresh === 'true';
    
    console.log(`📥 [Proxy] Generic page request: ${page}`);
    
    // Security: Prevent directory traversal
    if (!page || page.includes('..') || page.includes('/') || page.includes('\\')) {
      setCORSHeaders(res);
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'Page name cannot contain path separators',
        timestamp: new Date().toISOString()
      });
    }
    
    // Whitelist of allowed pages (optional - uncomment to restrict)
    // const allowedPages = ['arb-decisions', 'compliance-reports', 'circulars', 'procurement-news', 'tenders'];
    // if (!allowedPages.includes(page)) {
    //   setCORSHeaders(res);
    //   return res.status(403).json({
    //     error: 'Page not allowed',
    //     message: `Page "${page}" is not in the allowed list`,
    //     timestamp: new Date().toISOString()
    //   });
    // }
    
    fetchPPRAPage(`https://ppra.go.ke/${page}/`, res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  /**
   * GET /api/proxy/cache/stats
   * Admin endpoint to view cache statistics
   */
  app.get('/api/proxy/cache/stats', (req, res) => {
    setCORSHeaders(res);
    
    const stats = {
      enabled: true,
      totalEntries: cache.size,
      maxEntries: MAX_CACHE_SIZE,
      ttl: CACHE_TTL,
      ttlMinutes: CACHE_TTL / 60000,
      entries: Array.from(cache.entries()).map(([url, data]) => ({
        url: url,
        size: data.size,
        sizeFormatted: (data.size / 1024).toFixed(1) + ' KB',
        age: Math.round((Date.now() - data.timestamp) / 1000) + 's',
        timestamp: new Date(data.timestamp).toISOString()
      })),
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
  });

  /**
   * DELETE /api/proxy/cache
   * Admin endpoint to clear the cache
   */
  app.delete('/api/proxy/cache', (req, res) => {
    const size = cache.size;
    cache.clear();
    console.log(`🧹 [Cache] Cleared all ${size} cache entries`);
    
    setCORSHeaders(res);
    res.json({
      success: true,
      message: `Cleared ${size} cache entries`,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * GET /api/proxy/health
   * Health check endpoint
   */
  app.get('/api/proxy/health', (req, res) => {
    setCORSHeaders(res);
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PPRA CORS Proxy v2.0',
      cors: {
        status: 'enabled',
        headers: 'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods'
      },
      cache: {
        enabled: true,
        entries: cache.size,
        maxEntries: MAX_CACHE_SIZE,
        ttl: CACHE_TTL / 60000 + ' minutes'
      },
      endpoints: [
        { path: '/api/proxy/arb-decisions', method: 'GET', description: 'ARB Decisions page' },
        { path: '/api/proxy/compliance-reports', method: 'GET', description: 'Compliance Reports page' },
        { path: '/api/proxy/circulars', method: 'GET', description: 'Circulars page (WPDM + MDocs)' }, // ✅ Updated
        { path: '/api/proxy/ppra/:page', method: 'GET', description: 'Generic PPRA page' },
        { path: '/api/proxy/cache/stats', method: 'GET', description: 'Cache statistics (admin)' },
        { path: '/api/proxy/cache', method: 'DELETE', description: 'Clear cache (admin)' },
        { path: '/api/proxy/health', method: 'GET', description: 'Health check' }
      ],
      performance: {
        maxTimeout: '60s',
        compression: 'gzip',
        cacheLifetime: '5 minutes'
      }
    });
  });

  console.log('✅ [Proxy] Routes registered (CORS fixed):');
  console.log('   GET /api/proxy/arb-decisions');
  console.log('   GET /api/proxy/compliance-reports');
  console.log('   GET /api/proxy/circulars'); // ✅ Added
  console.log('   GET /api/proxy/ppra/:page');
  console.log('   GET /api/proxy/cache/stats');
  console.log('   DELETE /api/proxy/cache');
  console.log('   GET /api/proxy/health');
  console.log(`   📊 Cache: ${cache.size} entries, TTL: ${CACHE_TTL/60000} minutes`);
}

// ============================================
// EXPORT THE SETUP FUNCTION
// ============================================
module.exports = { setupProxyRoutes };