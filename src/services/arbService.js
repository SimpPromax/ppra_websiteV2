// src/services/arbService.js
/**
 * Service for fetching and managing ARB Decisions from PPRA website
 * Uses local backend proxy for CORS-free access
 * Enhanced with caching, retry logic, and streaming support
 * FIXED: Better year extraction with validation
 */

// ============================================
// USE LOCAL BACKEND PROXY (INSTEAD OF CORS-ANYWHERE)
// ============================================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/arb-decisions`;

class ARBService {
  constructor() {
    this.files = [];
    this.loading = false;
    this.error = null;
    this.stats = {
      total: 0,
      totalDownloads: 0,
      years: []
    };
    this.filters = {
      searchTerm: '',
      year: 'All',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    this.listeners = [];
    
    // ============================================
    // Caching System
    // ============================================
    this.cache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000, // 5 minutes cache
    };
    
    // ============================================
    // Request deduplication
    // ============================================
    this.pendingRequest = null;
    
    // ============================================
    // Abort controller for cleanup
    // ============================================
    this.currentController = null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  getState() {
    const filteredFiles = this.getFilteredFiles();
    return {
      files: this.files,
      filteredFiles,
      loading: this.loading,
      error: this.error,
      stats: this.stats,
      filters: this.filters,
      years: this.stats.years,
    };
  }

  // ============================================
  // IMPROVED: fetchDecisions with retry, cache, and timeout
  // ============================================
  async fetchDecisions(options = {}) {
    const {
      forceRefresh = false,
      retries = 3,
      timeout = 60000, // Increased to 60 seconds
      retryDelay = 2000,
    } = options;

    // Check cache first (unless force refresh)
    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached decisions data');
      this.files = this.cache.data;
      this.updateStats();
      this.notifyListeners();
      return this.files;
    }

    // Deduplicate concurrent requests
    if (this.pendingRequest) {
      console.log('🔄 [Dedup] Request already in progress, waiting...');
      return this.pendingRequest;
    }

    // Cancel any ongoing request
    if (this.currentController) {
      this.currentController.abort();
    }

    this.loading = true;
    this.error = null;
    this.notifyListeners();

    // Create new abort controller
    this.currentController = new AbortController();

    // Create the request promise
    this.pendingRequest = this._fetchWithRetry({
      retries,
      timeout,
      retryDelay,
      signal: this.currentController.signal,
    });

    try {
      const result = await this.pendingRequest;
      return result;
    } catch (error) {
      console.error('❌ Error fetching ARB decisions:', error);
      this.error = error.message || 'Unable to fetch decisions. Please check your internet connection.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
      this.currentController = null;
    }
  }

  // ============================================
  // Internal fetch with retry logic
  // ============================================
  async _fetchWithRetry({ retries, timeout, retryDelay, signal }) {
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Fetch attempt ${attempt}/${retries}`);
        
        const result = await this._performFetch({ timeout, signal });
        
        // Success - update cache
        this.cache.data = result;
        this.cache.timestamp = Date.now();
        
        this.files = result;
        this.updateStats();
        this.loading = false;
        this.notifyListeners();
        
        console.log(`✅ Successfully fetched ${result.length} decisions on attempt ${attempt}`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
        
        // Don't retry if it's an abort error
        if (error.name === 'AbortError') {
          console.log('🛑 Request was cancelled');
          throw error;
        }
        
        // Don't retry if it's a status error (4xx, 5xx) except 429 or 503
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          console.log('❌ Client error, not retrying');
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this._delay(delay);
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  // ============================================
  // Actual fetch with proper CORS headers
  // ============================================
  async _performFetch({ timeout, signal }) {
    console.log('🔍 Fetching ARB decisions from:', PROXY_ENDPOINT);
    
    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, timeout);
    
    try {
      // Use race between fetch and timeout
      const response = await Promise.race([
        fetch(PROXY_ENDPOINT, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache',
          },
          signal: signal || timeoutController.signal,
          credentials: 'include',
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Fetch timeout')), timeout);
        })
      ]);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }
      
      // Get response as text with progress
      const contentLength = response.headers.get('content-length');
      console.log(`📊 Response size: ${contentLength ? this._formatBytes(parseInt(contentLength)) : 'unknown'}`);
      
      // Use streaming for large responses
      const html = await this._readResponseStream(response);
      
      console.log('📄 HTML received, length:', html.length);
      
      if (!html || html.length < 1000) {
        throw new Error('Received incomplete HTML response');
      }
      
      // Parse the HTML
      const files = this.parseDecisionsFromHTML(html);
      console.log('📊 Files parsed:', files.length);
      
      return files;
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ============================================
  // Stream response reader with progress
  // ============================================
  async _readResponseStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    let chunkCount = 0;
    let totalBytes = 0;
    
    console.log('📥 Reading response stream...');
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ Stream complete: ${this._formatBytes(totalBytes)} total`);
          break;
        }
        
        chunkCount++;
        totalBytes += value.length;
        html += decoder.decode(value, { stream: true });
        
        // Log progress every 500KB
        if (totalBytes % (500 * 1024) < value.length) {
          console.log(`📦 Received ${this._formatBytes(totalBytes)} so far...`);
        }
      }
      
      // Final decode
      html += decoder.decode();
      
      return html;
      
    } catch (error) {
      console.error('❌ Stream reading error:', error);
      throw error;
    }
  }

  // ============================================
  // Cache management methods
  // ============================================
  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) {
      return false;
    }
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = null;
    console.log('🧹 Cache cleared');
  }

  // ============================================
  // Cancel ongoing request
  // ============================================
  cancelRequest() {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
      this.pendingRequest = null;
      this.loading = false;
      this.notifyListeners();
      console.log('🛑 Request cancelled');
    }
  }

  // ============================================
  // Utility methods
  // ============================================
  _formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // parseDecisionsFromHTML (FIXED with better year extraction)
  // ============================================
  parseDecisionsFromHTML(html) {
    // Create parser with error handling
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(html, 'text/html');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.warn('⚠️ HTML parsing error:', parserError.textContent);
      }
    } catch (error) {
      console.error('❌ Failed to parse HTML:', error);
      return [];
    }
    
    const files = [];
    
    // Find all MDocs tables
    const tables = doc.querySelectorAll('.mdocs-container table, .mdocs table, .table-responsive table');
    console.log('📋 Found tables:', tables.length);
    
    if (tables.length === 0) {
      console.warn('⚠️ No tables found, checking for alternative content...');
      // Try to find any file links
      const links = doc.querySelectorAll('a[href$=".pdf"], a[href*="/download/"]');
      console.log(`📎 Found ${links.length} direct PDF links`);
      
      // If there are direct links, try to extract them
      links.forEach(link => {
        const parentRow = link.closest('tr, li, div');
        if (parentRow) {
          const fileData = this.extractFileDataFromRow(parentRow, 'Unknown', new Set());
          if (fileData) {
            files.push(fileData);
          }
        }
      });
      
      return files;
    }
    
    // ✅ Track years we've seen to validate against
    const validYears = new Set();
    
    tables.forEach(table => {
      // Find the parent spoiler to get the year
      const spoiler = table.closest('.su-spoiler, .accordion, .panel');
      let year = 'Unknown';
      
      if (spoiler) {
        const title = spoiler.querySelector('.su-spoiler-title, .accordion-header, .panel-title');
        if (title) {
          const match = title.textContent.trim().match(/(\d{4})\s*Decisions?/i);
          if (match) {
            year = match[1];
            validYears.add(year);
          }
        }
      }
      
      // Parse rows - use multiple selectors
      const rows = table.querySelectorAll('tbody tr.mdocs-normal, tbody tr, tr.mdocs-normal, tr.file-row');
      
      rows.forEach(row => {
        const fileData = this.extractFileDataFromRow(row, year, validYears);
        if (fileData) {
          files.push(fileData);
        }
      });
    });
    
    // If still no files, try a different approach
    if (files.length === 0) {
      console.warn('⚠️ No files found, trying alternative extraction...');
      const rows = doc.querySelectorAll('.mdocs-normal, .file-row, [data-mdocs-id]');
      rows.forEach(row => {
        const fileData = this.extractFileDataFromRow(row, 'Unknown', validYears);
        if (fileData) {
          files.push(fileData);
        }
      });
    }
    
    // ✅ Validate years after extraction
    const yearCounts = {};
    files.forEach(f => {
      yearCounts[f.year] = (yearCounts[f.year] || 0) + 1;
    });
    console.log('📊 Year distribution:', yearCounts);
    
    return files;
  }

  // ============================================
  // extractFileDataFromRow (FIXED with better year validation)
  // ============================================
  extractFileDataFromRow(row, defaultYear, validYears) {
    try {
      // If row is not an element, skip
      if (!row || typeof row.querySelector !== 'function') {
        return null;
      }
      
      // Try different selectors for the name link
      const nameLink = row.querySelector('.mdocs-name a') || 
                       row.querySelector('.mdocs-file-name a') ||
                       row.querySelector('td:first-child a') ||
                       row.querySelector('a[href*="/download/"]');
      
      const downloadLink = row.querySelector('.mdocs-download a') ||
                          row.querySelector('.mdocs-file-download a') ||
                          row.querySelector('td:last-child a') ||
                          row.querySelector('a[href$=".pdf"]') ||
                          nameLink;
      
      const downloadsEl = row.querySelector('.mdocs-downloads em') ||
                         row.querySelector('.download-count') ||
                         row.querySelector('[data-downloads]');
      
      const modifiedEl = row.querySelector('.mdocs-modified em') ||
                        row.querySelector('.modified-date') ||
                        row.querySelector('[data-modified]');
      
      const iconEl = row.querySelector('.mdoc-file-type-icon') ||
                    row.querySelector('.file-icon') ||
                    row.querySelector('img[alt*="file"]');
      
      const folderEl = row.querySelector('.mdocs-name small.text-muted') ||
                      row.querySelector('.folder-name') ||
                      row.querySelector('[data-folder]');
      
      if (!nameLink) {
        return null;
      }
      
      let folder = '';
      if (folderEl) {
        folder = folderEl.textContent.trim();
      }
      
      // ===== ✅ FIXED: Better year extraction =====
      let decisionYear = defaultYear;
      const nameText = nameLink.textContent || '';
      
      // Try to extract year from the decision name with multiple patterns
      // Pattern 1: Standalone 4-digit year (20XX)
      const yearMatch = nameText.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const extractedYear = yearMatch[1];
        // ✅ Validate that the extracted year is in the valid years set
        // Or if validYears is empty (fallback), accept the year
        if (!validYears || validYears.size === 0 || validYears.has(extractedYear)) {
          decisionYear = extractedYear;
        } else {
          // If the extracted year doesn't match any valid year, log a warning
          console.warn(`⚠️ Year mismatch: Found "${extractedYear}" in file name but valid years are: ${[...validYears].join(', ')}. Using table year: ${defaultYear}`);
          decisionYear = defaultYear;
        }
      }
      
      // Pattern 2: Year in parentheses like "(2024)"
      if (!yearMatch || decisionYear === 'Unknown') {
        const parenMatch = nameText.match(/\((\d{4})\)/);
        if (parenMatch) {
          const extractedYear = parenMatch[1];
          if (!validYears || validYears.size === 0 || validYears.has(extractedYear)) {
            decisionYear = extractedYear;
          }
        }
      }
      
      // Pattern 3: Year in brackets like "[2024]"
      if (!yearMatch || decisionYear === 'Unknown') {
        const bracketMatch = nameText.match(/\[(\d{4})\]/);
        if (bracketMatch) {
          const extractedYear = bracketMatch[1];
          if (!validYears || validYears.size === 0 || validYears.has(extractedYear)) {
            decisionYear = extractedYear;
          }
        }
      }
      
      // Pattern 4: Look for year in the folder name
      if (decisionYear === 'Unknown' && folder) {
        const folderYearMatch = folder.match(/\b(20\d{2})\b/);
        if (folderYearMatch) {
          const extractedYear = folderYearMatch[1];
          if (!validYears || validYears.size === 0 || validYears.has(extractedYear)) {
            decisionYear = extractedYear;
          }
        }
      }
      
      // ✅ Final validation: If year is still Unknown but we have valid years, 
      // check if this file might belong to the first valid year
      if (decisionYear === 'Unknown' && validYears && validYears.size > 0) {
        // Try to find the year from the context (table year)
        if (defaultYear !== 'Unknown' && validYears.has(defaultYear)) {
          decisionYear = defaultYear;
        } else {
          // Fallback to the first valid year
          decisionYear = [...validYears][0];
          console.warn(`⚠️ Using fallback year "${decisionYear}" for file: ${nameText.substring(0, 50)}...`);
        }
      }
      
      // Generate a unique ID
      const id = nameLink.getAttribute('data-mdocs-id') || 
                nameLink.getAttribute('data-id') ||
                `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      let downloadUrl = downloadLink?.getAttribute('href') || '';
      
      // Clean up the download URL
      if (downloadUrl && !downloadUrl.startsWith('http')) {
        downloadUrl = `https://ppra.go.ke${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
      }
      
      // ✅ Log suspicious files for debugging
      if (decisionYear !== defaultYear && decisionYear !== 'Unknown' && defaultYear !== 'Unknown') {
        console.log(`📎 File year differs from table: "${decisionYear}" vs "${defaultYear}" for: ${nameText.substring(0, 60)}...`);
      }
      
      return {
        id: id,
        name: nameText.trim() || 'Untitled Decision',
        downloadUrl: downloadUrl || '#',
        downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
        modified: modifiedEl?.textContent?.trim() || '',
        icon: iconEl?.getAttribute('src') || '',
        folder: folder || defaultYear || 'ARB Decisions',
        year: decisionYear,
        tableYear: defaultYear, // Keep for debugging
      };
      
    } catch (error) {
      console.warn('⚠️ Error extracting file data:', error);
      return null;
    }
  }

  // ============================================
  // updateStats, getYears, etc.
  // ============================================
  updateStats() {
    const years = this.getYears();
    
    this.stats = {
      total: this.files.length,
      totalDownloads: this.files.reduce((sum, f) => sum + (f.downloads || 0), 0),
      years: years,
    };
  }

  getYears() {
    const yearSet = new Set();
    this.files.forEach(file => {
      if (file.year && file.year !== 'Unknown') {
        yearSet.add(file.year);
      }
    });
    return ['All', ...Array.from(yearSet).sort().reverse()];
  }

  getFilteredFiles() {
    let result = [...this.files];
    
    if (this.filters.year !== 'All') {
      result = result.filter(f => f.year === this.filters.year);
    }
    
    if (this.filters.searchTerm && this.filters.searchTerm.trim()) {
      const term = this.filters.searchTerm.toLowerCase().trim();
      result = result.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.folder.toLowerCase().includes(term)
      );
    }
    
    result = this.sortFiles(result, this.filters.sortBy, this.filters.sortOrder);
    return result;
  }

  sortFiles(files, sortBy = 'date', order = 'desc') {
    const sorted = [...files];
    sorted.sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'downloads') {
        valA = a.downloads || 0;
        valB = b.downloads || 0;
        return order === 'desc' ? valB - valA : valA - valB;
      } 
      
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (sortBy === 'year') {
        valA = parseInt(a.year) || 0;
        valB = parseInt(b.year) || 0;
        return order === 'desc' ? valB - valA : valA - valB;
      }
      
      // Default: sort by date (modified)
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        try {
          const parts = dateStr.split(/[- :]/);
          if (parts.length >= 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${parts[3] || '00'}:${parts[4] || '00'}`);
          }
          return new Date(dateStr);
        } catch {
          return new Date(0);
        }
      };
      
      valA = parseDate(a.modified);
      valB = parseDate(b.modified);
      return order === 'desc' ? valB - valA : valA - valB;
    });
    
    return sorted;
  }

  updateFilter(key, value) {
    this.filters = { ...this.filters, [key]: value };
    this.notifyListeners();
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      year: 'All',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    this.notifyListeners();
  }

  toggleSortOrder() {
    this.filters.sortOrder = this.filters.sortOrder === 'desc' ? 'asc' : 'desc';
    this.notifyListeners();
  }

  getYearCount(year) {
    if (year === 'All') return this.files.length;
    return this.files.filter(f => f.year === year).length;
  }

  downloadFile(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.warn('⚠️ No download URL available for:', fileName);
    }
  }

  getFileIcon(fileName, iconUrl) {
    if (iconUrl) {
      return { type: 'image', url: iconUrl, alt: 'File icon' };
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'zip': '📦',
      'rar': '📦',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
    };
    
    return { type: 'emoji', emoji: icons[ext] || '📎' };
  }

  // ============================================
  // ✅ NEW: Debug Functions
  // ============================================

  /**
   * Debug year distribution to find misplaced files
   */
  debugYearDistribution() {
    console.log('🔍 Year Distribution Debug:');
    
    // Count files by year
    const yearCounts = {};
    const misplacedFiles = [];
    const filesWithNoYear = [];
    
    this.files.forEach(file => {
      const year = file.year || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      
      // Check if file's year doesn't match its table year
      if (file.tableYear && file.tableYear !== 'Unknown' && file.year !== file.tableYear && file.year !== 'Unknown') {
        misplacedFiles.push({
          name: file.name.substring(0, 60) + (file.name.length > 60 ? '...' : ''),
          year: file.year,
          tableYear: file.tableYear,
          folder: file.folder
        });
      }
      
      if (file.year === 'Unknown' || !file.year) {
        filesWithNoYear.push({
          name: file.name.substring(0, 60) + (file.name.length > 60 ? '...' : ''),
          folder: file.folder,
          tableYear: file.tableYear
        });
      }
    });
    
    console.log('📊 Year counts:', yearCounts);
    console.log(`📊 Total files: ${this.files.length}`);
    console.log(`📊 Total years: ${Object.keys(yearCounts).length}`);
    
    if (misplacedFiles.length > 0) {
      console.warn(`⚠️ Found ${misplacedFiles.length} potentially misplaced files:`);
      misplacedFiles.forEach(f => {
        console.warn(`  - "${f.name}" → Year: ${f.year}, Table: ${f.tableYear}`);
      });
    } else {
      console.log('✅ No misplaced files detected');
    }
    
    if (filesWithNoYear.length > 0) {
      console.warn(`⚠️ Found ${filesWithNoYear.length} files with no year:`);
      filesWithNoYear.forEach(f => {
        console.warn(`  - "${f.name}" → Folder: ${f.folder}, Table: ${f.tableYear}`);
      });
    }
    
    return { yearCounts, misplacedFiles, filesWithNoYear, total: this.files.length };
  }

  /**
   * Get valid years from the data
   */
  getValidYears() {
    const yearSet = new Set();
    this.files.forEach(file => {
      if (file.year && file.year !== 'Unknown') {
        yearSet.add(file.year);
      }
    });
    return [...yearSet].sort();
  }

  /**
   * Get files that might be misplaced
   */
  getMisplacedFiles() {
    return this.files.filter(file => 
      file.tableYear && 
      file.tableYear !== 'Unknown' && 
      file.year !== file.tableYear &&
      file.year !== 'Unknown'
    );
  }

  /**
   * Get files with no year
   */
  getFilesWithNoYear() {
    return this.files.filter(file => 
      !file.year || file.year === 'Unknown'
    );
  }

  /**
   * Debug years from the console
   */
  debugYears() {
    const years = this.getYears();
    console.log('📊 All years:', years);
    years.forEach(year => {
      const count = this.getYearCount(year);
      console.log(`  ${year}: ${count} files`);
    });
  }

  // ============================================
  // PROXY HEALTH CHECK
  // ============================================
  async checkProxyHealth() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/proxy/health`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Proxy health:', data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('❌ Proxy health check failed:', error);
      return null;
    }
  }

  // ============================================
  // CORS TEST
  // ============================================
  async testCORS() {
    try {
      console.log('🧪 Testing CORS configuration...');
      const response = await fetch(`${BACKEND_URL}/api/cors-test`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ CORS test passed:', data);
        return data;
      } else {
        console.error('❌ CORS test failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ CORS test error:', error);
      return null;
    }
  }

  // ============================================
  // FORCE REFRESH
  // ============================================
  async refreshDecisions() {
    console.log('🔄 Force refreshing decisions...');
    this.clearCache();
    return this.fetchDecisions({ forceRefresh: true });
  }
}

// ============================================
// ENHANCED: Vue/React Composable for ARB Service
// ============================================
export function useARB() {
  const service = arbService;
  
  const fetchDecisions = async (options) => {
    return service.fetchDecisions(options);
  };
  
  const refreshDecisions = async () => {
    return service.refreshDecisions();
  };
  
  const updateFilter = (key, value) => {
    service.updateFilter(key, value);
  };
  
  const resetFilters = () => {
    service.resetFilters();
  };
  
  const toggleSortOrder = () => {
    service.toggleSortOrder();
  };
  
  const getState = () => {
    return service.getState();
  };
  
  const cancelRequest = () => {
    service.cancelRequest();
  };
  
  const clearCache = () => {
    service.clearCache();
  };
  
  const testCORS = () => {
    return service.testCORS();
  };
  
  const checkProxyHealth = () => {
    return service.checkProxyHealth();
  };
  
  // ✅ NEW: Debug functions
  const debugYearDistribution = () => {
    return service.debugYearDistribution();
  };
  
  const getValidYears = () => {
    return service.getValidYears();
  };
  
  const getMisplacedFiles = () => {
    return service.getMisplacedFiles();
  };
  
  const getFilesWithNoYear = () => {
    return service.getFilesWithNoYear();
  };
  
  return {
    fetchDecisions,
    refreshDecisions,
    updateFilter,
    resetFilters,
    toggleSortOrder,
    getState,
    cancelRequest,
    clearCache,
    testCORS,
    checkProxyHealth,
    debugYearDistribution,
    getValidYears,
    getMisplacedFiles,
    getFilesWithNoYear,
    subscribe: service.subscribe.bind(service),
  };
}

const arbService = new ARBService();
export { ARBService };
export default arbService;