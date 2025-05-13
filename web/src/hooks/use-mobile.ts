import * as React from "react"

// -------------------------------------------------------
// Constants
// -------------------------------------------------------

const MOBILE_BREAKPOINT = 768

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns Boolean indicating if the current device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Set initial value
    handleResize();
    
    // Add event listener
    mql.addEventListener("change", handleResize);
    
    // Cleanup
    return () => mql.removeEventListener("change", handleResize);
  }, []);

  return !!isMobile;
}
