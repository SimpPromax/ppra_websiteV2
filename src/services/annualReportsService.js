// src/services/annualReportsService.js
/**
 * Service for fetching Annual Reports from PPRA website
 * Uses local backend proxy for CORS-free access
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/annual-reports`;

class AnnualReportsService {
  constructor() {
    this.files = [];
    this.loading = false;
    this.error = null;
    this.listeners = [];
    this.cache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000, // 5 minutes
    };
    this.pendingRequest = null;
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
    return {
      files: this.files,
      loading: this.loading,
      error: this.error,
      total: this.files.length,
    };
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchReports(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached annual reports data');
      this.files = this.cache.data;
      this.notifyListeners();
      return this.files;
    }

    if (this.pendingRequest) {
      console.log('🔄 [Dedup] Request already in progress, waiting...');
      return this.pendingRequest;
    }

    this.loading = true;
    this.error = null;
    this.notifyListeners();

    this.pendingRequest = this._fetchFromProxy();

    try {
      const result = await this.pendingRequest;
      this.cache.data = result;
      this.cache.timestamp = Date.now();
      this.files = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${result.length} annual reports`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching annual reports:', error);
      this.error = error.message || 'Unable to fetch annual reports.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching annual reports from proxy:', PROXY_ENDPOINT);

    try {
      const response = await fetch(PROXY_ENDPOINT, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(30000),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('📄 HTML received, length:', html.length);

      if (!html || html.length < 1000) {
        throw new Error('Received incomplete HTML response');
      }

      const files = this.parseReportsFromHTML(html);
      console.log('📊 Files parsed:', files.length);

      return files;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseReportsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const files = [];

    const wpdmItems = doc.querySelectorAll('.w3eden .wpdm-link-tpl');
    console.log('📋 Found WPDM items:', wpdmItems.length);

    wpdmItems.forEach((item) => {
      const fileData = this.extractFileData(item);
      if (fileData) {
        files.push(fileData);
      }
    });

    // Sort by year (newest first)
    files.sort((a, b) => {
      const yearA = this.extractYearNumber(a.title);
      const yearB = this.extractYearNumber(b.title);
      return yearB - yearA;
    });

    return files;
  }

  extractFileData(item) {
    try {
      const icon = item.querySelector('.wpdm_icon');
      const title = item.querySelector('.ptitle');
      const downloadBtn = item.querySelector('.wpdm-download-link');
      const sizeLabel = item.querySelector('.label-default');
      const dataDurl = item.getAttribute('data-durl');

      if (!title) return null;

      let downloadUrl = '';
      if (downloadBtn) {
        const onclick = downloadBtn.getAttribute('onclick');
        if (onclick) {
          const match = onclick.match(/location\.href='([^']+)'/);
          if (match) {
            downloadUrl = match[1];
          }
        }
        if (!downloadUrl) {
          downloadUrl = downloadBtn.getAttribute('href') || '';
        }
      }
      if (!downloadUrl && dataDurl) {
        downloadUrl = dataDurl;
      }

      const titleText = title.textContent?.trim() || '';
      const sizeText = sizeLabel?.textContent?.trim() || '';

      return {
        id: `annual-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleText,
        size: sizeText,
        downloadUrl: downloadUrl || '#',
        icon: icon?.getAttribute('src') || '',
        source: 'wpdm',
        year: this.extractYear(titleText),
      };
    } catch (error) {
      console.warn('⚠️ Error extracting file data:', error);
      return null;
    }
  }

  extractYear(title) {
    const match = title.match(/(\d{4})/);
    return match ? match[1] : null;
  }

  extractYearNumber(title) {
    const match = title.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 0;
  }

  downloadFile(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.warn('⚠️ No download URL available for:', fileName);
    }
  }

  // ===== DEBUG FUNCTIONS =====
  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 ANNUAL REPORTS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Files: ${this.files.length}`);
    console.log('📊 Files:');
    this.files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.title.substring(0, 60)}... (${file.size})`);
    });
    console.log('='.repeat(60));
    return {
      total: this.files.length,
      files: this.files.map(f => ({ title: f.title.substring(0, 50) + '...', size: f.size, year: f.year })),
    };
  }
}

const annualReportsService = new AnnualReportsService();
export default annualReportsService;