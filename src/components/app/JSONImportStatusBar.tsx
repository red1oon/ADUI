// JSONImportStatusBar.tsx v1.0 - Extracted from App.tsx
// Save as: src/components/app/JSONImportStatusBar.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface JSONImportStatusBarProps {
  importInfo?: { template: any; timestamp: string | null; windowCount: number };
  onClearImport?: () => void;
}

export const JSONImportStatusBar: React.FC<JSONImportStatusBarProps> = ({ 
  importInfo, 
  onClearImport 
}) => {
  if (!importInfo?.template) return null;

  return (
    <View style={styles.importStatus}>
      <View style={styles.importStatusContent}>
        <Text style={styles.importStatusTitle}>📄 JSON Template Active</Text>
        <Text style={styles.importStatusText}>
          {importInfo.template.name} • {importInfo.windowCount} window(s)
        </Text>
      </View>
      {onClearImport && (
        <TouchableOpacity onPress={onClearImport} style={styles.clearImportButton}>
          <Text style={styles.clearImportButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginLeft: 8,
  },
  clearImportButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});