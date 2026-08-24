// src/services/serviceCharterService.js
/**
 * Service for fetching Service Charter from PPRA website
 * Uses local backend proxy for CORS-free access
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PROXY_ENDPOINT = `${BACKEND_URL}/api/proxy/service-charter`;

class ServiceCharterService {
  constructor() {
    this.services = [];
    this.document = null;
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
      services: this.services,
      document: this.document,
      loading: this.loading,
      error: this.error,
      total: this.services.length,
    };
  }

  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  async fetchCharter(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && this.isCacheValid()) {
      console.log('✅ [Cache] Using cached service charter data');
      this.services = this.cache.data.services || [];
      this.document = this.cache.data.document || null;
      this.notifyListeners();
      return this.services;
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
      this.services = result.services || [];
      this.document = result.document || null;
      this.loading = false;
      this.notifyListeners();
      console.log(`✅ Successfully fetched ${this.services.length} services`);
      this.debugStats();
      return this.services;
    } catch (error) {
      console.error('❌ Error fetching service charter:', error);
      this.error = error.message || 'Unable to fetch service charter.';
      this.loading = false;
      this.notifyListeners();
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  async _fetchFromProxy() {
    console.log('🔍 Fetching service charter from proxy:', PROXY_ENDPOINT);

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

      const result = this.parseCharterFromHTML(html);
      console.log('📊 Services parsed:', result.services.length);
      console.log('📄 Document found:', !!result.document);

      return result;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  parseCharterFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const services = [];
    let document = null;

    // ===== EXTRACT DOCUMENT =====
    const wpdmItems = doc.querySelectorAll('.w3eden .wpdm-link-tpl');
    wpdmItems.forEach((item) => {
      const fileData = this.extractDocumentData(item);
      if (fileData) {
        document = fileData;
      }
    });

    // ===== EXTRACT SERVICE TABLE =====
    const table = doc.querySelector('table');
    if (!table) {
      console.warn('⚠️ No table found in HTML');
      return { services, document };
    }

    const rows = table.querySelectorAll('tbody tr');
    console.log('📋 Found table rows:', rows.length);

    // ✅ Track rowspan services
    let pendingRowspanService = null;
    let pendingRowspanRemaining = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      
      // Skip if not enough cells
      if (cells.length < 1) return;

      // Check if first cell has rowspan
      const firstCell = cells[0];
      const rowspan = firstCell?.getAttribute('rowspan');
      const firstCellText = this.extractText(firstCell?.innerHTML || '');

      // ===== CASE 1: This is a new service (has a service name in first cell) =====
      const hasServiceName = firstCellText && 
                             firstCellText !== 'SERVICE' && 
                             firstCellText !== '' &&
                             firstCellText !== '—' &&
                             !firstCellText.includes('&nbsp;');

      if (hasServiceName && cells.length >= 4) {
        // Extract service data
        const service = firstCellText;
        const requirementHtml = cells[1]?.innerHTML || '';
        const charges = this.extractText(cells[2]?.innerHTML || '');
        const timelineHtml = cells[3]?.innerHTML || '';

        // ✅ Parse requirements - using HTML structure first
        let requirements = this.extractListItems(requirementHtml);
        if (requirements.length === 0) {
          const text = this.extractText(requirementHtml);
          if (text && text !== '') {
            requirements = [text];
          } else {
            requirements = ['—'];
          }
        }

        // ✅ Parse timelines
        let timelines = [];
        const timelineText = this.extractText(timelineHtml);
        
        if (timelineText && timelineText !== '' && timelineText !== '—') {
          const timelineParts = this.extractTimelineItems(timelineHtml);
          if (timelineParts.length > 0) {
            timelines = timelineParts;
          } else if (timelineText && timelineText !== '—') {
            timelines = [timelineText];
          }
        }

        if (timelines.length === 0) {
          timelines = ['—'];
        }

        const newService = {
          id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${services.length}`,
          service: service,
          requirements: requirements,
          charges: charges || '—',
          timelines: timelines,
        };

        services.push(newService);

        // ===== Handle rowspan for this service =====
        if (rowspan && parseInt(rowspan) > 1) {
          pendingRowspanService = newService;
          pendingRowspanRemaining = parseInt(rowspan) - 1;
          console.log(`📌 Rowspan detected for "${service}" - ${pendingRowspanRemaining} more rows`);
        }

        return;
      }

      // ===== CASE 2: This is a continuation of a rowspan service =====
      if (pendingRowspanService && pendingRowspanRemaining > 0) {
        const timelineHtml = cells[0]?.innerHTML || '';
        const timelineText = this.extractText(timelineHtml);
        
        if (timelineText && timelineText !== '' && timelineText !== '—' && timelineText !== '&nbsp;') {
          const isDuplicate = pendingRowspanService.timelines.some(t => 
            t.includes(timelineText.substring(0, 20)) || 
            timelineText.includes(t.substring(0, 20))
          );
          
          if (!isDuplicate) {
            pendingRowspanService.timelines.push(timelineText);
            console.log(`  ➕ Added timeline to "${pendingRowspanService.service}": "${timelineText}"`);
          }
        }
        
        pendingRowspanRemaining--;
        
        if (pendingRowspanRemaining <= 0) {
          pendingRowspanService = null;
        }
        return;
      }

      // ===== CASE 3: Fallback =====
      if (cells.length >= 1 && !hasServiceName) {
        const timelineText = this.extractText(cells[0]?.innerHTML || '');
        if (timelineText && pendingRowspanService) {
          const isDuplicate = pendingRowspanService.timelines.some(t => 
            t.includes(timelineText.substring(0, 20)) || 
            timelineText.includes(t.substring(0, 20))
          );
          if (!isDuplicate && timelineText !== '—' && timelineText !== '') {
            pendingRowspanService.timelines.push(timelineText);
          }
        }
      }
    });

    // ===== Clean up: Remove duplicates and empty entries =====
    services.forEach(service => {
      // Clean timelines
      const seenTimelines = new Set();
      service.timelines = service.timelines.filter(t => {
        const key = t.toLowerCase().trim();
        if (seenTimelines.has(key)) return false;
        seenTimelines.add(key);
        return t !== '—' && t !== '' && t !== '&nbsp;';
      });
      if (service.timelines.length === 0) {
        service.timelines = ['—'];
      }

      // Clean requirements - merge if they look like fragments
      service.requirements = this.cleanRequirements(service.requirements);
    });

    console.log('📊 Final services:', services.map(s => ({
      service: s.service.substring(0, 30) + '...',
      requirements: s.requirements.length,
      timelines: s.timelines
    })));

    return { services, document };
  }

  /**
   * ✅ Clean requirements: Merge fragments that look like they were split incorrectly
   */
  cleanRequirements(requirements) {
    if (!requirements || requirements.length === 0) return ['—'];
    
    // Filter out empty entries
    let cleaned = requirements.filter(r => 
      r && r !== '' && r !== '—' && r !== '&nbsp;' && r.trim().length > 0
    );
    
    if (cleaned.length === 0) return ['—'];
    
    // Check if any item looks like a fragment (single character or very short)
    // and merge with next item if they form a URL or sentence
    const merged = [];
    let current = '';
    
    for (let i = 0; i < cleaned.length; i++) {
      const item = cleaned[i].trim();
      
      // If item is a single character or looks like a fragment, merge with next
      if (item.length <= 3 && i < cleaned.length - 1) {
        current += item;
        // Check if next item completes it - FIXED: proper parentheses
        const nextItem = cleaned[i + 1].trim();
        const combined = current + nextItem;
        if (combined.length > 3) {
          // This might be a URL fragment - merge with next
          current += nextItem;
          i++; // Skip next item
          merged.push(current);
          current = '';
        } else {
          merged.push(item);
        }
      } else if (current) {
        // If we have a pending current, add it
        merged.push(current + item);
        current = '';
      } else {
        merged.push(item);
      }
    }
    
    // If we still have fragments, combine them
    if (current) {
      merged.push(current);
    }
    
    // Final cleanup - merge very short items with next
    const final = [];
    for (let i = 0; i < merged.length; i++) {
      const item = merged[i].trim();
      if (item.length <= 2 && i < merged.length - 1) {
        final.push(item + merged[i + 1].trim());
        i++; // Skip next
      } else {
        final.push(item);
      }
    }
    
    return final.filter(r => r && r.length > 0);
  }

  /**
   * ✅ Extract timeline items without splitting on "-" or "."
   */
  extractTimelineItems(html) {
    if (!html) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Check for paragraph tags
    const paragraphs = tempDiv.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const texts = Array.from(paragraphs)
        .map(p => p.textContent?.trim() || '')
        .filter(text => text.length > 0 && text !== '&nbsp;' && text !== '');
      if (texts.length > 0) {
        return texts;
      }
    }

    // Check for <br> separated items
    const brSplit = tempDiv.innerHTML.split(/<br\s*\/?>/i);
    if (brSplit.length > 1) {
      return brSplit
        .map(text => this.extractText(text))
        .filter(text => text.length > 0 && text !== '&nbsp;' && text !== '');
    }

    // Return as single item
    const text = this.extractText(html);
    if (text && text.length > 0 && text !== '&nbsp;') {
      return [text];
    }

    return [];
  }

  /**
   * ✅ Extract list items from HTML - Fixed to handle URLs correctly
   */
  extractListItems(html) {
    if (!html) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Check for actual <li> list items
    const listItems = tempDiv.querySelectorAll('li');
    if (listItems.length > 0) {
      return Array.from(listItems)
        .map(li => li.textContent?.trim() || '')
        .filter(text => text.length > 0 && text !== '&nbsp;');
    }

    // Check for paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const texts = Array.from(paragraphs)
        .map(p => p.textContent?.trim() || '')
        .filter(text => text.length > 0 && text !== '&nbsp;');
      if (texts.length > 0) return texts;
    }

    // Split by <br> tags
    const brSplit = tempDiv.innerHTML.split(/<br\s*\/?>/i);
    if (brSplit.length > 1) {
      return brSplit
        .map(text => this.extractText(text))
        .filter(text => text.length > 0 && text !== '&nbsp;');
    }

    // Get the text and check if it contains actual bullet symbols
    const text = this.extractText(html);
    if (text && text.length > 0 && text !== '&nbsp;') {
      // Only split if there are actual bullet symbols at the start of lines
      // Check for bullet pattern: "• text" or "● text" or "- text" at line start
      if (text.includes('•') || text.includes('●') || text.includes('◦')) {
        // Split on bullet symbols but keep the rest intact
        const parts = text.split(/[•●◦]\s*/);
        return parts
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
      
      // For numbered lists: "1. text" or "a. text"
      if (text.match(/^\d+\.\s/m) || text.match(/^[a-z]\.\s/m)) {
        const parts = text.split(/\d+\.\s*|[a-z]\.\s*/);
        return parts
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
      
      // If it contains a URL with dots, don't split on dots
      if (text.includes('http') || text.includes('www')) {
        return [text];
      }
      
      // If there are multiple sentences separated by periods, keep as one
      // Only split if there are clear list markers
      if (text.includes('\n') || text.includes('  ')) {
        // Split by newlines or double spaces
        const parts = text.split(/\n\s*|\s{2,}/);
        if (parts.length > 1) {
          return parts
            .map(s => s.trim())
            .filter(s => s.length > 0);
        }
      }
      
      return [text];
    }

    return [];
  }

  /**
   * ✅ Extract plain text from HTML
   */
  extractText(html) {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent?.trim() || '';
    return text.replace(/\u00A0/g, ' ').trim();
  }

  extractDocumentData(item) {
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
        id: `charter-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: titleText,
        size: sizeText,
        downloadUrl: downloadUrl || '#',
        icon: icon?.getAttribute('src') || '',
        source: 'wpdm',
      };
    } catch (error) {
      console.warn('⚠️ Error extracting document data:', error);
      return null;
    }
  }

  downloadDocument(url, fileName) {
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.warn('⚠️ No download URL available for:', fileName);
    }
  }

  // ===== DEBUG FUNCTIONS =====
  debugStats() {
    console.log('='.repeat(60));
    console.log('📊 SERVICE CHARTER - DATA LOADED');
    console.log('='.repeat(60));
    console.log(`📊 Total Services: ${this.services.length}`);
    console.log(`📄 Document: ${this.document?.title || 'Not found'}`);
    console.log('📊 Services:');
    this.services.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.service.substring(0, 50)}...`);
      console.log(`     Requirements: ${service.requirements.length} items`);
      if (service.requirements.length > 0) {
        service.requirements.forEach((r, i) => {
          console.log(`       ${i + 1}. ${r.substring(0, 50)}${r.length > 50 ? '...' : ''}`);
        });
      }
      console.log(`     Timelines: ${service.timelines.length} items`);
      if (service.timelines.length > 0) {
        service.timelines.forEach((t, i) => {
          console.log(`       ${i + 1}. ${t}`);
        });
      }
    });
    console.log('='.repeat(60));
    return {
      total: this.services.length,
      services: this.services.map(s => ({
        service: s.service.substring(0, 40) + '...',
        requirements: s.requirements,
        charges: s.charges,
        timelines: s.timelines
      })),
      document: this.document,
    };
  }
}

const serviceCharterService = new ServiceCharterService();
export default serviceCharterService;