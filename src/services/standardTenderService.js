// src/services/standardTenderService.js
/**
 * Service for fetching Standard Tender Documents from PPRA website
 * Uses local backend proxy for CORS-free access
 * Handles multiple tabs (2022, 2021, Archive)
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/standard-tender-documents`;

class StandardTenderService {
  constructor() {
    this.tabs = [];
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

  // ============ SUBSCRIPTION SYSTEM ============
  
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
      tabs: this.tabs,
      loading: this.loading,
      error: this.error,
      total: this.tabs.reduce((sum, tab) => sum + tab.files.length, 0),
    };
  }

  // ============ CACHE MANAGEMENT ============
  
  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = null;
    console.log('🧹 Standard Tender cache cleared');
  }

  // ============ DATA FETCHING ============

  async fetchDocuments(options = {}) {
    const { forceRefresh = false } = options;

    // Check cache first
    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached standard tender documents data');
      this.tabs = this.cache.data;
      this.notifyListeners();
      return this.tabs;
    }

    // Deduplicate concurrent requests
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
      this.tabs = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${result.length} tabs with ${this.getTotalFiles()} documents`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching standard tender documents:', error);
      this.error = error.message || 'Unable to fetch documents. Please check your internet connection.';
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
        signal: AbortSignal.timeout(45000),
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

      const tabs = this.parseDocumentsFromHTML(html);
      console.log('📊 Tabs parsed:', tabs.length);
      tabs.forEach((tab, i) => {
        console.log(`  Tab ${i + 1}: "${tab.label}" - ${tab.files.length} files`);
      });

      return tabs;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  // ============ HTML PARSING ============

  parseDocumentsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tabs = [];

    // Find the tabs container
    const tabsContainer = doc.querySelector('.su-tabs');
    if (!tabsContainer) {
      console.warn('⚠️ No tabs container found');
      return this.extractFallbackTabs(doc);
    }

    // Get tab navigation labels
    const navItems = tabsContainer.querySelectorAll('.su-tabs-nav span');
    const panes = tabsContainer.querySelectorAll('.su-tabs-pane');

    navItems.forEach((nav, index) => {
      const label = nav.textContent?.trim() || `Tab ${index + 1}`;
      const pane = panes[index];
      
      if (!pane) return;

      // Parse WPDM items in this pane
      const files = this.parseWPDMItems(pane);
      
      // Check if there's also an MDocs table in this pane
      const mdocsTable = pane.querySelector('.mdocs-container table');
      if (mdocsTable) {
        const mdocsFiles = this.parseMDocsItems(mdocsTable);
        files.push(...mdocsFiles);
      }

      tabs.push({
        id: `tab-${index}`,
        label: label,
        files: files,
        total: files.length,
      });
    });

    // If no tabs found with the above method, try fallback
    if (tabs.length === 0) {
      return this.extractFallbackTabs(doc);
    }

    return tabs;
  }

  parseWPDMItems(container) {
    const files = [];
    const items = container.querySelectorAll('.w3eden .wpdm-link-tpl');

    items.forEach((item) => {
      const fileData = this.extractWPDMData(item);
      if (fileData) {
        files.push(fileData);
      }
    });

    return files;
  }

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
      const iconSrc = icon?.getAttribute('src') || '';

      return {
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleText,
        size: sizeText,
        downloadUrl: downloadUrl || '#',
        icon: iconSrc,
        fileType: this.detectFileType(titleText, iconSrc),
        source: 'wpdm',
      };
    } catch (error) {
      console.warn('⚠️ Error extracting WPDM data:', error);
      return null;
    }
  }

  parseMDocsItems(table) {
    const files = [];
    const rows = table.querySelectorAll('tbody tr.mdocs-normal');

    rows.forEach((row) => {
      const fileData = this.extractMDocsData(row);
      if (fileData) {
        files.push(fileData);
      }
    });

    return files;
  }

  extractMDocsData(row) {
    try {
      const nameLink = row.querySelector('.mdocs-name a');
      const downloadLink = row.querySelector('.mdocs-download a');
      const downloadsEl = row.querySelector('.mdocs-downloads em');
      const modifiedEl = row.querySelector('.mdocs-modified em');
      const iconEl = row.querySelector('.mdoc-file-type-icon');

      if (!nameLink) return null;

      const titleText = nameLink.textContent?.trim() || '';
      const iconSrc = iconEl?.getAttribute('src') || '';

      // Extract the actual file name from the link text
      const fileMatch = titleText.match(/-\s*(.+?)(\.\w+)?$/);
      const fileName = fileMatch ? fileMatch[1].trim() : titleText;

      return {
        id: `mdocs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleText,
        fileName: fileName,
        size: '',
        downloadUrl: downloadLink?.getAttribute('href') || '#',
        icon: iconSrc || '',
        fileType: this.detectFileType(fileName, iconSrc),
        downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
        modified: modifiedEl?.textContent?.trim() || '',
        source: 'mdocs',
      };
    } catch (error) {
      console.warn('⚠️ Error extracting MDocs data:', error);
      return null;
    }
  }

  extractFallbackTabs(doc) {
    const tabs = [];

    // Look for WPDM items
    const wpdmItems = doc.querySelectorAll('.w3eden .wpdm-link-tpl');
    if (wpdmItems.length > 0) {
      const files = [];
      wpdmItems.forEach((item) => {
        const fileData = this.extractWPDMData(item);
        if (fileData) files.push(fileData);
      });
      tabs.push({
        id: 'tab-fallback-1',
        label: 'Tender Documents',
        files: files,
        total: files.length,
      });
    }

    // Look for MDocs tables
    const mdocsTables = doc.querySelectorAll('.mdocs-container table');
    mdocsTables.forEach((table, index) => {
      const files = this.parseMDocsItems(table);
      if (files.length > 0) {
        tabs.push({
          id: `tab-fallback-${index + 2}`,
          label: `Archive ${index + 1}`,
          files: files,
          total: files.length,
        });
      }
    });

    return tabs;
  }

  // ============ UTILITY METHODS ============

  detectFileType(title, iconSrc) {
    const ext = title.split('.').pop()?.toLowerCase() || '';
    const extMap = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
    };

    // Check icon source for file type indicator
    if (iconSrc) {
      if (iconSrc.includes('pdf')) return 'PDF';
      if (iconSrc.includes('docx')) return 'Word';
      if (iconSrc.includes('doc')) return 'Word';
      if (iconSrc.includes('xls')) return 'Excel';
    }

    return extMap[ext] || 'Document';
  }

  getTotalFiles() {
    return this.tabs.reduce((sum, tab) => sum + tab.files.length, 0);
  }

  downloadFile(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.warn('⚠️ No download URL available for:', fileName);
    }
  }

  getFileIcon(file) {
    if (file.icon && file.icon.startsWith('http')) {
      return { type: 'image', url: file.icon };
    }
    const type = file.fileType?.toLowerCase() || '';
    const icons = {
      'pdf': '📄',
      'word': '📝',
      'excel': '📊',
      'powerpoint': '📽️',
    };
    return { type: 'emoji', emoji: icons[type] || '📎' };
  }

  // ============ DEBUG FUNCTIONS ============

  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 STANDARD TENDER DOCUMENTS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Tabs: ${this.tabs.length}`);
    this.tabs.forEach((tab, index) => {
      console.log(`  Tab ${index + 1}: "${tab.label}" - ${tab.files.length} files`);
    });
    console.log(`📊 Total Files: ${this.getTotalFiles()}`);
    console.log('='.repeat(60));
    return {
      totalTabs: this.tabs.length,
      totalFiles: this.getTotalFiles(),
      tabs: this.tabs.map(t => ({ label: t.label, count: t.files.length })),
    };
  }
}

// Create and export a singleton instance
const standardTenderService = new StandardTenderService();
export default standardTenderService;