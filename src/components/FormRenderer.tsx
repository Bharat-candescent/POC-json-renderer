import React, { useState, useCallback, useEffect } from 'react';
import { FormFieldConfig, Condition } from '../types';
import FormField from './FormField';

interface FormRendererProps {
  config: FormFieldConfig[];
  fieldVisibility: Record<string, boolean>;
  allRequired: boolean;
  inputsDisabled: boolean;
  // FIX: Added simulateHeavy to the component's props interface.
  simulateHeavy: boolean;
}

const inputLikeVariants: string[] = [
    'Input', 'Textarea', 'Password', 'Phone', 'Input OTP', 'Select', 'Combobox', 
    'Multi Select', 'Date Picker', 'Datetime Picker', 'Smart Datetime Input', 
    'Tags Input', 'Location Input', 'Credit Card'
];

const FormRenderer: React.FC<FormRendererProps> = ({ config, fieldVisibility, allRequired, inputsDisabled, simulateHeavy }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize form data with default values from the config
    const initialData: Record<string, any> = {};
    config.forEach(field => {
        if (field.variant === 'Checkbox' || field.variant === 'Switch') {
            initialData[field.name] = field.checked;
        } else if (field.variant === 'CheckboxGroup') {
            initialData[field.name] = {}; // Store as an object of value:boolean
        }
        else {
            initialData[field.name] = field.value || '';
        }
    });
    setFormData(initialData);
  }, [config]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // FIX: Rewrote checkConditions to handle nested AND/OR logic and different field types correctly.
  const checkConditions = useCallback((conditions: Condition[] | undefined): boolean => {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    const evaluateCondition = (condition: Condition): boolean => {
      // Handle compound conditions recursively
      if ('AND' in condition && condition.AND) {
        return condition.AND.every(evaluateCondition);
      }
      if ('OR' in condition && condition.OR) {
        return condition.OR.some(evaluateCondition);
      }

      // Handle simple conditions with a type guard
      if ('field' in condition) {
        const simpleCond = condition;
        const fieldValue = formData[simpleCond.field];

        switch (simpleCond.operator) {
          case 'equals':
            return fieldValue === simpleCond.value;
          case 'notEquals':
            return fieldValue !== simpleCond.value;
          case 'isChecked':
            // For CheckboxGroup, value is an object like { gala_dinner: true }
            if (typeof fieldValue === 'object' && fieldValue !== null && simpleCond.value) {
              return !!fieldValue[simpleCond.value];
            }
            return !!fieldValue; // For single checkbox
          case 'isNotChecked':
            if (typeof fieldValue === 'object' && fieldValue !== null && simpleCond.value) {
              return !fieldValue[simpleCond.value];
            }
            return !fieldValue;
          case 'isNotEmpty':
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
          case 'isEmpty':
              return fieldValue === null || fieldValue === undefined || fieldValue === '';
          default:
            return false;
        }
      }
      return false; // Fallback for invalid condition format
    }

    return conditions.every(evaluateCondition);
  }, [formData]);

  return (
    <form className="space-y-6">
      {config.map((field, index) => {
        // Condition 1: Check against global visibility toggles
        const isVisibleByToggle = fieldVisibility[field.variant];
        // Condition 2: Check against JSON-defined conditional logic
        const isVisibleByCondition = checkConditions(field.conditions);

        if (!isVisibleByToggle || !isVisibleByCondition) {
            return null;
        }

        const isInputLike = inputLikeVariants.includes(field.variant);
        
        // Create a modified field config based on global controls
        const modifiedField: FormFieldConfig = {
            ...field,
            required: allRequired ? true : field.required,
            disabled: (inputsDisabled && isInputLike) ? true : field.disabled
        };
        
        return (
            <FormField 
                key={`${field.name}-${index}`} 
                field={modifiedField} 
                value={formData[field.name]}
                onFieldChange={handleFieldChange}
                // FIX: Pass the simulateHeavy prop down to the FormField component.
                simulateHeavy={simulateHeavy}
            />
        );
      })}
      <div className="pt-4">
        <button
          type="submit"
          onClick={(e) => e.preventDefault()}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-colors"
        >
          Submit Form
        </button>
      </div>
    </form>
  );
};

export default FormRenderer;