// Fixed DataContext.tsx v1.1 - Proper Provider Selection
// Uses configuration system instead of defaulting to MockDataProvider

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataProvider } from '../contracts/DataProvider';
import { getDataConfig, createDataProvider } from '../config/DataConfig';

interface DataContextType {
  provider: DataProvider;
  isLoading: boolean;
  error: string | null;
  switchProvider: (provider: DataProvider) => void;
  clearError: () => void;
  providerType: string; // Added for debugging
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  initialProvider?: DataProvider;
}

export const DataContextProvider: React.FC<DataProviderProps> = ({ 
  children, 
  initialProvider 
}) => {
  // ✅ FIX: Use configuration system instead of defaulting to MockDataProvider
  const [provider, setProvider] = useState<DataProvider>(() => {
    if (initialProvider) {
      console.log('🔧 DATA CONTEXT: Using provided initialProvider');
      return initialProvider;
    }
    
    try {
      const config = getDataConfig();
      console.log('🔧 DATA CONTEXT: Creating provider from config:', config.provider);
      const configuredProvider = createDataProvider(config);
      console.log('🔧 DATA CONTEXT: Created provider:', configuredProvider.constructor.name);
      return configuredProvider;
    } catch (error) {
      console.error('🔧 DATA CONTEXT ERROR: Failed to create configured provider:', error);
      console.log('🔧 DATA CONTEXT: Falling back to MockDataProvider');
      // Only fall back to mock if configuration fails
      const { MockDataProvider } = require('../providers/MockDataProvider');
      return new MockDataProvider();
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerType, setProviderType] = useState<string>(provider.constructor.name);

  const switchProvider = (newProvider: DataProvider) => {
    console.log('🔧 DATA CONTEXT: Switching to provider:', newProvider.constructor.name);
    setProvider(newProvider);
    setProviderType(newProvider.constructor.name);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  // Test connection on provider change
  useEffect(() => {
    const testConnection = async () => {
      setIsLoading(true);
      try {
        console.log('🔧 DATA CONTEXT: Testing connection for provider:', provider.constructor.name);
        
        // Skip connection test for MockDataProvider
        if (provider.constructor.name === 'MockDataProvider') {
          console.log('🔧 DATA CONTEXT: MockDataProvider - skipping connection test');
          setIsLoading(false);
          return;
        }

        const connected = await provider.isConnected();
        console.log('🔧 DATA CONTEXT: Connection test result:', connected);
        
        if (!connected) {
          setError('Data provider connection failed');
        }
      } catch (err: any) {
        console.error('🔧 DATA CONTEXT: Connection error:', err);
        setError(`Connection error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, [provider]);

  // Update provider type when provider changes
  useEffect(() => {
    setProviderType(provider.constructor.name);
  }, [provider]);

  return (
    <DataContext.Provider value={{
      provider,
      isLoading,
      error,
      switchProvider,
      clearError,
      providerType
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataProvider = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within DataContextProvider');
  }
  return context;
};