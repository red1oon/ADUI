// MetadataAdapter.ts v1.3 - Complete Fixed Version with Embedded Reference Support
// FIXES: SelectField dropdown not showing - properly handles embedded reference data
// Converts external metadata format to internal FieldRenderer format
// Save as: src/utils/MetadataAdapter.ts

export class MetadataAdapter {
  
  // Static storage for embedded reference data
  private static embeddedReferences: Map<string, any[]> = new Map();
  
  // Component mapping from external to internal format
  private static componentTypeMap: Record<string, string> = {
    'QRCollectorField': 'QRCollector',
    'MultiPhotoField': 'MultiPhoto',
    'QRCodeField': 'QRCode',
    'QRChecklistField': 'QRChecklist', 
    'FlippableQRChecklistField': 'FlippableQRChecklist',
    'TaskListField': 'TaskList',             
    'TextField': 'String', 
    'TextAreaField': 'Text',
    'SelectField': 'List',
    'YesNoField': 'YesNo',
    'CameraField': 'Camera',
    'NumberField': 'Integer'
  };

  // Convert external window definition to internal format
  static adaptWindowDefinition(externalWindow: any): any {
    console.log('🔧 ADAPTER v1.3: Converting external window format to internal format');
    console.log('🔧 ADAPTER: External window:', externalWindow.windowId || externalWindow.id);

    // Clear previous embedded references for this window
    this.embeddedReferences.clear();

    const adaptedWindow = {
      // Map basic window properties
      id: externalWindow.windowId || externalWindow.id,
      name: externalWindow.name,
      description: externalWindow.description,
      windowType: externalWindow.windowType || 'Transaction',
      
      // Convert tabs
      tabs: externalWindow.tabs.map((externalTab: any) => this.adaptTab(externalTab)),
      
      // Preserve metadata with source tracking
      metadata: {
        ...externalWindow.metadata,
        source: externalWindow.metadata?.source || 'external-metadata-server',
        fetchedAt: new Date().toISOString(),
        adaptedAt: new Date().toISOString(),
        originalFormat: 'external-json',
        internalFormat: 'adui-v1.3'
      }
    };

    // Call debug method
    this.debugConversion(externalWindow, adaptedWindow);
    
    console.log('🔧 ADAPTER v1.3: Stored', this.embeddedReferences.size, 'embedded references');
    
    return adaptedWindow;
  }

  // Convert external tab to internal format
  private static adaptTab(externalTab: any): any {
    console.log('🔧 ADAPTER: Converting tab:', externalTab.name);
    
    return {
      id: externalTab.tabId || externalTab.id,
      tabId: externalTab.tabId || externalTab.id, // Keep both for compatibility
      name: externalTab.name,
      description: externalTab.description,
      sequence: externalTab.sequence || 10,
      tabLevel: externalTab.tabLevel || 0,
      isReadOnly: externalTab.isReadOnly || false,
      isSingleRow: externalTab.isSingleRow !== false,
      
      // Convert fields
      fields: externalTab.fields.map((externalField: any) => this.adaptField(externalField))
    };
  }

  // Convert external field to internal format  
  private static adaptField(externalField: any): any {
    console.log('🔧 ADAPTER: Converting field:', externalField.name, 'Component:', externalField.component);
    
    // Map component type to display type
    const displayType = this.componentTypeMap[externalField.component] || 'String';
    
    const adaptedField = {
      // Basic field properties
      id: externalField.fieldId || externalField.id,
      fieldId: externalField.fieldId || externalField.id, // Keep both for compatibility
      name: externalField.name,
      displayType: displayType,
      sequence: externalField.sequence || 10,
      
      // Validation properties
      isMandatory: externalField.validation?.required || false,
      isReadOnly: externalField.isReadOnly || false,
      isDisplayed: externalField.isDisplayed !== false,
      fieldLength: externalField.validation?.maxLength || 0,
      
      // Help and description
      help: externalField.ui?.helpText || externalField.help,
      description: externalField.description,
      
      // Display logic (temporarily disabled to avoid evaluation errors)
      displayLogic: this.adaptDisplayLogic(externalField.displayLogic),
      
      // FIXED: Reference data for dropdowns with proper embedded handling
      reference: this.adaptReference(externalField.reference, externalField.fieldId || externalField.id),
      
      // Handle data for complex components
      data: this.adaptFieldData(externalField.data, externalField.component),
      
      // Handle UI configuration for complex components
      ui: this.adaptUIConfig(externalField.ui, externalField.component),
      
      // Preserve original field configuration for debugging
      _originalComponent: externalField.component,
      _originalValidation: externalField.validation,
      _originalUI: externalField.ui
    };

    console.log('🔧 ADAPTER: Adapted field:', adaptedField.name, 'DisplayType:', adaptedField.displayType);
    return adaptedField;
  }

  // Adapt display logic (simplified - complex evaluation disabled for now)
  private static adaptDisplayLogic(displayLogic: string | undefined): string | undefined {
    if (!displayLogic) return undefined;
    
    console.log('🔧 ADAPTER: Display logic found:', displayLogic);
    
    // For now, return undefined to disable complex display logic
    // This prevents evaluation errors until proper expression engine is implemented
    console.log('🔧 ADAPTER: ⚠️ Disabling complex display logic for stability');
    return undefined;
    
    // TODO: Implement proper display logic evaluation
    // return this.translateDisplayLogic(displayLogic);
  }

  // FIXED: Adapt reference data for dropdowns - handles embedded references properly
  private static adaptReference(reference: any, fieldId: string): any {
    if (!reference || !reference.values) return undefined;
    
    console.log('🔧 ADAPTER: Converting reference data with', reference.values.length, 'values');
    
    let referenceId: string;
    
    if (reference.id) {
      // External reference - use provided ID
      referenceId = reference.id;
      console.log('🔧 ADAPTER: Using external reference ID:', referenceId);
    } else {
      // Embedded reference - generate unique ID and store data
      referenceId = `${fieldId}_EMBEDDED_REF`;
      
      // Convert and store embedded reference data
      const convertedValues = reference.values.map((value: any) => ({
        key: value.key,
        value: value.display || value.value,
        description: value.description,
        // Preserve additional properties
        color: value.color,
        icon: value.icon,
        sortOrder: value.sortOrder
      }));
      
      // Store in static map for retrieval by data provider
      this.embeddedReferences.set(referenceId, convertedValues);
      
      console.log('🔧 ADAPTER: ✅ Stored embedded reference:', referenceId, 'with', convertedValues.length, 'values');
    }
    
    return {
      id: referenceId,
      name: reference.name || 'Reference',
      validationType: reference.validationType || 'LIST',
      values: reference.values.map((value: any) => ({
        key: value.key,
        value: value.display || value.value,
        description: value.description,
        // Preserve additional properties
        color: value.color,
        icon: value.icon,
        sortOrder: value.sortOrder
      }))
    };
  }

  // NEW: Static method to get embedded reference data (for data providers)
  static getEmbeddedReferenceValues(referenceId: string): any[] | null {
    const values = this.embeddedReferences.get(referenceId);
    if (values) {
      console.log('🔧 ADAPTER: Retrieved embedded reference:', referenceId, 'with', values.length, 'values');
      return values;
    }
    console.log('🔧 ADAPTER: No embedded reference found for:', referenceId);
    return null;
  }

  // NEW: Static method to check if reference is embedded
  static isEmbeddedReference(referenceId: string): boolean {
    return referenceId.endsWith('_EMBEDDED_REF');
  }

  // NEW: Static method to clear embedded references (for cleanup)
  static clearEmbeddedReferences(): void {
    this.embeddedReferences.clear();
    console.log('🔧 ADAPTER: Cleared all embedded references');
  }

  // Adapt field data based on component type
  private static adaptFieldData(data: any, componentType: string): any {
    if (!data) return undefined;
    
    console.log('🔧 ADAPTER: Converting field data for component:', componentType);
    
    switch (componentType) {
      case 'TaskListField':
        // Pass through TaskList data structure completely
        console.log('🔧 ADAPTER: TaskList data - tasks:', data.tasks?.length || 0, 'relationships:', data.relationships?.length || 0);
        return {
          tasks: data.tasks || [],
          relationships: data.relationships || [],
          layout: data.layout || {},
          projectInfo: data.projectInfo || {}
        };
        
      case 'QRChecklistField':
      case 'FlippableQRChecklistField':
        // Handle checklist data
        console.log('🔧 ADAPTER: Checklist data - items:', data.items?.length || 0);
        return {
          items: data.items || [],
          scanSettings: data.scanSettings || {}
        };
        
      case 'QRCollectorField':
        // Handle QR collector data
        console.log('🔧 ADAPTER: QR collector data');
        return {
          maxCodes: data.maxCodes || 10,
          allowDuplicates: data.allowDuplicates || false,
          scanSettings: data.scanSettings || {}
        };
        
      case 'MultiPhotoField':
        // Handle multi-photo data
        console.log('🔧 ADAPTER: MultiPhoto data');
        return {
          maxPhotos: data.maxPhotos || 5,
          requireLocation: data.requireLocation !== false,
          photoSettings: data.photoSettings || {}
        };
        
      default:
        // Pass through other data as-is
        return data;
    }
  }

  // Adapt UI configuration based on component type
  private static adaptUIConfig(ui: any, componentType: string): any {
    if (!ui) return undefined;
    
    console.log('🔧 ADAPTER: Converting UI config for component:', componentType);
    
    switch (componentType) {
      case 'TaskListField':
        // Pass through TaskList UI configuration
        console.log('🔧 ADAPTER: TaskList UI - allowZoomGraph:', ui.allowZoomGraph);
        return {
          allowZoomGraph: ui.allowZoomGraph !== false,
          priorityColors: ui.priorityColors || {
            critical: '#E53E3E',
            high: '#FF9800',
            normal: '#3182CE',
            low: '#38A169'
          },
          statusColors: ui.statusColors || {
            completed: '#48BB78',
            in_progress: '#ED8936',
            blocked: '#F56565',
            not_started: '#90CDF4'
          },
          graphTransition: ui.graphTransition || {
            enabled: true,
            minZoom: 0.1,
            maxZoom: 1.0,
            snapLevels: [0.1, 0.3, 0.5, 1.0]
          },
          helpText: ui.helpText
        };
        
      default:
        // Pass through other UI config as-is
        return ui;
    }
  }

  // Debug: Show conversion comparison
  static debugConversion(externalWindow: any, adaptedWindow: any): void {
    console.log('🔧 ADAPTER DEBUG COMPARISON:');
    console.log('  External window ID:', externalWindow.windowId || externalWindow.id);
    console.log('  Adapted window ID:', adaptedWindow.id);
    console.log('  External tabs:', externalWindow.tabs?.length || 0);
    console.log('  Adapted tabs:', adaptedWindow.tabs?.length || 0);

    // Debug each tab
    externalWindow.tabs?.forEach((extTab: any, tabIndex: number) => {
      const adaptedTab = adaptedWindow.tabs?.[tabIndex];
      console.log(`  Tab ${tabIndex}: ${extTab.name} -> ${adaptedTab?.name}`);
      console.log(`    External fields: ${extTab.fields?.length || 0}`);
      console.log(`    Adapted fields: ${adaptedTab?.fields?.length || 0}`);

      // Debug each field
      extTab.fields?.forEach((extField: any, fieldIndex: number) => {
        const adaptedField = adaptedTab?.fields?.[fieldIndex];
        console.log(`    Field ${fieldIndex}: ${extField.name} (${extField.component}) -> ${adaptedField?.displayType}`);
        
        // Debug reference data
        if (extField.reference) {
          const refId = extField.reference.id || `${extField.fieldId}_EMBEDDED_REF`;
          console.log(`      Reference: ${extField.reference.id ? 'External' : 'Embedded'} ID: ${refId}`);
        }
      });
    });
    
    console.log('🔧 ADAPTER v1.3: Conversion complete ✅');
  }

  // Utility: Get component mapping for external reference
  static getComponentMapping(): Record<string, string> {
    return { ...this.componentTypeMap };
  }

  // Utility: Check if component type is supported
  static isComponentSupported(componentType: string): boolean {
    return componentType in this.componentTypeMap;
  }

  // Utility: Get field statistics for debugging
  static getFieldStatistics(windowDef: any): any {
    const stats = {
      totalFields: 0,
      fieldsByType: {} as Record<string, number>,
      fieldsByTab: {} as Record<string, number>,
      embeddedReferences: this.embeddedReferences.size,
      taskListFields: 0,
      checklistItems: 0
    };

    windowDef.tabs?.forEach((tab: any) => {
      stats.fieldsByTab[tab.name] = tab.fields?.length || 0;
      
      tab.fields?.forEach((field: any) => {
        stats.totalFields++;
        const type = field.displayType || 'Unknown';
        stats.fieldsByType[type] = (stats.fieldsByType[type] || 0) + 1;
        
        // Count TaskList fields
        if (field.displayType === 'TaskList') {
          stats.taskListFields++;
        }
        
        // Count checklist items
        if ((field.displayType === 'QRChecklist' || field.displayType === 'FlippableQRChecklist') && field.data?.items) {
          stats.checklistItems += field.data.items.length;
        }
      });
    });

    return stats;
  }

  // Utility: Get all embedded reference IDs
  static getEmbeddedReferenceIds(): string[] {
    return Array.from(this.embeddedReferences.keys());
  }

  // Utility: Get embedded reference stats for debugging
  static getEmbeddedReferenceStats(): { count: number; totalValues: number; references: Array<{ id: string; valueCount: number }> } {
    const references: Array<{ id: string; valueCount: number }> = [];
    let totalValues = 0;

    this.embeddedReferences.forEach((values, id) => {
      references.push({ id, valueCount: values.length });
      totalValues += values.length;
    });

    return {
      count: this.embeddedReferences.size,
      totalValues,
      references
    };
  }
}