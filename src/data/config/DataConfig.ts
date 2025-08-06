// DataConfig.ts v1.3 - JSON File Provider Support
// Adds JSONFileDataProvider for email attachment import functionality

import { DataProvider } from '../contracts/DataProvider';
import { MockDataProvider } from '../providers/MockDataProvider';
import { ExternalMetadataProvider } from '../providers/ExternalMetadataProvider';
import { JSONFileDataProvider } from '../providers/JSONFileDataProvider';
// import { APIDataProvider } from '../providers/APIDataProvider';
import Constants from 'expo-constants';

export interface DataConfig {
  provider: 'mock' | 'external' | 'api' | 'json-file';
  apiConfig?: {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
  };
  cacheConfig?: {
    enabled: boolean;
    ttl: number;
  };
}

export const createDataProvider = (config: DataConfig): DataProvider => {
  console.log('🔧 DATA CONFIG v1.3: Creating provider with config:', JSON.stringify(config, null, 2));
  
  switch (config.provider) {
    case 'mock':
      console.log('🔧 DATA CONFIG: ✅ Creating MockDataProvider');
      return new MockDataProvider();
    
    case 'external':
      console.log('🔧 DATA CONFIG: ✅ Creating ExternalMetadataProvider with format conversion');
      try {
        const provider = new ExternalMetadataProvider();
        console.log('🔧 DATA CONFIG: ✅ ExternalMetadataProvider v1.1 created successfully');
        return provider;
      } catch (error) {
        console.error('🔧 DATA CONFIG ERROR: Failed to create ExternalMetadataProvider:', error);
        console.log('🔧 DATA CONFIG: ⚠️ Falling back to MockDataProvider');
        return new MockDataProvider();
      }
    
    case 'json-file':
      console.log('🔧 DATA CONFIG: ✅ Creating JSONFileDataProvider for email attachment import');
      try {
        const provider = new JSONFileDataProvider();
        console.log('🔧 DATA CONFIG: ✅ JSONFileDataProvider created successfully');
        return provider;
      } catch (error) {
        console.error('🔧 DATA CONFIG ERROR: Failed to create JSONFileDataProvider:', error);
        console.log('🔧 DATA CONFIG: ⚠️ Falling back to MockDataProvider');
        return new MockDataProvider();
      }
    
    case 'api':
      if (!config.apiConfig) {
        throw new Error('API configuration required for API provider');
      }
      console.log('🔧 DATA CONFIG: Creating APIDataProvider (not yet implemented)');
      // return new APIDataProvider(config.apiConfig.baseUrl, config.apiConfig.apiKey);
      throw new Error('APIDataProvider not yet implemented');
    
    default:
      console.error('🔧 DATA CONFIG ERROR: Unknown provider type:', config.provider);
      throw new Error(`Unknown provider type: ${config.provider}`);
  }
};

// Environment-based configuration
export const getDataConfig = (): DataConfig => {
  console.log('🔧 DATA CONFIG v1.3: Getting data configuration...');
  console.log('🔧 DATA CONFIG: Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  
  const metadataSource = Constants.expoConfig?.extra?.metadataSource || 'external';
  const metadataBaseUrl = Constants.expoConfig?.extra?.metadataBaseUrl || 'http://localhost:3001';
  
  console.log('🔧 DATA CONFIG: Resolved configuration:');
  console.log('  - metadataSource:', metadataSource);
  console.log('  - metadataBaseUrl:', metadataBaseUrl);
  
  let config: DataConfig;
  
  switch (metadataSource) {
    case 'external':
      config = {
        provider: 'external',
        cacheConfig: {
          enabled: true,
          ttl: 5 * 60 * 1000 // 5 minutes
        }
      };
      console.log('🔧 DATA CONFIG: ✅ Using external metadata server configuration');
      break;
      
    case 'json-file':
      config = {
        provider: 'json-file',
        cacheConfig: {
          enabled: false, // No caching needed for file imports
          ttl: 0
        }
      };
      console.log('🔧 DATA CONFIG: ✅ Using JSON file import configuration');
      break;
      
    case 'remote':
    case 'api':
      config = {
        provider: 'api',
        apiConfig: {
          baseUrl: metadataBaseUrl,
          apiKey: process.env.IDEMPIERE_API_KEY || '',
          timeout: 10000
        },
        cacheConfig: {
          enabled: true,
          ttl: 10 * 60 * 1000 // 10 minutes in production
        }
      };
      console.log('🔧 DATA CONFIG: ✅ Using API provider configuration');
      break;
      
    case 'mock':
    default:
      config = {
        provider: 'mock',
        cacheConfig: {
          enabled: true,
          ttl: 5 * 60 * 1000
        }
      };
      console.log('🔧 DATA CONFIG: ✅ Using mock provider configuration');
      break;
  }
  
  console.log('🔧 DATA CONFIG: Final config ready ✅');
  return config;
};

// Factory function to create specific provider types
export const createJSONFileProvider = (): JSONFileDataProvider => {
  console.log('🔧 DATA CONFIG: Creating dedicated JSONFileDataProvider instance');
  return new JSONFileDataProvider();
};

// Helper function to switch to JSON file provider dynamically
export const switchToJSONFileProvider = (): DataConfig => {
  console.log('🔧 DATA CONFIG: Switching to JSON file provider configuration');
  return {
    provider: 'json-file',
    cacheConfig: {
      enabled: false,
      ttl: 0
    }
  };
};

// Default configuration
export const DEFAULT_DATA_CONFIG: DataConfig = getDataConfig();