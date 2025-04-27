import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check for mobile device by screen width
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Additional mobile detection methods
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // If device is explicitly mobile by user agent, override the width detection
    if (isMobileDevice()) {
      setIsMobile(true);
    }
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Check if app is running as a PWA
export function useIsPwa() {
  const [isPwa, setIsPwa] = React.useState(false)
  
  React.useEffect(() => {
    // Different ways to detect if the app is running in PWA mode
    const isRunningAsPwa = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true // For iOS
      );
    }
    
    setIsPwa(isRunningAsPwa());
    
    // Listen for changes (e.g., if user switches to PWA)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsPwa(e.matches);
    }
    
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [])
  
  return isPwa
}
