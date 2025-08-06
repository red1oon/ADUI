// FlippableQRChecklistField.tsx v1.6 - Fixed Animation Performance Issue
// Enhanced QR checklist with optimized rendering during animations
// Save as: src/components/fields/FlippableQRChecklistField.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet,
  Dimensions,
  Vibration
} from 'react-native';
import { FieldValue } from '../../types/ADTypes';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

// Enhanced interface for checklist items with rich metadata
interface ChecklistItem {
  id: string;
  qrCode: string;
  name: string;
  status: 'Y' | 'N' | 'P';
  description?: string;
  category?: string;
  location?: string;
  lastInspection?: string;
  nextDue?: string;
  serialNumber?: string;
  manufacturer?: string;
  installDate?: string;
}

interface QRChecklistData {
  items: ChecklistItem[];
  totalItems?: number;
  checkedItems?: number;
  lastScanned?: string;
}

interface FlipBehaviorConfig {
  enabled: boolean;
  trigger: 'tap' | 'swipe' | 'long_press';
  animation: {
    type: 'horizontal_flip' | 'vertical_flip';
    duration: number;
    easing: string;
  };
  haptic: {
    enabled: boolean;
    pattern: 'light_pulse' | 'medium_pulse' | 'strong_pulse';
  };
  frontContent: string[];
  backContent: string[];
}

interface FlippableQRChecklistFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
  onQRChecklistScan?: (items: ChecklistItem[], onUpdate: (updatedItems: ChecklistItem[]) => void) => void;
}

const getStatusBackgroundColor = (status: string): string => {
  switch (status) {
    case 'Y': return '#E6F3FF'; // Light blue for checked
    case 'N': return '#FFF9E6'; // Pale yellow for not checked  
    case 'P': return '#FFF9E6'; // Pale yellow for pending
    default: return '#fff';     // White for unknown status
  }
};
// Individual flippable card component with proper progressive content pagination
const FlippableCard: React.FC<{
  item: ChecklistItem;
  flipBehavior?: FlipBehaviorConfig;
  categoryColors?: Record<string, string>;
  statusIcons?: Record<string, string>;
  onToggle: (itemId: string) => void;
  readonly: boolean;
}> = ({ item, flipBehavior, categoryColors, statusIcons, onToggle, readonly }) => {
  // Safe defaults for undefined props
  const safeBehavior: FlipBehaviorConfig = flipBehavior || {
    enabled: true,
    trigger: 'tap',
    animation: { type: 'horizontal_flip', duration: 300, easing: 'ease_out_back' },
    haptic: { enabled: true, pattern: 'light_pulse' },
    frontContent: ['name', 'qrCode', 'status', 'category'],
    backContent: ['description', 'location', 'lastInspection', 'nextDue', 'serialNumber', 'manufacturer']
  };

  const safeColors = categoryColors || {
    safety: '#E53E3E',
    lighting: '#3182CE',
    medical: '#38A169',
    mechanical: '#805AD5',
    electrical: '#D69E2E'
  };

  const safeIcons = statusIcons || {
    Y: '✅',
    N: '⭕',
    P: '🔄'
  };

  const [currentView, setCurrentView] = useState(0); // 0 = front, 1+ = detail pages
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Animation shared values
  const rotateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // FIXED: Memoize detail fields calculation to prevent re-computation during animation
  const detailFields = useMemo(() => {
    const excludeFields = ['id', 'qrCode', 'name', 'status'];
    const details: Array<{key: string, label: string, value: string}> = [];
    
    console.log('🔧 CARD DETAILS: Computing detail fields for:', item.name);
    
    Object.entries(item).forEach(([key, value]) => {
      if (!excludeFields.includes(key)) {
        if (value !== undefined && value !== null && value !== '') {
          // Convert camelCase to readable labels
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          details.push({ key, label, value: String(value) });
        }
      }
    });
    
    console.log('🔧 CARD DETAILS: Found', details.length, 'detail fields for', item.name);
    return details;
  }, [item]); // Only recalculate when item changes, not during animation

  // Paginate detail fields into groups (3-4 fields per page)
  const detailPages = useMemo(() => {
    const fieldsPerPage = 3;
    const pages = [];
    for (let i = 0; i < detailFields.length; i += fieldsPerPage) {
      pages.push(detailFields.slice(i, i + fieldsPerPage));
    }
    return pages;
  }, [detailFields]); // Only recalculate when detailFields changes

  const totalViews = 1 + detailPages.length; // 1 front + N detail pages

  // Animated style for flip effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

  // FIXED: Simplified animation to prevent thread conflicts
  const handleCardFlip = useCallback(() => {
    if (isFlipping) return; // Prevent rapid tapping during animation
    
    if (!safeBehavior.enabled) {
      // If flip is disabled, toggle status instead
      onToggle(item.id);
      return;
    }

    setIsFlipping(true);
    
    // Cycle through views: front -> detail page 1 -> detail page 2 -> ... -> front
    const nextView = (currentView + 1) % totalViews;
    
    console.log(`🔧 CARD FLIP: ${item.name} - View ${currentView} -> ${nextView} (Total views: ${totalViews})`);
    
    // Simplified animation - just flip 180° and reset
    rotateY.value = withTiming(
      180,
      { duration: safeBehavior.animation.duration },
      (finished) => {
        if (finished) {
          runOnJS(setCurrentView)(nextView);
          // Reset rotation on UI thread after state change
          rotateY.value = 0;
        }
      }
    );

    // Trigger haptic feedback
    if (safeBehavior.haptic.enabled) {
      switch (safeBehavior.haptic.pattern) {
        case 'light_pulse':
          Vibration.vibrate(50);
          break;
        case 'medium_pulse':
          Vibration.vibrate([0, 100]);
          break;
        case 'strong_pulse':
          Vibration.vibrate([0, 200]);
          break;
      }
    }

    // Allow next flip after animation
    setTimeout(() => setIsFlipping(false), safeBehavior.animation.duration);
  }, [currentView, totalViews, safeBehavior, onToggle, item.id, item.name, isFlipping, rotateY]);

  // Handle direct toggle (for status change)
  const handleDirectToggle = useCallback((e) => {
    e.stopPropagation(); // Prevent card flip when tapping checkbox
    onToggle(item.id);
  }, [onToggle, item.id]);

  // Get category color
  const categoryColor = safeColors[item.category || ''] || '#666';
  
  // Get status icon
  const statusIcon = safeIcons[item.status] || '❓';

  // Render current view content
  const renderContent = () => {
    if (currentView === 0) {
      // Front view - basic info
      return (
        <View style={styles.frontContent}>
          <View style={styles.frontHeader}>
            <Text style={styles.equipmentName}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.statusContainer}
              onPress={handleDirectToggle}
              disabled={readonly}
            >
              <Text style={styles.statusIcon}>{statusIcon}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.frontFooter}>
            <Text style={styles.qrCodeText}>QR: {item.qrCode}</Text>
            {item.category && (
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {item.category}
              </Text>
            )}
          </View>
        </View>
      );
    } else {
      // Detail view - show fields for this page
      const pageIndex = currentView - 1;
      const pageFields = detailPages[pageIndex] || [];
      
      return (
        <View style={styles.detailContent}>
          <Text style={styles.detailTitle}>
            {item.name} - Details ({pageIndex + 1}/{detailPages.length})
          </Text>
          
          {pageFields.map((field) => (
            <View key={field.key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{field.label}:</Text>
              <Text style={styles.detailValue}>{field.value}</Text>
            </View>
          ))}
          
          {pageFields.length === 0 && (
            <Text style={styles.noDetailsText}>No additional details available</Text>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCardFlip}
        disabled={isFlipping}
      >
      <Animated.View style={[
        styles.card, 
        { borderLeftColor: categoryColor },
        { backgroundColor: getStatusBackgroundColor(item.status) },
        animatedStyle
        ]}>
          <View style={styles.cardContent}>
            {renderContent()}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Main component
const FlippableQRChecklistField: React.FC<FlippableQRChecklistFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false,
  onQRChecklistScan
}) => {
  const [isScanning, setIsScanning] = useState(false);

  // Initialize checklist data from various possible sources
  const initializeChecklistData = (): QRChecklistData => {
    // Try current value first
    if (value?.raw?.items && Array.isArray(value.raw.items)) {
      console.log('🔧 FLIPPABLE QR CHECKLIST: Found data in value.raw.items');
      return value.raw as QRChecklistData;
    }
    
    // Try fieldDef.data.items
    if (fieldDef?.data?.items && Array.isArray(fieldDef.data.items)) {
      console.log('🔧 FLIPPABLE QR CHECKLIST: Found data in fieldDef.data.items');
      return {
        items: fieldDef.data.items.map((item: any) => ({
          ...item,
          status: item.status || 'N'
        }))
      };
    }
    
    // Try alternative paths where data might be stored
    if (fieldDef?.reference?.values) {
      console.log('🔧 FLIPPABLE QR CHECKLIST: Found data in fieldDef.reference.values');
      return { items: fieldDef.reference.values };
    }
    
    if (fieldDef?.ui?.data?.items) {
      console.log('🔧 FLIPPABLE QR CHECKLIST: Found data in fieldDef.ui.data.items');
      return { items: fieldDef.ui.data.items };
    }
    
    console.log('🔧 FLIPPABLE QR CHECKLIST: No data found, using empty list');
    return { items: [] };
  };

  const checklistData = initializeChecklistData();
  const items = checklistData.items || [];
  
  // Extract UI configuration from fieldDef with safe defaults
  const flipBehavior: FlipBehaviorConfig = useMemo(() => {
    const defaultConfig: FlipBehaviorConfig = {
      enabled: true,
      trigger: 'tap',
      animation: {
        type: 'horizontal_flip',
        duration: 300,
        easing: 'ease_out_back'
      },
      haptic: {
        enabled: true,
        pattern: 'light_pulse'
      },
      frontContent: ['name', 'qrCode', 'status', 'category'],
      backContent: ['description', 'location', 'lastInspection', 'nextDue', 'serialNumber', 'manufacturer']
    };

    return fieldDef?.data?.ui?.flipBehavior ? 
      { ...defaultConfig, ...fieldDef.data.ui.flipBehavior } : 
      defaultConfig;
  }, [fieldDef?.data?.ui?.flipBehavior]);

  const categoryColors = fieldDef?.data?.ui?.categoryColors || {
    safety: '#E53E3E',
    lighting: '#3182CE',
    medical: '#38A169',
    mechanical: '#805AD5',
    electrical: '#D69E2E'
  };

  const statusIcons = fieldDef?.data?.ui?.statusIcons || {
    Y: '✅',
    N: '⭕',
    P: '🔄'
  };

  // Calculate progress
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.status === 'Y').length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  console.log('🔧 FLIPPABLE QR CHECKLIST: Rendered with', totalItems, 'items,', checkedItems, 'checked');

  // Handle individual item toggle (manual checkbox)
  const handleItemToggle = useCallback((itemId: string) => {
    if (readonly) return;

    console.log('🔧 FLIPPABLE QR CHECKLIST: Manual toggle for item:', itemId);

    const updatedItems = items.map(item =>
      item.id === itemId 
        ? { ...item, status: item.status === 'Y' ? 'N' : 'Y' as any }
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
        type: 'flippable_qr_checklist',
        lastUpdated: new Date().toISOString(),
        flipBehaviorEnabled: flipBehavior.enabled
      }
    });
  }, [items, checklistData, readonly, onChange, flipBehavior.enabled]);

  // Generate display string for ERP consumption
  const generateDisplayString = useCallback((itemList: ChecklistItem[]) => {
    return itemList.map(item => 
      `${item.qrCode}: ${item.status === 'Y' ? 'VERIFIED' : 'PENDING'}`
    ).join('; ');
  }, []);

  // Handle QR scanning mode
  const handleStartScanning = useCallback(() => {
    if (readonly || !onQRChecklistScan) return;
    
    setIsScanning(true);
    onQRChecklistScan(items, (updatedItems: ChecklistItem[]) => {
      const updatedData: QRChecklistData = {
        ...checklistData,
        items: updatedItems,
        totalItems: updatedItems.length,
        checkedItems: updatedItems.filter(item => item.status === 'Y').length,
        lastScanned: new Date().toISOString()
      };

      onChange({
        raw: updatedData,
        display: generateDisplayString(updatedItems),
        metadata: { 
          type: 'flippable_qr_checklist',
          lastUpdated: new Date().toISOString(),
          flipBehaviorEnabled: flipBehavior.enabled
        }
      });
      
      setIsScanning(false);
    });
  }, [readonly, onQRChecklistScan, items, checklistData, onChange, generateDisplayString, flipBehavior.enabled]);

  // Handle reset all items
  const handleResetAll = useCallback(() => {
    if (readonly) return;

    Alert.alert(
      'Reset All Items',
      'Are you sure you want to reset all items to unverified status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const resetItems = items.map(item => ({ ...item, status: 'N' as any }));
            
            const updatedData: QRChecklistData = {
              ...checklistData,
              items: resetItems,
              totalItems: resetItems.length,
              checkedItems: 0
            };

            onChange({
              raw: updatedData,
              display: generateDisplayString(resetItems),
              metadata: { 
                type: 'flippable_qr_checklist',
                lastUpdated: new Date().toISOString(),
                flipBehaviorEnabled: flipBehavior.enabled
              }
            });
          }
        }
      ]
    );
  }, [readonly, items, checklistData, onChange, generateDisplayString, flipBehavior.enabled]);

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Equipment Listed</Text>
        <Text style={styles.emptyText}>
          No equipment items are configured for this checklist.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.fieldTitle}>{fieldDef.name || 'Equipment Verification'}</Text>
        <Text style={styles.progressText}>
          {checkedItems} of {totalItems} items verified ({progressPercent}%)
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercent}%` }
            ]} 
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={handleStartScanning}
          disabled={readonly || isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Start QR Scan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={handleResetAll}
          disabled={readonly}
        >
          <Text style={styles.resetButtonText}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Equipment Cards */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <FlippableCard
            key={item.id}
            item={item}
            flipBehavior={flipBehavior}
            categoryColors={categoryColors}
            statusIcons={statusIcons}
            onToggle={handleItemToggle}
            readonly={readonly}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e6ed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#3182CE',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  resetButtonText: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Card Styles
  cardContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
  },

  // Front Face Styles
  frontContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  frontHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
  },
  frontFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qrCodeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Detail Face Styles
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  noDetailsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f7fa',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FlippableQRChecklistField;