// src/services/resourcesService.js
/**
 * Service for fetching Resources from PPRA website
 * Uses local backend proxy for CORS-free access
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/resources`;

class ResourcesService {
  constructor() {
    this.resources = [];
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
      resources: this.resources,
      loading: this.loading,
      error: this.error,
      total: this.resources.length,
    };
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchResources(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached resources data');
      this.resources = this.cache.data;
      this.notifyListeners();
      return this.resources;
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
      this.resources = result;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${result.length} resources`);
      this.debugStats();
      return result;
    } catch (error) {
      console.error('❌ Error fetching resources:', error);
      this.error = error.message || 'Unable to fetch resources.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching resources from proxy:', PROXY_ENDPOINT);

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

      const resources = this.parseResourcesFromHTML(html);
      console.log('📊 Resources parsed:', resources.length);

      return resources;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseResourcesFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const resources = [];

    // Find all VC button containers
    const btnContainers = doc.querySelectorAll('.vc_btn3-container');
    console.log('📋 Found button containers:', btnContainers.length);

    btnContainers.forEach((container) => {
      const link = container.querySelector('a.vc_btn3');
      if (!link) return;

      const name = link.textContent?.trim() || '';
      const href = link.getAttribute('href') || '';
      const iconElement = link.querySelector('.vc_btn3-icon');
      const iconClass = iconElement?.getAttribute('class')?.replace('vc_btn3-icon ', '') || 'fa fa-link';

      // Skip if no name or href
      if (!name || !href) return;

      // Determine category based on icon
      let category = 'Other';
      if (iconClass.includes('world') || iconClass.includes('globe')) {
        category = 'International Databases';
      } else if (iconClass.includes('graduation-cap') || iconClass.includes('diamond')) {
        category = 'Academic Publishers';
      } else if (iconClass.includes('database') || iconClass.includes('info-circle')) {
        category = 'Research Databases';
      } else if (iconClass.includes('money')) {
        category = 'Financial Resources';
      } else if (iconClass.includes('flask')) {
        category = 'Scientific & Technical';
      } else if (iconClass.includes('newspaper')) {
        category = 'Journals & Publications';
      }

      resources.push({
        id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name,
        url: href,
        iconClass: iconClass,
        category: category,
        // Extract domain for display
        domain: this.extractDomain(href),
      });
    });

    // Sort alphabetically by name
    resources.sort((a, b) => a.name.localeCompare(b.name));

    return resources;
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // ===== DEBUG FUNCTIONS =====
  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 RESOURCES - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Resources: ${this.resources.length}`);
    console.log('📊 Resources by Category:');
    const categories = {};
    this.resources.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    console.log('='.repeat(60));
    return {
      total: this.resources.length,
      categories: categories,
      resources: this.resources.map(r => ({ name: r.name, category: r.category, domain: r.domain })),
    };
  }
}

const resourcesService = new ResourcesService();
export default resourcesService;