export interface FormFieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormFieldConfig {
  checked: boolean;
  description: string;
  disabled: boolean;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  rowIndex: number;
  type: string;
  value: string;
  variant: string;
  options?: FormFieldOption[];
  direction?: 'horizontal' | 'vertical';
  hasOtherOption?: boolean;
}
