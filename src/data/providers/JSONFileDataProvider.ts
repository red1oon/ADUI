// JSONFileDataProvider.ts v2.0 - Enhanced Diagnostics for WindowID Resolution
// Comprehensive logging for JSON template import troubleshooting

import { DataProvider } from '../contracts/DataProvider';
import { 
  ADWindowDefinition, 
  WindowSummary, 
  ADReferenceValue, 
  FormDataRecord, 
  SaveResult 
} from '../../types/ADTypes';
import { MetadataAdapter } from '../../utils/MetadataAdapter';

interface ImportDiagnostics {
  stage: string;
  success: boolean;
  details: string;
  timestamp: string;
  data?: any;
}

export class JSONFileDataProvider implements DataProvider {
  private windowData: Map<string, ADWindowDefinition> = new Map();
  private referenceData: Map<string, ADReferenceValue[]> = new Map();
  private formData: Map<string, FormDataRecord> = new Map();
  private importedTemplate: any = null;
  private importTimestamp: string | null = null;
  private importDiagnostics: ImportDiagnostics[] = [];

  constructor() {
    console.log('🔧 JSONFileDataProvider v2.0: Initialized with enhanced diagnostics');
    this.logDiagnostic('initialization', true, 'JSONFileDataProvider v2.0 initialized');
  }

  // ==================== ENHANCED DIAGNOSTIC LOGGING ====================

  private logDiagnostic(stage: string, success: boolean, details: string, data?: any): void {
    const diagnostic: ImportDiagnostics = {
      stage,
      success,
      details,
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data, null, 2) : undefined
    };
    
    this.importDiagnostics.push(diagnostic);
    
    const logLevel = success ? '✅' : '❌';
    console.log(`🔧 JSONFileDataProvider v2.0: ${logLevel} [${stage.toUpperCase()}] ${details}`);
    
    if (data && Object.keys(data).length > 0) {
      console.log(`🔧 JSONFileDataProvider v2.0: [${stage.toUpperCase()}] Data:`, data);
    }
  }

  private logError(stage: string, error: any): void {
    const errorDetails = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack || 'No stack trace',
      toString: error.toString()
    };
    
    this.logDiagnostic(stage, false, `Error: ${errorDetails.message}`, errorDetails);
  }

  // ==================== ENHANCED FILE IMPORT METHODS ====================

  /**
   * Import JSON template with comprehensive diagnostics
   * @param fileUri - File URI from document picker or email attachment
   * @param jsonContent - Optional pre-loaded JSON content
   */
  async importJSONTemplate(fileUri: string, jsonContent?: string): Promise<boolean> {
    console.log('🔧 JSONFileDataProvider v2.0: ======== STARTING IMPORT PROCESS ========');
    this.importDiagnostics = []; // Clear previous diagnostics
    
    this.logDiagnostic('import_start', true, `Starting JSON template import from: ${fileUri}`);

    try {
      // ==================== STAGE 1: FILE ACCESS VALIDATION ====================
      await this.validateFileAccess(fileUri);

      // ==================== STAGE 2: CONTENT READING ====================
      const rawJson = await this.readFileContent(fileUri, jsonContent);

      // ==================== STAGE 3: JSON PARSING ====================
      const templateData = await this.parseJSONContent(rawJson);

      // ==================== STAGE 4: TEMPLATE STRUCTURE VALIDATION ====================
      await this.validateTemplateStructure(templateData);

      // ==================== STAGE 5: WINDOW ID EXTRACTION & ANALYSIS ====================
      const extractedWindowId = await this.extractAndAnalyzeWindowId(templateData);

      // ==================== STAGE 6: METADATA ADAPTATION ====================
      const adaptedWindow = await this.adaptTemplateToADFormat(templateData, extractedWindowId);

      // ==================== STAGE 7: DATA STORAGE ====================
      await this.storeImportedData(templateData, adaptedWindow);

      // ==================== STAGE 8: REFERENCE DATA EXTRACTION ====================
      await this.extractReferenceData(templateData);

      // ==================== IMPORT SUCCESS ====================
      this.logDiagnostic('import_complete', true, `Successfully imported template: ${extractedWindowId}`, {
        windowId: extractedWindowId,
        windowName: adaptedWindow.name,
        tabCount: adaptedWindow.tabs?.length || 0,
        referenceCount: this.referenceData.size,
        totalImportStages: this.importDiagnostics.length
      });

      console.log('🔧 JSONFileDataProvider v2.0: ======== IMPORT COMPLETED SUCCESSFULLY ========');
      return true;

    } catch (error) {
      this.logError('import_failed', error);
      console.log('🔧 JSONFileDataProvider v2.0: ======== IMPORT FAILED ========');
      console.log('🔧 JSONFileDataProvider v2.0: Full diagnostic log:', this.importDiagnostics);
      throw new Error(`Failed to import JSON template: ${error.message}`);
    }
  }

  // ==================== ENHANCED IMPORT STAGES ====================

  private async validateFileAccess(fileUri: string): Promise<void> {
    this.logDiagnostic('file_access_check', true, `Checking file accessibility: ${fileUri}`, {
      fileUri,
      uriType: fileUri.startsWith('file://') ? 'file_system' : 
               fileUri.startsWith('content://') ? 'content_provider' : 
               fileUri.startsWith('http') ? 'remote_url' : 'unknown'
    });

    // Additional file access validation could be added here
    // For now, we proceed to content reading which will catch access issues
  }

  private async readFileContent(fileUri: string, providedContent?: string): Promise<string> {
    if (providedContent) {
      this.logDiagnostic('content_reading', true, 'Using provided JSON content', {
        contentLength: providedContent.length,
        contentPreview: providedContent.substring(0, 200) + (providedContent.length > 200 ? '...' : '')
      });
      return providedContent;
    }

    this.logDiagnostic('content_reading', true, 'Reading JSON content from file system');
    
    try {
      const { FileSystem } = require('expo-file-system');
      const rawJson = await FileSystem.readAsStringAsync(fileUri);
      
      this.logDiagnostic('content_reading', true, 'Successfully read file content', {
        contentLength: rawJson.length,
        encoding: 'utf8',
        contentPreview: rawJson.substring(0, 200) + (rawJson.length > 200 ? '...' : '')
      });
      
      return rawJson;
    } catch (error) {
      this.logError('content_reading', error);
      throw new Error(`Cannot read JSON file: ${error.message}`);
    }
  }

  private async parseJSONContent(rawJson: string): Promise<any> {
    this.logDiagnostic('json_parsing', true, 'Starting JSON parsing', {
      contentLength: rawJson.length,
      startsWithBrace: rawJson.trim().startsWith('{'),
      endsWithBrace: rawJson.trim().endsWith('}')
    });

    try {
      const templateData = JSON.parse(rawJson);
      
      this.logDiagnostic('json_parsing', true, 'JSON parsing successful', {
        topLevelKeys: Object.keys(templateData),
        hasWindowId: !!(templateData.windowId || templateData.id),
        hasName: !!templateData.name,
        hasTabs: !!(templateData.tabs && Array.isArray(templateData.tabs)),
        dataType: typeof templateData
      });
      
      return templateData;
    } catch (error) {
      this.logError('json_parsing', error);
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }

  private async validateTemplateStructure(template: any): Promise<void> {
    this.logDiagnostic('structure_validation', true, 'Starting template structure validation');

    const validationResults = {
      hasId: !!(template.windowId || template.id),
      hasName: !!template.name,
      hasTabs: !!(template.tabs && Array.isArray(template.tabs)),
      tabCount: template.tabs ? template.tabs.length : 0,
      invalidTabs: []
    };

    // Check required top-level fields
    if (!validationResults.hasId) {
      this.logDiagnostic('structure_validation', false, 'Missing required windowId or id field', validationResults);
      throw new Error('Template missing required windowId or id field');
    }

    if (!validationResults.hasName) {
      this.logDiagnostic('structure_validation', false, 'Missing required name field', validationResults);
      throw new Error('Template missing required name field');
    }

    if (!validationResults.hasTabs) {
      this.logDiagnostic('structure_validation', false, 'Missing or invalid tabs array', validationResults);
      throw new Error('Template missing required tabs array');
    }

    // Validate tab structure
    for (let i = 0; i < template.tabs.length; i++) {
      const tab = template.tabs[i];
      const tabValidation = {
        index: i,
        hasId: !!(tab.tabId || tab.id),
        hasFields: !!(tab.fields && Array.isArray(tab.fields)),
        fieldCount: tab.fields ? tab.fields.length : 0
      };

      if (!tabValidation.hasId || !tabValidation.hasFields) {
        validationResults.invalidTabs.push(tabValidation);
      }
    }

    if (validationResults.invalidTabs.length > 0) {
      this.logDiagnostic('structure_validation', false, 'Invalid tab structures found', {
        ...validationResults,
        invalidTabDetails: validationResults.invalidTabs
      });
      throw new Error(`${validationResults.invalidTabs.length} tabs have invalid structure`);
    }

    this.logDiagnostic('structure_validation', true, 'Template structure validation successful', validationResults);
  }

  private async extractAndAnalyzeWindowId(template: any): Promise<string> {
    this.logDiagnostic('windowid_extraction', true, 'Starting windowId extraction and analysis');

    const windowIdAnalysis = {
      rawWindowId: template.windowId,
      rawId: template.id,
      templateName: template.name,
      extractedWindowId: null,
      extractionMethod: null
    };

    // Primary extraction: windowId field
    if (template.windowId) {
      windowIdAnalysis.extractedWindowId = template.windowId;
      windowIdAnalysis.extractionMethod = 'windowId_field';
    }
    // Fallback: id field
    else if (template.id) {
      windowIdAnalysis.extractedWindowId = template.id;
      windowIdAnalysis.extractionMethod = 'id_field';
    }
    // Last resort: generate from name
    else if (template.name) {
      windowIdAnalysis.extractedWindowId = template.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      windowIdAnalysis.extractionMethod = 'generated_from_name';
    }

    if (!windowIdAnalysis.extractedWindowId) {
      this.logDiagnostic('windowid_extraction', false, 'Unable to extract or generate windowId', windowIdAnalysis);
      throw new Error('Cannot determine windowId from template');
    }

    this.logDiagnostic('windowid_extraction', true, 'WindowId extraction successful', windowIdAnalysis);
    
    // Additional analysis for troubleshooting
    this.logDiagnostic('windowid_analysis', true, 'WindowId compatibility analysis', {
      extractedWindowId: windowIdAnalysis.extractedWindowId,
      isHardcodedMatch: windowIdAnalysis.extractedWindowId === 'EQUIP_INSPECTION',
      recommendedAppUsage: windowIdAnalysis.extractedWindowId,
      migrationRequired: windowIdAnalysis.extractedWindowId !== 'EQUIP_INSPECTION'
    });

    return windowIdAnalysis.extractedWindowId;
  }

  private async adaptTemplateToADFormat(template: any, windowId: string): Promise<ADWindowDefinition> {
    this.logDiagnostic('metadata_adaptation', true, 'Starting MetadataAdapter conversion', {
      inputWindowId: windowId,
      templateName: template.name,
      tabCount: template.tabs?.length || 0
    });

    try {
      const adaptedWindow = MetadataAdapter.adaptWindowDefinition(template);
      
      this.logDiagnostic('metadata_adaptation', true, 'MetadataAdapter conversion successful', {
        originalWindowId: windowId,
        adaptedWindowId: adaptedWindow.id,
        adaptedName: adaptedWindow.name,
        adaptedTabCount: adaptedWindow.tabs?.length || 0,
        windowIdChanged: windowId !== adaptedWindow.id
      });
      
      return adaptedWindow;
    } catch (error) {
      this.logError('metadata_adaptation', error);
      throw new Error(`MetadataAdapter failed: ${error.message}`);
    }
  }

  private async storeImportedData(template: any, adaptedWindow: ADWindowDefinition): Promise<void> {
    this.logDiagnostic('data_storage', true, 'Storing imported template data', {
      windowId: adaptedWindow.id,
      templateTimestamp: new Date().toISOString()
    });

    this.importedTemplate = template;
    this.importTimestamp = new Date().toISOString();
    this.windowData.set(adaptedWindow.id, adaptedWindow);

    this.logDiagnostic('data_storage', true, 'Data storage successful', {
      storedWindowId: adaptedWindow.id,
      windowDataSize: this.windowData.size,
      importTimestamp: this.importTimestamp
    });
  }

  private async extractReferenceData(template: any): Promise<void> {
    this.logDiagnostic('reference_extraction', true, 'Starting reference data extraction');
    
    const extractionSummary = {
      totalReferences: 0,
      extractedReferences: [],
      skippedFields: 0
    };

    for (const tab of template.tabs) {
      for (const field of tab.fields) {
        if (field.reference && field.reference.values) {
          const refId = field.reference.id || `REF_${field.fieldId}`;
          this.referenceData.set(refId, field.reference.values);
          
          extractionSummary.totalReferences++;
          extractionSummary.extractedReferences.push({
            referenceId: refId,
            fieldId: field.fieldId,
            valueCount: field.reference.values.length
          });
          
          console.log(`🔧 JSONFileDataProvider v2.0: Stored reference: ${refId} (${field.reference.values.length} values)`);
        } else {
          extractionSummary.skippedFields++;
        }
      }
    }

    this.logDiagnostic('reference_extraction', true, 'Reference data extraction complete', extractionSummary);
  }

  // ==================== DIAGNOSTIC REPORTING ====================

  /**
   * Get detailed import diagnostics for troubleshooting
   */
  getImportDiagnostics(): ImportDiagnostics[] {
    return [...this.importDiagnostics];
  }

  /**
   * Get import info with enhanced diagnostics
   */
  getImportInfo(): { 
    template: any; 
    timestamp: string | null; 
    windowCount: number;
    diagnostics: ImportDiagnostics[];
    lastWindowId?: string;
  } {
    const lastWindowId = Array.from(this.windowData.keys())[0];
    
    return {
      template: this.importedTemplate,
      timestamp: this.importTimestamp,
      windowCount: this.windowData.size,
      diagnostics: this.importDiagnostics,
      lastWindowId
    };
  }

  // ==================== DATAPROVIDER INTERFACE ====================

  async isConnected(): Promise<boolean> {
    const connected = this.windowData.size > 0;
    console.log(`🔧 JSONFileDataProvider v2.0: Connection check: ${connected} (${this.windowData.size} windows loaded)`);
    return connected;
  }

  async getWindowDefinition(windowId: string): Promise<ADWindowDefinition> {
    console.log(`🔧 JSONFileDataProvider v2.0: Getting window definition: ${windowId}`);
    
    // Enhanced logging for windowId lookup
    const availableWindowIds = Array.from(this.windowData.keys());
    console.log(`🔧 JSONFileDataProvider v2.0: Available windowIds: [${availableWindowIds.join(', ')}]`);
    
    const windowDef = this.windowData.get(windowId);
    if (!windowDef) {
      const lookupError = {
        requestedWindowId: windowId,
        availableWindowIds,
        isExactMatch: availableWindowIds.includes(windowId),
        possibleMatches: availableWindowIds.filter(id => 
          id.toLowerCase().includes(windowId.toLowerCase()) || 
          windowId.toLowerCase().includes(id.toLowerCase())
        )
      };
      
      console.error('🔧 JSONFileDataProvider v2.0: ❌ Window definition lookup failed:', lookupError);
      throw new Error(`Window definition not found: ${windowId}. Available: [${availableWindowIds.join(', ')}]. Import a JSON template first.`);
    }

    console.log(`🔧 JSONFileDataProvider v2.0: ✅ Returning window definition for: ${windowId}`);
    return windowDef;
  }

  async getAvailableWindows(): Promise<WindowSummary[]> {
    console.log('🔧 JSONFileDataProvider v2.0: Getting available windows');
    
    const windows: WindowSummary[] = Array.from(this.windowData.values()).map(window => ({
      id: window.id,
      name: window.name,
      description: window.description || 'Imported from JSON template',
      windowType: window.windowType || 'Transaction',
      isActive: true
    }));

    console.log(`🔧 JSONFileDataProvider v2.0: ✅ Returning ${windows.length} available windows:`, 
      windows.map(w => `${w.id} (${w.name})`));
    return windows;
  }

  async getReferenceValues(referenceId: string): Promise<ADReferenceValue[]> {
  console.log(`🔧 JSONFileDataProvider v2.0: Getting reference values for: ${referenceId}`);
  
  // FIXED: Check for embedded reference data first (like ExternalMetadataProvider)
  if (MetadataAdapter.isEmbeddedReference(referenceId)) {
    console.log(`🔧 JSONFileDataProvider v2.0: Looking for embedded reference: ${referenceId}`);
    const embeddedValues = MetadataAdapter.getEmbeddedReferenceValues(referenceId);
    
    if (embeddedValues) {
      console.log(`🔧 JSONFileDataProvider v2.0: ✅ Found embedded reference with ${embeddedValues.length} values`);
      return embeddedValues;
    } else {
      console.warn(`🔧 JSONFileDataProvider v2.0: ⚠️ Embedded reference ${referenceId} not found in MetadataAdapter`);
    }
  }
  
  // Fallback: Check local reference data storage
  const values = this.referenceData.get(referenceId) || [];
  console.log(`🔧 JSONFileDataProvider v2.0: ✅ Returning ${values.length} reference values from local storage for: ${referenceId}`);
  return values;
}

  async saveFormData(windowId: string, formData: FormDataRecord): Promise<SaveResult> {
    console.log(`🔧 JSONFileDataProvider v2.0: Saving form data for window: ${windowId}`);
    
    const recordId = `IMPORT_${Date.now()}`;
    const storageKey = `${windowId}_${recordId}`;
    this.formData.set(storageKey, formData);

    console.log(`🔧 JSONFileDataProvider v2.0: ✅ Form data saved with record ID: ${recordId}`);
    
    return {
      success: true,
      recordId,
      message: `Form data saved successfully from imported template. Record ID: ${recordId}`,
      timestamp: new Date().toISOString()
    };
  }

  async getFormData(windowId: string, recordId?: string): Promise<FormDataRecord> {
    console.log(`🔧 JSONFileDataProvider v2.0: Getting form data for: ${windowId} ${recordId || '(new)'}`);
    
    if (recordId) {
      const storageKey = `${windowId}_${recordId}`;
      const data = this.formData.get(storageKey) || {};
      console.log(`🔧 JSONFileDataProvider v2.0: ✅ Returning saved form data for: ${recordId}`);
      return data;
    }

    console.log(`🔧 JSONFileDataProvider v2.0: ✅ Returning empty form data for new form`);
    return {};
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear imported data with enhanced logging
   */
  clearImportedData(): void {
    console.log('🔧 JSONFileDataProvider v2.0: Clearing all imported data');
    
    const clearSummary = {
      windowDataCleared: this.windowData.size,
      referenceDataCleared: this.referenceData.size,
      formDataCleared: this.formData.size,
      diagnosticsCleared: this.importDiagnostics.length
    };
    
    this.windowData.clear();
    this.referenceData.clear();
    this.formData.clear();
    this.importedTemplate = null;
    this.importTimestamp = null;
    this.importDiagnostics = [];
    
    console.log('🔧 JSONFileDataProvider v2.0: ✅ Clear operation complete:', clearSummary);
  }

  /**
   * Get comprehensive provider status
   */
  getProviderStatus(): {
    type: string;
    version: string;
    hasImportedData: boolean;
    importTimestamp: string | null;
    windowCount: number;
    referenceCount: number;
    formDataCount: number;
    diagnosticsCount: number;
    lastImportSuccess: boolean;
  } {
    const lastDiagnostic = this.importDiagnostics[this.importDiagnostics.length - 1];
    
    return {
      type: 'JSONFileDataProvider',
      version: '2.0',
      hasImportedData: this.importedTemplate !== null,
      importTimestamp: this.importTimestamp,
      windowCount: this.windowData.size,
      referenceCount: this.referenceData.size,
      formDataCount: this.formData.size,
      diagnosticsCount: this.importDiagnostics.length,
      lastImportSuccess: lastDiagnostic ? lastDiagnostic.success : false
    };
  }
}