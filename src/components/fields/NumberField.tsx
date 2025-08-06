// NumberField.tsx v1.0 - Numeric input field component
// Save as: src/components/fields/NumberField.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FieldValue } from '../../types/ADTypes';

interface NumberFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false
}) => {
  const [inputValue, setInputValue] = useState(value?.display || value?.raw?.toString() || '');
  const [hasError, setHasError] = useState(false);

  // Determine if this is an integer or decimal field
  const isInteger = fieldDef.displayType === 'Integer';
  
  // Get validation constraints
  const minValue = fieldDef.validation?.min;
  const maxValue = fieldDef.validation?.max;

  const validateAndUpdate = useCallback((text: string) => {
    setInputValue(text);
    
    // Allow empty input
    if (text === '') {
      setHasError(false);
      onChange({
        raw: null,
        display: '',
        metadata: { type: 'number', fieldType: isInteger ? 'integer' : 'decimal' }
      });
      return;
    }

    // Validate numeric input
    let numValue: number;
    let isValid = false;

    if (isInteger) {
      // Integer validation
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed) && text === parsed.toString()) {
        numValue = parsed;
        isValid = true;
      }
    } else {
      // Decimal validation
      const parsed = parseFloat(text);
      if (!isNaN(parsed) && text.match(/^-?\d*\.?\d*$/)) {
        numValue = parsed;
        isValid = true;
      }
    }

    if (isValid) {
      // Check min/max constraints
      if (minValue !== undefined && numValue < minValue) {
        setHasError(true);
        return;
      }
      if (maxValue !== undefined && numValue > maxValue) {
        setHasError(true);
        return;
      }

      setHasError(false);
      onChange({
        raw: numValue,
        display: text,
        metadata: { 
          type: 'number', 
          fieldType: isInteger ? 'integer' : 'decimal',
          validated: true
        }
      });
    } else {
      setHasError(true);
    }
  }, [isInteger, minValue, maxValue, onChange]);

  const handleTextChange = useCallback((text: string) => {
    // Allow negative sign at the start
    if (text === '-') {
      setInputValue(text);
      return;
    }

    // For integers, only allow digits and negative sign
    if (isInteger) {
      const cleanText = text.replace(/[^-0-9]/g, '');
      if (cleanText !== text) return; // Reject invalid characters
      validateAndUpdate(cleanText);
    } else {
      // For decimals, allow digits, decimal point, and negative sign
      const cleanText = text.replace(/[^-0-9.]/g, '');
      // Prevent multiple decimal points
      const decimalCount = (cleanText.match(/\./g) || []).length;
      if (decimalCount > 1) return;
      
      validateAndUpdate(cleanText);
    }
  }, [isInteger, validateAndUpdate]);

  // Generate placeholder text
  const getPlaceholder = () => {
    if (fieldDef.help) return fieldDef.help;
    
    let placeholder = `Enter ${isInteger ? 'whole number' : 'number'}`;
    if (minValue !== undefined && maxValue !== undefined) {
      placeholder += ` (${minValue}-${maxValue})`;
    } else if (minValue !== undefined) {
      placeholder += ` (min: ${minValue})`;
    } else if (maxValue !== undefined) {
      placeholder += ` (max: ${maxValue})`;
    }
    
    return placeholder;
  };

  // Generate error message
  const getErrorMessage = () => {
    if (!hasError) return null;
    
    if (inputValue === '') return null;
    
    const currentValue = isInteger ? parseInt(inputValue, 10) : parseFloat(inputValue);
    
    if (isNaN(currentValue)) {
      return `Please enter a valid ${isInteger ? 'whole number' : 'number'}`;
    }
    
    if (minValue !== undefined && currentValue < minValue) {
      return `Value must be at least ${minValue}`;
    }
    
    if (maxValue !== undefined && currentValue > maxValue) {
      return `Value cannot exceed ${maxValue}`;
    }
    
    return `Please enter a valid ${isInteger ? 'whole number' : 'number'}`;
  };

  if (readonly) {
    return (
      <View style={styles.readonlyContainer}>
        <Text style={styles.readonlyText}>
          {value?.display || value?.raw?.toString() || 'No value'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textInput,
          hasError && styles.errorInput
        ]}
        value={inputValue}
        onChangeText={handleTextChange}
        placeholder={getPlaceholder()}
        keyboardType={isInteger ? 'number-pad' : 'numeric'}
        editable={!readonly}
        selectTextOnFocus
      />
      
      {hasError && (
        <Text style={styles.errorText}>
          {getErrorMessage()}
        </Text>
      )}
      
      {/* Help text for constraints */}
      {(minValue !== undefined || maxValue !== undefined) && !hasError && (
        <Text style={styles.constraintText}>
          {minValue !== undefined && maxValue !== undefined 
            ? `Range: ${minValue} - ${maxValue}`
            : minValue !== undefined 
            ? `Minimum: ${minValue}`
            : `Maximum: ${maxValue}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  errorInput: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  readonlyContainer: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  readonlyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  constraintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});