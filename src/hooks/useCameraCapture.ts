// useCameraCapture.ts v1.0 - Extracted Camera Capture Hook
// Handles camera photo capture functionality with GPS tagging and permissions

import { useCallback } from 'react';
import { Alert } from 'react-native';

// Services
import { PermissionService, CameraService, type LocationData, type MediaItem } from '../services';

// ==================== INTERFACES ====================

interface CaptureOptions {
  documentId: string;
  fieldId: string;
  location: LocationData | null;
  customFileName?: string;
  compressionQuality?: number;
}

interface CaptureResult {
  success: boolean;
  mediaItem?: MediaItem;
  error?: string;
}

interface UseCameraCaptureReturn {
  // Core capture function
  capturePhoto: (options: CaptureOptions) => Promise<CaptureResult>;
  
  // Field-specific capture (matches existing App.tsx interface)
  handleCameraCapture: (fieldDef: any, onChange: Function, documentId: string, location: LocationData | null) => Promise<void>;
  
  // Utility functions
  checkCameraPermission: () => boolean;
  requestCameraPermission: () => Promise<boolean>;
}

// ==================== CAMERA CAPTURE HOOK ====================

export const useCameraCapture = (): UseCameraCaptureReturn => {
  
  console.log('📸 useCameraCapture: Hook initialized');

  // ==================== PERMISSION MANAGEMENT ====================

  const checkCameraPermission = useCallback(() => {
    const hasPermission = PermissionService.getPermissionStatus();
    console.log('📸 useCameraCapture: Permission status:', hasPermission);
    return hasPermission;
  }, []);

  const requestCameraPermission = useCallback(async () => {
    console.log('📸 useCameraCapture: Requesting camera permissions');
    
    try {
      await PermissionService.requestAllPermissions();
      const granted = PermissionService.getPermissionStatus();
      console.log('📸 useCameraCapture: Permission granted:', granted);
      return granted;
    } catch (error) {
      console.log('📸 useCameraCapture: Permission request failed:', error);
      return false;
    }
  }, []);

  // ==================== CORE CAPTURE FUNCTION ====================

  const capturePhoto = useCallback(async (options: CaptureOptions): Promise<CaptureResult> => {
    const { documentId, fieldId, location, customFileName, compressionQuality } = options;
    
    console.log('📸 useCameraCapture: Starting photo capture for field:', fieldId);

    // Check permissions first
    if (!checkCameraPermission()) {
      const granted = await requestCameraPermission();
      if (!granted) {
        return {
          success: false,
          error: 'Camera permission not granted'
        };
      }
    }

    try {
      // Capture photo using CameraService
      const mediaItem = await CameraService.capturePhoto(
        documentId, 
        fieldId, 
        location,
        {
          fileName: customFileName,
          quality: compressionQuality || 0.8
        }
      );

      if (mediaItem) {
        console.log('📸 useCameraCapture: Photo captured successfully:', mediaItem.fileName);
        return {
          success: true,
          mediaItem
        };
      } else {
        console.log('📸 useCameraCapture: Photo capture returned null');
        return {
          success: false,
          error: 'Photo capture was cancelled or failed'
        };
      }
    } catch (error) {
      console.log('📸 useCameraCapture: Photo capture error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown camera error'
      };
    }
  }, [checkCameraPermission, requestCameraPermission]);

  // ==================== FIELD-SPECIFIC CAPTURE (App.tsx COMPATIBILITY) ====================

  const handleCameraCapture = useCallback(async (
    fieldDef: any, 
    onChange: Function, 
    documentId: string, 
    location: LocationData | null
  ) => {
    console.log('📸 useCameraCapture: Handling field camera capture for:', fieldDef.fieldId || fieldDef.id);

    // Show permission dialog if needed
    if (!checkCameraPermission()) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos',
        [
          { text: 'Cancel' },
          { 
            text: 'Grant Permission', 
            onPress: async () => {
              const granted = await requestCameraPermission();
              if (granted) {
                // Retry capture after permission granted
                handleCameraCapture(fieldDef, onChange, documentId, location);
              }
            }
          }
        ]
      );
      return;
    }

    // Capture the photo
    const result = await capturePhoto({
      documentId,
      fieldId: fieldDef.fieldId || fieldDef.id,
      location
    });

    if (result.success && result.mediaItem) {
      // Format result for form field (matches existing App.tsx format)
      const formattedValue = {
        raw: result.mediaItem.uri,
        display: result.mediaItem.fileName,
        metadata: result.mediaItem
      };

      console.log('📸 useCameraCapture: Calling onChange with formatted value');
      onChange(formattedValue);
    } else {
      // Handle capture failure
      if (result.error) {
        Alert.alert(
          'Camera Error',
          `Failed to capture photo: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [capturePhoto, checkCameraPermission, requestCameraPermission]);

  // ==================== RETURN INTERFACE ====================

  return {
    // Core capture function
    capturePhoto,
    
    // Field-specific capture (matches existing App.tsx interface)
    handleCameraCapture,
    
    // Utility functions
    checkCameraPermission,
    requestCameraPermission,
  };
};