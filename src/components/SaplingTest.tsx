import React, { useState, useEffect } from 'react';
import { saplingService } from '@/lib/sapling';
import type { SaplingError } from '@/lib/sapling';
export function SaplingTest() {
  const [text, setText] = useState('This are a test sentence with some grammar mistake.');
  const [errors, setErrors] = useState<SaplingError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkSapling = async () => {
      try {
        await saplingService.initialize();
        setIsAvailable(saplingService.isAvailable());
      } catch (error) {
        console.error('Sapling initialization failed:', error);
        setIsAvailable(false);
      }
    };

    checkSapling();
  }, []);

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const result = await saplingService.checkText(text);
      setErrors(result);
    } catch (error) {
      console.error('Sapling check failed:', error);
      setErrors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFix = (error: SaplingError) => {
    const newText = text.slice(0, error.start) + error.correction + text.slice(error.end);
    setText(newText);
    setErrors([]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Sapling Grammar Checker Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Status: {isAvailable ? '✅ Available' : '❌ Not Available'}
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Text:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Enter text to check..."
        />
      </div>
      
      <button
        onClick={handleCheck}
        disabled={isLoading || !isAvailable}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Checking...' : 'Check Grammar'}
      </button>
      
      {errors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Found {errors.length} issues:</h4>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="p-2 bg-white border border-gray-200 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      error.type === 'spelling' ? 'bg-red-100 text-red-800' :
                      error.type === 'grammar' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {error.type}
                    </span>
                    <p className="text-sm text-gray-700 mt-1">{error.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      "{error.incorrect}" → "{error.correction}"
                    </p>
                  </div>
                  {error.correction && (
                    <button
                      onClick={() => applyFix(error)}
                      className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Apply Fix
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {!isLoading && errors.length === 0 && text.trim() && (
        <p className="mt-4 text-green-600">No issues found!</p>
      )}
    </div>
  );
}