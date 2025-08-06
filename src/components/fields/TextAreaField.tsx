import React, { memo } from 'react';
import { TextInput } from 'react-native';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';

interface TextAreaFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
}

export const TextAreaField = memo<TextAreaFieldProps>(({ fieldDef, value, onChange, readonly }) => (
  <TextInput
    style={[fieldStyles.textArea, readonly && fieldStyles.readonlyInput]}
    value={value?.display || value?.raw || ''}
    onChangeText={(text) => onChange({ raw: text, display: text })}
    placeholder={fieldDef.help || `Enter ${fieldDef.name}`}
    editable={!readonly}
    multiline
    numberOfLines={4}
    textAlignVertical="top"
  />
));
