// useConnectionMonitor.ts v1.0 - Extracted from App.tsx
// Save as: src/hooks/useConnectionMonitor.ts

import { useState, useEffect, useCallback } from 'react';
import { useDataProvider } from '../data';

export const useConnectionMonitor = () => {
  const { provider, providerType } = useDataProvider();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'cached' | 'offline' | 'error'>('offline');
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<string | undefined>();

  const checkConnection = useCallback(async () => {
    try {
      console.log('🔧 CONNECTION: Checking connection for provider:', providerType);
      
      if (providerType === 'MockDataProvider') {
        setConnectionStatus('connected');
        setLastSuccessfulFetch('Demo Data');
        return;
      }

      if (providerType === 'JSONFileDataProvider') {
        setConnectionStatus('connected');
        setLastSuccessfulFetch('Imported Template');
        return;
      }

      if (providerType === 'ExternalMetadataProvider') {
        try {
          const isConnected = await provider.isConnected();
          
          if (isConnected) {
            setConnectionStatus('connected');
            setLastSuccessfulFetch(new Date().toLocaleTimeString());
          } else {
            // @ts-ignore - checking cache
            if (provider.cache && provider.cache.size > 0) {
              setConnectionStatus('cached');
            } else {
              setConnectionStatus('offline');
            }
          }
          return;
        } catch (connectionError) {
          // @ts-ignore - checking cache
          if (provider.cache && provider.cache.size > 0) {
            setConnectionStatus('cached');
          } else {
            setConnectionStatus('error');
          }
        }
        return;
      }

      setConnectionStatus('error');
      
    } catch (error) {
      console.error('🔧 CONNECTION ERROR:', error);
      setConnectionStatus('error');
    }
  }, [provider, providerType]);

  useEffect(() => {
    checkConnection();
    
    if (providerType !== 'MockDataProvider' && providerType !== 'JSONFileDataProvider') {
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [checkConnection, providerType]);

  return {
    connectionStatus,
    lastSuccessfulFetch,
    recheckConnection: checkConnection,
    providerType
  };
};