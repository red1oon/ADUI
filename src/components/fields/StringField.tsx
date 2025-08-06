import React, { memo } from 'react';
import { TextInput } from 'react-native';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';

interface StringFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
}

export const StringField = memo<StringFieldProps>(({ fieldDef, value, onChange, readonly }) => (
  <TextInput
    style={[fieldStyles.textInput, readonly && fieldStyles.readonlyInput]}
    value={value?.display || value?.raw || ''}
    onChangeText={(text) => onChange({ raw: text, display: text })}
    placeholder={fieldDef.help || `Enter ${fieldDef.name}`}
    editable={!readonly}
    maxLength={fieldDef.fieldLength || undefined}
  />
));
