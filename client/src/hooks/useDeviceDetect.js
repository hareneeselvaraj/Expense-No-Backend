import { useState, useEffect } from 'react';

export default function useDeviceDetect(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= breakpoint;
    });

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile(e.matches);
        
        // Set initial value
        setIsMobile(mql.matches);
        
        // Listen for changes
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [breakpoint]);

    return { isMobile };
}
