// HOOK STRUCTURE TEMPLATE
// This file provides a consistent structure template for hook files in the project.
// Copy this template when creating new hook files to maintain consistency.

import { useState, useEffect, useCallback } from 'react';
// Import other necessary libraries and components

// -------------------------------------------------------
// Types
// -------------------------------------------------------

interface ExampleParams {
  // Parameters for the hook
}

interface ExampleResult {
  // Return values from the hook
}

// -------------------------------------------------------
// Utility functions
// -------------------------------------------------------

/**
 * Description of the utility function
 * @param param1 Description of parameter
 * @returns Description of return value
 */
const utilityFunction = (param1: string): number => {
  // Implementation
  return 0;
};

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------

/**
 * Description of what the hook does and when to use it
 * @param param Example parameter
 * @returns The hook's return values
 */
export function useExample(param: ExampleParams): ExampleResult {
  // State declarations
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Effect for initialization or cleanup
  useEffect(() => {
    // Initialization logic
    
    return () => {
      // Cleanup logic
    };
  }, []);

  /**
   * Description of this method
   * @param methodParam Parameter description
   */
  const exampleMethod = useCallback((methodParam: string) => {
    // Implementation
  }, [/* dependencies */]);

  // Return hook API
  return {
    data,
    isLoading,
    error,
    exampleMethod,
  };
}

// -------------------------------------------------------
// Additional hooks (if needed)
// -------------------------------------------------------

/**
 * Another hook that's related to the main one
 */
export function useRelatedExample() {
  // Implementation
}
