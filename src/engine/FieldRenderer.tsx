// FieldRenderer.tsx v1.6 - Complete with TaskList Support
// Renders form fields dynamically based on displayType from metadata
// Save as: src/engine/FieldRenderer.tsx

import React, { memo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { FieldValue } from '../types/ADTypes';

// Import all field components
import { QRCollectorField } from '../components/fields/QRCollectorField';
import { MultiPhotoField } from '../components/fields/MultiPhotoField';
import { StringField } from '../components/fields/StringField';
import { TextAreaField } from '../components/fields/TextAreaField';
import { NumberField } from '../components/fields/NumberField';
import { YesNoField } from '../components/fields/YesNoField';
import { ListField } from '../components/fields/ListField';
import { QRCodeField } from '../components/fields/QRCodeField';
import { CameraField } from '../components/fields/CameraField';
import { QRChecklistField } from '../components/fields/QRChecklistField';
import FlippableQRChecklistField from '../components/fields/FlippableQRChecklistField';
import TaskListField from '../components/fields/TaskListField'; // NEW: Task management with graph view

// Universal Help Button Component
const HelpButton: React.FC<{ fieldDef: any }> = ({ fieldDef }) => {
  const handleShowHelp = () => {
    const helpText = fieldDef.help || 
      fieldDef.ui?.helpText || 
      fieldDef.description || 
      'No help information available.';
    
    Alert.alert(
      fieldDef.name || 'Field Information',
      helpText,
      [{ text: 'OK' }]
    );
  };

  // Only show help button if help text exists
  if (!fieldDef.help && !fieldDef.ui?.helpText && !fieldDef.description) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.helpButton}
      onPress={handleShowHelp}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.helpIcon}>?</Text>
    </TouchableOpacity>
  );
};

interface FieldRendererProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  formData: Record<string, FieldValue>;
  onQRScanned?: (fieldDef: any, onChange: Function) => void;
  onCameraCapture?: (fieldDef: any, onChange: Function) => void;
  onQRChecklistScan?: (items: any[], onUpdate: (items: any[]) => void) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = memo(({
  fieldDef,
  value,
  onChange,
  formData,
  onQRScanned,
  onCameraCapture,
  onQRChecklistScan
}) => {
  // Validate field definition
  if (!fieldDef || !fieldDef.displayType) {
    console.error('🔧 FIELD: Invalid field definition:', fieldDef);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid field definition</Text>
      </View>
    );
  }

  // Check if field should be displayed
  if (fieldDef.isDisplayed === false) {
    console.log('🔧 FIELD: Field hidden by isDisplayed flag:', fieldDef.name);
    return null;
  }

  // Evaluate display logic (simplified)
  if (fieldDef.displayLogic) {
    // For now, skip complex display logic evaluation
    console.log('🔧 FIELD: Display logic present but disabled:', fieldDef.displayLogic);
  }

  const isReadonly = fieldDef.isReadOnly;

  console.log('🔧 FIELD: Rendering field:', fieldDef.name, 'Type:', fieldDef.displayType);

  // Render appropriate component based on displayType
  const renderFieldComponent = () => {
    
    switch (fieldDef.displayType) {
      // In src/engine/FieldRenderer.tsx - add to the switch statement:
      case 'QRCollector':
        return (
          <QRCollectorField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onQRScan={onQRScanned}
          />
        );

      case 'MultiPhoto':
        return (
          <MultiPhotoField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onCameraCapture={onCameraCapture}
          />
        );

      case 'String':
        return (
          <StringField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'FlippableQRChecklist': // Enhanced flip panel checklist
        console.log('🔧 FIELD: Rendering FlippableQRChecklist field:', fieldDef.name);
        return (
          <FlippableQRChecklistField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onQRChecklistScan={onQRChecklistScan}
          />
        );

      case 'TaskList': // NEW: TaskListField component with graph view
        console.log('🔧 FIELD: Rendering TaskList field:', fieldDef.name);
        return (
          <TaskListField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'Text':
        return (
          <TextAreaField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'Integer':
      case 'Number':
        return (
          <NumberField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'YesNo':
        return (
          <YesNoField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'List':
        return (
          <ListField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
          />
        );

      case 'QRCode':
        return (
          <QRCodeField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onQRScanned={onQRScanned}
          />
        );

      case 'Camera':
        return (
          <CameraField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onCameraCapture={onCameraCapture}
          />
        );

      case 'QRChecklist': // QR Checklist component
        console.log('🔧 FIELD: Rendering QRChecklist field:', fieldDef.name);
        return (
          <QRChecklistField
            fieldDef={fieldDef}
            value={value}
            onChange={onChange}
            readonly={isReadonly}
            onQRChecklistScan={onQRChecklistScan}
          />
        );

      default:
        console.warn('🔧 FIELD: Unsupported field type:', fieldDef.displayType);
        return (
          <View style={styles.unknownFieldContainer}>
            <Text style={styles.unknownFieldText}>
              Unsupported field type: {fieldDef.displayType}
            </Text>
            <Text style={styles.unknownFieldDetail}>
              Field: {fieldDef.name}
            </Text>
            <Text style={styles.unknownFieldDebug}>
              Available types: String, Text, TaskList, Integer, Number, YesNo, List, QRCode, Camera, QRChecklist, FlippableQRChecklist
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.fieldContainer}>
      {/* Field Header with Help Button */}
      <View style={styles.fieldHeader}>
        <Text style={[
          styles.fieldLabel,
          fieldDef.isMandatory && styles.mandatoryLabel
        ]}>
          {fieldDef.name}
          {fieldDef.isMandatory && ' *'}
        </Text>
        
        <HelpButton fieldDef={fieldDef} />
      </View>

      {/* Field Component */}
      {renderFieldComponent()}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mandatoryLabel: {
    color: '#d32f2f',
  },
  helpButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  helpIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f44336',
    margin: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unknownFieldContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  unknownFieldText: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unknownFieldDetail: {
    color: '#ff9800',
    fontSize: 12,
    marginTop: 4,
  },
  unknownFieldDebug: {
    color: '#ff9800',
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default FieldRenderer;