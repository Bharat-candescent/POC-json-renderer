
export interface FormFieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Represents a single condition for visibility
export interface SimpleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'isChecked' | 'isNotChecked' | 'isNotEmpty' | 'isEmpty';
  value?: any;
}

// Allows for nested AND/OR logic
export interface CompoundCondition {
  AND?: (SimpleCondition | CompoundCondition)[];
  OR?: (SimpleCondition | CompoundCondition)[];
}

// The top-level conditions can be an array of simple/compound conditions
export type Condition = SimpleCondition | CompoundCondition;


// --- Dynamic Property Rules ---
// Rule to change a field's property (e.g., 'required') based on conditions
export interface DynamicPropRule {
    property: 'required';
    value: boolean;
    conditions: Condition[];
}

// --- Dynamic Options ---
// Defines how to fetch options for a dropdown based on another field's value
export interface OptionsSource {
    field: string; // The controlling field's name
    mapping: Record<string, FormFieldOption[]>; // e.g., { "advanced_react": [{label: 'Hooks', ...}] }
}

// --- Validation ---
// Defines component-level validation rules
export interface ValidationRule {
  type: 'unique'; // e.g., check for username uniqueness
  message: string;
}

export interface FormFieldConfig {
  checked?: boolean;
  description: string;
  disabled: boolean;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  rowIndex: number;
  type: string;
  value?: any;
  variant: string;
  options?: FormFieldOption[];
  direction?: 'horizontal' | 'vertical';
  hasOtherOption?: boolean;
  
  // --- Advanced Features ---
  conditions?: Condition[];
  dynamicProps?: DynamicPropRule[];
  optionsSource?: OptionsSource;
  isComplex?: boolean; // Flag for performance testing heavy components
  validationRules?: ValidationRule[];
}
