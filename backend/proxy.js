// proxy.js - COMPLETE WORKING VERSION WITH 24-HOUR CACHE + AUTO-REFRESH + STREAMING + ENHANCED LOGGING + BROWSER EMULATION + CACHE EXTENSION
// ============================================
// CORS PROXY ROUTES FOR PPRA PAGES
// ============================================

// ============================================
// CACHE SYSTEM
// ============================================
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for other pages
const MAX_CACHE_SIZE = 20;

// ━━━ 24 HOUR CACHE FOR ARB DECISIONS ━━━
const ARB_CACHE_KEY = 'arb_decisions_v2';
const ARB_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ━━━ 24 HOUR CACHE FOR COMPLIANCE REPORTS ━━━
const COMPLIANCE_CACHE_KEY = 'compliance_reports_v2';
const COMPLIANCE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ━━━ CACHE EXTENSION ON FAILURE ━━━
// When a refresh fails, extend the existing cache by this amount (in ms)
// Set to 6 hours so if PPRA is down, we keep serving data
const CACHE_EXTENSION_ON_FAILURE = 6 * 60 * 60 * 1000;

// ============================================
// BROWSER-LIKE HEADERS (Emulates Chrome/Windows)
// ============================================
function getBrowserHeaders() {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
  };
}

// ============================================
// REQUEST DEDUPLICATION (Prevents duplicate simultaneous requests)
// ============================================
const pendingRequests = new Map();

async function deduplicateRequest(url, fetchFn) {
  if (pendingRequests.has(url)) {
    console.log(`⏳ [Dedup] Waiting for existing request to ${url}`);
    return pendingRequests.get(url);
  }
  
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(url);
  });
  pendingRequests.set(url, promise);
  
  return promise;
}

/**
 * Clean up old cache entries when cache gets too large
 */
function cleanCache() {
  if (cache.size > MAX_CACHE_SIZE) {
    console.log(`🧹 [Cache] Cleaning old entries (${cache.size} entries)`);
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
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
  console.log(`💾 [Cache] Stored ${(html.length/1024/1024).toFixed(2)} MB for ${url}`);
}

// ============================================
// SET CORS HEADERS
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
// FETCH WITH BROWSER EMULATION + RETRY
// ============================================
async function fetchWithBrowser(url, timeout = 180000, retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 [Browser] Attempt ${attempt}/${retries}: ${url}`);
      
      // Add jitter delay between retries (1-5 seconds)
      if (attempt > 1) {
        const delay = 2000 + Math.random() * 3000;
        console.log(`⏳ [Browser] Waiting ${Math.round(delay/1000)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        headers: getBrowserHeaders(),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      if (html.length < 1000) {
        throw new Error(`Response too small (${html.length} bytes) - likely rate-limited`);
      }
      
      if (!html.includes('wp-content') && !html.includes('wordpress')) {
        console.warn(`⚠️ [Browser] Page may not be WordPress (no wp-content found)`);
      }
      
      console.log(`✅ [Browser] Fetched ${(html.length/1024/1024).toFixed(2)} MB (${html.length} bytes)`);
      return html;
      
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [Browser] Attempt ${attempt} failed:`, error.message);
      
      if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
        console.log(`⏳ [Browser] Rate limited, waiting 10s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  throw new Error(`All ${retries} attempts failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// ============================================
// HELPER: FETCH PPRA PAGE WITH STREAMING
// ============================================
async function fetchPPRAPage(url, res, options = {}) {
  const {
    timeout = 180000,
    forceRefresh = false,
    compress = true,
  } = options;

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

  console.log(`🔄 [Proxy] Streaming: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: getBrowserHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📊 [Proxy] Response status: ${response.status} ${response.statusText}`);
    console.log(`📊 [Proxy] Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'server': response.headers.get('server'),
      'date': response.headers.get('date'),
    });

    if (!response.ok) {
      let errorBody = 'Unable to read error body';
      try {
        const clonedResponse = response.clone();
        errorBody = await clonedResponse.text();
        console.error(`❌ [Proxy] Error response body (first 1000 chars):`, errorBody.substring(0, 1000));
      } catch (readError) {
        console.error(`❌ [Proxy] Could not read error body:`, readError.message);
      }
      
      console.error(`❌ [Proxy] Status: ${response.status} for ${url}`);
      setCORSHeaders(res);
      return res.status(response.status).json({
        error: `PPRA returned ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        url: url,
        responseBody: errorBody.substring(0, 500),
        timestamp: new Date().toISOString()
      });
    }

    setCORSHeaders(res);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const chunks = [];
    let totalSize = 0;
    let streamError = false;

    try {
      for await (const chunk of response.body) {
        chunks.push(chunk);
        totalSize += chunk.length;
        if (!res.writableEnded && !res.destroyed) {
          res.write(chunk);
        } else {
          console.log(`⚠️ [Stream] Client disconnected, stopping stream`);
          streamError = true;
          break;
        }
      }
    } catch (streamErr) {
      if (streamErr.message && streamErr.message.includes('terminated')) {
        console.log(`⚠️ [Stream] PPRA server closed connection (expected for large files)`);
        streamError = true;
      } else if (streamErr.code === 'ECONNRESET') {
        console.log(`⚠️ [Stream] Connection reset by PPRA server`);
        streamError = true;
      } else {
        console.error('❌ [Stream] Error during streaming:', streamErr.message);
        streamError = true;
      }
    }

    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }
    
    console.log(`✅ [Proxy] Streamed ${(totalSize/1024/1024).toFixed(2)} MB (${totalSize} bytes) from ${url}`);
    console.log(`📊 [Proxy] Stream completed with ${streamError ? 'errors' : 'success'}`);

    if (totalSize > 1000 && !streamError) {
      const fullHtml = Buffer.concat(chunks).toString('utf-8');
      setCachedResponse(url, fullHtml);
    } else if (totalSize > 0) {
      console.log(`⚠️ [Proxy] Not caching due to stream error or small size (${totalSize} bytes)`);
    }
    
  } catch (error) {
    console.error('❌ [Proxy] Error:', error.message);
    console.error('❌ [Proxy] Error stack:', error.stack);
    
    if (res.headersSent) {
      console.log(`⚠️ [Proxy] Headers already sent, cannot send error response`);
      return;
    }
    
    setCORSHeaders(res);
    
    if (error.name === 'AbortError') {
      console.error('⏰ [Proxy] Request timed out after', timeout, 'ms');
      return res.status(504).json({
        error: 'Request timed out',
        details: `The request to ${url} took longer than ${timeout}ms to complete`,
        timestamp: new Date().toISOString()
      });
    }
    
    const cached = cache.get(url);
    if (cached) {
      console.warn(`⚠️ [Proxy] Serving cached fallback for ${url}`);
      res.setHeader('X-Cache', 'STALE');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(cached.html);
    }
    
    res.status(500).json({
      error: 'Failed to fetch page from PPRA',
      details: error.message,
      stack: error.stack,
      url: url,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================
// HELPER: FETCH PAGE FOR CACHING (used by auto-refresh)
// ============================================
async function fetchPageForCache(url, timeout = 180000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`🔄 [Cache] Fetching for cache: ${url}`);
    
    const response = await fetch(url, {
      headers: getBrowserHeaders(),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📊 [Cache] Response status: ${response.status} ${response.statusText}`);
    console.log(`📊 [Cache] Content-Type: ${response.headers.get('content-type')}`);
    console.log(`📊 [Cache] Content-Length: ${response.headers.get('content-length')}`);
    
    if (!response.ok) {
      let errorBody = 'Unable to read error body';
      try {
        const clonedResponse = response.clone();
        errorBody = await clonedResponse.text();
        console.error(`❌ [Cache] Error response body (first 500 chars):`, errorBody.substring(0, 500));
      } catch (readError) {
        console.error(`❌ [Cache] Could not read error body:`, readError.message);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}\nBody: ${errorBody.substring(0, 200)}`);
    }
    
    const chunks = [];
    let totalSize = 0;
    for await (const chunk of response.body) {
      chunks.push(chunk);
      totalSize += chunk.length;
    }
    
    const html = Buffer.concat(chunks).toString('utf-8');
    console.log(`📊 [Cache] Downloaded ${(totalSize/1024/1024).toFixed(2)} MB (${totalSize} bytes) for ${url}`);
    console.log(`📊 [Cache] HTML length: ${html.length} characters`);
    
    if (html.length < 1000) {
      console.warn(`⚠️ [Cache] HTML too small (${html.length} bytes) - might be an error page`);
      console.warn(`⚠️ [Cache] HTML preview: ${html.substring(0, 500)}`);
      throw new Error(`HTML too small (${html.length} bytes) - likely an error page`);
    }
    
    if (html.includes('too many requests') || html.includes('rate limit') || html.includes('429')) {
      console.warn(`⚠️ [Cache] Rate limiting detected!`);
      throw new Error('Rate limiting detected - PPRA is blocking requests');
    }
    
    if (!html.includes('ARB') && !html.includes('Decision') && !html.includes('table')) {
      console.warn(`⚠️ [Cache] Page may be missing expected content (no ARB/Decision/table found)`);
      console.warn(`⚠️ [Cache] HTML preview: ${html.substring(0, 500)}`);
    }
    
    return html;
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ [Cache] Fetch failed:`, error.message);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// ============================================
// ⭐ NEW: CACHE EXTENSION HELPER
// ============================================
/**
 * Extend an existing cache entry's lifetime when a refresh fails.
 * This keeps serving old data instead of losing it entirely.
 */
function extendCacheLifetime(cacheKey, extensionMs = CACHE_EXTENSION_ON_FAILURE) {
  if (!cache.has(cacheKey)) {
    console.log(`⚠️ [CacheExtend] No existing cache for ${cacheKey} to extend`);
    return false;
  }
  
  const existing = cache.get(cacheKey);
  const previousAge = Math.round((Date.now() - existing.timestamp) / (60 * 60 * 1000));
  
  // Reset timestamp to now to extend lifetime
  existing.timestamp = Date.now();
  existing.extendedAt = new Date().toISOString();
  existing.extensionCount = (existing.extensionCount || 0) + 1;
  
  cache.set(cacheKey, existing);
  
  console.log(`🔄 [CacheExtend] Extended ${cacheKey} by ${Math.round(extensionMs/(60*60*1000))}h`);
  console.log(`   Previous age: ${previousAge}h | Extension #${existing.extensionCount}`);
  console.log(`   New expiry: ${new Date(Date.now() + extensionMs).toLocaleString()}`);
  
  return true;
}

// ============================================
// AUTO-REFRESH: Refresh ARB cache at 3 AM daily
// ============================================

/**
 * Refresh the ARB Decisions cache
 * ⭐ UPDATED: Extends cache lifetime on failure instead of losing data
 */
async function refreshARBCache() {
  console.log('🔄 [Auto-Refresh] Fetching fresh ARB decisions...');
  const startTime = Date.now();
  
  try {
    const html = await fetchPageForCache('https://ppra.go.ke/arb-decisions/', 180000);
    const size = html.length;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    
    // ✅ SUCCESS: Replace cache with fresh data
    cache.set(ARB_CACHE_KEY, {
      html: html,
      timestamp: Date.now(),
      size: size,
      extensionCount: 0,  // Reset extension counter on fresh fetch
    });
    
    console.log(`✅ [Auto-Refresh] ARB cache updated: ${sizeMB} MB (${duration}ms)`);
    console.log(`   Next expiry: ${new Date(Date.now() + ARB_CACHE_TTL).toLocaleString()}`);
    return true;
    
  } catch (error) {
    console.error(`❌ [Auto-Refresh] ARB failed:`, error.message);
    
    // ⭐ NEW: Extend existing cache instead of losing it
    const extended = extendCacheLifetime(ARB_CACHE_KEY);
    
    if (extended) {
      console.log(`✅ [Auto-Refresh] Kept existing ARB cache (extended by 6h)`);
    } else {
      console.log(`⚠️ [Auto-Refresh] No existing ARB cache to keep - will retry on next request`);
    }
    
    return false;
  }
}

/**
 * Refresh the Compliance Reports cache
 * ⭐ UPDATED: Extends cache lifetime on failure instead of losing data
 */
async function refreshComplianceCache() {
  console.log('🔄 [Auto-Refresh] Fetching fresh Compliance Reports...');
  const startTime = Date.now();
  
  try {
    const html = await fetchPageForCache('https://ppra.go.ke/compliance-reports/', 120000);
    const size = html.length;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const duration = Date.now() - startTime;
    
    // ✅ SUCCESS: Replace cache with fresh data
    cache.set(COMPLIANCE_CACHE_KEY, {
      html: html,
      timestamp: Date.now(),
      size: size,
      extensionCount: 0,  // Reset extension counter on fresh fetch
    });
    
    console.log(`✅ [Auto-Refresh] Compliance cache updated: ${sizeMB} MB (${duration}ms)`);
    console.log(`   Next expiry: ${new Date(Date.now() + COMPLIANCE_CACHE_TTL).toLocaleString()}`);
    return true;
    
  } catch (error) {
    console.error(`❌ [Auto-Refresh] Compliance failed:`, error.message);
    
    // ⭐ NEW: Extend existing cache instead of losing it
    const extended = extendCacheLifetime(COMPLIANCE_CACHE_KEY);
    
    if (extended) {
      console.log(`✅ [Auto-Refresh] Kept existing Compliance cache (extended by 6h)`);
    } else {
      console.log(`⚠️ [Auto-Refresh] No existing Compliance cache to keep - will retry on next request`);
    }
    
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
 * Schedule daily refresh at 6 AM, with retry at 8 AM if it fails
 * ━━━ REFRESH SCHEDULE ━━━
 *   6:00 AM - Primary refresh (normal browsing hours)
 *   8:00 AM - Retry only if 6 AM failed
 */
function scheduleDailyRefresh() {
  // ─────────────────────────────────────────────
  // Helper: Run a refresh and return success status
  // ─────────────────────────────────────────────
  async function runRefresh(label) {
    console.log(`🔄 [Scheduler] Running ${label} refresh...`);
    const results = await refreshAllCaches();
    const successCount = results.filter(r => r === true).length;
    const allSucceeded = successCount === results.length;

    console.log(`📊 [Scheduler] ${label} refresh: ${successCount}/${results.length} succeeded`);

    return {
      successCount,
      total: results.length,
      allSucceeded,
    };
  }

  // ─────────────────────────────────────────────
  // Helper: Calculate ms until a specific time today/tomorrow
  // ─────────────────────────────────────────────
  function msUntil(hour, minute = 0) {
    const now = new Date();
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0
    );

    // If the time has already passed today, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    return {
      ms: target.getTime() - now.getTime(),
      target,
    };
  }

  // ─────────────────────────────────────────────
  // PRIMARY REFRESH: 6:00 AM
  // ─────────────────────────────────────────────
  function schedulePrimary() {
    const { ms, target } = msUntil(6, 0);

    console.log(`⏰ [Scheduler] PRIMARY refresh scheduled for: ${target.toLocaleString()}`);
    console.log(`   (in ${Math.round(ms / 60000)} minutes)`);
    console.log(`   📊 Will refresh: ARB Decisions + Compliance Reports`);
    console.log(`   🛡️  On failure: Cache will be EXTENDED (not deleted)`);
    console.log(`   🔁 On failure: Will retry at 8:00 AM`);

    setTimeout(async () => {
      const result = await runRefresh('6 AM PRIMARY');

      if (result.allSucceeded) {
        console.log('✅ [Scheduler] 6 AM refresh succeeded. No retry needed.');
      } else {
        console.log('⚠️ [Scheduler] 6 AM refresh had failures. Scheduling 8 AM retry...');
        scheduleRetry();
      }

      // Schedule next day's primary refresh
      schedulePrimary();
    }, ms);
  }

  // ─────────────────────────────────────────────
  // RETRY REFRESH: 8:00 AM (only if 6 AM failed)
  // ─────────────────────────────────────────────
  function scheduleRetry() {
    const { ms, target } = msUntil(8, 0);

    console.log(`⏰ [Scheduler] RETRY refresh scheduled for: ${target.toLocaleString()}`);
    console.log(`   (in ${Math.round(ms / 60000)} minutes)`);

    setTimeout(async () => {
      const result = await runRefresh('8 AM RETRY');

      if (result.allSucceeded) {
        console.log('✅ [Scheduler] 8 AM retry succeeded.');
      } else {
        console.log('❌ [Scheduler] 8 AM retry also failed.');
        console.log('🛡️  [Scheduler] Existing cache will continue to be served.');
        console.log('   (Cache extension on next request will keep data available)');
      }
    }, ms);
  }

  // ─────────────────────────────────────────────
  // Start the schedule
  // ─────────────────────────────────────────────
  schedulePrimary();
}

// ============================================
// MANUAL CACHE WARMER
// ============================================
async function warmCache() {
  console.log('🔥 [CacheWarmer] Starting manual cache warm-up...');
  
  const urls = [
    { key: ARB_CACHE_KEY, url: 'https://ppra.go.ke/arb-decisions/', timeout: 180000, label: 'ARB Decisions' },
    { key: COMPLIANCE_CACHE_KEY, url: 'https://ppra.go.ke/compliance-reports/', timeout: 120000, label: 'Compliance Reports' },
  ];
  
  for (const item of urls) {
    try {
      console.log(`🔥 [CacheWarmer] Fetching ${item.label}...`);
      const html = await fetchWithBrowser(item.url, item.timeout);
      
      cache.set(item.key, {
        html: html,
        timestamp: Date.now(),
        size: html.length,
        extensionCount: 0,
      });
      
      console.log(`✅ [CacheWarmer] Cached ${item.label} (${(html.length/1024/1024).toFixed(2)} MB)`);
    } catch (error) {
      console.error(`❌ [CacheWarmer] Failed for ${item.label}:`, error.message);
      
      // ⭐ Extend existing cache on failure
      const extended = extendCacheLifetime(item.key);
      if (extended) {
        console.log(`✅ [CacheWarmer] Kept existing ${item.label} cache (extended by 6h)`);
      }
    }
  }
  
  console.log('✅ [CacheWarmer] Cache warm-up complete!');
}

// ============================================
// SETUP PROXY ROUTES
// ============================================
function setupProxyRoutes(app) {
  console.log('🔧 [Proxy] Setting up routes...');
  console.log('🌐 [Browser] Using Chrome/Windows emulation');
  console.log('🛡️  [Cache] Extension on failure: ENABLED (6h)');

  app.use('/api/proxy', (req, res, next) => {
    setCORSHeaders(res);
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ============================================
  // ARB DECISIONS - LEGACY
  // ============================================
  app.get('/api/proxy/arb-decisions', (req, res) => {
    console.log('📥 [Proxy] ARB Decisions request received (legacy)');
    const forceRefresh = req.query.refresh === 'true';
    
    deduplicateRequest('arb-decisions-legacy', async () => {
      await fetchPPRAPage('https://ppra.go.ke/arb-decisions/', res, {
        timeout: 180000,
        forceRefresh: forceRefresh,
        compress: true
      });
    });
  });

  // ============================================
  // ARB DECISIONS V2 - 24 HOUR CACHE
  // ============================================
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
        const extensionInfo = cached.extensionCount ? ` (extended ${cached.extensionCount}x)` : '';
        
        console.log(`📦 [Cache HIT] ARB: ${(cached.size/1024/1024).toFixed(2)} MB, ${displayAge} old${extensionInfo}`);
        setCORSHeaders(res);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', displayAge);
        res.setHeader('X-Cache-Expires', expiresAt.toISOString());
        if (cached.extensionCount) {
          res.setHeader('X-Cache-Extended', cached.extensionCount.toString());
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(cached.html);
      } else {
        cache.delete(ARB_CACHE_KEY);
        console.log('⏰ [Cache] ARB EXPIRED after 24 hours');
      }
    }
    
    console.log('👤 [First User] Fetching ARB from PPRA (may take 1-2 minutes)...');
    console.log('💾 This will be cached for 24 hours');
    
    try {
      const html = await fetchWithBrowser('https://ppra.go.ke/arb-decisions/', 180000);
      const size = html.length;
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const expiresAt = new Date(Date.now() + ARB_CACHE_TTL);
      
      cache.set(ARB_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: size,
        extensionCount: 0,
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

  // ============================================
  // COMPLIANCE REPORTS - LEGACY
  // ============================================
  app.get('/api/proxy/compliance-reports', (req, res) => {
    console.log('📥 [Proxy] Compliance Reports request received (legacy)');
    const forceRefresh = req.query.refresh === 'true';
    
    deduplicateRequest('compliance-reports-legacy', async () => {
      await fetchPPRAPage('https://ppra.go.ke/compliance-reports/', res, {
        timeout: 120000,
        forceRefresh: forceRefresh,
        compress: true
      });
    });
  });

  // ============================================
  // COMPLIANCE REPORTS - V2
  // ============================================
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
        const extensionInfo = cached.extensionCount ? ` (extended ${cached.extensionCount}x)` : '';
        
        console.log(`📦 [Cache HIT] Compliance: ${(cached.size/1024/1024).toFixed(2)} MB, ${displayAge} old${extensionInfo}`);
        setCORSHeaders(res);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', displayAge);
        res.setHeader('X-Cache-Expires', expiresAt.toISOString());
        if (cached.extensionCount) {
          res.setHeader('X-Cache-Extended', cached.extensionCount.toString());
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(cached.html);
      } else {
        cache.delete(COMPLIANCE_CACHE_KEY);
        console.log('⏰ [Cache] Compliance EXPIRED after 24 hours');
      }
    }
    
    console.log('👤 [First User] Fetching Compliance from PPRA (may take 30-60 seconds)...');
    console.log('💾 This will be cached for 24 hours');
    
    try {
      const html = await fetchWithBrowser('https://ppra.go.ke/compliance-reports/', 120000);
      const size = html.length;
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const expiresAt = new Date(Date.now() + COMPLIANCE_CACHE_TTL);
      
      cache.set(COMPLIANCE_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: size,
        extensionCount: 0,
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
        extensionCount: cached.extensionCount || 0,
        extendedAt: cached.extendedAt || null,
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
        extensionCount: cached.extensionCount || 0,
        extendedAt: cached.extendedAt || null,
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

  app.post('/api/proxy/arb-decisions/refresh', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔄 [Refresh] Forcing ARB cache refresh...');
    try {
      const html = await fetchWithBrowser('https://ppra.go.ke/arb-decisions/', 180000);
      cache.set(ARB_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: html.length,
        extensionCount: 0,
      });
      res.json({
        success: true,
        message: 'ARB cache refreshed successfully',
        size: (html.length / 1024 / 1024).toFixed(2) + ' MB',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // ⭐ Extend cache on failure
      const extended = extendCacheLifetime(ARB_CACHE_KEY);
      res.status(503).json({
        success: false,
        message: 'Failed to refresh ARB cache',
        error: error.message,
        cacheExtended: extended,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post('/api/proxy/compliance-reports/refresh', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔄 [Refresh] Forcing Compliance cache refresh...');
    try {
      const html = await fetchWithBrowser('https://ppra.go.ke/compliance-reports/', 120000);
      cache.set(COMPLIANCE_CACHE_KEY, {
        html: html,
        timestamp: Date.now(),
        size: html.length,
        extensionCount: 0,
      });
      res.json({
        success: true,
        message: 'Compliance cache refreshed successfully',
        size: (html.length / 1024 / 1024).toFixed(2) + ' MB',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // ⭐ Extend cache on failure
      const extended = extendCacheLifetime(COMPLIANCE_CACHE_KEY);
      res.status(503).json({
        success: false,
        message: 'Failed to refresh Compliance cache',
        error: error.message,
        cacheExtended: extended,
        timestamp: new Date().toISOString()
      });
    }
  });

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

  app.post('/api/proxy/cache/warm', async (req, res) => {
    setCORSHeaders(res);
    console.log('🔥 [Cache] Manual cache warm-up requested');
    
    warmCache().catch(err => console.error('🔥 [Cache] Warm-up error:', err.message));
    
    res.json({
      success: true,
      message: 'Cache warm-up started in background. Check server logs for progress.',
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
      timeout: 60000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/circulars', (req, res) => {
    console.log('📥 [Proxy] Circulars request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/circulars/', res, {
      timeout: 60000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/annual-reports', (req, res) => {
    console.log('📥 [Proxy] Annual Reports request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/annual-reports/', res, {
      timeout: 60000,
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
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/strategic-plan', (req, res) => {
    console.log('📥 [Proxy] Strategic Plan request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/strategc-plan/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/debarred-firms', (req, res) => {
    console.log('📥 [Proxy] Debarred Firms request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/debarred-firms/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/regulations', (req, res) => {
    console.log('📥 [Proxy] Regulations request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/regulations/', res, {
      timeout: 60000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/service-charter', (req, res) => {
    console.log('📥 [Proxy] Service Charter request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/service-charter/', res, {
      timeout: 45000,
      forceRefresh: forceRefresh,
      compress: true
    });
  });

  app.get('/api/proxy/resources', (req, res) => {
    console.log('📥 [Proxy] Resources request received');
    const forceRefresh = req.query.refresh === 'true';
    fetchPPRAPage('https://ppra.go.ke/resources/', res, {
      timeout: 45000,
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
      timeout: 60000,
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
      browserEmulation: {
        enabled: true,
        userAgent: 'Chrome/Windows 10'
      },
      cacheExtension: {
        enabled: true,
        extensionHours: CACHE_EXTENSION_ON_FAILURE / (60 * 60 * 1000),
        description: 'On refresh failure, existing cache is extended by this amount'
      },
      caches: {
        arbDecisions: {
          hasCache: !!arbCached,
          cacheAge: arbCached ? `${Math.round((Date.now() - arbCached.timestamp) / (60 * 60 * 1000))} hours` : 'No cache',
          cacheSize: arbCached ? (arbCached.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
          expiresAt: arbCached ? new Date(arbCached.timestamp + ARB_CACHE_TTL).toISOString() : null,
          extensionCount: arbCached?.extensionCount || 0,
          nextAutoRefresh: '3:00 AM tomorrow'
        },
        complianceReports: {
          hasCache: !!compCached,
          cacheAge: compCached ? `${Math.round((Date.now() - compCached.timestamp) / (60 * 60 * 1000))} hours` : 'No cache',
          cacheSize: compCached ? (compCached.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A',
          expiresAt: compCached ? new Date(compCached.timestamp + COMPLIANCE_CACHE_TTL).toISOString() : null,
          extensionCount: compCached?.extensionCount || 0,
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
      service: 'PPRA CORS Proxy v2.0 (Streaming + Logging + Browser Emulation + Cache Extension)',
      cors: {
        status: 'enabled',
        headers: 'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods'
      },
      cache: {
        enabled: true,
        entries: cache.size,
        maxEntries: MAX_CACHE_SIZE
      },
      browserEmulation: {
        enabled: true,
        headers: 'Chrome/Windows 10',
        retries: 3
      },
      cacheExtension: {
        enabled: true,
        extensionHours: CACHE_EXTENSION_ON_FAILURE / (60 * 60 * 1000),
        description: 'On refresh failure, existing cache is extended (not deleted)'
      },
      caches: {
        arbDecisions: {
          enabled: true,
          ttl: '24 hours',
          status: arbCached ? `Active (${Math.round((Date.now() - arbCached.timestamp) / (60 * 60 * 1000))} hours old)` : 'Empty',
          extensionCount: arbCached?.extensionCount || 0,
          nextAutoRefresh: '3:00 AM tomorrow'
        },
        complianceReports: {
          enabled: true,
          ttl: '24 hours',
          status: compCached ? `Active (${Math.round((Date.now() - compCached.timestamp) / (60 * 60 * 1000))} hours old)` : 'Empty',
          extensionCount: compCached?.extensionCount || 0,
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
        { path: '/api/proxy/cache/warm', method: 'POST', description: 'Manual cache warm-up' },
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
  console.log('   🔥 CACHE MANAGEMENT:');
  console.log('   POST /api/proxy/cache/warm              - Manual cache warm-up');
  console.log('   GET /api/proxy/cache/stats              - Cache statistics');
  console.log('   DELETE /api/proxy/cache                 - Clear all cache');
  console.log('   POST /api/proxy/arb-decisions/refresh   - Force refresh ARB cache');
  console.log('   POST /api/proxy/compliance-reports/refresh - Force refresh Compliance cache');
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
  console.log(`   🛡️  Cache Extension on Failure: 6 hours`);
  console.log(`   🔒 Request Deduplication: Enabled`);
  console.log(`   📡 Streaming: Enabled`);
  console.log(`   📊 Enhanced Logging: Enabled`);
  console.log(`   🌐 Browser Emulation: Enabled (Chrome/Windows)`);
  console.log(`   🔄 Retries: 3 attempts with delays`);
  console.log(`   ⏱️  ARB Timeout: 3 minutes`);
  console.log(`   ⏱️  Compliance Timeout: 2 minutes`);
}

// ============================================
// EXPORT THE SETUP FUNCTION
// ============================================
module.exports = { setupProxyRoutes, warmCache };