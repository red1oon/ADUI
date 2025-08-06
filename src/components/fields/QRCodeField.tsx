import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';

interface QRCodeFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
  onQRScanned?: (fieldDef: ADFieldDefinition, onChange: Function) => void;
}

export const QRCodeField = memo<QRCodeFieldProps>(({ fieldDef, value, onChange, readonly, onQRScanned }) => {
  if (readonly) {
    return (
      <View style={fieldStyles.readonlyContainer}>
        <Text style={fieldStyles.readonlyText}>{value?.display || 'No QR data'}</Text>
      </View>
    );
  }
  
  return (
    <View style={fieldStyles.qrFieldContainer}>
      <TextInput
        style={fieldStyles.qrInput}
        value={value?.display || ''}
        onChangeText={(text) => onChange({ raw: text, display: text })}
        placeholder="QR Code data or scan"
        editable={!readonly}
      />
      
      <TouchableOpacity 
        style={fieldStyles.qrScanButton}
        onPress={() => onQRScanned && onQRScanned(fieldDef, onChange)}
      >
        <Text style={fieldStyles.qrScanText}>📱 Scan</Text>
      </TouchableOpacity>
    </View>
  );
});
