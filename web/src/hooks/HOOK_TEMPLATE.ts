// HOOK STRUCTURE TEMPLATE
// This file provides a consistent structure template for hook files in the project.
// Copy this template when creating new hook files to maintain consistency.

import { useState, useEffect, useCallback } from 'react';
import { showErrorToast } from '@/lib/error-handling';

// -------------------------------------------------------
// Types
// -------------------------------------------------------

interface HookParams {
  // Parameters for the hook
}

interface HookResult {
  // Return values from the hook
  data: any | null;
  isLoading: boolean;
  error: Error | null;
  
  // Methods provided by the hook
  performAction: (params: any) => Promise<void>;
  reset: () => void;
}

// -------------------------------------------------------
// Constants
// -------------------------------------------------------

const SOME_CONSTANT = 'value';

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
 * @param params Hook parameters
 * @returns The hook's return values and methods
 */
export function useExample(params: HookParams): HookResult {
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
  }, [/* dependencies */]);

  /**
   * Description of this method
   * @param actionParams Parameter description
   */
  const performAction = useCallback(async (actionParams: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Implementation
      // setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  }, [/* dependencies */]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  // Return hook API
  return {
    data,
    isLoading,
    error,
    performAction,
    reset,
  };
}

// -------------------------------------------------------
// Usage example (comment out in production)
// -------------------------------------------------------

/*
function ComponentExample() {
  const { data, isLoading, error, performAction } = useExample({
    // params
  });

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={() => performAction({ param: 'value' })}>
        Perform Action
      </button>
    </div>
  );
}
*/
