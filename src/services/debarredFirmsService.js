// src/services/debarredFirmsService.js
/**
 * Service for fetching Debarred Firms from PPRA website
 * Uses local backend proxy for CORS-free access
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/debarred-firms`;

class DebarredFirmsService {
  constructor() {
    this.firms = [];
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
      firms: this.firms,
      loading: this.loading,
      error: this.error,
      total: this.firms.length,
    };
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchFirms(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached debarred firms data');
      this.firms = this.cache.data;
      this.notifyListeners();
      return this.firms;
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
      this.firms = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${result.length} debarred firms`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching debarred firms:', error);
      this.error = error.message || 'Unable to fetch debarred firms.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching debarred firms from proxy:', PROXY_ENDPOINT);

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

      const firms = this.parseFirmsFromHTML(html);
      console.log('📊 Firms parsed:', firms.length);

      return firms;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseFirmsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firms = [];

    // Find the data table - using Elementor data table
    const table = doc.querySelector('.eael-data-table-wrap table');
    if (!table) {
      console.warn('⚠️ No table found in HTML');
      return firms;
    }

    // Find all rows in tbody
    const rows = table.querySelectorAll('tbody tr');
    console.log('📋 Found table rows:', rows.length);

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 3) {
        const firmName = cells[0]?.textContent?.trim() || '';
        const dateOfDebarment = cells[1]?.textContent?.trim() || '';
        const debarmentPeriod = cells[2]?.textContent?.trim() || '';

        // Skip empty rows
        if (!firmName) return;

        firms.push({
          id: `debarred-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          firmName: firmName,
          dateOfDebarment: dateOfDebarment,
          debarmentPeriod: debarmentPeriod,
          // Extract year for sorting
          year: this.extractYear(dateOfDebarment),
        });
      }
    });

    // Sort by date (newest first)
    firms.sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      return yearB - yearA;
    });

    return firms;
  }

  extractYear(dateString) {
    if (!dateString) return 0;
    const match = dateString.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 0;
  }

  // ===== DEBUG FUNCTIONS =====
  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 DEBARRED FIRMS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Firms: ${this.firms.length}`);
    console.log('📊 Firms:');
    this.firms.forEach((firm, index) => {
      console.log(`  ${index + 1}. ${firm.firmName} - ${firm.dateOfDebarment}`);
    });
    console.log('='.repeat(60));
    return {
      total: this.firms.length,
      firms: this.firms.map(f => ({ name: f.firmName, date: f.dateOfDebarment, period: f.debarmentPeriod })),
    };
  }
}

const debarredFirmsService = new DebarredFirmsService();
export default debarredFirmsService;