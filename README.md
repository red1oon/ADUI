# ADUI - Adaptive Dynamic User Interface

> **🚀 Transform mobile app development: Deploy sophisticated forms in minutes, not months**

**Metadata-driven mobile forms platform that eliminates custom development through JSON configuration**

[![React Native](https://img.shields.io/badge/React%20Native-0.73+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2050+-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why ADUI?

**Traditional Problem:** Every mobile form needs custom development, app store updates, and technical expertise  
**ADUI Solution:** Pure JSON configuration creates enterprise-grade mobile forms instantly
**JSON Tool:** Handy CSV to JSON and a JSON model designer ready (see separate project [JSONFormMaker](https://github.com/red1oon/JSONFormMaker ) under same author)
```json
// This JSON creates a complete mobile inspection app
{
  "fields": [
    {"component": "GPSField", "autoCapture": true},
    {"component": "CameraField", "maxPhotos": 5},
    {"component": "QRScanField", "validation": "asset_id"}
  ]
}
```

**Result:** Professional mobile app with GPS, camera, and QR scanning - no coding required!

## Revolutionary Architecture: Application Dictionary Driven

ADUI transforms mobile app development by implementing the **Application Dictionary (AD)** concept from enterprise ERP systems, creating complete separation between UI presentation, data processing, and backend storage. This architecture enables dynamic form generation without code changes and seamless integration across multiple data layers.

### Core Innovation: Three-Layer Separation

```
Frontend UI (React Native) ← JSON Metadata → Data Processor ← Multiple Backends
     ↑                            ↑                  ↑              ↑
User Interface            Business Logic        Integration     Excel/DB/Email
```

**1. UI Layer**: Pure presentation driven entirely by JSON metadata  
**2. Processing Layer**: Business rules, validation, and data transformation  
**3. Storage Layer**: Excel export → Database integration → Real-time sync

## Technical Architecture

### Metadata-Driven Form Generation

Forms are defined purely through JSON configuration, eliminating custom development:

```typescript
interface ADWindowDefinition {
  id: string;
  name: string;
  tabs: ADTabDefinition[];
}

interface ADFieldDefinition {
  id: string;
  component: ComponentType;        // StringField, QRScanField, etc.
  displayName: string;
  isMandatory: boolean;
  displayLogic?: string;           // Conditional visibility
  validationRule?: string;         // Cross-field validation
}
```

### Application Dictionary Benefits

- **Zero Code Changes**: New forms deployed via metadata updates
- **Instant Deployment**: No app store updates required
- **Business User Control**: Forms created by domain experts, not developers  
- **Consistent UX**: Same components across all forms
- **Enterprise Integration**: Direct compatibility with iDempiere ERP

### Progressive Data Integration

**Phase 1: Excel Export**
```typescript
// Structured data output compatible with enterprise workflows
const exportData = {
  formTemplate: "site_inspection",
  submissionData: {
    C_BPartner_ID: "CLIENT_001",
    M_Product_ID: "ASSET_456", 
    GPS_Location: [lat, lng],
    photos: ["photo1.jpg", "photo2.jpg"]
  }
};
```

**Phase 2: Email Processing**
- Email-based form distribution and collection
- Automated parsing of structured submissions
- Photo attachments with metadata correlation
- Integration with existing email workflows

**Phase 3: Database Connectivity**
- Direct integration with PostgreSQL, MySQL, SQL Server
- iDempiere Application Dictionary compatibility
- Real-time synchronization capabilities
- Enterprise audit trails and security

## Key Features

### 🎯 **Instant Form Creation**
- JSON-driven dynamic form generation
- 20+ built-in field types (GPS, QR scanning, camera, signatures)
- Conditional logic and validation rules
- No-code form configuration

### 📱 **Mobile-Native Experience**
- React Native performance with native interactions
- Offline-first architecture with local storage
- Professional UI designed for field workers
- Cross-platform iOS/Android compatibility

### 🔗 **Enterprise Integration Ready**
- iDempiere Application Dictionary standards
- Multi-tenant architecture (AD_Client_ID support)
- Audit trail compatibility (Created, CreatedBy, Updated, UpdatedBy)
- Document workflow integration (DocStatus, Processed)

### 🚀 **Deployment Flexibility**
- Start with Excel export for immediate value
- Evolve to database integration without code changes
- Email-based distribution for universal access
- Cloud or on-premise deployment options

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- React Native development environment

### Installation

```bash
# Clone the repository
git clone https://github.com/red1oon/ADUI.git
cd ADUI

# Install dependencies
npm install

# Start development server
npx expo start
```

### Basic Form Configuration

Create a form by defining JSON metadata:

```json
{
  "windowName": "Site Inspection",
  "tabs": [{
    "name": "Basic Information",
    "fields": [
      {
        "id": "client_lookup",
        "component": "LookupField",
        "displayName": "Client/Site",
        "isMandatory": true,
        "reference": "C_BPartner"
      },
      {
        "id": "gps_location", 
        "component": "GPSField",
        "displayName": "Location",
        "autoCapture": true
      },
      {
        "id": "inspection_photos",
        "component": "CameraField", 
        "displayName": "Photos",
        "maxPhotos": 5
      }
    ]
  }]
}
```

## Architecture Deep Dive

### Component Registry System

```typescript
const ComponentRegistry = {
  'StringField': StringFieldComponent,
  'QRScanField': QRScanFieldComponent,
  'CameraField': CameraFieldComponent,
  'GPSField': GPSFieldComponent,
  // Extensible without code changes
};
```

### Metadata Processing Engine

```typescript
class MetadataAdapter {
  convertToADUI(externalMetadata: any): ADUIFieldDefinition[] {
    // Transform various metadata formats to ADUI standard
    // Supports iDempiere, custom JSON, and legacy formats
  }
  
  processConditionalLogic(field: ADUIField, formData: any): boolean {
    // Evaluate display logic and field dependencies
  }
}
```

### Data Layer Abstraction

```typescript
interface DataProvider {
  fetchMetadata(windowId: string): Promise<WindowDefinition>;
  saveFormData(data: FormSubmission): Promise<void>;
  syncOfflineData(): Promise<void>;
}

// Multiple implementations:
// - MockDataProvider (development)
// - ExcelDataProvider (Excel export)
// - DatabaseProvider (SQL databases)
// - iDempiereProvider (ERP integration)
```

## Roadmap

### Current Status (v1.0)
- ✅ JSON-driven form generation
- ✅ 15+ field components with validation
- ✅ Offline data storage
- ✅ Excel export functionality
- ✅ Email integration basics

### Next Phase (v1.1)
- 🔄 Enhanced email processing workflows
- 🔄 Advanced conditional logic engine
- 🔄 Photo metadata correlation
- 🔄 Multi-template support

### Future Releases
- 📋 Direct database connectivity
- 📋 iDempiere web service integration
- 📋 Real-time synchronization
- 📋 BIM/IFC integration for construction workflows
- 📋 Multi-language support

## Contributing

We welcome contributions! The metadata-driven architecture makes it easy to add new field types, validation rules, and data providers without affecting existing functionality.

### Adding New Field Components

```typescript
// 1. Create component
export const CustomField: React.FC<FieldProps> = ({ field, value, onChange }) => {
  // Implementation
};

// 2. Register component
ComponentRegistry.register('CustomField', CustomField);

// 3. Use in JSON metadata
{
  "component": "CustomField",
  "displayName": "My Custom Field"
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Community

- **Issues**: [GitHub Issues](https://github.com/red1oon/ADUI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/red1oon/ADUI/discussions)
- **Documentation**: [Wiki](https://github.com/red1oon/ADUI/wiki)

---

**ADUI enables any organization to deploy sophisticated mobile forms in minutes instead of months, with a clear evolution path from Excel exports to enterprise-grade ERP integration.**
