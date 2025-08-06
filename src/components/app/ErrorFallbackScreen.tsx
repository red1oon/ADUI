// ErrorFallbackScreen.tsx v1.0 - Extracted from App.tsx
// Save as: src/components/app/ErrorFallbackScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorFallbackScreenProps {
  error: string;
  onRetry: () => void;
  onSwitchToDemo: () => void;
  onImportJSON: () => void;
  connectionStatus: string;
  providerType: string;
}

export const ErrorFallbackScreen: React.FC<ErrorFallbackScreenProps> = ({ 
  error, 
  onRetry, 
  onSwitchToDemo, 
  onImportJSON, 
  connectionStatus, 
  providerType 
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorIcon}>🚫</Text>
    <Text style={styles.errorTitle}>Cannot Load Form Data</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    
    <View style={styles.errorDetails}>
      <Text style={styles.errorDetailTitle}>Connection Issue:</Text>
      <Text style={styles.errorDetailText}>Provider: {providerType}</Text>
      <Text style={styles.errorDetailText}>Status: {connectionStatus}</Text>
    </View>

    <View style={styles.errorActions}>
      <TouchableOpacity style={[styles.errorButton, styles.retryButton]} onPress={onRetry}>
        <Text style={styles.errorButtonText}>🔄 Retry Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.errorButton, styles.demoButton]} onPress={onSwitchToDemo}>
        <Text style={styles.errorButtonText}>🎯 Use Demo Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.errorButton, styles.importButton]} onPress={onImportJSON}>
        <Text style={styles.errorButtonText}>📄 Import JSON Template</Text>
      </TouchableOpacity>
    </View>
    
    <Text style={styles.errorHint}>
      Choose an option above to continue using ADUI
    </Text>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorActions: {
    width: '100%',
    marginBottom: 16,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
  demoButton: {
    backgroundColor: '#4CAF50',
  },
  importButton: {
    backgroundColor: '#FF9800',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});