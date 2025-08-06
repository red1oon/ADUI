import { DataProvider } from '../contracts/DataProvider';
import { 
  ADWindowDefinition, 
  ADTabDefinition, 
  ADFieldDefinition,
  WindowSummary, 
  ADReferenceValue, 
  FormDataRecord, 
  SaveResult 
} from '../../types/ADTypes';

export class APIDataProvider implements DataProvider {
  private baseUrl: string;
  private apiKey: string;
  private cache: Map<string, any> = new Map();

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getWindowDefinition(windowId: string): Promise<ADWindowDefinition> {
    const cacheKey = `window_${windowId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ad/window/${windowId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const rawData = await response.json();
      const windowDef = this.mapAPIResponseToWindow(rawData);
      
      this.cache.set(cacheKey, windowDef);
      return windowDef;
    } catch (error) {
      console.error('Failed to fetch window definition:', error);
      throw new Error(`Failed to load window ${windowId}: ${error.message}`);
    }
  }

  async getAvailableWindows(): Promise<WindowSummary[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ad/windows`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const rawData = await response.json();
      return rawData.map(this.mapAPIResponseToSummary);
    } catch (error) {
      console.error('Failed to fetch available windows:', error);
      throw new Error(`Failed to load windows: ${error.message}`);
    }
  }

  async getReferenceValues(referenceId: string): Promise<ADReferenceValue[]> {
    const cacheKey = `ref_${referenceId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ad/reference/${referenceId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const rawData = await response.json();
      this.cache.set(cacheKey, rawData.values);
      
      return rawData.values;
    } catch (error) {
      console.error('Failed to fetch reference values:', error);
      return [];
    }
  }

  async saveFormData(windowId: string, formData: FormDataRecord): Promise<SaveResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/data/${windowId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save form data:', error);
      throw new Error(`Failed to save: ${error.message}`);
    }
  }

  async getFormData(windowId: string, recordId?: string): Promise<FormDataRecord> {
    const url = recordId 
      ? `${this.baseUrl}/api/v1/data/${windowId}/${recordId}`
      : `${this.baseUrl}/api/v1/data/${windowId}/new`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch form data:', error);
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private mapAPIResponseToWindow(apiData: any): ADWindowDefinition {
    return {
      id: apiData.ad_window_id?.toString() || apiData.id,
      name: apiData.name,
      description: apiData.description,
      windowType: apiData.windowtype || 'Transaction',
      tabs: apiData.tabs?.map(this.mapAPIResponseToTab) || [],
      metadata: {
        version: apiData.version || '1.0.0',
        lastModified: apiData.updated || new Date().toISOString(),
        source: 'api'
      }
    };
  }

  private mapAPIResponseToTab(apiTab: any): ADTabDefinition {
    return {
      id: apiTab.ad_tab_id?.toString() || apiTab.id,
      name: apiTab.name,
      description: apiTab.description,
      sequence: apiTab.seqno || 10,
      tabLevel: apiTab.tablevel || 0,
      isReadOnly: apiTab.isreadonly === 'Y',
      isSingleRow: apiTab.issinglerow === 'Y',
      fields: apiTab.fields?.map(this.mapAPIResponseToField) || []
    };
  }

  private mapAPIResponseToField(apiField: any): ADFieldDefinition {
    return {
      id: apiField.ad_field_id?.toString() || apiField.id,
      name: apiField.name,
      displayType: apiField.ad_reference?.name || 'String',
      sequence: apiField.seqno || 10,
      isMandatory: apiField.ismandatory === 'Y',
      isReadOnly: apiField.isreadonly === 'Y',
      isDisplayed: apiField.isdisplayed === 'Y',
      fieldLength: apiField.fieldlength || 0,
      help: apiField.help,
      description: apiField.description,
      displayLogic: apiField.displaylogic,
      validationRule: apiField.ad_val_rule?.code,
      reference: apiField.ad_reference ? {
        id: apiField.ad_reference.id?.toString(),
        name: apiField.ad_reference.name,
        validationType: apiField.ad_reference.validationtype || 'LIST'
      } : undefined
    };
  }

  private mapAPIResponseToSummary(apiData: any): WindowSummary {
    return {
      id: apiData.ad_window_id?.toString() || apiData.id,
      name: apiData.name,
      description: apiData.description,
      category: apiData.category || 'General',
      isAvailable: apiData.isactive === 'Y'
    };
  }
}
