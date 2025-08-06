import React, { memo } from 'react';
import { View, Text, Switch } from 'react-native';
import { ADFieldDefinition, FieldValue } from '../../types/ADTypes';
import { fieldStyles } from '../../theme/styles';

interface YesNoFieldProps {
  fieldDef: ADFieldDefinition;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  readonly: boolean;
}

export const YesNoField = memo<YesNoFieldProps>(({ fieldDef, value, onChange, readonly }) => (
  <View style={fieldStyles.switchContainer}>
    <Text style={fieldStyles.switchLabel}>{fieldDef.name}</Text>
    <Switch
      value={value?.raw === 'Y' || value?.raw === true}
      onValueChange={(val) => onChange({ raw: val ? 'Y' : 'N', display: val ? 'Yes' : 'No' })}
      disabled={readonly}
    />
  </View>
));
