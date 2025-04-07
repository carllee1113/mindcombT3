// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Check if storage is available
const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
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
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage access failed:', error);
        // Continue to fallback
      }
    }
    // Fallback to memory store
    return memoryStore[key] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    // Re-check storage availability each time
    hasLocalStorage = typeof window !== 'undefined' ? checkLocalStorage() : false;
    
    if (hasLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
        // Continue to fallback
      }
    }
    // Fallback to memory store
    memoryStore[key] = value;
    return true; // Still succeeded with memory fallback
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
    // Always clean up memory store
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