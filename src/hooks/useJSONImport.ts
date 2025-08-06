// useJSONImport.ts v1.0 - Extracted from App.tsx
// Save as: src/hooks/useJSONImport.ts

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { useDataProvider } from '../data';
import { JSONFileDataProvider } from '../data/providers/JSONFileDataProvider';
import { createJSONFileProvider } from '../data/config/DataConfig';

// Graceful DocumentPicker import with fallback
let DocumentPicker: any;
try {
  DocumentPicker = require('expo-document-picker');
  console.log('📱 DocumentPicker loaded successfully');
} catch (error) {
  console.log('📱 DocumentPicker not available, using fallback');
  DocumentPicker = {
    getDocumentAsync: () => {
      Alert.alert(
        'Feature Unavailable',
        'Document picker is not available in this build. Please use a development build that includes expo-document-picker.',
        [{ text: 'OK' }]
      );
      return Promise.resolve({ type: 'cancel' });
    }
  };
}

export const useJSONImport = () => {
  const { provider, switchProvider } = useDataProvider();
  const [importInfo, setImportInfo] = useState<{ template: any; timestamp: string | null; windowCount: number } | null>(null);

  // ==================== JSON FILE IMPORT METHODS ====================

  const handleJSONFileImport = useCallback(async (fileUri: string, jsonContent?: string) => {
    console.log('🔧 JSON IMPORT: Handling JSON file import from:', fileUri);
    
    try {
      // Show loading state
      //Alert.alert('Importing Template', 'Loading JSON template...', [], { cancelable: true });

      let rawJson: string;
      console.log('🔧 JSON IMPORT: Starting file read operation...');
      if (jsonContent) {
        rawJson = jsonContent;
      } else {
        // Read JSON file content
        try {
          rawJson = await FileSystem.readAsStringAsync(fileUri);
          console.log('🔧 JSON IMPORT: Successfully read JSON file content');
        } catch (readError) {
          console.error('🔧 JSON IMPORT: Failed to read JSON file:', readError);
          throw new Error(`Cannot read JSON file: ${readError.message}`);
        }
      }

      // Create new JSONFileDataProvider instance
      console.log('🔧 JSON IMPORT: Creating JSON provider...');
      const jsonProvider = createJSONFileProvider();
      
      // Import the JSON template
      console.log('🔧 JSON IMPORT: Calling importJSONTemplate...');
      const success = await jsonProvider.importJSONTemplate(fileUri, rawJson);
      
      if (success) {
        // Switch to the JSON file provider
        switchProvider(jsonProvider);
        
        // Get import info for display
        const info = jsonProvider.getImportInfo();
        setImportInfo(info);
        
        console.log('🔧 JSON IMPORT: About to show success alert'); 
        
        Alert.alert(
          'Template Imported!', 
          `Successfully imported JSON template:\n• ${info.template?.name || 'Unknown'}\n• ${info.windowCount} window(s) available`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to import JSON template');
      }
      
    } catch (error) {
      console.error('🔧 JSON IMPORT: ❌ JSON import failed:', error);
      Alert.alert(
        'Import Failed', 
        `Could not import JSON template:\n${error.message}`,
        [{ text: 'OK' }]
      );
    }
  }, [switchProvider]);

  // Enhanced DocumentPicker import
  const handleManualJSONImport = useCallback(async () => {
    try {
      console.log('🔧 MANUAL IMPORT: Starting enhanced debug import...');
      console.log('🔧 MANUAL IMPORT: DocumentPicker type:', typeof DocumentPicker);
      console.log('🔧 MANUAL IMPORT: DocumentPicker.getDocumentAsync type:', typeof DocumentPicker.getDocumentAsync);
      
      // Check if we're in fallback mode
      if (typeof DocumentPicker.getDocumentAsync !== 'function') {
        console.log('🔧 MANUAL IMPORT: ❌ DocumentPicker not available - in fallback mode');
        Alert.alert('DocumentPicker Not Available', 'This build does not include DocumentPicker. Use QR code import instead.');
        return;
      }

      console.log('🔧 MANUAL IMPORT: Calling DocumentPicker.getDocumentAsync...');
      
      // Enhanced DocumentPicker call with detailed options
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'], // Accept multiple types
        copyToCacheDirectory: true, // Force copy to accessible location
        multiple: false // Single file only
      });

      console.log('🔧 MANUAL IMPORT: DocumentPicker result received');
      console.log('🔧 MANUAL IMPORT: Result type:', result.type);
      console.log('🔧 MANUAL IMPORT: Result object:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('🔧 MANUAL IMPORT: ❌ User cancelled file selection (or file access denied)');
        
        // Provide helpful feedback
        Alert.alert(
          'File Selection Cancelled', 
          'File selection was cancelled or access was denied. Try:\n' +
          '1. Select file from Downloads folder\n' +
          '2. Use QR code import instead\n' +
          '3. Copy file to accessible location',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('🔧 MANUAL IMPORT: ✅ File selected successfully');
        console.log('🔧 MANUAL IMPORT: File URI:', file.uri);        // ✅ file.uri not result.uri
        console.log('🔧 MANUAL IMPORT: File name:', file.name);      // ✅ file.name not result.name
        console.log('🔧 MANUAL IMPORT: File size:', file.size);      // ✅ file.size not result.size
        console.log('🔧 MANUAL IMPORT: File MIME type:', file.mimeType); // ✅ file.mimeType not result.mimeType

        // Check if file is accessible
        try {
          console.log('🔧 MANUAL IMPORT: Testing file access...');
          
          // ✅ With copyToCacheDirectory: true, use result.uri (copied location)
          const accessibleUri = result.uri || file.uri;
          console.log('🔧 MANUAL IMPORT: Using accessible URI:', accessibleUri);
          
          const fileInfo = await FileSystem.getInfoAsync(accessibleUri);  // ✅ Use copied URI
          console.log('🔧 MANUAL IMPORT: File info:', JSON.stringify(fileInfo, null, 2));
          
          if (!fileInfo.exists) {
            throw new Error('File does not exist or is not accessible');
          }

          console.log('🔧 MANUAL IMPORT: Reading file content...');
          const fileContent = await FileSystem.readAsStringAsync(accessibleUri);  // ✅ Use copied URI
          console.log('🔧 MANUAL IMPORT: File content length:', fileContent.length);
          console.log('🔧 MANUAL IMPORT: File content preview:', fileContent.substring(0, 100) + '...');
          // Test JSON parsing
          console.log('🔧 MANUAL IMPORT: Testing JSON parsing...');
          const jsonData = JSON.parse(fileContent);
          console.log('🔧 MANUAL IMPORT: JSON parsed successfully');
          console.log('🔧 MANUAL IMPORT: JSON windowId:', jsonData.windowId || jsonData.id);
          console.log('🔧 MANUAL IMPORT: JSON name:', jsonData.name);

          // Proceed with import
          console.log('🔧 MANUAL IMPORT: Proceeding with JSON template import...');
          await handleJSONFileImport(file.uri);
          
        } catch (fileError) {
          console.error('🔧 MANUAL IMPORT: ❌ File access/parsing error:', fileError);
          Alert.alert(
            'File Error', 
            `Could not access or parse file:\n${fileError.message}\n\nTry copying the file to Downloads folder.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('🔧 MANUAL IMPORT: ❌ Unexpected result type:', result.type);
        Alert.alert('Unexpected Result', `DocumentPicker returned unexpected type: ${result.type}`);
      }
      
    } catch (error) {
      console.error('🔧 MANUAL IMPORT: ❌ Fatal error:', error);
      Alert.alert('Import Error', `Fatal error during import:\n${error.message}`);
    }
  }, [handleJSONFileImport]);

  const clearJSONImport = useCallback(() => {
    console.log('🔧 JSON IMPORT: Clearing JSON import');
    
    Alert.alert(
      'Clear Import',
      'This will clear the imported template and return to the default provider. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Clear the imported data
            if (provider instanceof JSONFileDataProvider) {
              provider.clearImportedData();
            }
            
            // Reset import info
            setImportInfo(null);
          }
        }
      ]
    );
  }, [provider]);

  // ==================== SETUP INTENT LISTENERS ====================

  useEffect(() => {
    console.log('🔧 JSON IMPORT: Setting up intent listeners for JSON file handling');

    // Handle initial app launch with JSON file
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('🔧 JSON IMPORT: Initial URL:', initialUrl);
      
      if (initialUrl && (initialUrl.includes('.json') || initialUrl.includes('application/json'))) {
        console.log('🔧 JSON IMPORT: App launched with JSON file, importing...');
        handleJSONFileImport(initialUrl);
      }
    };

    // Handle JSON file opening while app is running
    const handleURLChange = (event: { url: string }) => {
      console.log('🔧 JSON IMPORT: URL change detected:', event.url);
      
      if (event.url && (event.url.includes('.json') || event.url.includes('application/json'))) {
        console.log('🔧 JSON IMPORT: JSON file opened while app running, importing...');
        handleJSONFileImport(event.url);
      }
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', handleURLChange);

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [handleJSONFileImport]);

  return {
    importInfo,
    handleJSONFileImport,
    handleManualJSONImport,
    clearJSONImport
  };
};