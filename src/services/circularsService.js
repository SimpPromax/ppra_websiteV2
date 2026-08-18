

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/circulars`;

class CircularsService {
  constructor() {
    this.files = [];
    this.loading = false;
    this.error = null;
    this.filters = {
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    this.listeners = [];
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
      filters: this.filters,
    };
  }

  async fetchCirculars() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('🔍 Fetching circulars from:', PROXY_ENDPOINT);
      
      const response = await fetch(PROXY_ENDPOINT, {
        headers: { 'Accept': 'text/html' },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      this.files = this.parseCircularsFromHTML(html);
      
      console.log('📊 Parsed circulars:', this.files.length);
      
      this.loading = false;
      this.notifyListeners();
      return this.files;
      
    } catch (error) {
      console.error('❌ Error:', error);
      this.error = error.message;
      this.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  parseCircularsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const files = [];

    // === HANDLE WPDM (WordPress Download Manager) ===
    // These are the card-style downloads
    const wpdmItems = doc.querySelectorAll('.w3eden .wpdm-link-tpl');
    wpdmItems.forEach(item => {
      const fileData = this.extractWPDMData(item);
      if (fileData) files.push(fileData);
    });

    // === HANDLE MDocs (Memphis Documents Library) ===
    // These are the table-style downloads
    const mdocsRows = doc.querySelectorAll('.mdocs-container table tbody tr.mdocs-normal');
    mdocsRows.forEach(row => {
      const fileData = this.extractMDocsData(row);
      if (fileData) files.push(fileData);
    });

    return files;
  }

  extractWPDMData(item) {
    try {
      const icon = item.querySelector('.wpdm_icon');
      const title = item.querySelector('.ptitle');
      const downloadBtn = item.querySelector('.wpdm-download-link');
      const sizeLabel = item.querySelector('.label-default');

      if (!title) return null;

      return {
        id: `wpdm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: title.textContent.trim(),
        downloadUrl: downloadBtn?.getAttribute('onclick')?.match(/href='([^']+)'/)?.[1] || 
                     downloadBtn?.getAttribute('href') || '#',
        icon: icon?.getAttribute('src') || '',
        size: sizeLabel?.textContent?.trim() || '',
        type: 'wpdm', // Track source
        year: this.extractYear(title.textContent),
        folder: 'Circulars',
        modified: '',
        downloads: 0,
        description: title.textContent.trim()
      };
    } catch (error) {
      console.warn('⚠️ Error extracting WPDM data:', error);
      return null;
    }
  }

  extractMDocsData(row) {
    try {
      const nameLink = row.querySelector('.mdocs-name a');
      const downloadLink = row.querySelector('.mdocs-download a');
      const downloadsEl = row.querySelector('.mdocs-downloads em');
      const modifiedEl = row.querySelector('.mdocs-modified em');
      const iconEl = row.querySelector('.mdoc-file-type-icon');

      if (!nameLink) return null;

      return {
        id: nameLink.getAttribute('data-mdocs-id') || `mdocs-${Date.now()}`,
        name: nameLink.textContent.trim(),
        downloadUrl: downloadLink?.getAttribute('href') || '#',
        icon: iconEl?.getAttribute('src') || '',
        downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
        modified: modifiedEl?.textContent?.trim() || '',
        type: 'mdocs',
        year: this.extractYear(nameLink.textContent),
        folder: 'Circulars',
        size: '',
        description: ''
      };
    } catch (error) {
      console.warn('⚠️ Error extracting MDocs data:', error);
      return null;
    }
  }

  extractYear(text) {
    const match = text.match(/\b(20\d{2})\b/);
    return match ? match[1] : 'Unknown';
  }

  getFilteredFiles() {
    let result = [...this.files];

    if (this.filters.searchTerm?.trim()) {
      const term = this.filters.searchTerm.toLowerCase().trim();
      result = result.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term)
      );
    }

    result = this.sortFiles(result);
    return result;
  }

  sortFiles(files) {
    const sorted = [...files];
    const order = this.filters.sortOrder === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (this.filters.sortBy === 'name') {
        return order * a.name.localeCompare(b.name);
      }
      // Default sort by date (using year)
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return order * (yearB - yearA);
    });

    return sorted;
  }

  updateFilter(key, value) {
    this.filters = { ...this.filters, [key]: value };
    this.notifyListeners();
  }

  downloadFile(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
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
    };
    return { type: 'emoji', emoji: icons[ext] || '📎' };
  }
}

const circularsService = new CircularsService();
export default circularsService;