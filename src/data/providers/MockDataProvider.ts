import { DataProvider } from '../contracts/DataProvider';
import { 
  ADWindowDefinition, 
  WindowSummary, 
  ADReferenceValue, 
  FormDataRecord, 
  SaveResult 
} from '../../types/ADTypes';

export class MockDataProvider implements DataProvider {
  private windows: Map<string, ADWindowDefinition> = new Map();
  
  constructor() {
    this.initializeMockData();
  }

  async getWindowDefinition(windowId: string): Promise<ADWindowDefinition> {
    // Simulate API delay
    await this.delay(100);
    
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window ${windowId} not found`);
    }
    
    return {
      ...window,
      metadata: {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        source: 'mock'
      }
    };
  }

  async getAvailableWindows(): Promise<WindowSummary[]> {
    await this.delay(50);
    
    return Array.from(this.windows.values()).map(window => ({
      id: window.id,
      name: window.name,
      description: window.description,
      category: 'Field Operations',
      isAvailable: true
    }));
  }

  async getReferenceValues(referenceId: string): Promise<ADReferenceValue[]> {
    await this.delay(50);
    
    // Mock reference data
    const mockReferences: Record<string, ADReferenceValue[]> = {
      'CONDITION_LIST': [
        { key: 'EXCELLENT', value: 'Excellent', description: 'No issues, perfect condition' },
        { key: 'GOOD', value: 'Good', description: 'Minor wear, fully functional' },
        { key: 'FAIR', value: 'Fair', description: 'Some issues, needs attention' },
        { key: 'POOR', value: 'Poor', description: 'Major issues, repair needed' },
        { key: 'CRITICAL', value: 'Critical', description: 'Unsafe, immediate action required' }
      ],
      'RISK_LEVELS': [
        { key: 'LOW', value: 'Low Risk', description: 'Minimal safety concern' },
        { key: 'MEDIUM', value: 'Medium Risk', description: 'Some safety precautions needed' },
        { key: 'HIGH', value: 'High Risk', description: 'Significant safety concern' },
        { key: 'CRITICAL', value: 'Critical Risk', description: 'Immediate action required' }
      ]
    };
    
    return mockReferences[referenceId] || [];
  }

  async saveFormData(windowId: string, formData: FormDataRecord): Promise<SaveResult> {
    await this.delay(200);
    
    // Mock save operation
    return {
      success: true,
      recordId: `REC_${Date.now()}`,
      errors: [],
      warnings: []
    };
  }

  async getFormData(windowId: string, recordId?: string): Promise<FormDataRecord> {
    await this.delay(100);
    
    // Return empty form data for new records
    return {
      recordId: recordId || undefined,
      windowId,
      data: {},
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        status: 'draft'
      }
    };
  }

  async isConnected(): Promise<boolean> {
    return true; // Mock always connected
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeMockData(): void {
    // Equipment Inspection Window
    this.windows.set('EQUIP_INSPECTION', {
      id: 'EQUIP_INSPECTION',
      name: 'Equipment Inspection',
      description: 'Dynamic form for equipment inspections',
      windowType: 'Transaction',
      tabs: [
        {
          id: 'TAB_GENERAL',
          name: 'General',
          sequence: 10,
          tabLevel: 0,
          isReadOnly: false,
          isSingleRow: true,
          fields: [
            {
              id: 'ASSET_ID',
              name: 'Asset ID',
              displayType: 'QRCode',
              sequence: 10,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 50,
              help: 'Scan QR code on equipment'
            },
            {
              id: 'LOCATION_REF',
              name: 'Location',
              displayType: 'String',
              sequence: 20,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 100,
              help: 'Building, floor, room reference'
            },
            {
              id: 'CONDITION',
              name: 'Condition',
              displayType: 'List',
              sequence: 30,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              reference: {
                id: 'CONDITION_LIST',
                name: 'Equipment Condition',
                validationType: 'LIST'
              }
            },
            {
              id: 'OPERATIONAL',
              name: 'Operational',
              displayType: 'YesNo',
              sequence: 40,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              help: 'Is equipment currently operational?'
            },
            {
              id: 'NOTES',
              name: 'Inspection Notes',
              displayType: 'Text',
              sequence: 50,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 2000,
              help: 'Detailed inspection observations'
            }
          ]
        },
        {
          id: 'TAB_PHOTOS',
          name: 'Photos',
          sequence: 20,
          tabLevel: 0,
          isReadOnly: false,
          isSingleRow: true,
          fields: [
            {
              id: 'OVERVIEW_PHOTO',
              name: 'Overview Photo',
              displayType: 'Camera',
              sequence: 10,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              help: 'Overall view of equipment'
            },
            {
              id: 'DETAIL_PHOTO',
              name: 'Detail Photo',
              displayType: 'Camera',
              sequence: 20,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              help: 'Close-up of specific components'
            },
            {
              id: 'NAMEPLATE_PHOTO',
              name: 'Nameplate Photo',
              displayType: 'Camera',
              sequence: 30,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              help: 'Equipment nameplate and serial number'
            }
          ]
        }
      ]
    });

    // Safety Audit Window
    this.windows.set('SAFETY_AUDIT', {
      id: 'SAFETY_AUDIT',
      name: 'Safety Audit',
      description: 'Workplace safety inspection checklist',
      windowType: 'Transaction',
      tabs: [
        {
          id: 'TAB_AUDIT',
          name: 'Safety Check',
          sequence: 10,
          tabLevel: 0,
          isReadOnly: false,
          isSingleRow: true,
          fields: [
            {
              id: 'AREA_CODE',
              name: 'Area Code',
              displayType: 'QRCode',
              sequence: 10,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 50,
              help: 'Scan area identification code'
            },
            {
              id: 'PPE_COMPLIANCE',
              name: 'PPE Compliance',
              displayType: 'YesNo',
              sequence: 20,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              help: 'Personal protective equipment properly used?'
            },
            {
              id: 'HAZARD_LEVEL',
              name: 'Risk Level',
              displayType: 'List',
              sequence: 30,
              isMandatory: true,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              reference: {
                id: 'RISK_LEVELS',
                name: 'Risk Assessment',
                validationType: 'LIST'
              }
            },
            {
              id: 'IMMEDIATE_ACTION',
              name: 'Immediate Action Required',
              displayType: 'YesNo',
              sequence: 40,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 0,
              displayLogic: "@HAZARD_LEVEL@='HIGH' || @HAZARD_LEVEL@='CRITICAL'"
            },
            {
              id: 'SAFETY_NOTES',
              name: 'Safety Observations',
              displayType: 'Text',
              sequence: 50,
              isMandatory: false,
              isReadOnly: false,
              isDisplayed: true,
              fieldLength: 2000,
              help: 'Detailed safety observations and recommendations'
            }
          ]
        }
      ]
    });
  }
}
