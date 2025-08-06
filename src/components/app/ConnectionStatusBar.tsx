// ConnectionStatusBar.tsx v1.0 - Extracted from App.tsx
// Save as: src/components/app/ConnectionStatusBar.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConnectionStatusBarProps {
  status: 'connected' | 'cached' | 'offline' | 'error';
  lastFetch?: string;
  providerType?: string;
  onRetry?: () => void;
}

export const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({ 
  status, 
  lastFetch, 
  providerType, 
  onRetry 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#4CAF50',
          icon: '🟢',
          text: providerType === 'MockDataProvider' ? 'Demo' : 
                providerType === 'JSONFileDataProvider' ? 'Imported' : 'Live',
          description: providerType === 'MockDataProvider' 
            ? 'Using demo data' 
            : providerType === 'JSONFileDataProvider'
            ? 'Using imported JSON template'
            : 'Connected to metadata server'
        };
      case 'cached':
        return {
          color: '#FF9800',
          icon: '🟡',
          text: 'Cached',
          description: `Using cached data${lastFetch ? ` from ${lastFetch}` : ''}`
        };
      case 'offline':
        return {
          color: '#f44336',
          icon: '🔴',
          text: 'Offline',
          description: 'Metadata server unavailable'
        };
      case 'error':
        return {
          color: '#D32F2F',
          icon: '❌',
          text: 'Error',
          description: 'Failed to load metadata'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TouchableOpacity 
      style={[styles.statusIndicator, { borderColor: config.color }]}
      onPress={onRetry}
    >
      <Text style={styles.statusIcon}>{config.icon}</Text>
      <View style={styles.statusTextContainer}>
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
        <Text style={styles.statusDescription}>{config.description}</Text>
      </View>
      {providerType && (
        <Text style={styles.providerType}>{providerType}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 12,
    color: '#666',
  },
  providerType: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});