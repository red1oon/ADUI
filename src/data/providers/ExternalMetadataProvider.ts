// ExternalMetadataProvider.ts v1.2 - Complete Fixed Version with Embedded Reference Support
// FIXES: SelectField dropdown not showing - supports embedded reference data from MetadataAdapter
// Save as: src/data/providers/ExternalMetadataProvider.ts

import { DataProvider } from '../contracts/DataProvider';
import { 
  ADWindowDefinition, 
  WindowSummary, 
  ADReferenceValue, 
  FormDataRecord, 
  SaveResult 
} from '../../types/ADTypes';
import { MetadataAdapter } from '../../utils/MetadataAdapter';
import Constants from 'expo-constants';

export class ExternalMetadataProvider implements DataProvider {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Get base URL from environment configuration
    this.baseUrl = Constants.expoConfig?.extra?.metadataBaseUrl || 'http://localhost:3001';
    console.log(`🌐 ExternalMetadataProvider v1.2 initialized with baseUrl: ${this.baseUrl}`);
  }

  async getWindowDefinition(windowId: string): Promise<ADWindowDefinition> {
    const cacheKey = `window_${windowId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📋 Returning cached window: ${windowId}`);
        return cached.data;
      }
    }

    try {
      console.log(`🌐 Fetching window from external server: ${windowId}`);
      const response = await fetch(`${this.baseUrl}/windows/${windowId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const externalWindowDef = await response.json();
      console.log(`📥 Received external window data:`, externalWindowDef.name);
      
      // ✅ FIX: Convert external format to internal format
      const adaptedWindowDef = MetadataAdapter.adaptWindowDefinition(externalWindowDef);
      console.log(`🔄 Converted to internal format:`, adaptedWindowDef.name);
      
      // Debug the conversion
      MetadataAdapter.debugConversion(externalWindowDef, adaptedWindowDef);
      
      // Cache the adapted result
      this.cache.set(cacheKey, {
        data: adaptedWindowDef,
        timestamp: Date.now()
      });
      
      console.log(`✅ Successfully loaded and adapted window: ${adaptedWindowDef.name}`);
      return adaptedWindowDef;
      
    } catch (error) {
      console.error(`❌ Failed to fetch window ${windowId}:`, error);
      throw new Error(`Failed to load window ${windowId}: ${error.message}`);
    }
  }

  async getAvailableWindows(): Promise<WindowSummary[]> {
    try {
      console.log('🌐 Fetching available windows from external server');
      const response = await fetch(`${this.baseUrl}/windows`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();                        // ✅ NEW
      const windows = responseData.windows || [];                        // ✅ NEW
      console.log(`✅ Loaded ${windows.length} available windows`);       // ✅ NEW
      return windows;                                                     // ✅ NEW
      
    } catch (error) {
      console.error('❌ Failed to fetch available windows:', error);
      throw new Error(`Failed to load windows: ${error.message}`);
    }
  }

  // FIXED: Support for embedded reference data from MetadataAdapter
  async getReferenceValues(referenceId: string): Promise<ADReferenceValue[]> {
    const cacheKey = `ref_${referenceId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📋 Returning cached reference: ${referenceId}`);
        return cached.data;
      }
    }

    // NEW: Check for embedded reference data first
    if (MetadataAdapter.isEmbeddedReference(referenceId)) {
      console.log(`🔧 PROVIDER: Looking for embedded reference: ${referenceId}`);
      const embeddedValues = MetadataAdapter.getEmbeddedReferenceValues(referenceId);
      
      if (embeddedValues) {
        console.log(`✅ PROVIDER: Found embedded reference with ${embeddedValues.length} values`);
        
        // Cache the embedded values
        this.cache.set(cacheKey, {
          data: embeddedValues,
          timestamp: Date.now()
        });
        
        return embeddedValues;
      } else {
        console.warn(`⚠️ PROVIDER: Embedded reference ${referenceId} not found in MetadataAdapter`);
        return [];
      }
    }

    // EXISTING: Try to fetch external reference data
    try {
      console.log(`🌐 Fetching external reference values: ${referenceId}`);
      const response = await fetch(`${this.baseUrl}/references/${referenceId}`);
      
      if (!response.ok) {
        console.warn(`Reference ${referenceId} not found on server, returning empty array`);
        return [];
      }
      
      const referenceData = await response.json();
      const values = referenceData.values || [];
      
      // Cache the external values
      this.cache.set(cacheKey, {
        data: values,
        timestamp: Date.now()
      });
      
      console.log(`✅ Loaded ${values.length} external reference values for ${referenceId}`);
      return values;
      
    } catch (error) {
      console.error(`Failed to fetch reference ${referenceId}:`, error);
      return [];
    }
  }

  async saveFormData(windowId: string, formData: FormDataRecord): Promise<SaveResult> {
    try {
      console.log(`💾 Attempting to save form data for window: ${windowId}`);
      
      // For development, simulate successful save without sending to server
      console.log(`💾 Simulating save for window ${windowId}:`, Object.keys(formData.data || {}));
      
      // In production, you would send to server:
      // const response = await fetch(`${this.baseUrl}/windows/${windowId}/data`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      return {
        success: true,
        recordId: `EXT_${Date.now()}`,
        message: `Form data saved successfully to external metadata server`,
        timestamp: new Date().toISOString(),
        errors: [],
        warnings: []
      };
      
    } catch (error) {
      console.error(`❌ Failed to save form data for ${windowId}:`, error);
      return {
        success: false,
        recordId: undefined,
        message: `Failed to save form data: ${error.message}`,
        timestamp: new Date().toISOString(),
        errors: [error.message],
        warnings: []
      };
    }
  }

  async getFormData(windowId: string, recordId?: string): Promise<FormDataRecord> {
    try {
      if (recordId) {
        console.log(`📄 Fetching existing form data: ${windowId}/${recordId}`);
        
        // In production, fetch from server:
        // const response = await fetch(`${this.baseUrl}/windows/${windowId}/data/${recordId}`);
        // return await response.json();
        
        // For now, return empty data
        console.log(`📄 No existing data found, returning empty form`);
      }
      
      // Return empty form data for new records
      return {
        recordId: recordId || undefined,
        windowId,
        data: {},
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          status: 'draft',
          source: 'external-metadata-server'
        }
      };
      
    } catch (error) {
      console.error(`❌ Failed to fetch form data for ${windowId}:`, error);
      
      // Return empty data on error
      return {
        recordId: recordId || undefined,
        windowId,
        data: {},
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          status: 'error',
          source: 'external-metadata-server',
          error: error.message
        }
      };
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      console.log(`🔍 Testing connection to: ${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      const isConnected = response.ok;
      console.log(`🔍 Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;
    } catch (error) {
      console.warn('🔍 Health check failed:', error.message);
      return false;
    }
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ ExternalMetadataProvider: All cache cleared');
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ ExternalMetadataProvider: Cleared cache entry: ${key}`);
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheInfo(): { size: number; keys: string[]; timeout: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }

  /**
   * Set cache timeout (useful for development)
   */
  setCacheTimeout(timeoutMs: number): void {
    this.cacheTimeout = timeoutMs;
    console.log(`🔧 ExternalMetadataProvider: Cache timeout set to ${timeoutMs}ms`);
  }

  // ==================== DEBUGGING METHODS ====================

  /**
   * Get provider status for debugging
   */
  getProviderStatus(): {
    type: string;
    baseUrl: string;
    cacheSize: number;
    cacheTimeout: number;
    embeddedReferences: number;
  } {
    return {
      type: 'ExternalMetadataProvider',
      baseUrl: this.baseUrl,
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      embeddedReferences: MetadataAdapter.getEmbeddedReferenceStats().count
    };
  }

  /**
   * Test connection with detailed logging
   */
  async testConnection(): Promise<{ connected: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        timeout: 10000 
      });
      
      const responseTime = Date.now() - startTime;
      const connected = response.ok;
      
      console.log(`🔍 Connection test: ${connected ? 'SUCCESS' : 'FAILED'} (${responseTime}ms)`);
      
      return { connected, responseTime };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`🔍 Connection test failed: ${error.message} (${responseTime}ms)`);
      
      return { 
        connected: false, 
        responseTime,
        error: error.message 
      };
    }
  }

  /**
   * Get embedded reference statistics from MetadataAdapter
   */
  getEmbeddedReferenceInfo(): {
    count: number;
    totalValues: number;
    references: Array<{ id: string; valueCount: number }>;
  } {
    return MetadataAdapter.getEmbeddedReferenceStats();
  }

  // ==================== CONFIGURATION ====================

  /**
   * Update base URL (useful for dynamic environments)
   */
  setBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
    this.clearCache(); // Clear cache when URL changes
    console.log(`🔧 ExternalMetadataProvider: Base URL updated to: ${newBaseUrl}`);
  }

  /**
   * Get current configuration
   */
  getConfiguration(): { baseUrl: string; cacheTimeout: number } {
    return {
      baseUrl: this.baseUrl,
      cacheTimeout: this.cacheTimeout
    };
  }
}