// QRChecklistField.tsx v1.1 - Streamlined continuous QR scanning
// Save as: src/components/fields/QRChecklistField.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { FieldValue } from '../../types/ADTypes';

interface ChecklistItem {
  id: string;
  qrCode: string;
  name: string;
  status: 'Y' | 'N';
  description?: string;
  category?: string;
}

interface QRChecklistData {
  items: ChecklistItem[];
  totalItems?: number;
  checkedItems?: number;
  lastScanned?: string;
}

interface QRChecklistFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
  onQRChecklistScan?: (items: ChecklistItem[], onUpdate: (updatedItems: ChecklistItem[]) => void) => void;
}

export const QRChecklistField: React.FC<QRChecklistFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false,
  onQRChecklistScan
}) => {
  const [isScanning, setIsScanning] = useState(false);

  // Initialize checklist data from fieldDef.data or value
  const initializeChecklistData = (): QRChecklistData => {
    if (value?.raw?.items) {
      console.log('🔧 QR CHECKLIST: Using form data:', value.raw.items.length, 'items');
      return value.raw;
    }
    
    if (fieldDef.data?.items) {
      console.log('🔧 QR CHECKLIST: Using field definition data:', fieldDef.data.items.length, 'items');
      return {
        items: fieldDef.data.items.map((item: any) => ({
          ...item,
          status: item.status || 'N'
        }))
      };
    }
    
    console.log('🔧 QR CHECKLIST: No data found, using empty list');
    return { items: [] };
  };

  const checklistData = initializeChecklistData();
  const items = checklistData.items || [];
  
  // Calculate progress
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.status === 'Y').length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  console.log('🔧 QR CHECKLIST: Rendered with', totalItems, 'items,', checkedItems, 'checked');

  // Handle individual item toggle (manual checkbox)
  const handleItemToggle = useCallback((itemId: string) => {
    if (readonly) return;

    console.log('🔧 QR CHECKLIST: Manual toggle for item:', itemId);

    const updatedItems = items.map(item =>
      item.id === itemId 
        ? { ...item, status: item.status === 'Y' ? 'N' : 'Y' }
        : item
    );

    const updatedData: QRChecklistData = {
      ...checklistData,
      items: updatedItems,
      totalItems: updatedItems.length,
      checkedItems: updatedItems.filter(item => item.status === 'Y').length
    };

    onChange({
      raw: updatedData,
      display: generateDisplayString(updatedItems),
      metadata: { 
        type: 'qr_checklist',
        lastUpdated: new Date().toISOString()
      }
    });
  }, [items, checklistData, readonly, onChange]);

  // Generate display string for ERP consumption
  const generateDisplayString = useCallback((itemList: ChecklistItem[]) => {
    return itemList.map(item => 
      `${item.qrCode}: ${item.status === 'Y' ? 'VERIFIED' : 'PENDING'} - ${item.name}`
    ).join('\n');
  }, []);

  // Handle QR scanning start
  const handleStartScanning = useCallback(() => {
    if (!onQRChecklistScan || readonly) {
      Alert.alert('QR Scanning', 'QR scanning not available in this context');
      return;
    }

    console.log('🔧 QR CHECKLIST: Starting scanning mode');
    setIsScanning(true);
    
    // Callback to update items from scanning
    const handleScanUpdate = (updatedItems: ChecklistItem[]) => {
      console.log('🔧 QR CHECKLIST: Scan update received:', updatedItems.filter(item => item.status === 'Y').length, 'checked');
      
      const updatedData: QRChecklistData = {
        items: updatedItems,
        totalItems: updatedItems.length,
        checkedItems: updatedItems.filter(item => item.status === 'Y').length,
        lastScanned: new Date().toISOString()
      };

      onChange({
        raw: updatedData,
        display: generateDisplayString(updatedItems),
        metadata: { 
          type: 'qr_checklist',
          lastUpdated: new Date().toISOString(),
          scanningSession: true
        }
      });
      
      setIsScanning(false);
    };

    onQRChecklistScan(items, handleScanUpdate);
  }, [items, onQRChecklistScan, readonly, onChange, generateDisplayString]);

  // Handle reset all statuses
  const handleResetAll = useCallback(() => {
    if (readonly) return;

    Alert.alert(
      'Reset All Items',
      'This will uncheck all items. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            console.log('🔧 QR CHECKLIST: Resetting all items');
            const resetItems = items.map(item => ({ ...item, status: 'N' as const }));
            const resetData: QRChecklistData = {
              items: resetItems,
              totalItems: resetItems.length,
              checkedItems: 0
            };

            onChange({
              raw: resetData,
              display: generateDisplayString(resetItems),
              metadata: { type: 'qr_checklist', lastUpdated: new Date().toISOString() }
            });
          }
        }
      ]
    );
  }, [items, readonly, onChange, generateDisplayString]);

  if (readonly && items.length === 0) {
    return (
      <View style={styles.readonlyContainer}>
        <Text style={styles.readonlyText}>No checklist items</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noItemsText}>No checklist items configured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compact Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {checkedItems} of {totalItems} items verified ({progressPercent}%)
        </Text>
        <View style={styles.progressBarBackground}>
          <View 
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
          />
        </View>
      </View>

      {/* Compact Action Buttons */}
      {!readonly && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={handleStartScanning}
            disabled={isScanning}
          >
            <Text style={styles.buttonIcon}>📱</Text>
          </TouchableOpacity>

          {checkedItems > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={handleResetAll}>
              <Text style={styles.buttonIcon}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Compact Checklist Items - Fixed Height Issue */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={true}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.checklistItem,
              item.status === 'Y' ? styles.verifiedItem : styles.pendingItem
            ]}
            onPress={() => handleItemToggle(item.id)}
            disabled={readonly}
          >
            <Text style={styles.checkbox}>
              {item.status === 'Y' ? '✅' : '☐'}
            </Text>
            
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQRCode}>{item.qrCode}</Text>
            </View>

            <View style={[
              styles.statusBadge,
              item.status === 'Y' ? styles.verifiedBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.status === 'Y' ? styles.verifiedText : styles.pendingText
              ]}>
                {item.status === 'Y' ? '✓' : '○'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  readonlyContainer: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  readonlyText: {
    fontSize: 16,
    color: '#666',
  },
  noItemsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },

  // Compact Progress Header
  progressHeader: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e6ed',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },

  // Compact Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#1976D2',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    color: 'white',
  },

  // Compact Checklist Items - FIXED HEIGHT
  itemsContainer: {
    maxHeight: 400, // Increased from 300 to show all 6 items
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, // Reduced from 12
    marginBottom: 4, // Reduced from 8
    borderRadius: 6,
    borderWidth: 1,
  },
  verifiedItem: {
    backgroundColor: '#e8f5e9', // Green background for verified
    borderColor: '#4CAF50',
  },
  pendingItem: {
    backgroundColor: '#fff8e1', // Yellow background for pending
    borderColor: '#FFB74D',
  },
  checkbox: {
    fontSize: 16, // Reduced from 20
    marginRight: 8, // Reduced from 12
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14, // Reduced from 16
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemQRCode: {
    fontSize: 11, // Reduced from 12
    color: '#666',
    fontFamily: 'monospace',
  },

  // Compact Status Badge
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FFB74D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifiedText: {
    color: 'white',
  },
  pendingText: {
    color: 'white',
  },
});