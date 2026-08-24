// src/services/standardTenderDocumentsService.js
/**
 * Service for fetching Standard Tender Documents from PPRA website
 * Uses local backend proxy for CORS-free access
 * Handles multiple tabs: 2022, 2021, and Old Archive
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/standard-tender-documents`;

class StandardTenderDocumentsService {
  constructor() {
    this.documents = {
      '2022': [],
      '2021': [],
      'old': []
    };
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
    const allDocs = this.getAllDocuments();
    return {
      documents: this.documents,
      allDocuments: allDocs,
      loading: this.loading,
      error: this.error,
      total: allDocs.length,
      counts: {
        '2022': this.documents['2022'].length,
        '2021': this.documents['2021'].length,
        'old': this.documents['old'].length,
      },
      // Helper getters for specific views
      activeDocuments: [...this.documents['2022'], ...this.documents['2021']],
      archivedDocuments: this.documents['old'],
    };
  }

  getAllDocuments() {
    return [
      ...this.documents['2022'],
      ...this.documents['2021'],
      ...this.documents['old']
    ];
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchDocuments(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached standard tender documents data');
      this.documents = this.cache.data;
      this.notifyListeners();
      return this.documents;
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
      this.documents = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched documents: 2022(${result['2022'].length}), 2021(${result['2021'].length}), Old(${result['old'].length})`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching standard tender documents:', error);
      this.error = error.message || 'Unable to fetch documents.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching standard tender documents from proxy:', PROXY_ENDPOINT);

    try {
      const response = await fetch(PROXY_ENDPOINT, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(60000),
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

      const documents = this.parseDocumentsFromHTML(html);
      console.log('📊 Documents parsed:', documents);

      return documents;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseDocumentsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const result = {
      '2022': [],
      '2021': [],
      'old': []
    };

    // Find all tabs
    const tabsContainer = doc.querySelector('.su-tabs');
    if (!tabsContainer) {
      console.warn('⚠️ No tabs container found');
      return result;
    }

    const tabs = tabsContainer.querySelectorAll('.su-tabs-pane');
    console.log('📋 Found tabs:', tabs.length);

    tabs.forEach((tab, index) => {
      let tabName = 'old'; // default
      
      // Determine which tab this is
      if (index === 0) {
        tabName = '2022';
      } else if (index === 1) {
        tabName = '2021';
      } else if (index === 2) {
        tabName = 'old';
      }

      // Find all WPDM items in this tab
      const wpdmItems = tab.querySelectorAll('.w3eden .wpdm-link-tpl');
      console.log(`📋 Tab ${tabName}: Found ${wpdmItems.length} items`);

      wpdmItems.forEach((item) => {
        const fileData = this.extractFileData(item, tabName);
        if (fileData) {
          result[tabName].push(fileData);
        }
      });

      // For old tab, also check for MDocs table
      if (tabName === 'old') {
        const mdocsRows = tab.querySelectorAll('.mdocs-container table tbody tr.mdocs-normal');
        console.log(`📋 Tab ${tabName}: Found ${mdocsRows.length} MDocs items`);
        
        mdocsRows.forEach((row) => {
          const fileData = this.extractMDocsData(row, tabName);
          if (fileData) {
            result[tabName].push(fileData);
          }
        });
      }
    });

    return result;
  }

  extractFileData(item, tabName) {
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

      // Extract document number from title
      const numberMatch = titleText.match(/^(\d+\.\s+)/);
      const docNumber = numberMatch ? numberMatch[1].trim() : '';

      return {
        id: `std-${tabName}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleText,
        size: sizeText,
        downloadUrl: downloadUrl || '#',
        icon: icon?.getAttribute('src') || '',
        source: 'wpdm',
        tab: tabName,
        docNumber: docNumber,
        fileType: this.getFileType(icon?.getAttribute('src') || downloadUrl),
      };
    } catch (error) {
      console.warn('⚠️ Error extracting file data:', error);
      return null;
    }
  }

  extractMDocsData(row, tabName) {
    try {
      const nameLink = row.querySelector('.mdocs-name a');
      const downloadLink = row.querySelector('.mdocs-download a');
      const downloadsEl = row.querySelector('.mdocs-downloads em');
      const modifiedEl = row.querySelector('.mdocs-modified em');
      const iconEl = row.querySelector('.mdoc-file-type-icon');

      if (!nameLink) return null;

      return {
        id: nameLink.getAttribute('data-mdocs-id') || `std-old-${Date.now()}`,
        title: nameLink.textContent?.trim() || 'Untitled',
        downloadUrl: downloadLink?.getAttribute('href') || '#',
        icon: iconEl?.getAttribute('src') || '',
        downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
        modified: modifiedEl?.textContent?.trim() || '',
        source: 'mdocs',
        tab: tabName,
        docNumber: '',
        size: '',
        fileType: this.getFileTypeFromName(nameLink.textContent || ''),
      };
    } catch (error) {
      console.warn('⚠️ Error extracting MDocs data:', error);
      return null;
    }
  }

  getFileType(iconUrl) {
    if (!iconUrl) return 'unknown';
    const ext = iconUrl.split('.').pop()?.toLowerCase() || '';
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'svg': 'svg',
    };
    return typeMap[ext] || 'unknown';
  }

  getFileTypeFromName(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
    };
    return typeMap[ext] || 'unknown';
  }

  getFileIcon(fileName, iconUrl, fileType) {
    if (iconUrl) {
      return { type: 'image', url: iconUrl };
    }

    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'unknown': '📎'
    };

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const emoji = icons[ext] || icons['unknown'];
    
    return { type: 'emoji', emoji };
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
    console.log('📊 STANDARD TENDER DOCUMENTS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 2022 Documents: ${this.documents['2022'].length}`);
    console.log(`📊 2021 Documents: ${this.documents['2021'].length}`);
    console.log(`📊 Old Documents: ${this.documents['old'].length}`);
    console.log(`📊 Total: ${this.getAllDocuments().length}`);
    console.log('='.repeat(60));
    return {
      counts: {
        '2022': this.documents['2022'].length,
        '2021': this.documents['2021'].length,
        'old': this.documents['old'].length,
      },
      total: this.getAllDocuments().length,
    };
  }
}

const standardTenderDocumentsService = new StandardTenderDocumentsService();
export default standardTenderDocumentsService;