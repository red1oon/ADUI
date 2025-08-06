import { ADFieldDefinition, FieldValue } from '../types/ADTypes';

export class ValidationEngine {
  static validateField(value: FieldValue | undefined, fieldDef: ADFieldDefinition): string | null {
    if (fieldDef.isMandatory && (!value || value.raw === '' || value.raw === null || value.raw === undefined)) {
      return `${fieldDef.name} is required`;
    }
    
    if (fieldDef.validationRule && value?.raw) {
      switch (fieldDef.displayType) {
        case 'Integer':
          if (isNaN(parseInt(String(value.raw)))) return 'Must be a valid number';
          break;
        case 'Number':
          if (isNaN(parseFloat(String(value.raw)))) return 'Must be a valid decimal number';
          break;
      }
    }
    
    return null;
  }

  static evaluateDisplayLogic(logic: string | undefined, formData: Record<string, FieldValue>): boolean {
    if (!logic) return true;
    
    try {
      let expression = logic;
      
      // Replace field references with actual values
      Object.keys(formData).forEach(fieldName => {
        const value = formData[fieldName]?.key || formData[fieldName]?.raw || '';
        expression = expression.replace(new RegExp(`@${fieldName}@`, 'g'), `'${value}'`);
      });
      
      // Basic evaluation (in production, use a proper expression evaluator)
      return eval(expression);
    } catch (error) {
      console.warn('Display logic evaluation error:', error);
      return true;
    }
  }

  static validateAllFields(formData: Record<string, FieldValue>, fieldDefs: ADFieldDefinition[]): string[] {
    const errors: string[] = [];
    
    fieldDefs.forEach(fieldDef => {
      if (fieldDef.isDisplayed && this.evaluateDisplayLogic(fieldDef.displayLogic, formData)) {
        const value = formData[fieldDef.id];
        const error = this.validateField(value, fieldDef);
        if (error) {
          errors.push(error);
        }
      }
    });
    
    return errors;
  }
}
