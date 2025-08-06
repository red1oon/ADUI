// useFormManagement.ts v1.0.1 - Fixed with Correct Brackets and QR Codes
// CONSERVATIVE CHANGE: Applied OldAllInOneApp pattern with proper syntax
// FIXES: MultiPhotoField photos + QRCollectorField QR codes in reports
// Save as: src/hooks/useFormManagement.ts

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import Share from 'react-native-share';

// Types
import { FieldValue } from '../types/ADTypes';

// Services
import { LocationService, type LocationData } from '../services';

// Engine
import { ValidationEngine } from '../engine';

// Utils
import { DocumentGenerator } from '../utils';

// ==================== INTERFACES (UNCHANGED) ====================

interface ADWindowDefinition {
  name: string;
  tabs: Array<{
    tabId?: string;
    id: string;
    name: string;
    fields: Array<{
      fieldId?: string;
      id: string;
      [key: string]: any;
    }>;
  }>;
  [key: string]: any;
}

interface FormManagementOptions {
  initialActiveTab?: number;
  autoResetOnSubmit?: boolean;
}

// UNCHANGED: Original interface preserved exactly
interface UseFormManagementReturn {
  // Form Data State
  formData: Record<string, FieldValue>;
  isDirty: boolean;
  documentId: string;
  
  // Tab Management
  activeTab: number;
  setActiveTab: (index: number) => void;
  
  // Form Actions
  handleFieldChange: (fieldId: string, value: FieldValue) => void;
  resetForm: () => void;
  handleSubmit: (windowDef: ADWindowDefinition, location: LocationData | null, providerType: string) => Promise<void>;
  
  // Utilities
  getFilledFieldsCount: () => number;
  getFormProgress: () => { filled: number; total: number; percentage: number };
}

// ==================== FORM MANAGEMENT HOOK ====================

export const useFormManagement = (options: FormManagementOptions = {}): UseFormManagementReturn => {
  const {
    initialActiveTab = 0,
    autoResetOnSubmit = true
  } = options;

  // ==================== STATE (UNCHANGED) ====================

  const [formData, setFormData] = useState<Record<string, FieldValue>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [documentId] = useState(DocumentGenerator.generateInspectionId());

  console.log('📝 useFormManagement v1.0.1: Hook initialized with document ID:', documentId);

  // ==================== FORM DATA HANDLERS (UNCHANGED) ====================

  const handleFieldChange = useCallback((fieldId: string, value: FieldValue) => {
    console.log('📝 useFormManagement v1.0.1: Field changed:', fieldId, value);
    
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    console.log('📝 useFormManagement v1.0.1: Resetting form data');
    
    setFormData({});
    setIsDirty(false);
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  // ==================== FORM SUBMISSION (ENHANCED BUT NON-BREAKING) ====================

  const handleSubmit = useCallback(async (
    windowDef: ADWindowDefinition, 
    location: LocationData | null,
    providerType: string
  ) => {
    if (!windowDef) {
      Alert.alert('Error', 'No window definition available for submission');
      return;
    }

    try {
      console.log('📝 useFormManagement v1.0.1: Starting form submission...');
      
      // Validation (currently disabled for testing)
      const allFields = windowDef.tabs?.flatMap(tab => tab?.fields || []) || [];
      const validationErrors = ValidationEngine.validateAllFields(formData, allFields);
      
      console.log('📝 useFormManagement v1.0.1: Validation check -', validationErrors.length, 'errors found (ignored for testing)');

      // ENHANCED PHOTO COLLECTION: Based on successful OldAllInOneApp.tsx pattern
      const photos: string[] = [];
      if (formData && typeof formData === 'object') {
        Object.values(formData).forEach(value => {
          // EXISTING LOGIC: Individual photos (preserved exactly)
          if (value?.metadata?.mediaType === 'photo' && value?.raw) {
            photos.push(value.raw);
          }
          
          // NEW LOGIC: MultiPhotoField collections - extract URIs like OldAllInOneApp
          if (value?.metadata?.mediaType === 'photo-collection' && value?.metadata?.individualPhotos) {
            value.metadata.individualPhotos.forEach((photo: any) => {
              if (photo?.raw) {
                photos.push(photo.raw);
              }
            });
          }
          
          // FALLBACK: Direct photo array in raw data (matches old MediaItem[] pattern)
          if (value?.raw?.photos && Array.isArray(value.raw.photos)) {
            value.raw.photos.forEach((photo: any) => {
              if (photo?.uri) {
                photos.push(photo.uri);  // Use .uri like OldAllInOneApp MediaItem
              }
            });
          }
        });
      }

      // QR CODES COLLECTION: Extract QR codes for report content
      const qrCodes: Array<{code: string, timestamp: string}> = [];
      if (formData && typeof formData === 'object') {
        Object.values(formData).forEach(value => {
          if (value?.raw?.codes && Array.isArray(value.raw.codes)) {
            value.raw.codes.forEach((qrEntry: any) => {
              if (qrEntry?.code) {
                qrCodes.push({
                  code: qrEntry.code,
                  timestamp: qrEntry.timestamp
                });
              }
            });
          }
        });
      }

      console.log('📝 useFormManagement v1.0.1: Sharing report with', photos.length, 'photos and', qrCodes.length, 'QR codes');

      // Generate report content
      let reportContent;
      try {
        reportContent = DocumentGenerator.generateReportContent(
          documentId,
          windowDef.name,
          formData,
          location,
          windowDef.tabs || []
        );
      } catch (reportError) {
        console.log('📝 useFormManagement v1.0.1: DocumentGenerator error, using enhanced fallback:', reportError);
        
        // Enhanced fallback report with QR codes (like OldAllInOneApp pattern)
        let qrSection = '';
        if (qrCodes.length > 0) {
          qrSection = `\n\nQR CODES SCANNED (${qrCodes.length}):\n${qrCodes.map((qr, index) => 
            `${index + 1}. ${qr.code} (${new Date(qr.timestamp).toLocaleString()})`
          ).join('\n')}`;
        }

        reportContent = {
          subject: `${documentId} - ${windowDef.name || 'Form Report'}`,
          body: `FORM REPORT\n==========================================\nDocument ID: ${documentId}\nDate: ${new Date().toLocaleString()}\nLocation: ${location ? 
            `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)} (±${location.accuracy?.toFixed(0)}m)` : 
            'Location not available'}\n\nFORM DATA:\n${Object.keys(formData).map(key => 
              `${key}: ${formData[key]?.display || formData[key]?.raw || 'No value'}`
            ).join('\n')}${qrSection}\n\nPHOTOS: ${photos.length} photo(s) attached\n\nGenerated by ADUI v3.0.1 (Fixed Brackets & QR Codes)`
        };
      }

      // Prepare share options (UNCHANGED)
      const shareOptions = {
        title: reportContent.subject,
        subject: reportContent.subject,
        message: reportContent.body,
        failOnCancel: false,
      };

      if (photos.length > 0) {
        shareOptions.urls = photos;
      }

      // Share the report (UNCHANGED)
      await Share.open(shareOptions);
      
      // Calculate statistics (UNCHANGED)
      const filledFields = Object.keys(formData).filter(key => 
        formData[key] && formData[key].raw !== '' && formData[key].raw !== null
      ).length;
      
      // Enhanced success alert (includes QR count but doesn't break interface)
      Alert.alert(
        '✅ Form Submitted!',
        `AD Form submitted successfully!\n• Fields filled: ${filledFields}\n• Photos: ${photos.length}\n• QR codes: ${qrCodes.length}\n• Document: ${documentId}\n• Provider: ${providerType}`,
        [
          { text: 'New Form', onPress: autoResetOnSubmit ? resetForm : undefined },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.log('📝 useFormManagement v1.0.1: Submission error:', error);
      Alert.alert('Save Failed', `Could not submit form: ${error?.message || error}`);
    }
  }, [formData, documentId, autoResetOnSubmit, resetForm]);

  // ==================== UTILITY FUNCTIONS (UNCHANGED) ====================

  const getFilledFieldsCount = useCallback(() => {
    return Object.keys(formData).filter(key => 
      formData[key] && formData[key].raw !== '' && formData[key].raw !== null
    ).length;
  }, [formData]);

  const getFormProgress = useCallback(() => {
    const filled = getFilledFieldsCount();
    const total = Object.keys(formData).length;
    const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
    
    return { filled, total, percentage };
  }, [formData, getFilledFieldsCount]);

  // ==================== RETURN INTERFACE (UNCHANGED) ====================

  return {
    // Form Data State
    formData,
    isDirty,
    documentId,
    
    // Tab Management
    activeTab,
    setActiveTab,
    
    // Form Actions
    handleFieldChange,
    resetForm,
    handleSubmit,
    
    // Utilities
    getFilledFieldsCount,
    getFormProgress,
  };
};