// Core iDempiere Application Dictionary types
export interface ADFieldDefinition {
  id: string;
  name: string;
  displayType: string;
  sequence: number;
  isMandatory: boolean;
  isReadOnly: boolean;
  isDisplayed: boolean;
  fieldLength: number;
  help?: string;
  description?: string;
  displayLogic?: string;
  validationRule?: string;
  reference?: ADReferenceDefinition;
  defaultValue?: any;
}

export interface ADReferenceDefinition {
  id: string;
  name: string;
  validationType: string;
  values?: Array<ADReferenceValue>;
}

export interface ADReferenceValue {
  key: string;
  value: string;
  description?: string;
  isActive?: boolean;
}

export interface ADTabDefinition {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  tabLevel: number;
  isReadOnly: boolean;
  isSingleRow: boolean;
  fields: ADFieldDefinition[];
}

export interface ADWindowDefinition {
  id: string;
  name: string;
  description?: string;
  windowType: string;
  tabs: ADTabDefinition[];
  metadata?: {
    version: string;
    lastModified: string;
    source: 'mock' | 'api' | 'cache';
  };
}

// Form data types
export interface FieldValue {
  key?: any;
  display?: string;
  raw?: any;
  metadata?: any;
}

export interface FormDataRecord {
  recordId?: string;
  windowId: string;
  data: Record<string, FieldValue>;
  metadata: {
    created: string;
    modified: string;
    status: 'draft' | 'submitted' | 'approved';
  };
}

export interface ValidationError {
  fieldId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SaveResult {
  success: boolean;
  recordId?: string;
  errors?: ValidationError[];
  warnings?: string[];
}

export interface WindowSummary {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isAvailable: boolean;
}
