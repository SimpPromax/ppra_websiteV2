// src/services/PPADregulationsService.js
/**
 * Service for fetching PPAD Regulations from PPRA website
 * Uses local backend proxy for CORS-free access
 * Handles both WPDM and MDocs file formats
 * PPAD = Public Procurement and Asset Disposal
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/regulations`;

class PPADRegulationsService {
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

  async fetchRegulations(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached PPAD regulations data');
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
      console.log(`✅ Successfully fetched ${result.length} PPAD regulations`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching PPAD regulations:', error);
      this.error = error.message || 'Unable to fetch PPAD regulations.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching PPAD regulations from proxy:', PROXY_ENDPOINT);

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

      const files = this.parseRegulationsFromHTML(html);
      console.log('📊 Files parsed:', files.length);

      return files;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseRegulationsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const files = [];

    // ============================================================
    // 1. PARSE WPDM FILES (Card-style downloads)
    // ============================================================
    const wpdmItems = doc.querySelectorAll('.w3eden .wpdm-link-tpl');
    console.log('📋 Found WPDM items:', wpdmItems.length);

    wpdmItems.forEach((item) => {
      const fileData = this.extractWPDMData(item);
      if (fileData) {
        files.push(fileData);
      }
    });

    // ============================================================
    // 2. PARSE MDOCS FILES (Table-style downloads)
    // ============================================================
    const mdocsRows = doc.querySelectorAll('.mdocs-container table tbody tr.mdocs-normal');
    console.log('📋 Found MDocs rows:', mdocsRows.length);

    mdocsRows.forEach((row) => {
      const fileData = this.extractMDocsData(row);
      if (fileData) {
        files.push(fileData);
      }
    });

    // Sort by name (alphabetical)
    files.sort((a, b) => a.name.localeCompare(b.name));

    return files;
  }

  // ============================================================
  // WPDM EXTRACTION
  // ============================================================
  extractWPDMData(item) {
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
        id: `wpdm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: titleText,
        size: sizeText,
        downloadUrl: downloadUrl || '#',
        icon: icon?.getAttribute('src') || '',
        source: 'wpdm',
        type: 'Regulation',
        downloads: 0,
        modified: '',
      };
    } catch (error) {
      console.warn('⚠️ Error extracting WPDM data:', error);
      return null;
    }
  }

  // ============================================================
  // MDOCS EXTRACTION
  // ============================================================
  extractMDocsData(row) {
    try {
      const nameLink = row.querySelector('.mdocs-name a');
      const downloadLink = row.querySelector('.mdocs-download a');
      const downloadsEl = row.querySelector('.mdocs-downloads em');
      const modifiedEl = row.querySelector('.mdocs-modified em');
      const iconEl = row.querySelector('.mdoc-file-type-icon');

      if (!nameLink) return null;

      // Get the full name (includes file extension)
      const nameText = nameLink.textContent?.trim() || '';
      
      // Get the file extension from the icon or name
      let fileType = 'pdf';
      if (iconEl) {
        const src = iconEl.getAttribute('src') || '';
        if (src.includes('pdf')) fileType = 'pdf';
        else if (src.includes('docx')) fileType = 'docx';
        else if (src.includes('xlsx')) fileType = 'xlsx';
      }

      return {
        id: nameLink.getAttribute('data-mdocs-id') || `mdocs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: nameText,
        downloadUrl: downloadLink?.getAttribute('href') || '#',
        icon: iconEl?.getAttribute('src') || '',
        downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
        modified: modifiedEl?.textContent?.trim() || '',
        source: 'mdocs',
        type: 'Regulation',
        fileType: fileType,
        size: '',
      };
    } catch (error) {
      console.warn('⚠️ Error extracting MDocs data:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================
  downloadFile(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.warn('⚠️ No download URL available for:', fileName);
    }
  }

  getFileIcon(fileName, iconUrl) {
    if (iconUrl) {
      return { type: 'image', url: iconUrl };
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
    };
    return { type: 'emoji', emoji: icons[ext] || '📎' };
  }

  // ============================================================
  // DEBUG FUNCTIONS
  // ============================================================
  debugStats() {
    const wpdmCount = this.files.filter(f => f.source === 'wpdm').length;
    const mdocsCount = this.files.filter(f => f.source === 'mdocs').length;

    console.log('='.repeat(60));
    console.log('📊 PPAD REGULATIONS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Files: ${this.files.length}`);
    console.log(`📊 WPDM Files: ${wpdmCount}`);
    console.log(`📊 MDocs Files: ${mdocsCount}`);
    console.log('📊 Files:');
    this.files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name.substring(0, 60)}... (${file.source})`);
    });
    console.log('='.repeat(60));
    return {
      total: this.files.length,
      wpdmCount,
      mdocsCount,
      files: this.files.map(f => ({ name: f.name.substring(0, 50) + '...', source: f.source })),
    };
  }

  // ============================================================
  // CLEAR CACHE
  // ============================================================
  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = null;
    console.log('🧹 PPAD Regulations cache cleared');
  }

  // ============================================================
  // FORCE REFRESH
  // ============================================================
  async refreshRegulations() {
    console.log('🔄 Force refreshing PPAD regulations...');
    this.clearCache();
    return this.fetchRegulations({ forceRefresh: true });
  }
}

// Create singleton instance
const ppadRegulationsService = new PPADRegulationsService();

// Export both the class and the singleton instance
export { PPADRegulationsService };
export default ppadRegulationsService;