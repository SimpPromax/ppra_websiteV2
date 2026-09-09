// proxy.js - COMPLETE WORKING VERSION WITH 24-HOUR CACHE + AUTO-REFRESH
// ============================================
// CORS PROXY ROUTES FOR PPRA PAGES
// ============================================

// ============================================
// CACHE SYSTEM
// ============================================
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for other pages
const MAX_CACHE_SIZE = 20; // Maximum number of cached responses

// ━━━ 24 HOUR CACHE FOR ARB DECISIONS ━━━
const ARB_CACHE_KEY = 'arb_decisions_v2';
const ARB_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ━━━ 24 HOUR CACHE FOR COMPLIANCE REPORTS ━━━
const COMPLIANCE_CACHE_KEY = 'compliance_reports_v2';
const COMPLIANCE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Cache, X-Cache-Age, X-Cache-Expires');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ============================================
// HELPER: FETCH PPRA PAGE WITH IMPROVED PERFORMANCE
// ============================================
async function fetchPPRAPage(url, res, options = {}) {
  const {
    timeout = 45000,
    forceRefresh = false,
    compress = true,
  } = options;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedResponse(url);
    if (cached) {
      setCORSHeaders(res);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', Math.round((Date.now() - cached.timestamp) / 1000) + 's');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(cached.html);
    }
  }

  console.log(`🔄 [Proxy] Fetching: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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

    const html = await response.text();
    const size = html.length;
    console.log(`✅ [Proxy] Fetched ${size} bytes from ${url}`);

    if (size > 1000) {
      setCachedResponse(url, html);
    }

    setCORSHeaders(res);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', size);
    res.send(html);
    
  } catch (error) {
    console.error('❌ [Proxy] Error:', error.message);
    setCORSHeaders(res);
    
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
// HELPER: FETCH PAGE FOR CACHING (used by auto-refresh)
// ============================================
async function fetchPageForCache(url, timeout = 60000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PPRA-Auto-Refresh/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'text/html,application/xhtml+xml',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    if (html.length < 1000) {
      throw new Error(`HTML too small (${html.length} bytes)`);
    }
    
    return html;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// ============================================
// AUTO-REFRESH: Refresh ARB cache at 3 AM daily
// ============================================

/**
 * Refresh the ARB Decisions cache
 */
async function refreshARBCache() {
  console.log('🔄 [Auto-Refresh] Fetching fresh ARB decisions...');
  const startTime = Date.now();
  
  try {
    const html = await fetchPageForCache('https://ppra.go.ke/arb-decisions/', 60000);
    const size = html.length;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    
    cache.set(ARB_CACHE_KEY, {
      html: html,
      timestamp: Date.now(),
      size: size
    });
    
    console.log(`✅ [Auto-Refresh] ARB cache updated: ${sizeMB} MB (${duration}ms)`);
    console.log(`   Next expiry: ${new Date(Date.now() + ARB_CACHE_TTL).toLocaleString()}`);
    return true;
    
  } catch (error) {
    console.error(`❌ [Auto-Refresh] ARB failed:`, error.message);
    console.log(`⚠️ [Auto-Refresh] Keeping existing ARB cache`);
    return false;
  }
}

/**
 * Refresh the Compliance Reports cache
 */
async function refreshComplianceCache() {
  console.log('🔄 [Auto-Refresh] Fetching fresh Compliance Reports...');
  const startTime = Date.now();
  
  try {
    const html = await fetchPageForCache('https://ppra.go.ke/compliance-reports/', 60000);
    const size = html.length;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    
    cache.set(COMPLIANCE_CACHE_KEY, {
      html: html,
      timestamp: Date.now(),
      size: size
    });
    
    console.log(`✅ [Auto-Refresh] Compliance cache updated: ${sizeMB} MB (${duration}ms)`);
    console.log(`   Next expiry: ${new Date(Date.now() + COMPLIANCE_CACHE_TTL).toLocaleString()}`);
    return true;
    
  } catch (error) {
    console.error(`❌ [Auto-Refresh] Compliance failed:`, error.message);
    console.log(`⚠️ [Auto-Refresh] Keeping existing Compliance cache`);
    return false;
  }
}

/**
 * Refresh ALL caches
 */
async function refreshAllCaches() {
  console.log('🔄 [Auto-Refresh] Refreshing ALL caches...');
  const results = await Promise.all([
    refreshARBCache(),
    refreshComplianceCache()
  ]);
  
  const successCount = results.filter(r => r === true).length;
  console.log(`✅ [Auto-Refresh] ${successCount}/${results.length} caches refreshed`);
  return results;
}

/**
 * Schedule daily refresh at 3 AM
 */
function scheduleDailyRefresh() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    3, 0, 0, 0 // 3:00 AM
  );
  
  const msToMidnight = night.getTime() - now.getTime();
  
  console.log(`⏰ [Scheduler] Next cache refresh at: ${night.toLocaleString()}`);
  console.log(`   (in ${Math.round(msToMidnight / 60000)} minutes)`);
  console.log(`   📊 Will refresh: ARB Decisions + Compliance Reports`);
  
  // Schedule first refresh
  setTimeout(async () => {
    console.log('🔄 [Scheduler] Running scheduled 3 AM refresh...');
    await refreshAllCaches();
    
    // Schedule again for next day (every 24 hours)
    setInterval(async () => {
      console.log('🔄 [Scheduler] Running daily 3 AM refresh...');
      await refreshAllCaches();
    }, 24 * 60 * 60 * 1000);
    
  }, msToMidnight);
}

// ============================================
// SETUP PROXY ROUTES
// ============================================
function setupProxyRoutes(app) {
  console.log('🔧 [Proxy] Setting up routes...');

  app.use('/api/proxy', (req, res, next) => {
    setCORSHeaders(res);
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ============================================
  // PROXY ENDPOINTS - LEGACY (5-min cache)
  // ============================================

  app.get('/api/proxy/arb-decisions', (req, res) => {
    console.log('📥 [Proxy] ARB Decisions request received (legacy)');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/arb-decisions/', res, {
      timeout: 60000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/compliance-reports', (req, res) => {
    console.log('📥 [Proxy] Compliance Reports request received (legacy)');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/compliance-reports/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  // ============================================
  // NEW: 24-HOUR USER-INITIATED CACHING
  // ============================================

  /**
   * GET /api/proxy/arb-decisions-v2
   * ARB Decisions with 24-hour cache + auto-refresh at 3 AM
   */
  app.get('/api/proxy/arb-decisions-v2', async (req, res) => {
    console.log('📥 [Proxy v2] ARB Decisions request received');
    const forceRefresh = req.query.refresh === 'true';
    
    if (!forceRefresh && cache.has(ARB_CACHE_KEY)) {
      const cached = cache.get(ARB_CACHE_KEY);
      const age = Date.now() - cached.timestamp;
      
      if (age < ARB_CACHE_TTL) {
        const hoursOld = Math.round(age / (60 * 60 * 1000));
        const displayAge = hoursOld > 0 ? `${hoursOld} hours` : `${Math.round(age / (60 * 1000))} minutes`;
        const expiresAt = new Date(cached.timestamp + ARB_CACHE_TTL);
        
        console.log(`📦 [Cache HIT] ARB: ${cached.html.length} bytes, ${displayAge} old`);
        setCORSHeaders(res);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', displayAge);
        res.setHeader('X-Cache-Expires', expiresAt.toISOString());
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(cached.html);
      } else {
        cache.delete(ARB_CACHE_KEY);
        console.log('⏰ [Cache] ARB EXPIRED after 24 hours');
      }
    }
    
    console.log('👤 [First User] Fetching ARB from PPRA (15-30s)...');
    console.log('💾 This will be cached for 24 hours');
    
    try {
      const html = await fetchPageForCache('https://ppra.go.ke/arb-decisions/', 60000);
      const size = html.length;
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const expiresAt = new Date(Date.now() + ARB_CACHE_TTL);
      
      cache.set(ARB_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: size
      });
      
      console.log(`✅ [Fetched] ARB: ${sizeMB} MB cached for 24 hours`);
      console.log(`📊 Expires: ${expiresAt.toLocaleString()}`);
      
      setCORSHeaders(res);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Expires', expiresAt.toISOString());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      
    } catch (error) {
      console.error('❌ [Error] ARB:', error.message);
      setCORSHeaders(res);
      
      if (cache.has(ARB_CACHE_KEY)) {
        const stale = cache.get(ARB_CACHE_KEY);
        const age = Math.round((Date.now() - stale.timestamp) / (60 * 60 * 1000));
        console.warn(`⚠️ Using stale ARB cache (${age} hours old)`);
        res.setHeader('X-Cache', 'STALE');
        res.setHeader('X-Cache-Error', error.message);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(stale.html);
      }
      
      res.status(503).json({
        error: 'Unable to fetch ARB decisions',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * GET /api/proxy/compliance-reports-v2
   * Compliance Reports with 24-hour cache + auto-refresh at 3 AM
   */
  app.get('/api/proxy/compliance-reports-v2', async (req, res) => {
    console.log('📥 [Proxy v2] Compliance Reports request received');
    const forceRefresh = req.query.refresh === 'true';
    
    if (!forceRefresh && cache.has(COMPLIANCE_CACHE_KEY)) {
      const cached = cache.get(COMPLIANCE_CACHE_KEY);
      const age = Date.now() - cached.timestamp;
      
      if (age < COMPLIANCE_CACHE_TTL) {
        const hoursOld = Math.round(age / (60 * 60 * 1000));
        const displayAge = hoursOld > 0 ? `${hoursOld} hours` : `${Math.round(age / (60 * 1000))} minutes`;
        const expiresAt = new Date(cached.timestamp + COMPLIANCE_CACHE_TTL);
        
        console.log(`📦 [Cache HIT] Compliance: ${cached.html.length} bytes, ${displayAge} old`);
        setCORSHeaders(res);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', displayAge);
        res.setHeader('X-Cache-Expires', expiresAt.toISOString());
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(cached.html);
      } else {
        cache.delete(COMPLIANCE_CACHE_KEY);
        console.log('⏰ [Cache] Compliance EXPIRED after 24 hours');
      }
    }
    
    console.log('👤 [First User] Fetching Compliance from PPRA (15-30s)...');
    console.log('💾 This will be cached for 24 hours');
    
    try {
      const html = await fetchPageForCache('https://ppra.go.ke/compliance-reports/', 60000);
      const size = html.length;
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const expiresAt = new Date(Date.now() + COMPLIANCE_CACHE_TTL);
      
      cache.set(COMPLIANCE_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: size
      });
      
      console.log(`✅ [Fetched] Compliance: ${sizeMB} MB cached for 24 hours`);
      console.log(`📊 Expires: ${expiresAt.toLocaleString()}`);
      
      setCORSHeaders(res);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Expires', expiresAt.toISOString());
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      
    } catch (error) {
      console.error('❌ [Error] Compliance:', error.message);
      setCORSHeaders(res);
      
      if (cache.has(COMPLIANCE_CACHE_KEY)) {
        const stale = cache.get(COMPLIANCE_CACHE_KEY);
        const age = Math.round((Date.now() - stale.timestamp) / (60 * 60 * 1000));
        console.warn(`⚠️ Using stale Compliance cache (${age} hours old)`);
        res.setHeader('X-Cache', 'STALE');
        res.setHeader('X-Cache-Error', error.message);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(stale.html);
      }
      
      res.status(503).json({
        error: 'Unable to fetch Compliance Reports',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // ============================================
  // CACHE MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * GET /api/proxy/arb-decisions/cache-status
   */
  app.get('/api/proxy/arb-decisions/cache-status', (req, res) => {
    setCORSHeaders(res);
    const cached = cache.get(ARB_CACHE_KEY);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const hoursOld = Math.round(age / (60 * 60 * 1000));
      const displayAge = hoursOld > 0 ? `${hoursOld} hours` : `${Math.round(age / (60 * 1000))} minutes`;
      const expiresAt = new Date(cached.timestamp + ARB_CACHE_TTL);
      
      res.json({
        type: 'ARB Decisions',
        hasCache: true,
        cacheAge: displayAge,
        expiresAt: expiresAt.toISOString(),
        expiresIn: Math.round((expiresAt.getTime() - Date.now()) / (60 * 60 * 1000)) + ' hours',
        cacheSize: (cached.size / 1024 / 1024).toFixed(2) + ' MB',
        timestamp: new Date().toISOString(),
        nextAutoRefresh: '3:00 AM tomorrow'
      });
    } else {
      res.json({
        type: 'ARB Decisions',
        hasCache: false,
        timestamp: new Date().toISOString(),
        nextAutoRefresh: '3:00 AM tomorrow'
      });
    }
  });

  /**
   * GET /api/proxy/compliance-reports/cache-status
   */
  app.get('/api/proxy/compliance-reports/cache-status', (req, res) => {
    setCORSHeaders(res);
    const cached = cache.get(COMPLIANCE_CACHE_KEY);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const hoursOld = Math.round(age / (60 * 60 * 1000));
      const displayAge = hoursOld > 0 ? `${hoursOld} hours` : `${Math.round(age / (60 * 1000))} minutes`;
      const expiresAt = new Date(cached.timestamp + COMPLIANCE_CACHE_TTL);
      
      res.json({
        type: 'Compliance Reports',
        hasCache: true,
        cacheAge: displayAge,
        expiresAt: expiresAt.toISOString(),
        expiresIn: Math.round((expiresAt.getTime() - Date.now()) / (60 * 60 * 1000)) + ' hours',
        cacheSize: (cached.size / 1024 / 1024).toFixed(2) + ' MB',
        timestamp: new Date().toISOString(),
        nextAutoRefresh: '3:00 AM tomorrow'
      });
    } else {
      res.json({
        type: 'Compliance Reports',
        hasCache: false,
        timestamp: new Date().toISOString(),
        nextAutoRefresh: '3:00 AM tomorrow'
      });
    }
  });

  /**
   * POST /api/proxy/arb-decisions/cache-clear
   */
  app.post('/api/proxy/arb-decisions/cache-clear', (req, res) => {
    setCORSHeaders(res);
    const hadCache = cache.has(ARB_CACHE_KEY);
    cache.delete(ARB_CACHE_KEY);
    console.log(`🗑️ [Cache] Cleared: ARB Decisions`);
    res.json({
      success: true,
      message: hadCache ? 'ARB cache cleared' : 'ARB cache was already empty',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * POST /api/proxy/compliance-reports/cache-clear
   */
  app.post('/api/proxy/compliance-reports/cache-clear', (req, res) => {
    setCORSHeaders(res);
    const hadCache = cache.has(COMPLIANCE_CACHE_KEY);
    cache.delete(COMPLIANCE_CACHE_KEY);
    console.log(`🗑️ [Cache] Cleared: Compliance Reports`);
    res.json({
      success: true,
      message: hadCache ? 'Compliance cache cleared' : 'Compliance cache was already empty',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * POST /api/proxy/arb-decisions/refresh
   */
  app.post('/api/proxy/arb-decisions/refresh', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔄 [Refresh] Forcing ARB cache refresh...');
    const result = await refreshARBCache();
    res.json({
      success: result,
      message: result ? 'ARB cache refreshed' : 'Failed to refresh ARB cache',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * POST /api/proxy/compliance-reports/refresh
   */
  app.post('/api/proxy/compliance-reports/refresh', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔄 [Refresh] Forcing Compliance cache refresh...');
    const result = await refreshComplianceCache();
    res.json({
      success: result,
      message: result ? 'Compliance cache refreshed' : 'Failed to refresh Compliance cache',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * POST /api/proxy/cache/refresh-all
   * Refresh ALL caches
   */
  app.post('/api/proxy/cache/refresh-all', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔄 [Refresh] Forcing ALL caches refresh...');
    const results = await refreshAllCaches();
    const successCount = results.filter(r => r === true).length;
    res.json({
      success: successCount > 0,
      refreshed: successCount,
      total: results.length,
      message: `Refreshed ${successCount}/${results.length} caches`,
      timestamp: new Date().toISOString()
    });
  });

  // ============================================
  // OTHER PROXY ENDPOINTS
  // ============================================

  app.get('/api/proxy/market-price-index', (req, res) => {
    console.log('📥 [Proxy] Market Price Index request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/market-price-index/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/circulars', (req, res) => {
    console.log('📥 [Proxy] Circulars request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/circulars/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/annual-reports', (req, res) => {
    console.log('📥 [Proxy] Annual Reports request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/annual-reports/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/standard-tender-documents', (req, res) => {
    console.log('📥 [Proxy] Standard Tender Documents request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/standard-tender-documents/', res, {
      timeout: 60000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/tender-security-providers', (req, res) => {
    console.log('📥 [Proxy] Tender Security Providers request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/tender-security-providers/', res, {
      timeout: 30000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/strategic-plan', (req, res) => {
    console.log('📥 [Proxy] Strategic Plan request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/strategc-plan/', res, {
      timeout: 30000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/debarred-firms', (req, res) => {
    console.log('📥 [Proxy] Debarred Firms request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/debarred-firms/', res, {
      timeout: 30000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/regulations', (req, res) => {
    console.log('📥 [Proxy] Regulations request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/regulations/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/service-charter', (req, res) => {
    console.log('📥 [Proxy] Service Charter request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/service-charter/', res, {
      timeout: 30000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/resources', (req, res) => {
    console.log('📥 [Proxy] Resources request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/resources/', res, {
      timeout: 30000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/ppra/:page', (req, res) => {
    const page = req.params.page;
    const forceRefresh = req.query.refresh === 'true';
    
    console.log(`📥 [Proxy] Generic page request: ${page}`);
    
    if (!page || page.includes('..') || page.includes('/') || page.includes('\\')) {
      setCORSHeaders(res);
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'Page name cannot contain path separators',
        timestamp: new Date().toISOString()
      });
    }
    
    fetchPPRAPage(`https://ppra.go.ke/${page}/`, res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  // ============================================
  // CACHE MANAGEMENT ENDPOINTS
  // ============================================

  app.get('/api/proxy/cache/stats', (req, res) => {
    setCORSHeaders(res);
    
    const arbCached = cache.get(ARB_CACHE_KEY);
    const compCached = cache.get(COMPLIANCE_CACHE_KEY);
    
    res.json({
      enabled: true,
      totalEntries: cache.size,
      maxEntries: MAX_CACHE_SIZE,
      ttl: CACHE_TTL,
      ttlMinutes: CACHE_TTL / 60000,
      caches: {
        arbDecisions: {
          hasCache: !!arbCached,
          cacheAge: arbCached ? `${Math.round((Date.now() - arbCached.timestamp) / (60 * 60 * 1000))} hours` : 'No cache',
          cacheSize: arbCached ? (arbCached.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
          expiresAt: arbCached ? new Date(arbCached.timestamp + ARB_CACHE_TTL).toISOString() : null,
          nextAutoRefresh: '3:00 AM tomorrow'
        },
        complianceReports: {
          hasCache: !!compCached,
          cacheAge: compCached ? `${Math.round((Date.now() - compCached.timestamp) / (60 * 60 * 1000))} hours` : 'No cache',
          cacheSize: compCached ? (compCached.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
          expiresAt: compCached ? new Date(compCached.timestamp + COMPLIANCE_CACHE_TTL).toISOString() : null,
          nextAutoRefresh: '3:00 AM tomorrow'
        }
      },
      timestamp: new Date().toISOString()
    });
  });

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

  app.get('/api/proxy/health', (req, res) => {
    setCORSHeaders(res);
    
    const arbCached = cache.get(ARB_CACHE_KEY);
    const compCached = cache.get(COMPLIANCE_CACHE_KEY);
    
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
        maxEntries: MAX_CACHE_SIZE
      },
      caches: {
        arbDecisions: {
          enabled: true,
          ttl: '24 hours',
          status: arbCached ? `Active (${Math.round((Date.now() - arbCached.timestamp) / (60 * 60 * 1000))} hours old)` : 'Empty',
          nextAutoRefresh: '3:00 AM tomorrow'
        },
        complianceReports: {
          enabled: true,
          ttl: '24 hours',
          status: compCached ? `Active (${Math.round((Date.now() - compCached.timestamp) / (60 * 60 * 1000))} hours old)` : 'Empty',
          nextAutoRefresh: '3:00 AM tomorrow'
        }
      },
      endpoints: [
        { path: '/api/proxy/arb-decisions', method: 'GET', description: 'ARB (5min cache - legacy)' },
        { path: '/api/proxy/arb-decisions-v2', method: 'GET', description: 'ARB (24h cache) ⭐' },
        { path: '/api/proxy/arb-decisions/cache-status', method: 'GET', description: 'ARB cache status' },
        { path: '/api/proxy/arb-decisions/cache-clear', method: 'POST', description: 'Clear ARB cache' },
        { path: '/api/proxy/arb-decisions/refresh', method: 'POST', description: 'Refresh ARB cache' },
        { path: '/api/proxy/compliance-reports', method: 'GET', description: 'Compliance (5min cache - legacy)' },
        { path: '/api/proxy/compliance-reports-v2', method: 'GET', description: 'Compliance (24h cache) ⭐' },
        { path: '/api/proxy/compliance-reports/cache-status', method: 'GET', description: 'Compliance cache status' },
        { path: '/api/proxy/compliance-reports/cache-clear', method: 'POST', description: 'Clear Compliance cache' },
        { path: '/api/proxy/compliance-reports/refresh', method: 'POST', description: 'Refresh Compliance cache' },
        { path: '/api/proxy/cache/refresh-all', method: 'POST', description: 'Refresh ALL caches' },
        { path: '/api/proxy/ppra/:page', method: 'GET', description: 'Generic PPRA page' },
        { path: '/api/proxy/cache/stats', method: 'GET', description: 'Cache statistics' },
        { path: '/api/proxy/cache', method: 'DELETE', description: 'Clear all cache' },
        { path: '/api/proxy/health', method: 'GET', description: 'Health check' }
      ]
    });
  });

  // ============================================
  // START AUTO-REFRESH SCHEDULER
  // ============================================
  scheduleDailyRefresh();

  console.log('✅ [Proxy] Routes registered:');
  console.log('   ⭐ 24-HOUR CACHE ENDPOINTS:');
  console.log('   GET /api/proxy/arb-decisions-v2          - ARB Decisions (24h cache)');
  console.log('   GET /api/proxy/compliance-reports-v2     - Compliance Reports (24h cache)');
  console.log('');
  console.log('   📊 CACHE MANAGEMENT:');
  console.log('   GET /api/proxy/arb-decisions/cache-status');
  console.log('   GET /api/proxy/compliance-reports/cache-status');
  console.log('   POST /api/proxy/arb-decisions/cache-clear');
  console.log('   POST /api/proxy/compliance-reports/cache-clear');
  console.log('   POST /api/proxy/arb-decisions/refresh');
  console.log('   POST /api/proxy/compliance-reports/refresh');
  console.log('   POST /api/proxy/cache/refresh-all');
  console.log('');
  console.log('   📋 LEGACY ENDPOINTS (5-min cache):');
  console.log('   GET /api/proxy/arb-decisions');
  console.log('   GET /api/proxy/compliance-reports');
  console.log('   GET /api/proxy/market-price-index');
  console.log('   GET /api/proxy/circulars');
  console.log('   GET /api/proxy/ppra/:page');
  console.log('');
  console.log(`   💾 ARB Cache: ${cache.has(ARB_CACHE_KEY) ? '✅ Active' : '❌ Empty'}`);
  console.log(`   💾 Compliance Cache: ${cache.has(COMPLIANCE_CACHE_KEY) ? '✅ Active' : '❌ Empty'}`);
  console.log(`   ⏰ Auto-Refresh: 3:00 AM daily`);
}

// ============================================
// EXPORT THE SETUP FUNCTION
// ============================================
module.exports = { setupProxyRoutes };