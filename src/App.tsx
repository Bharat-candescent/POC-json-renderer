

import React, { useState, useLayoutEffect, useRef, useCallback, useMemo, Profiler } from 'react';
import { FormFieldConfig } from './types';
import { FORM_CONFIG } from './constants';
import FormRenderer from './components/FormRenderer';
import { InfoIcon, CpuChipIcon, ServerIcon, DatabaseIcon, BeakerIcon, DocumentTextIcon, CodeBracketIcon, BoltIcon, AdjustmentsHorizontalIcon } from './components/icons/Icons';

// Create a larger master config by duplicating the base config to test scalability.
const MASTER_FORM_CONFIG: FormFieldConfig[] = Array.from({ length: 4 }).flatMap((_, i) => {
    const suffix = `_${i}`;
    const originalNames = FORM_CONFIG.map(f => f.name);

    return FORM_CONFIG.map((field, j) => {
        const newName = `${field.name}${suffix}`;
        
        // Deep copy the field to avoid modifying the original FORM_CONFIG
        const newField = JSON.parse(JSON.stringify(field));
        
        newField.name = newName;
        newField.label = `${field.label}${i > 0 ? ` (Copy ${i + 1})` : ''}`;
        newField.rowIndex = i * FORM_CONFIG.length + j;

        // FIX: Moved updateConditions function to a higher scope to be accessible by multiple blocks.
        const updateConditions = (conditions: any) => {
            if (Array.isArray(conditions)) {
                conditions.forEach(cond => {
                    if (cond.field && originalNames.includes(cond.field)) {
                        cond.field = `${cond.field}${suffix}`;
                    }
                    // Recurse for nested compound conditions
                    if (cond.AND) updateConditions(cond.AND);
                    if (cond.OR) updateConditions(cond.OR);
                });
            }
        };

        // IMPORTANT: Update conditions to reference the new, unique field names within the same duplicated block
        if (newField.conditions) {
            updateConditions(newField.conditions);
        }
         // Update dynamic property rules
        if (newField.dynamicProps) {
            newField.dynamicProps.forEach((rule: any) => {
                updateConditions(rule.conditions);
            });
        }
        // Update options source
        if (newField.optionsSource?.field && originalNames.includes(newField.optionsSource.field)) {
            newField.optionsSource.field = `${newField.optionsSource.field}${suffix}`;
        }
        
        return newField;
    });
});

const App: React.FC = () => {
  const [formConfig, setFormConfig] = useState<FormFieldConfig[] | null>(null);
  const [wallClockTime, setWallClockTime] = useState<number | null>(null);
  const [reactRenderDuration, setReactRenderDuration] = useState<number | null>(null);

  const [fieldCount, setFieldCount] = useState<number>(FORM_CONFIG.length);
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonForDisplay, setJsonForDisplay] = useState<string>('');
  
  // State for global form controls
  const allVariants = useMemo(() => Array.from(new Set(MASTER_FORM_CONFIG.map(f => f.variant))).sort(), []);
  const initialVisibility = useMemo(() => allVariants.reduce((acc, v) => ({ ...acc, [v]: true }), {}), [allVariants]);
  
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>(initialVisibility);
  const [allRequired, setAllRequired] = useState<boolean>(false);
  const [inputsDisabled, setInputsDisabled] = useState<boolean>(false);
  const [simulateHeavy, setSimulateHeavy] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);

  const runTest = useCallback((config: FormFieldConfig[]) => {
    setFormConfig(null); // Clear previous form
    setWallClockTime(null);
    setReactRenderDuration(null);
    setActiveTab('form');
    
    setTimeout(() => {
      setJsonForDisplay(JSON.stringify(config, null, 2));
      startTimeRef.current = performance.now();
      setFormConfig(config); // Trigger render
    }, 50);
  }, []);

  const handleRenderTest = useCallback(() => {
    const configToRender = MASTER_FORM_CONFIG.slice(0, fieldCount);
    runTest(configToRender);
  }, [fieldCount, runTest]);

  const handleInitialLoadTest = useCallback(() => {
    runTest(MASTER_FORM_CONFIG);
  }, [runTest]);

  useLayoutEffect(() => {
    if (formConfig && startTimeRef.current) {
      const endTime = performance.now();
      setWallClockTime(endTime - startTimeRef.current);
      // Reset ref, profiler will handle the react time
      startTimeRef.current = 0;
    }
  }, [formConfig]);

  const onRender = useCallback((_id: string, phase: string, actualDuration: number) => {
    if (phase === 'mount' && formConfig) {
      setReactRenderDuration(actualDuration);
    }
  }, [formConfig]);

  const handleVisibilityChange = (variant: string) => {
    setFieldVisibility(prev => ({ ...prev, [variant]: !prev[variant] }));
  };

  const TabButton: React.FC<{
    tabName: 'form' | 'json';
    label: string;
    count?: number;
    children: React.ReactNode;
  }> = ({ tabName, label, count, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === tabName
          ? 'border-b-2 border-cyan-400 text-cyan-300'
          : 'border-b-2 border-transparent text-gray-400 hover:text-white'
      }`}
      aria-current={activeTab === tabName ? 'page' : undefined}
    >
      {children}
      {label} {count !== undefined && `(${count} fields)`}
    </button>
  );

  return (
    <main className="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Form Builder Performance POC
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            A proof-of-concept for analyzing client-side rendering of complex, JSON-driven forms with advanced conditional logic.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 flex items-center">
              <InfoIcon className="w-6 h-6 mr-3" />
              Key Architectural Decisions
            </h2>

            <div className="space-y-4">
               <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-1 flex items-center"><DatabaseIcon className="w-5 h-5 mr-2 text-purple-400"/>1. Store JSON Config, Not Rendered HTML</h3>
                <p className="text-gray-400 text-sm">
                  Storing JSON is superior for flexibility, versioning, and supporting multiple UIs from a single source of truth.
                </p>
              </div>

               <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                 <h3 className="font-semibold text-lg mb-1 flex items-center"><ServerIcon className="w-5 h-5 mr-2 text-purple-400"/>2. Render on the Client-Side (CSR)</h3>
                <p className="text-gray-400 text-sm">
                  Ideal for dynamic forms. CSR leverages the user's device, enabling a rich, interactive experience with minimal server load.
                </p>
              </div>

              <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-1 flex items-center"><CpuChipIcon className="w-5 h-5 mr-2 text-purple-400"/>3. The Performance Question</h3>
                <p className="text-gray-400 text-sm">
                  The primary concern with CSR is performance. This test measures render times, especially with complex dependencies and computationally "heavy" components, to simulate real-world stress.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-cyan-300 flex items-center">
                <BeakerIcon className="w-6 h-6 mr-3" />
                Live Performance Test
              </h3>
              <div className="space-y-6 p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                 <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                    <label htmlFor="simulateHeavy" className="text-sm font-medium text-gray-300">Simulate "Heavy" Components</label>
                    <input type="checkbox" id="simulateHeavy" className="toggle-switch" checked={simulateHeavy} onChange={() => setSimulateHeavy(!simulateHeavy)} />
                </div>
                
                <div>
                  <label htmlFor="field-count" className="block text-sm font-medium text-gray-300 mb-2">
                    Fields to Render: <span className="font-bold text-white">{fieldCount}</span>
                  </label>
                  <input
                    id="field-count"
                    type="range"
                    min="1"
                    max={MASTER_FORM_CONFIG.length}
                    value={fieldCount}
                    onChange={(e) => setFieldCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    aria-label="Number of fields to render"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleRenderTest}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg text-base hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transform transition-all hover:scale-[1.02]"
                    >
                      Run Dynamic Test
                    </button>
                    <button
                        onClick={handleInitialLoadTest}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transform transition-all hover:scale-[1.02]"
                    >
                        <BoltIcon className="w-5 h-5"/>
                        Run Full Load Test
                    </button>
                </div>
                
                {(wallClockTime !== null || reactRenderDuration !== null) && (
                  <div className="p-4 bg-gray-900/80 border border-gray-700 rounded-lg animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-green-300">Wall Clock Time</p>
                        <p className="text-3xl font-bold text-green-200">
                          {wallClockTime?.toFixed(2) ?? '...'} ms
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Total time from click to paint.</p>
                    </div>
                     <div>
                        <p className="text-sm text-sky-300">React Render Duration</p>
                        <p className="text-3xl font-bold text-sky-200">
                         {reactRenderDuration?.toFixed(2) ?? '...'} ms
                        </p>
                         <p className="text-xs text-gray-400 mt-1">Time spent in React's render phase.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg flex flex-col min-h-0">
            <div className="flex border-b border-gray-700 flex-shrink-0">
                <TabButton tabName="form" label="Rendered Form" count={formConfig ? formConfig.length : 0}>
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                </TabButton>
                <TabButton tabName="json" label="JSON Configuration">
                    <CodeBracketIcon className="w-5 h-5 mr-2" />
                </TabButton>
            </div>

            <div className="p-6 overflow-hidden flex flex-col flex-grow">
              {activeTab === 'form' && formConfig && (
                <div className="mb-6 p-4 bg-gray-900/70 rounded-lg border border-gray-700 flex-shrink-0">
                  <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 mr-3" />
                    Global Form Controls
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                        <label htmlFor="allRequired" className="text-sm font-medium text-gray-300">Make all required</label>
                        <input type="checkbox" id="allRequired" className="toggle-switch" checked={allRequired} onChange={() => setAllRequired(!allRequired)} />
                      </div>
                       <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                        <label htmlFor="inputsDisabled" className="text-sm font-medium text-gray-300">Disable all inputs</label>
                        <input type="checkbox" id="inputsDisabled" className="toggle-switch" checked={inputsDisabled} onChange={() => setInputsDisabled(!inputsDisabled)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Toggle Field Visibility:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {allVariants.map(variant => (
                          <div key={variant} className="flex items-center">
                            <input
                              id={`vis-${variant}`}
                              type="checkbox"
                              checked={fieldVisibility[variant]}
                              onChange={() => handleVisibilityChange(variant)}
                              className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor={`vis-${variant}`} className="ml-2 text-sm text-gray-400">{variant}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-y-auto flex-grow min-h-0">
                  {activeTab === 'form' && (
                      formConfig ? (
                          <Profiler id="FormRenderer" onRender={onRender}>
                              <FormRenderer 
                                config={formConfig}
                                fieldVisibility={fieldVisibility}
                                allRequired={allRequired}
                                inputsDisabled={inputsDisabled}
                                simulateHeavy={simulateHeavy}
                              />
                          </Profiler>
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                              <p>Use the controls to run a render test.</p>
                          </div>
                      )
                  )}
                  {activeTab === 'json' && (
                       jsonForDisplay ? (
                          <pre className="text-xs bg-gray-900 p-4 rounded-md text-cyan-200 overflow-x-auto">
                              <code>{jsonForDisplay}</code>
                          </pre>
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                              <p>Run a test to see the generated JSON configuration.</p>
                          </div>
                      )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
       <style>{`
          .toggle-switch {
              height: 1.5rem;
              width: 2.75rem;
              position: relative;
              display: inline-block;
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
              background-color: #4b5563;
              border-radius: 9999px;
              cursor: pointer;
              transition: background-color 0.2s ease-in-out;
          }
          .toggle-switch::before {
              content: '';
              position: absolute;
              top: 0.25rem;
              left: 0.25rem;
              height: 1rem;
              width: 1rem;
              background-color: white;
              border-radius: 9999px;
              transition: transform 0.2s ease-in-out;
          }
          .toggle-switch:checked {
              background-color: #0891b2;
          }
          .toggle-switch:checked::before {
              transform: translateX(1.25rem);
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
      `}</style>
    </main>
  );
};

export default App;