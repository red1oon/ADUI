//src/components/fields/CameraField.tsx

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';

interface CameraFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
  onCameraCapture?: (fieldDef: ADFieldDefinition, onChange: Function) => void;
}

export const CameraField = memo<CameraFieldProps>(({ fieldDef, value, onChange, readonly, onCameraCapture }) => {
  if (readonly && !value?.raw) {
    return (
      <View style={fieldStyles.readonlyContainer}>
        <Text style={fieldStyles.readonlyText}>No photo</Text>
      </View>
    );
  }
  
  return (
    <View style={fieldStyles.imageFieldContainer}>
      {value?.raw && (
        <Image source={{ uri: value.raw }} style={fieldStyles.imagePreview} />
      )}
      
      {!readonly && (
        <TouchableOpacity 
          style={fieldStyles.imageButton}
          onPress={() => onCameraCapture && onCameraCapture(fieldDef, onChange)}
        >
          <Text style={fieldStyles.imageButtonText}>
            {value?.raw ? '📷 Change Photo' : '📷 Take Photo'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});
