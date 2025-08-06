import { 
  ADWindowDefinition, 
  ADReferenceValue, 
  WindowSummary, 
  FormDataRecord, 
  SaveResult 
} from '../../types/ADTypes';

export interface DataProvider {
  // Window Definitions
  getWindowDefinition(windowId: string): Promise<ADWindowDefinition>;
  getAvailableWindows(): Promise<WindowSummary[]>;
  
  // Reference Data
  getReferenceValues(referenceId: string): Promise<ADReferenceValue[]>;
  
  // Form Data Operations
  saveFormData(windowId: string, formData: FormDataRecord): Promise<SaveResult>;
  getFormData(windowId: string, recordId?: string): Promise<FormDataRecord>;
  
  // Health Check
  isConnected(): Promise<boolean>;
}
