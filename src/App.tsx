import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { FormFieldConfig } from './types';
import { FORM_CONFIG } from './constants';
import FormRenderer from './components/FormRenderer';
import { InfoIcon, CpuChipIcon, ServerIcon, DatabaseIcon, BeakerIcon, DocumentTextIcon, CodeBracketIcon, BoltIcon } from './components/icons/Icons';

// Create a larger master config by duplicating the base config to test scalability.
const MASTER_FORM_CONFIG: FormFieldConfig[] = Array.from({ length: 4 }).flatMap((_, i) => 
    FORM_CONFIG.map((field, j) => ({
        ...field,
        name: `${field.name}_${i}`, // Ensure unique name attribute for form elements
        label: `${field.label}${i > 0 ? ` (Copy ${i + 1})` : ''}`,
        rowIndex: i * FORM_CONFIG.length + j,
    }))
);


const App: React.FC = () => {
  const [formConfig, setFormConfig] = useState<FormFieldConfig[] | null>(null);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [initialLoadTime, setInitialLoadTime] = useState<number | null>(null);
  const [fieldCount, setFieldCount] = useState<number>(25);
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonForDisplay, setJsonForDisplay] = useState<string>('');
  
  const renderStartTimeRef = useRef<number>(0);
  const initialLoadStartTimeRef = useRef<number>(0);

  const handleRenderTest = useCallback(() => {
    setFormConfig(null);
    setRenderTime(null);
    setInitialLoadTime(null);
    setActiveTab('form');
    // Give React a moment to clear the old form
    setTimeout(() => {
      const configToRender = MASTER_FORM_CONFIG.slice(0, fieldCount);
      setJsonForDisplay(JSON.stringify(configToRender, null, 2));
      
      renderStartTimeRef.current = performance.now();
      setFormConfig(configToRender);
    }, 50);
  }, [fieldCount]);

  const handleInitialLoadTest = useCallback(() => {
    setFormConfig(null);
    setRenderTime(null);
    setInitialLoadTime(null);
    setActiveTab('form');
    setFieldCount(MASTER_FORM_CONFIG.length);
     // Give React a moment to clear the old form
    setTimeout(() => {
      const configToRender = MASTER_FORM_CONFIG;
      setJsonForDisplay(JSON.stringify(configToRender, null, 2));

      initialLoadStartTimeRef.current = performance.now();
      setFormConfig(configToRender);
    }, 50);
  }, []);

  useLayoutEffect(() => {
    if (formConfig) {
      const endTime = performance.now();
      if (renderStartTimeRef.current) {
        setRenderTime(endTime - renderStartTimeRef.current);
        renderStartTimeRef.current = 0;
      }
      if (initialLoadStartTimeRef.current) {
        setInitialLoadTime(endTime - initialLoadStartTimeRef.current);
        initialLoadStartTimeRef.current = 0;
      }
    }
  }, [formConfig]);

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
          <p className="text-lg text-gray-400">
            Answering key architectural questions for dynamic, JSON-driven forms.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 flex items-center">
              <InfoIcon className="w-6 h-6 mr-3" />
              POC Analysis
            </h2>

            <div className="space-y-6">
               <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><DatabaseIcon className="w-5 h-5 mr-2 text-purple-400"/>1. Store JSON Config, Not Rendered HTML</h3>
                <p className="text-gray-400">
                  Storing the JSON configuration is vastly superior. It offers flexibility, supports multiple UIs, is more compact, and allows for easier validation and versioning.
                </p>
              </div>

               <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                 <h3 className="font-semibold text-lg mb-2 flex items-center"><ServerIcon className="w-5 h-5 mr-2 text-purple-400"/>2. Render on the Client-Side (CSR)</h3>
                <p className="text-gray-400">
                  Client-side rendering is ideal for dynamic forms. It leverages the user's device, reducing server load and enabling a snappy, interactive experience after the initial load.
                </p>
              </div>

              <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><CpuChipIcon className="w-5 h-5 mr-2 text-purple-400"/>3. Performance Test on Old Devices</h3>
                <p className="text-gray-400">
                  The primary concern with CSR is performance on older devices. This test measures the time taken to render a large form from its JSON configuration, simulating the load on a client device.
                </p>
              </div>

              <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><BoltIcon className="w-5 h-5 mr-2 text-purple-400"/>4. End-to-End Loading Simulation</h3>
                <p className="text-gray-400">
                  The JSON now includes field options (e.g., for dropdowns), simulating a full config from a backend. The "Initial Load Test" is perfect for use with Vite and Lighthouse to measure total load time, including bundle size and parsing.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-cyan-300 flex items-center">
                <BeakerIcon className="w-6 h-6 mr-3" />
                Live Performance Test
              </h3>
              <div className="space-y-6 p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <div>
                  <label htmlFor="field-count" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Fields to Render: <span className="font-bold text-white">{fieldCount}</span>
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
                <button
                  onClick={handleRenderTest}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transform transition-all hover:scale-[1.02]"
                >
                  Run Dynamic Render Test
                </button>
                {renderTime !== null && (
                  <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg animate-fade-in">
                    <p className="text-sm text-green-300">Time to render {formConfig?.length} fields:</p>
                    <p className="text-4xl font-bold text-green-200">
                      {renderTime.toFixed(2)} ms
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Measures dynamic updates based on the slider.</p>
                  </div>
                )}
                
                <div className="border-t border-gray-700 my-4"></div>

                <div className="space-y-4">
                    <button
                        onClick={handleInitialLoadTest}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transform transition-all hover:scale-[1.02]"
                    >
                        <BoltIcon className="w-5 h-5"/>
                        Run Initial Load Test ({MASTER_FORM_CONFIG.length} Fields)
                    </button>
                    {initialLoadTime !== null && (
                        <div className="p-4 bg-sky-900/50 border border-sky-500 rounded-lg animate-fade-in">
                            <p className="text-sm text-sky-300">Time for full initial load ({MASTER_FORM_CONFIG.length} fields):</p>
                            <p className="text-4xl font-bold text-sky-200">
                            {initialLoadTime.toFixed(2)} ms
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Simulates fetching and rendering the entire form.</p>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg flex flex-col">
            <div className="flex border-b border-gray-700 flex-shrink-0">
                <TabButton tabName="form" label="Rendered Form" count={formConfig ? formConfig.length : 0}>
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                </TabButton>
                <TabButton tabName="json" label="JSON Configuration">
                    <CodeBracketIcon className="w-5 h-5 mr-2" />
                </TabButton>
            </div>
            <div className="p-6 overflow-y-auto h-full min-h-[400px]">
                {activeTab === 'form' && (
                    formConfig ? (
                        <FormRenderer config={formConfig} />
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
    </main>
  );
};

export default App;
