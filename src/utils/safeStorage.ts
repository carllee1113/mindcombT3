// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Persistent memory store for critical UI state
const persistentStore: Record<string, string> = {};

// Initialize persistent store with default values
const initializePersistentStore = () => {
  persistentStore['showLandingPage'] = 'false';
  persistentStore['viewMode'] = 'mindmap';
  persistentStore['uiState'] = JSON.stringify({
    icons: true,
    visibility: true
  });
};

// Initialize storage with default values
initializePersistentStore();

// Error reporting function
const reportStorageError = (error: unknown, operation: string, storageType: string) => {
  console.warn(`${storageType} ${operation} failed:`, error);
  // You could add additional error reporting here if needed
};

// Check if storage is available
const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  if (typeof window === 'undefined' || !window[type]) return false;
  
  try {
    // Test in an iframe to detect third-party cookie restrictions
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeStorage = iframe.contentWindow?.[type];
    document.body.removeChild(iframe);
    
    if (!iframeStorage) return false;
    // First check if the storage object exists
    if (!window[type]) return false;
    
    const storage = window[type];
    const testKey = `__storage_test__${Math.random()}`;
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Determine if localStorage and sessionStorage are available
// We wrap this in a function to allow for lazy evaluation and re-checking
const checkLocalStorage = (): boolean => {
  try {
    return isStorageAvailable('localStorage');
  } catch (e) {
    return false;
  }
};

const checkSessionStorage = (): boolean => {
  try {
    return isStorageAvailable('sessionStorage');
  } catch (e) {
    return false;
  }
};

// Initial checks - these will be re-evaluated when methods are called
let hasLocalStorage = typeof window !== 'undefined' ? checkLocalStorage() : false;
let hasSessionStorage = typeof window !== 'undefined' ? checkSessionStorage() : false;

// Safe localStorage wrapper
export const localStore = {
  getItem: (key: string): string | null => {
    // Re-check storage availability each time to handle dynamic environments
    hasLocalStorage = typeof window !== 'undefined' ? checkLocalStorage() : false;
    
    if (hasLocalStorage) {
      try {
        const value = localStorage.getItem(key);
        // Also store in memory as backup
        if (value !== null) {
          memoryStore[key] = value;
          persistentStore[key] = value; // Update persistent store
        }
        return value;
      } catch (error) {
        reportStorageError(error, 'getItem', 'localStorage');
        // Try to recover from persistent store first, then memory store
        return persistentStore[key] || memoryStore[key] || null;
      }
    }
    // Fallback to persistent store first, then memory store
    return persistentStore[key] || memoryStore[key] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    // Re-check storage availability each time
    hasLocalStorage = typeof window !== 'undefined' ? checkLocalStorage() : false;
    
    if (hasLocalStorage) {
      try {
        localStorage.setItem(key, value);
        persistentStore[key] = value; // Update persistent store
        return true;
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
        // Continue to fallback
      }
    }
    // Update both persistent and memory stores
    persistentStore[key] = value;
    memoryStore[key] = value;
    return true; // Still succeeded with fallback
  },
  
  removeItem: (key: string): boolean => {
    // Re-check storage availability each time
    hasLocalStorage = typeof window !== 'undefined' ? checkLocalStorage() : false;
    
    if (hasLocalStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
        // Continue to fallback
      }
    }
    // Clean up both persistent and memory stores
    delete persistentStore[key];
    delete memoryStore[key];
    return true;
  }
};

// Similar implementation for sessionStorage
export const sessionStore = {
  getItem: (key: string): string | null => {
    // Re-check storage availability each time
    hasSessionStorage = typeof window !== 'undefined' ? checkSessionStorage() : false;
    
    if (hasSessionStorage) {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.warn('sessionStorage access failed:', error);
        // Continue to fallback
      }
    }
    // Fallback to memory store
    return memoryStore[key] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    // Re-check storage availability each time
    hasSessionStorage = typeof window !== 'undefined' ? checkSessionStorage() : false;
    
    if (hasSessionStorage) {
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('sessionStorage.setItem failed:', error);
        // Continue to fallback
      }
    }
    // Fallback to memory store
    memoryStore[key] = value;
    return true;
  },
  
  removeItem: (key: string): boolean => {
    // Re-check storage availability each time
    hasSessionStorage = typeof window !== 'undefined' ? checkSessionStorage() : false;
    
    if (hasSessionStorage) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('sessionStorage.removeItem failed:', error);
        // Continue to fallback
      }
    }
    // Always clean up memory store
    delete memoryStore[key];
    return true;
  }
};