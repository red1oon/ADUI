// App.tsx v3.1 - Complete with GestureHandlerRootView for TaskList Pinch Gestures
// Reduced from 700+ lines to ~350 lines through component and hook extraction
// Added GestureHandlerRootView wrapper to support TaskListField pinch-to-zoom

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // NEW: Required for TaskList pinch gestures

// ==================== EXTRACTED COMPONENTS ====================
import { ConnectionStatusBar } from './src/components/app/ConnectionStatusBar';
import { JSONImportStatusBar } from './src/components/app/JSONImportStatusBar';
import { ErrorFallbackScreen } from './src/components/app/ErrorFallbackScreen';
import { MainFormScreen } from './src/components/screens/MainFormScreen';
import { QRScannerScreen, QRChecklistScannerScreen } from './src/components/screens/QRScannerScreens';

// ==================== EXTRACTED HOOKS ====================
import { useConnectionMonitor } from './src/hooks/useConnectionMonitor';
import { useJSONImport } from './src/hooks/useJSONImport';
import { useFormManagement } from './src/hooks/useFormManagement';
import { useQRScanning } from './src/hooks/useQRScanning';
import { useCameraCapture } from './src/hooks/useCameraCapture';
import { useLocationService } from './src/hooks/useLocationService';

// ==================== EXTRACTED STYLES ====================
import { appScreenStyles } from './src/theme/appScreenStyles';

// ==================== DATA LAYER ====================
import { DataContextProvider, useWindowData, useDataProvider } from './src/data';
import { MockDataProvider } from './src/data/providers/MockDataProvider';

// ==================== SERVICES LAYER ====================
import { PermissionService } from './src/services';

// ==================== THEME LAYER ====================
import { appStyles } from './src/theme';

// ==================== MAIN APP COMPONENT ====================

const ADUIFormApp: React.FC = () => {
  // ==================== EXTRACTED HOOKS ====================
  
  // Connection and data management
  const connection = useConnectionMonitor();
  const jsonImport = useJSONImport();
  
  // Form management (extracted ~100 lines)
  const {
    formData,
    isDirty,
    documentId,
    activeTab,
    setActiveTab,
    handleFieldChange,
    resetForm,
    handleSubmit,
  } = useFormManagement({
    initialActiveTab: 0,
    autoResetOnSubmit: true
  });
  
  // QR scanning management (extracted ~50 lines)
  const {
    showQRScanner,
    currentQRField,
    showQRChecklistScanner,
    currentChecklistScan,
    startQRScan,
    handleQRScanResult,
    closeQRScanner,
    startQRChecklistScan,
    handleChecklistScanResult,
    closeQRChecklistScanner,
  } = useQRScanning();
  
  // Camera capture management (extracted ~50 lines)
  const { handleCameraCapture } = useCameraCapture();
  
  // Location management (extracted ~50 lines)
  const {
    location,
    locationStatus,
    resetLocation,
    getLocationString,
  } = useLocationService(true);

  // ==================== CORE STATE ====================
  
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const { windowDef, loading, error, refetch } = useWindowData(activeWindowId);
  const { provider, switchProvider } = useDataProvider();

  // ==================== WINDOW DISCOVERY ====================

 useEffect(() => {
  const discoverWindows = async () => {
    if (connection.connectionStatus === 'connected') {
      try {
        const availableWindows = await provider.getAvailableWindows();
        if (availableWindows.length > 0) {
          const firstWindowId = availableWindows[0].id;
          console.log('🔧 APP v3.1: Auto-discovered window:', firstWindowId);
          setActiveWindowId(firstWindowId);
        } else
        setActiveWindowId(null);
      } catch (error) {
        console.log('🔧 APP v3.1: Window discovery failed:', error);
        setActiveWindowId(null);
      }
    } else if (connection.connectionStatus === 'offline' || connection.connectionStatus === 'error') {
      // Clear any window when server is unavailable  
      setActiveWindowId(null);
      console.log('🔧 APP v3.1: Server unavailable, cleared window ID');
    }
  };
  
  discoverWindows();
}, [connection.connectionStatus, provider]);
  // ==================== PROVIDER SWITCHING ====================

  const handleSwitchToDemo = useCallback(() => {
    console.log('🔧 APP v3.1: Switching to demo data (MockDataProvider)');
    
    Alert.alert(
      'Switch to Demo Data',
      'This will use built-in demo forms instead of the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Demo',
          onPress: () => {
            const mockProvider = new MockDataProvider();
            switchProvider(mockProvider);
          }
        }
      ]
    );
  }, [switchProvider]);

  // ==================== AUTO-FALLBACK TO MOCK ====================

  useEffect(() => {
    if (error && connection.providerType === 'ExternalMetadataProvider' && connection.connectionStatus === 'error') {
      console.log('🔧 APP v3.1: ExternalMetadataProvider failed, considering auto-fallback');
      
      const fallbackTimer = setTimeout(() => {
        console.log('🔧 APP v3.1: Auto-falling back to MockDataProvider');
        const mockProvider = new MockDataProvider();
        switchProvider(mockProvider);
      }, 5000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [error, connection.providerType, connection.connectionStatus, switchProvider]);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('🔧 APP v3.1: Initializing ADUI with refactored architecture and TaskList gesture support...');
    
    await PermissionService.requestAllPermissions();
    
    console.log('🔧 APP v3.1: Initialization complete');
  };

  // ==================== FORM SUBMISSION ====================

  const handleSave = useCallback(async () => {
    await handleSubmit(windowDef, location, connection.providerType);
  }, [handleSubmit, windowDef, location, connection.providerType]);

  // ==================== ENHANCED FORM RESET ====================

  const handleReset = useCallback(() => {
    resetForm();
    resetLocation();
  }, [resetForm, resetLocation]);

  // ==================== EVENT HANDLERS (SIMPLIFIED) ====================

  // QR scanning handlers
  const handleQRScanned = startQRScan;
  const handleBarCodeScanned = ({ data }: { data: string }) => handleQRScanResult(data);
  const handleQRChecklistScan = startQRChecklistScan;
  const handleChecklistBarCodeScanned = ({ data }: { data: string }) => handleChecklistScanResult(data);

  // Camera capture handler (with enhanced signature)
  const handleCameraCaptureField = useCallback((fieldDef: any, onChange: Function) => {
    handleCameraCapture(fieldDef, onChange, documentId, location);
  }, [handleCameraCapture, documentId, location]);

  // ==================== RENDER LOADING STATE ====================

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[appStyles.container, appScreenStyles.centerContainer]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={appScreenStyles.loadingText}>
            Loading {connection.providerType === 'ExternalMetadataProvider' ? 'External' : 
                     connection.providerType === 'JSONFileDataProvider' ? 'Imported' : 'Demo'} Metadata...
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // ==================== RENDER ERROR STATE ====================

 if (error || (connection.connectionStatus === 'offline' && !loading && !windowDef)) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorFallbackScreen
        error={error?.message || 'Metadata server unavailable'}
        onRetry={connection.recheckConnection}
        onSwitchToDemo={handleSwitchToDemo}
        onImportJSON={jsonImport.handleManualJSONImport}
        connectionStatus={connection.connectionStatus}
        providerType={connection.providerType}
      />
    </GestureHandlerRootView>
  );
}

  // ==================== RENDER QR SCANNER SCREENS ====================

  if (showQRScanner) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QRScannerScreen
          onBarCodeScanned={handleBarCodeScanned}
          onClose={closeQRScanner}
          title="QR Code Scanner"
          instructions="Position the QR code within the frame to scan"
        />
      </GestureHandlerRootView>
    );
  }

  if (showQRChecklistScanner && currentChecklistScan) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QRChecklistScannerScreen
          items={currentChecklistScan.items}
          onBarCodeScanned={handleChecklistBarCodeScanned}
          onClose={closeQRChecklistScanner}
        />
      </GestureHandlerRootView>
    );
  }

  // ==================== MAIN APP SCREEN ====================

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={appStyles.container}>
        {/* Header */}
        <View style={appStyles.header}>
          <TouchableOpacity onPress={handleReset} style={appStyles.headerButton}>
            <Text style={appStyles.headerButtonText}>Reset</Text>
          </TouchableOpacity>
          
          {/* Manual JSON Import Button */}
          <TouchableOpacity 
            onPress={jsonImport.handleManualJSONImport} 
            style={[appStyles.headerButton, appScreenStyles.importHeaderButton]}
          >
            <Text style={[appStyles.headerButtonText, appScreenStyles.importHeaderButtonText]}>
              Import
            </Text>
          </TouchableOpacity>
          
          <View style={appStyles.headerCenter}>
            <Text style={appStyles.title}>ADUI v3.1</Text>
            <Text style={appStyles.subtitle}>{windowDef?.name || 'No Form Loaded'}</Text>
            <Text style={[appStyles.subtitle, { fontSize: 12, opacity: 0.8 }]}>
              {documentId}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[
              appStyles.headerButton, 
              appStyles.saveButton, 
              !isDirty && appStyles.disabledButton
            ]}
            disabled={!isDirty}
          >
            <Text style={[appStyles.headerButtonText, appStyles.saveButtonText]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Connection Status Bar */}
        <ConnectionStatusBar 
          status={connection.connectionStatus} 
          lastFetch={connection.lastSuccessfulFetch}
          providerType={connection.providerType}
          onRetry={connection.recheckConnection}
        />

        {/* JSON Import Status */}
        <JSONImportStatusBar 
          importInfo={jsonImport.importInfo}
          onClearImport={jsonImport.clearJSONImport}
        />

        {/* Location Status */}
        <View style={appScreenStyles.locationBar}>
          <Text style={appScreenStyles.locationText}>
            📍 {getLocationString()}
          </Text>
        </View>

        {/* Main Form Screen (extracted ~200 lines) */}
        {windowDef ? (
          <MainFormScreen
            windowDef={windowDef}
            formData={formData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onFieldChange={handleFieldChange}
            onQRScanned={handleQRScanned}
            onCameraCapture={handleCameraCaptureField}
            onQRChecklistScan={handleQRChecklistScan}
          />
        ) : (
          <View style={appStyles.container}>
            <Text style={appStyles.subtitle}>
              📱 Ready for JSON import or external metadata connection
            </Text>
          </View>
        )}

        {/* Debug Footer */}
        <View style={appScreenStyles.debugFooter}>
          <Text style={appScreenStyles.debugFooterTitle}>
            🔧 ADUI v3.1 - REFACTORED ARCHITECTURE:
          </Text>
          <Text style={appScreenStyles.debugFooterText}>
            • Provider: {connection.providerType} | Status: {connection.connectionStatus}{'\n'}
            • Source: {windowDef?.metadata?.source || 'Unknown'}{'\n'}
            • Architecture: Extracted Components ✅ Hooks ✅ Maintainable ✅{'\n'}
            • Reduced: 700+ lines → ~350 lines | Modular ✅ Reusable ✅{'\n'}
            • TaskList: Pinch Gestures ✅ Graph View ✅
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

// ==================== APP WRAPPER WITH DATA PROVIDER ====================

export default function App() {
  console.log('🔧 APP ROOT: Starting ADUI v3.1 with TaskList gesture support...');
  
  return (
    <DataContextProvider>
      <ADUIFormApp />
    </DataContextProvider>
  );
}