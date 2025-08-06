// Mock iDempiere AD Window Definitions for POC
// This simulates the metadata structure from iDempiere Application Dictionary

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
  reference?: {
    id: string;
    name: string;
    validationType: string;
    values?: Array<{ key: string; value: string; description?: string }>;
  };
  defaultValue?: any;
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
}

// Sample window definitions will be added here
export const SAMPLE_WINDOWS: ADWindowDefinition[] = [
  // Equipment Inspection Window
  // Safety Audit Window  
  // Asset Verification Window
];
