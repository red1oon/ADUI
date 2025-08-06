// ListField.tsx v1.1 - Production Ready with Bug Fixes
// Fixed dropdown selection issue through improved lifecycle management and error handling

import React, { memo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';
import { useReferenceData } from '../../data/hooks/useWindowData';

interface ListFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
}

export const ListField = memo<ListFieldProps>(({ fieldDef, value, onChange, readonly }) => {
  const [showPicker, setShowPicker] = useState(false);
  const { values } = useReferenceData(fieldDef.reference?.id || '');
  
  // Track reference data loading for proper lifecycle management
  useEffect(() => {
    if (!values || values.length === 0) {
      // Only log significant issues, not normal loading states
      if (fieldDef.reference?.id && !values) {
        console.warn('⚠️ ListField: No reference data for field:', fieldDef.name, 'Reference ID:', fieldDef.reference.id);
      }
    }
  }, [fieldDef, values]);
  
  const handleSelect = (item: any) => {
    // Create robust value object with fallbacks
    const newValue = { 
      key: item.key, 
      display: item.value || item.display || item.key, 
      raw: item.key 
    };
    
    onChange(newValue);
    setShowPicker(false);
  };
  
  const handleOpenPicker = () => {
    if (!values || values.length === 0) {
      console.warn('⚠️ ListField: Attempted to open picker with no available options for field:', fieldDef.name);
    }
    setShowPicker(true);
  };
  
  if (readonly) {
    return (
      <View style={fieldStyles.readonlyContainer}>
        <Text style={fieldStyles.readonlyText}>{value?.display || 'Not set'}</Text>
      </View>
    );
  }
  
  return (
    <>
      <TouchableOpacity 
        style={fieldStyles.listField} 
        onPress={handleOpenPicker}
      >
        <Text style={fieldStyles.listFieldText}>
          {value?.display || 'Select...'}
        </Text>
        <Text style={fieldStyles.listFieldIcon}>▼</Text>
      </TouchableOpacity>
      
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={fieldStyles.pickerContainer}>
          <View style={fieldStyles.pickerHeader}>
            <Text style={fieldStyles.pickerTitle}>{fieldDef.name}</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={fieldStyles.pickerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          
          {(!values || values.length === 0) ? (
            // Enhanced error handling with user-friendly message
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                No options available
              </Text>
              <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10 }}>
                Please check your connection and try again
              </Text>
            </View>
          ) : (
            <FlashList
              data={values}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={fieldStyles.pickerItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={fieldStyles.pickerItemText}>
                    {item.value || item.display || item.key || 'Unknown'}
                  </Text>
                  {item.description && (
                    <Text style={fieldStyles.pickerItemDesc}>{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              estimatedItemSize={60}
              keyExtractor={(item, index) => item.key || item.id || index.toString()}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
});