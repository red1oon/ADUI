// QRScannerScreens.tsx v1.2 - Semi-Transparent Top Feedback Overlay, Removed Redundant Exit
// Handles both individual QR scanning and checklist QR scanning screens

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CameraView } from 'expo-camera';

// Theme
import { qrStyles } from '../../theme';

// Extracted styles for scanner-specific UI
import { appScreenStyles } from '../../theme/appScreenStyles';

// ==================== INTERFACES ====================

interface QRScannerScreenProps {
  onBarCodeScanned: (result: { data: string }) => void;
  onClose: () => void;
  title?: string;
  instructions?: string;
}

interface QRChecklistItem {
  id: string;
  name: string;
  qrCode?: string;  // FIXED: Use qrCode instead of code for consistency
  status?: 'Y' | 'N' | 'P';  // ADDED: Status tracking
  checked?: boolean;  // LEGACY: For backward compatibility
}

interface QRChecklistScannerProps {
  items: QRChecklistItem[];
  onBarCodeScanned: (result: { data: string }) => void;
  onClose: () => void;
  progress?: {
    checked: number;
    total: number;
    percentage: number;
  };
  lastScannedItem?: string;  // Show what was last scanned
  scanFeedback?: {  // NEW: Scan result feedback
    message: string;
    type: 'success' | 'warning' | 'error';
    visible: boolean;
  };
}

// ==================== INDIVIDUAL QR SCANNER SCREEN ====================

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  onBarCodeScanned,
  onClose,
  title = "QR Code Scanner",
  instructions = "Position the QR code within the frame to scan"
}) => {
  console.log('📷 QRScannerScreen v1.1: Rendering individual QR scanner');

  return (
    <View style={qrStyles.qrContainer}>
      {/* Header */}
      <View style={qrStyles.qrHeader}>
        <Text style={qrStyles.qrTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={qrStyles.qrCloseButton}>
          <Text style={qrStyles.qrCloseText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <CameraView
        style={qrStyles.qrCamera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "code128", "code39", "code93", "ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={onBarCodeScanned}
      />

      {/* Bottom Instructions */}
      <View style={qrStyles.qrBottomContainer}>
        <Text style={qrStyles.qrInstructions}>
          🎯 {instructions}
        </Text>
        <TouchableOpacity style={qrStyles.qrCancelButton} onPress={onClose}>
          <Text style={qrStyles.qrCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== QR CHECKLIST SCANNER SCREEN (MODIFIED) ====================

export const QRChecklistScannerScreen: React.FC<QRChecklistScannerProps> = ({
  items,
  onBarCodeScanned,
  onClose,
  progress,
  lastScannedItem,
  scanFeedback
}) => {
  console.log('📷 QRChecklistScannerScreen v1.1: Rendering merged header scanner with', items.length, 'items');

  // FIXED: Calculate progress correctly from status field
  const checkedCount = progress?.checked ?? items.filter(item => 
    item.status === 'Y' || item.checked === true
  ).length;
  const totalCount = progress?.total ?? items.length;
  const progressPercent = progress?.percentage ?? (totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0);

  return (
    <View style={qrStyles.qrContainer}>
      {/* MODIFIED: Simplified Header with Progress - NO REDUNDANT EXIT BUTTON */}
      <View style={mergedHeaderStyles.mergedHeader}>
        <Text style={mergedHeaderStyles.scannerTitle}>QR Checklist Scanner</Text>
        
        {/* Progress Section */}
        <View style={mergedHeaderStyles.progressSection}>
          <Text style={mergedHeaderStyles.progressText}>
            📋 {checkedCount} of {totalCount} items verified ({progressPercent}%)
          </Text>
          <View style={mergedHeaderStyles.progressBarBackground}>
            <View 
              style={[
                mergedHeaderStyles.progressBarFill, 
                { width: `${progressPercent}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* NEW: Semi-Transparent Top Overlay for Scan Feedback */}
      {scanFeedback?.visible && (
        <View style={mergedHeaderStyles.scanFeedbackOverlay}>
          <View style={[
            mergedHeaderStyles.feedbackBubble,
            scanFeedback.type === 'success' && mergedHeaderStyles.successBubble,
            scanFeedback.type === 'warning' && mergedHeaderStyles.warningBubble,
            scanFeedback.type === 'error' && mergedHeaderStyles.errorBubble,
          ]}>
            <Text style={mergedHeaderStyles.feedbackIcon}>
              {scanFeedback.type === 'success' ? '✅' : 
               scanFeedback.type === 'warning' ? '⚠️' : '❌'}
            </Text>
            <Text style={mergedHeaderStyles.feedbackText}>
              {scanFeedback.message}
            </Text>
          </View>
        </View>
      )}
      
      {/* Camera View - EXPANDED */}
      <CameraView
        style={mergedHeaderStyles.expandedCamera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "code128", "code39", "code93", "ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={onBarCodeScanned}
      />
      
      {/* SIMPLIFIED: Bottom Container - Only Exit and Instructions */}
      <View style={qrStyles.qrBottomContainer}>
        <Text style={qrStyles.qrInstructions}>
          🎯 Scan QR codes from the checklist to verify items
        </Text>
        <Text style={mergedHeaderStyles.checklistInstruction}>
          Progress updates automatically • Continue scanning or exit when done
        </Text>
        <TouchableOpacity style={qrStyles.qrCancelButton} onPress={onClose}>
          <Text style={qrStyles.qrCancelText}>Exit Scanning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== NEW STYLES FOR MERGED HEADER ====================

const mergedHeaderStyles = {
  mergedHeader: {
    backgroundColor: '#7B2D8E', // Purple theme to match
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // NEW: Semi-Transparent Top Overlay Styles
  scanFeedbackOverlay: {
    position: 'absolute' as const,
    top: 120, // Below the header
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center' as const,
  },
  feedbackBubble: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.8)', // Semi-transparent dark
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  successBubble: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)', // Green with transparency
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  warningBubble: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)', // Orange with transparency
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  errorBubble: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)', // Red with transparency
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  feedbackIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    textAlign: 'center' as const,
  },
  
  expandedCamera: {
    flex: 1, // Take remaining space
  },
  checklistInstruction: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center' as const,
    marginTop: 4,
    marginBottom: 8,
  },
};

// ==================== UTILITY FUNCTIONS (UPDATED) ====================

export const QRScannerUtils = {
  /**
   * Calculate checklist progress from items array (FIXED)
   */
  calculateProgress: (items: QRChecklistItem[]) => {
    const checked = items.filter(item => 
      item.status === 'Y' || item.checked === true
    ).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    return { checked, total, percentage };
  },

  /**
   * Find matching checklist item by scanned code (IMPROVED)
   */
  findMatchingItem: (items: QRChecklistItem[], scannedCode: string): QRChecklistItem | null => {
    return items.find(item => 
      item.qrCode === scannedCode || 
      item.id === scannedCode ||
      item.name.toLowerCase().includes(scannedCode.toLowerCase())
    ) || null;
  },

  /**
   * Update checklist item status (ENHANCED)
   */
  updateItemStatus: (items: QRChecklistItem[], itemId: string, verified: boolean): QRChecklistItem[] => {
    return items.map(item => 
      item.id === itemId ? { 
        ...item, 
        status: verified ? 'Y' : 'N',
        checked: verified 
      } : item
    );
  },

  /**
   * Get last scanned item name (NEW)
   */
  getLastScannedItemName: (items: QRChecklistItem[], scannedCode: string): string | null => {
    const item = QRScannerUtils.findMatchingItem(items, scannedCode);
    return item ? item.name : null;
  }
};