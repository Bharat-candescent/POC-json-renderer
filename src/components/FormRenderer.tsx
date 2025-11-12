import React from 'react';
import { FormFieldConfig } from '../types';
import FormField from './FormField';

interface FormRendererProps {
  config: FormFieldConfig[];
}

const FormRenderer: React.FC<FormRendererProps> = ({ config }) => {
  return (
    <form className="space-y-6">
      {config.map((field, index) => (
        <FormField key={`${field.name}-${index}`} field={field} />
      ))}
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