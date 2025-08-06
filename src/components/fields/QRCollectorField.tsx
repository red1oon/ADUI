// QRCollectorField.tsx v1.2 - Fixed Storage &  
// FIXED: Complete success message without errors
// Save as: src/components/fields/QRCollectorField.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { FieldValue } from '../../types/ADTypes';

interface QRCodeEntry {
  id: string;
  code: string;
  timestamp: string; 
  sequence: number;
}

interface QRCollectorData {
  codes: QRCodeEntry[];
  totalScanned: number;
  lastScanned?: string;
}

interface QRCollectorFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
  onQRScan?: (fieldDef: any, onChange: Function) => void; 
}

export const QRCollectorField: React.FC<QRCollectorFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false,
  onQRScan 
}) => { 
  // Parse current QR collection data
  const collectorData: QRCollectorData = value?.raw || { codes: [], totalScanned: 0 };
  const codes = collectorData.codes || [];

  // FIXED: Generate display string with QR details (like TaskListField pattern)
  const generateDisplayString = useCallback((codeList: QRCodeEntry[]): string => {
    const summary = `${codeList.length} QR codes collected`;
    
    // Include actual QR code details for report generation
    const codeDetails = codeList.map((qr, index) => 
      `${index + 1}. ${qr.code} (${new Date(qr.timestamp).toLocaleString()})`
    ).join('\n');
    
    return codeList.length > 0 ? `${summary}\n\nQR Codes:\n${codeDetails}` : summary;
  }, []);

  // Handle starting QR scan
  const handleStartScan = useCallback(() => {
    if (readonly || !onQRScan) return;
    
    console.log('🔧 QR COLLECTOR v1.2: Starting QR scan...');
    
    // Pass a custom handler that adds to collection
    const customOnChange = async (qrValue: FieldValue) => {
      if (qrValue?.raw) {
        console.log('🔧 QR COLLECTOR v1.2: Processing QR scan result:', qrValue.raw);
         
         
        const newEntry: QRCodeEntry = {
          id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: qrValue.raw,
          timestamp: new Date().toISOString(), 
          sequence: codes.length + 1
        };

        const updatedCodes = [...codes, newEntry];
        const updatedData: QRCollectorData = {
          codes: updatedCodes,
          totalScanned: updatedCodes.length,
          lastScanned: newEntry.timestamp
        };

        console.log('🔧 QR COLLECTOR v1.2: Adding QR code:', {
          code: newEntry.code, 
          total: updatedCodes.length
        });

        // FIXED: Store data with rich display content (includes QR details for reports)
        onChange({
          raw: updatedData,
          display: generateDisplayString(updatedCodes), // ← Now includes QR details!
          metadata: {
            totalCodes: updatedCodes.length,
            lastScanned: newEntry.timestamp
          }
        });

        console.log('🔧 QR COLLECTOR v1.2: QR code stored successfully!'); 
 
      } else {
        console.log('🔧 QR COLLECTOR v1.2: No QR data received');
      }
    };

    // Create a modified fieldDef for the scan
    const scanFieldDef = {
      ...fieldDef,
      id: `${fieldDef.id}_scan`,
      fieldId: `${fieldDef.fieldId}_scan`
    };

    onQRScan(scanFieldDef, customOnChange);
  }, [codes, fieldDef, onChange, onQRScan, readonly, generateDisplayString]); 

  // Handle removing a QR code
  const handleRemoveCode = useCallback((codeId: string) => {
    if (readonly) return;

    Alert.alert(
      'Remove QR Code',
      'Are you sure you want to remove this QR code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedCodes = codes.filter(code => code.id !== codeId);
            const updatedData: QRCollectorData = {
              codes: updatedCodes,
              totalScanned: updatedCodes.length,
              lastScanned: updatedCodes.length > 0 ? updatedCodes[updatedCodes.length - 1].timestamp : undefined
            };

            onChange({
              raw: updatedData,
              display: generateDisplayString(updatedCodes), // ← Use rich display
              metadata: {
                totalCodes: updatedCodes.length,
                lastScanned: updatedData.lastScanned
              }
            });
          }
        }
      ]
    );
  }, [codes, onChange, readonly, generateDisplayString]);

  // Handle clearing all codes
  const handleClearAll = useCallback(() => {
    if (readonly || codes.length === 0) return;

    Alert.alert(
      'Clear All QR Codes',
      `Remove all ${codes.length} QR codes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            const emptyData: QRCollectorData = {
              codes: [],
              totalScanned: 0
            };

            onChange({
              raw: emptyData,
              display: generateDisplayString([]), // ← Use consistent display generation
              metadata: { totalCodes: 0 }
            });
          }
        }
      ]
    );
  }, [codes.length, onChange, readonly, generateDisplayString]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryStats}>
          <Text style={styles.summaryTitle}>
            {fieldDef.displayName || fieldDef.name || 'QR Codes Collected'}
          </Text>
          <Text style={styles.summaryCount}>{codes.length}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.scanButton, readonly && styles.disabledButton]}
            onPress={handleStartScan}
            disabled={readonly}
          >
            <Text style={[styles.scanButtonText, readonly && styles.disabledText]}>
              📱 Scan QR
            </Text>
          </TouchableOpacity>
          
          {codes.length > 0 && !readonly && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* QR Codes List */}
      {codes.length > 0 && (
        <ScrollView style={styles.codesList} showsVerticalScrollIndicator={false}>
          {codes.map((codeEntry, index) => (
            <View key={codeEntry.id} style={styles.codeItem}>
              <View style={styles.codeHeader}>
                <Text style={styles.codeSequence}>#{codeEntry.sequence}</Text>
                <Text style={styles.codeValue}>{codeEntry.code}</Text>
                {!readonly && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCode(codeEntry.id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.codeMetadata}>
                <Text style={styles.metadataText}>
                  🕒 {formatTimestamp(codeEntry.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Empty State */}
      {codes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📱</Text>
          <Text style={styles.emptyStateText}>No QR codes collected yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap "Scan QR" to start collecting QR codes with timestamp
          </Text>
        </View>
      )} 
 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  // Summary
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryStats: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  // Buttons
  scanButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },

  // Codes List
  codesList: {
    maxHeight: 200,
  },
  codeItem: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeSequence: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  codeValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  codeMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // Instructions
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginTop: 12,
  },
  instructionsText: {
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 16,
  },
});