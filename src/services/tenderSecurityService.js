// src/services/tenderSecurityService.js
/**
 * Service for fetching Tender Security Providers from PPRA website
 * Uses local backend proxy for CORS-free access
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/tender-security-providers`;

class TenderSecurityService {
  constructor() {
    this.providers = [];
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
      providers: this.providers,
      loading: this.loading,
      error: this.error,
      total: this.providers.length,
    };
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchProviders(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached tender security providers data');
      this.providers = this.cache.data;
      this.notifyListeners();
      return this.providers;
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
      this.providers = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${result.length} tender security providers`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching tender security providers:', error);
      this.error = error.message || 'Unable to fetch tender security providers.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching tender security providers from proxy:', PROXY_ENDPOINT);

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

      const providers = this.parseProvidersFromHTML(html);
      console.log('📊 Providers parsed:', providers.length);

      return providers;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseProvidersFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const providers = [];

    // Find the table containing insurance companies
    const table = doc.querySelector('table');
    if (!table) {
      console.warn('⚠️ No table found in HTML');
      return providers;
    }

    // Find all rows in the table body
    const rows = table.querySelectorAll('tbody tr');
    console.log('📋 Found rows:', rows.length);

    let isHeaderRow = true;
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      
      // Skip if not enough cells or it's a header row
      if (cells.length < 2) return;
      
      // Skip the header row (contains "Serial No." and "GENERAL INSURANCE COMPANIES")
      const firstCellText = cells[0]?.textContent?.trim() || '';
      if (firstCellText === 'Serial No.' || firstCellText === 'GENERAL INSURANCE COMPANIES') {
        isHeaderRow = false;
        return;
      }

      // Extract serial number and company name
      const serialNo = cells[0]?.textContent?.trim() || '';
      const companyName = cells[1]?.textContent?.trim() || '';

      if (serialNo && companyName) {
        providers.push({
          id: `tsp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          serialNo: parseInt(serialNo),
          name: companyName,
        });
      }
    });

    return providers;
  }

  // ===== DEBUG FUNCTIONS =====
  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 TENDER SECURITY PROVIDERS - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Providers: ${this.providers.length}`);
    console.log('📊 Providers:');
    this.providers.forEach((provider, index) => {
      console.log(`  ${provider.serialNo}. ${provider.name}`);
    });
    console.log('='.repeat(60));
    return {
      total: this.providers.length,
      providers: this.providers.map(p => ({ serialNo: p.serialNo, name: p.name })),
    };
  }
}

const tenderSecurityService = new TenderSecurityService();
export default tenderSecurityService;