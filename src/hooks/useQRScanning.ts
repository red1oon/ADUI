// useQRScanning.ts v1.4 - Simple Top Popup + Better Vibration
// Reverted to simpler approach with modified Alert positioning

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, Vibration } from 'react-native';

// Services
import { PermissionService, QRService } from '../services';

// ==================== INTERFACES ====================

interface QRFieldContext {
  fieldDef: any;
  onChange: Function;
}

interface QRChecklistContext {
  items: any[];
  onUpdate: (items: any[]) => void;
}

interface UseQRScanningReturn {
  // Individual QR Scanning State
  showQRScanner: boolean;
  currentQRField: QRFieldContext | null;
  
  // Checklist QR Scanning State
  showQRChecklistScanner: boolean;
  currentChecklistScan: QRChecklistContext | null;
  
  // Timer Control State
  scanCooldown: boolean;
  cooldownTimeRemaining: number;
  canScan: boolean;
  
  // Individual QR Scanning Actions
  startQRScan: (fieldDef: any, onChange: Function) => void;
  handleQRScanResult: (data: string) => void;
  closeQRScanner: () => void;
  
  // Checklist QR Scanning Actions
  startQRChecklistScan: (items: any[], onUpdate: (items: any[]) => void) => void;
  handleChecklistScanResult: (data: string) => void;
  closeQRChecklistScanner: () => void;

  // Timer Control Actions
  resetScanCooldown: () => void;
  setScanCooldownDuration: (milliseconds: number) => void;
}

// ==================== CONFIGURATION ====================

const DEFAULT_COOLDOWN_MS = 1500; // 1.5 seconds for better UX
const COOLDOWN_UPDATE_INTERVAL = 100; // Update UI every 100ms

// ==================== QR SCANNING HOOK WITH SILENT UPDATES ====================

export const useQRScanning = (): UseQRScanningReturn => {
  
  // ==================== STATE ====================

  // Individual QR scanning state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [currentQRField, setCurrentQRField] = useState<QRFieldContext | null>(null);

  // Checklist QR scanning state
  const [showQRChecklistScanner, setShowQRChecklistScanner] = useState(false);
  const [currentChecklistScan, setCurrentChecklistScan] = useState<QRChecklistContext | null>(null);

  // Timer control state
  const [scanCooldown, setScanCooldown] = useState(false);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(DEFAULT_COOLDOWN_MS);
  
  // Refs for timer management
  const lastScanTime = useRef<number>(0);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const cooldownInterval = useRef<NodeJS.Timeout | null>(null);

  console.log('🔍 useQRScanning v1.4: Hook initialized with simple approach');

  // ==================== TIMER UTILITIES ====================

  const clearTimers = useCallback(() => {
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
      cooldownTimer.current = null;
    }
    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
      cooldownInterval.current = null;
    }
  }, []);

  const startCooldownTimer = useCallback((duration: number = cooldownDuration) => {
    console.log(`🔍 useQRScanning v1.3: Starting ${duration}ms silent cooldown`);
    
    // Clear any existing timers
    clearTimers();
    
    // Set cooldown state
    setScanCooldown(true);
    setCooldownTimeRemaining(duration);
    lastScanTime.current = Date.now();

    // Start countdown interval for UI feedback
    cooldownInterval.current = setInterval(() => {
      const elapsed = Date.now() - lastScanTime.current;
      const remaining = Math.max(0, duration - elapsed);
      
      setCooldownTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearTimers();
        setScanCooldown(false);
        setCooldownTimeRemaining(0);
        console.log('🔍 useQRScanning v1.3: Silent cooldown expired');
      }
    }, COOLDOWN_UPDATE_INTERVAL);

    // Primary cooldown timer
    cooldownTimer.current = setTimeout(() => {
      clearTimers();
      setScanCooldown(false);
      setCooldownTimeRemaining(0);
      console.log('🔍 useQRScanning v1.3: Silent cooldown completed');
    }, duration);
  }, [cooldownDuration, clearTimers]);

  const resetScanCooldown = useCallback(() => {
    console.log('🔍 useQRScanning v1.4: Manually resetting scan cooldown');
    clearTimers();
    setScanCooldown(false);
    setCooldownTimeRemaining(0);
    lastScanTime.current = 0;
  }, [clearTimers]);

  const setScanCooldownDuration = useCallback((milliseconds: number) => {
    console.log('🔍 useQRScanning v1.3: Setting cooldown duration to', milliseconds, 'ms');
    setCooldownDuration(milliseconds);
  }, []);

  // Computed state
  const canScan = !scanCooldown;

  // ==================== CLEANUP ON UNMOUNT ====================

  useEffect(() => {
    return () => {
      console.log('🔍 useQRScanning v1.3: Cleanup timers on unmount');
      clearTimers();
    };
  }, [clearTimers]);

  // ==================== INDIVIDUAL QR SCANNING ====================

  const startQRScan = useCallback((fieldDef: any, onChange: Function) => {
    console.log('🔍 useQRScanning v1.3: Starting individual QR scan for field:', fieldDef.fieldId || fieldDef.id);

    if (!PermissionService.getPermissionStatus()) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to scan QR codes',
        [
          { text: 'Cancel' },
          { text: 'Grant Permission', onPress: () => PermissionService.requestAllPermissions() }
        ]
      );
      return;
    }

    // Reset cooldown when starting new scan session
    resetScanCooldown();
    
    setCurrentQRField({ fieldDef, onChange });
    setShowQRScanner(true);
  }, [resetScanCooldown]);

  const handleQRScanResult = useCallback((data: string) => {
    console.log('🔍 useQRScanning v1.3: Individual QR scan result:', data);

    // Check cooldown timer (silent)
    if (scanCooldown) {
      console.log('🔍 useQRScanning v1.3: Individual scan blocked by cooldown, remaining:', cooldownTimeRemaining, 'ms');
      return; // SILENT: No popup, just ignore
    }

    if (!currentQRField) {
      console.log('🔍 useQRScanning v1.3: No current QR field context');
      return;
    }

    // Start cooldown timer
    startCooldownTimer();

    // Audio + Haptic feedback 
    Vibration.vibrate(100); // Short vibration

    // Process scan result
    const parsedData = QRService.parseQRData(data);
    const displayValue = QRService.formatQRData(parsedData);
    
    currentQRField.onChange({ 
      raw: data, 
      display: displayValue,
      metadata: {
        ...parsedData,
        scannedAt: new Date().toISOString(),
        cooldownApplied: true
      }
    });
    
    closeQRScanner();
    
    // SIMPLIFIED: Still show alert for individual scans (single scan context)
    Alert.alert('✅ QR Code Scanned', `Successfully scanned: ${displayValue}`, [{ text: 'OK' }]);
  }, [currentQRField, scanCooldown, cooldownTimeRemaining, startCooldownTimer]);

  const closeQRScanner = useCallback(() => {
    console.log('🔍 useQRScanning v1.3: Closing individual QR scanner');
    setShowQRScanner(false);
    setCurrentQRField(null);
    // Note: Keep cooldown timer running even when scanner closes
  }, []);

  // ==================== CHECKLIST QR SCANNING (SILENT UPDATES) ====================

  const startQRChecklistScan = useCallback((items: any[], onUpdate: (items: any[]) => void) => {
    console.log('🔍 useQRScanning v1.3: Starting SILENT checklist QR scan with', items.length, 'items');

    if (!PermissionService.getPermissionStatus()) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to scan QR codes',
        [
          { text: 'Cancel' },
          { text: 'Grant Permission', onPress: () => PermissionService.requestAllPermissions() }
        ]
      );
      return;
    }

    // Reset cooldown when starting new checklist scan session
    resetScanCooldown();

    setCurrentChecklistScan({ items, onUpdate });
    setShowQRChecklistScanner(true);
  }, [resetScanCooldown]);

  const handleChecklistScanResult = useCallback((data: string) => {
    console.log('🔍 useQRScanning v1.4: Checklist QR scan result:', data);

    // Check cooldown timer (silent)
    if (scanCooldown) {
      console.log('🔍 useQRScanning v1.4: Checklist scan blocked by cooldown, remaining:', cooldownTimeRemaining, 'ms');
      return; // SILENT: Just ignore, no feedback
    }

    if (!currentChecklistScan) {
      console.log('🔍 useQRScanning v1.4: No active checklist scan');
      return;
    }

    // Find matching item in checklist
    const matchedItemIndex = currentChecklistScan.items.findIndex(item => 
      item.qrCode === data
    );

    if (matchedItemIndex >= 0) {
      const matchedItem = currentChecklistScan.items[matchedItemIndex];
      
      // Apply cooldown to ALL matched codes
      startCooldownTimer();
      
      if (matchedItem.status !== 'Y') {
        // SUCCESS: Strong vibration + Simple alert
        console.log('🔍 BEFORE VIBRATION: Attempting vibration...');
        try {
          // Try different vibration approaches
          if (Vibration.vibrate) {
            Vibration.vibrate([100, 50, 100]); // Success pattern
            console.log('🔍 SUCCESS VIBRATION: ✅ Applied vibration pattern [100,50,100]');
          } else {
            console.log('🔍 VIBRATION: ❌ Vibration.vibrate not available');
          }
        } catch (error) {
          console.log('🔍 VIBRATION ERROR: ❌', error);
        }
        
        // Update item status to verified
        const updatedItems = [...currentChecklistScan.items];
        updatedItems[matchedItemIndex] = { 
          ...matchedItem, 
          status: 'Y',
          scannedAt: new Date().toISOString()
        };
        
        // Update the scanning state
        setCurrentChecklistScan(prev => prev ? { ...prev, items: updatedItems } : null);
        
        // Call the update callback immediately for progress counter
        currentChecklistScan.onUpdate(updatedItems);
        
        // SIMPLE: Top alert without action buttons
        Alert.alert(
          '✅ Item Verified', 
          matchedItem.name,
          [{ text: 'OK', style: 'default' }]
        );
        
        console.log('🔍 useQRScanning v1.4: ✅ SUCCESS with simple alert:', matchedItem.name);
        
      } else {
        // ALREADY VERIFIED: Different vibration + Simple alert
        console.log('🔍 BEFORE WARNING VIBRATION: Attempting warning vibration...');
        try {
          if (Vibration.vibrate) {
            Vibration.vibrate(300); // Single long vibration
            console.log('🔍 WARNING VIBRATION: ⚠️ Applied single vibration (300ms)');
          } else {
            console.log('🔍 VIBRATION: ❌ Vibration.vibrate not available');
          }
        } catch (error) {
          console.log('🔍 VIBRATION ERROR: ❌', error);
        }
        
        // SIMPLE: Warning alert
        Alert.alert(
          '⚠️ Already Verified', 
          matchedItem.name,
          [{ text: 'OK', style: 'default' }]
        );
        
        console.log('🔍 useQRScanning v1.4: ⚠️ Already verified with simple alert:', matchedItem.name);
      }
    } else {
      // NO MATCH: Error vibration but no cooldown + Simple alert
      console.log('🔍 BEFORE ERROR VIBRATION: Attempting error vibration...');
      try {
        if (Vibration.vibrate) {
          Vibration.vibrate([200, 100, 200]); // Error pattern
          console.log('🔍 ERROR VIBRATION: ❌ Applied error pattern [200,100,200]');
        } else {
          console.log('🔍 VIBRATION: ❌ Vibration.vibrate not available');
        }
      } catch (error) {
        console.log('🔍 VIBRATION ERROR: ❌', error);
      }
      
      // SIMPLE: Error alert
      Alert.alert(
        '❌ Code Not Found', 
        'QR code not in checklist',
        [{ text: 'OK', style: 'default' }]
      );
      
      console.log('🔍 useQRScanning v1.4: ❌ Code not found with simple alert:', data);
    }
  }, [currentChecklistScan, scanCooldown, cooldownTimeRemaining, startCooldownTimer]);

  const closeQRChecklistScanner = useCallback(() => {
    console.log('🔍 useQRScanning v1.4: Closing checklist QR scanner');
    setShowQRChecklistScanner(false);
    setCurrentChecklistScan(null);
    // Note: Keep cooldown timer running even when scanner closes
  }, []);

  // ==================== RETURN INTERFACE ====================

  return {
    // Individual QR Scanning State
    showQRScanner,
    currentQRField,
    
    // Checklist QR Scanning State
    showQRChecklistScanner,
    currentChecklistScan,
    
    // Timer Control State
    scanCooldown,
    cooldownTimeRemaining,
    canScan,
    
    // Individual QR Scanning Actions
    startQRScan,
    handleQRScanResult,
    closeQRScanner,
    
    // Checklist QR Scanning Actions
    startQRChecklistScan,
    handleChecklistScanResult,
    closeQRChecklistScanner,

    // Timer Control Actions
    resetScanCooldown,
    setScanCooldownDuration,
  };
};