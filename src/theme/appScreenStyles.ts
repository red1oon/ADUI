// appScreenStyles.ts v1.0 - Extracted App Screen Specific Styles
// Contains all remaining styles from App.tsx for better maintainability

import { StyleSheet } from 'react-native';

// ==================== APP SCREEN STYLES ====================

export const appScreenStyles = StyleSheet.create({
  // General Container Styles
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    color: '#333',
  },
  
  // Header Import Button Styles
  importHeaderButton: {
    backgroundColor: '#FF9800',
    minWidth: 60,
  },
  importHeaderButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // Location Bar Styles
  locationBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // QR Scanner Progress Styles
  scanningProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanningProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scanningProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scanningProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // QR Checklist Instructions
  checklistInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  
  // Debug Footer Styles
  debugFooter: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  debugFooterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  debugFooterText: {
    fontSize: 11,
    color: '#2e7d32',
    lineHeight: 16,
  },
  
  // Connection Status Indicator Styles
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
  
  // JSON Import Status Styles
  importStatus: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  importStatusContent: {
    flex: 1,
  },
  importStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  importStatusText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  clearImportButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearImportButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});