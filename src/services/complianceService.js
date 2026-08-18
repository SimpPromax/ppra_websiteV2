// src/services/complianceService.js
/**
 * Service for fetching and managing Compliance Reports from PPRA website
 * Uses local backend proxy for CORS-free access
 */

// ============================================
// USE LOCAL BACKEND PROXY (INSTEAD OF CORS-PROXY)
// ============================================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/compliance-reports`;

// Category color mapping for consistent UI
export const CATEGORY_COLORS = {
  'AUDIT REPORTS': 'bg-red-100 text-red-800 border-red-200',
  'ASSESSMENT REPORTS': 'bg-purple-100 text-purple-800 border-purple-200',
  'REVIEW REPORTS': 'bg-green-100 text-green-800 border-green-200',
  // Fallback for any other categories
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

// Category pill colors
export const CATEGORY_PILL_COLORS = {
  'AUDIT REPORTS': 'bg-red-600',
  'ASSESSMENT REPORTS': 'bg-purple-600',
  'REVIEW REPORTS': 'bg-green-600',
};

const DEFAULT_CATEGORY_COLOR = 'bg-gray-100 text-gray-600 border-gray-200';

class ComplianceService {
  constructor() {
    this.files = [];
    this.loading = false;
    this.error = null;
    this.stats = {
      total: 0,
      totalDownloads: 0,
      categories: [],
      folders: [],
      years: []
    };
    this.filters = {
      searchTerm: '',
      category: 'All',
      year: 'All',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    this.listeners = [];
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
    const filteredFiles = this.getFilteredFiles();
    return {
      files: this.files,
      filteredFiles,
      loading: this.loading,
      error: this.error,
      stats: this.stats,
      filters: this.filters,
      categories: this.stats.categories,
      folders: this.stats.folders,
      years: this.stats.years,
    };
  }

  // ============ DATA FETCHING ============

  /**
   * Fetch and parse compliance reports from the PPRA page
   * Uses local backend proxy - NO CORS issues!
   */
  async fetchReports() {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('🔍 Fetching compliance reports from backend proxy:', PROXY_ENDPOINT);
      
      // ============================================
      // USE LOCAL BACKEND PROXY
      // No CORS issues - backend handles everything
      // ============================================
      const response = await fetch(PROXY_ENDPOINT, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch compliance page: ${response.status}`);
      }
      
      const html = await response.text();
      console.log('📄 HTML received, length:', html.length);
      
      // Check if we got valid HTML
      if (!html || html.length < 1000) {
        throw new Error('Received incomplete HTML response');
      }
      
      this.files = this.parseReportsFromHTML(html);
      
      // Debug: Log categories found
      const categories = [...new Set(this.files.map(f => f.category))];
      console.log('📊 Categories found:', categories);
      console.log('📊 Total files:', this.files.length);
      
      this.updateStats();
      this.loading = false;
      this.notifyListeners();
      return this.files;
    } catch (error) {
      console.error('❌ Error fetching compliance reports:', error);
      this.error = error.message || 'Unable to fetch reports. Please check your internet connection.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Parse MDocs HTML tables to extract file data
   */
  parseReportsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const files = [];
    
    const rows = doc.querySelectorAll('.mdocs-normal');
    
    rows.forEach(row => {
      const fileData = this.extractFileDataFromRow(row);
      if (fileData) {
        files.push(fileData);
      }
    });
    
    return files;
  }

  /**
   * Extract file data from a single MDocs table row
   */
  extractFileDataFromRow(row) {
    const nameLink = row.querySelector('.mdocs-name a');
    const downloadLink = row.querySelector('.mdocs-download a');
    const downloadsEl = row.querySelector('.mdocs-downloads em');
    const modifiedEl = row.querySelector('.mdocs-modified em');
    const iconEl = row.querySelector('.mdoc-file-type-icon');
    
    if (!nameLink || !downloadLink) {
      return null;
    }
    
    // Get folder/year from parent elements
    const folderEl = row.closest('.su-spoiler');
    const folderName = folderEl?.querySelector('.su-spoiler-title')?.textContent?.trim() || 'Uncategorized';
    
    // Get category from the tab
    const tabEl = row.closest('.su-tabs-pane');
    let category = 'Reports';
    
    if (tabEl) {
      // Find the parent tabs container and get the active tab label
      const tabsContainer = tabEl.closest('.su-tabs');
      if (tabsContainer) {
        const navItems = tabsContainer.querySelectorAll('.su-tabs-nav span');
        const panes = tabsContainer.querySelectorAll('.su-tabs-pane');
        
        panes.forEach((pane, index) => {
          if (pane === tabEl && navItems[index]) {
            category = navItems[index].textContent?.trim() || 'Reports';
          }
        });
      }
    }
    
    // Extract year from folder name (e.g., "2019-2020")
    const yearMatch = folderName.match(/\d{4}-\d{4}/);
    const year = yearMatch ? yearMatch[0] : 'Unknown';
    
    return {
      id: nameLink.getAttribute('data-mdocs-id') || `file-${Date.now()}-${Math.random()}`,
      name: nameLink.textContent?.trim() || 'Untitled',
      downloadUrl: downloadLink.getAttribute('href') || '#',
      downloads: parseInt(downloadsEl?.textContent?.replace(/,/g, '')) || 0,
      modified: modifiedEl?.textContent?.trim() || '',
      icon: iconEl?.getAttribute('src') || '',
      folder: folderName,
      category: category,
      year: year,
    };
  }

  // ============ STATISTICS ============

  updateStats() {
    const categories = this.getCategories();
    const folders = this.getFolders();
    const years = this.getYears();
    
    console.log('📊 Updated stats:', { categories, folders, years, total: this.files.length });
    
    this.stats = {
      total: this.files.length,
      totalDownloads: this.files.reduce((sum, f) => sum + f.downloads, 0),
      categories: categories,
      folders: folders,
      years: years,
    };
  }

  getCategories() {
    return [...new Set(this.files.map(f => f.category))];
  }

  getFolders() {
    return [...new Set(this.files.map(f => f.folder))];
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

  // ============ FILTERING & SORTING ============

  getFilteredFiles() {
    let result = [...this.files];
    
    // Filter by category
    if (this.filters.category !== 'All') {
      result = result.filter(f => f.category === this.filters.category);
    }
    
    // Filter by year
    if (this.filters.year !== 'All') {
      result = result.filter(f => f.year === this.filters.year);
    }
    
    // Search by name
    if (this.filters.searchTerm && this.filters.searchTerm.trim()) {
      const term = this.filters.searchTerm.toLowerCase().trim();
      result = result.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.folder.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term)
      );
    }
    
    // Sort
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
        const getYear = (yearStr) => {
          const match = yearStr.match(/\d{4}/);
          return match ? parseInt(match[0]) : 0;
        };
        valA = getYear(a.year || a.folder);
        valB = getYear(b.year || b.folder);
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

  // ============ FILTER ACTIONS ============

  updateFilter(key, value) {
    this.filters = { ...this.filters, [key]: value };
    this.notifyListeners();
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      category: 'All',
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

  // ============ UTILITY HELPERS ============

  getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
  }

  getCategoryPillColor(category) {
    return CATEGORY_PILL_COLORS[category] || 'bg-gray-600';
  }

  formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    try {
      const parts = dateStr.split(/[- :]/);
      if (parts.length >= 3) {
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${parts[3] || '00'}:${parts[4] || '00'}`);
        return date.toLocaleDateString('en-KE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  getFileIcon(fileName, iconUrl) {
    if (iconUrl) {
      return {
        type: 'image',
        url: iconUrl,
        alt: 'File icon'
      };
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
    
    return {
      type: 'emoji',
      emoji: icons[ext] || '📎'
    };
  }

  downloadFile(url, fileName) {
    window.open(url, '_blank');
  }

  async checkDownloadUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============ CATEGORY AND YEAR HELPERS ============

  getFilesByCategory(category) {
    if (category === 'All') return this.files;
    return this.files.filter(f => f.category === category);
  }

  getFilesByYear(year) {
    if (year === 'All') return this.files;
    return this.files.filter(f => f.year === year);
  }

  getFilesByCategoryAndYear(category, year) {
    let result = this.files;
    if (category !== 'All') {
      result = result.filter(f => f.category === category);
    }
    if (year !== 'All') {
      result = result.filter(f => f.year === year);
    }
    return result;
  }

  getCategoryCount(category) {
    if (category === 'All') return this.files.length;
    return this.files.filter(f => f.category === category).length;
  }

  getYearCount(year) {
    if (year === 'All') return this.files.length;
    return this.files.filter(f => f.year === year).length;
  }

  getCategoryYearCount(category, year) {
    return this.getFilesByCategoryAndYear(category, year).length;
  }

  // ============ DEBUG HELPERS ============

  debugCategories() {
    const categories = this.getCategories();
    console.log('📊 All categories:', categories);
    categories.forEach(cat => {
      const count = this.getCategoryCount(cat);
      console.log(`  ${cat}: ${count} files`);
    });
  }

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
      const response = await fetch(`${BACKEND_URL}/api/proxy/health`);
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
}

// Create and export a singleton instance
const complianceService = new ComplianceService();

export { ComplianceService };
export default complianceService;