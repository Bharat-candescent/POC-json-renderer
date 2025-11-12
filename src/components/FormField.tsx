import React from 'react';
import { FormFieldConfig } from '../types';
import { ChevronDownIcon, CalendarIcon, UploadIcon, LockClosedIcon, StarIcon, SignatureIcon } from './icons/Icons';

interface FormFieldProps {
  field: FormFieldConfig;
}

const FormField: React.FC<FormFieldProps> = ({ field }) => {
  // State for the "Other" checkbox, only used if the variant is CheckboxGroup with hasOtherOption
  const [isOtherChecked, setIsOtherChecked] = React.useState(false);

  const renderActualField = () => {
    const commonInputClass = "mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm";
    const disabledClass = "disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed";

    switch (field.variant) {
      case 'Checkbox':
        return (
          <div className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                defaultChecked={field.checked}
                disabled={field.disabled}
                className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-600 rounded bg-gray-700 disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={field.name} className="font-medium text-gray-300">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <p className="text-gray-400">{field.description}</p>
            </div>
          </div>
        );
      case 'Switch':
        return (
          <div className="flex items-center justify-between mt-2">
            <div>
              <label className="font-medium text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <p className="text-gray-400 text-sm">{field.description}</p>
            </div>
            <label htmlFor={field.name} className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" id={field.name} className="sr-only peer" defaultChecked={field.checked} disabled={field.disabled} />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        );
      case 'Textarea':
        return <textarea rows={3} name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass}`} placeholder={field.placeholder} disabled={field.disabled}></textarea>;
      case 'Select':
      case 'Combobox':
        return (
          <div className="relative">
            <select name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass} appearance-none`} disabled={field.disabled}>
              <option value="">{field.placeholder}</option>
              {field.options?.map(option => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
              ))}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        );
      case 'Multi Select':
        return (
          <div className="relative">
            <select multiple name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass}`} disabled={field.disabled}>
              {field.options?.map(option => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      case 'Date Picker':
      case 'Datetime Picker':
      case 'Smart Datetime Input':
        return (
          <div className="relative">
            <input type="text" name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass} pl-10`} placeholder="Select a date" disabled={field.disabled} />
            <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        );
      case 'File Input':
        return (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                      <label htmlFor={field.name} className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-cyan-500">
                          <span>Upload a file</span>
                          <input id={field.name} name={field.name} type="file" className="sr-only" disabled={field.disabled} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
          </div>
        );
      case 'Password':
        return (
          <div className="relative">
            <input type="password" name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass} pl-10`} placeholder={field.placeholder} disabled={field.disabled} />
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        );
      case 'Rating':
        return (
          <div className="flex items-center mt-2 space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-6 h-6 text-gray-500 cursor-pointer hover:text-yellow-400" />
            ))}
          </div>
        );
      case 'Slider':
        return <input type="range" name={field.name} id={field.name} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" disabled={field.disabled} />;
      case 'Signature Input':
        return (
          <div className="w-full h-24 bg-gray-200 rounded-md mt-1 flex items-center justify-center border border-gray-400">
            <SignatureIcon className="w-8 h-8 text-gray-500"/>
            <p className="text-gray-500 ml-2">Signature Pad</p>
          </div>
        );
      case 'RadioGroup':
        return (
          <div className="mt-2 space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center">
                    <input id={`${field.name}-${option.value}`} name={field.name} type="radio" value={option.value} className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-600 bg-gray-700 disabled:cursor-not-allowed" disabled={option.disabled || field.disabled}/>
                    <label htmlFor={`${field.name}-${option.value}`} className={`ml-3 block text-sm font-medium ${option.disabled ? 'text-gray-500' : 'text-gray-300'}`}>{option.label}</label>
                </div>
              ))}
          </div>
        );
      case 'CheckboxGroup':
        return (
            <div className={`mt-2 ${field.direction === 'horizontal' ? 'flex flex-wrap gap-x-6 gap-y-2' : 'space-y-2'}`}>
                {field.options?.map(option => (
                  <div key={option.value} className="flex items-center">
                      <input 
                        id={`${field.name}-${option.value}`} 
                        name={field.name} 
                        type="checkbox" 
                        value={option.value} 
                        className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-600 rounded bg-gray-700 disabled:cursor-not-allowed"
                        disabled={option.disabled || field.disabled}
                      />
                      <label 
                        htmlFor={`${field.name}-${option.value}`} 
                        className={`ml-3 block text-sm font-medium ${option.disabled ? 'text-gray-500' : 'text-gray-300'}`}
                      >
                        {option.label}
                      </label>
                  </div>
                ))}
                {field.hasOtherOption && (
                    <div className="flex flex-col space-y-2 pt-2">
                        <div className="flex items-center">
                            <input 
                                id={`${field.name}-other`} 
                                name={`${field.name}-other-checkbox`} 
                                type="checkbox" 
                                className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-600 rounded bg-gray-700"
                                checked={isOtherChecked}
                                onChange={(e) => setIsOtherChecked(e.target.checked)}
                                disabled={field.disabled}
                            />
                            <label htmlFor={`${field.name}-other`} className="ml-3 block text-sm font-medium text-gray-300">Other</label>
                        </div>
                        <input 
                            type="text" 
                            name={`${field.name}-other-text`} 
                            className={`${commonInputClass} ${disabledClass} transition-opacity duration-300 ${isOtherChecked ? 'opacity-100' : 'opacity-50'}`}
                            placeholder="Please specify"
                            disabled={!isOtherChecked || field.disabled}
                        />
                    </div>
                )}
            </div>
        );
      default:
        return <input type="text" name={field.name} id={field.name} className={`${commonInputClass} ${disabledClass}`} placeholder={field.placeholder} disabled={field.disabled} />;
    }
  };

  if (field.variant === 'Checkbox' || field.variant === 'Switch') {
    return <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">{renderActualField()}</div>;
  }
  
  return (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-300">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="mt-1">{renderActualField()}</div>
      <p className="mt-2 text-sm text-gray-400">{field.description}</p>
    </div>
  );
};

export default FormField;
