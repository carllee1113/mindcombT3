// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Check if storage is available
const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
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
const hasLocalStorage = typeof window !== 'undefined' ? isStorageAvailable('localStorage') : false;
const hasSessionStorage = typeof window !== 'undefined' ? isStorageAvailable('sessionStorage') : false;

// Safe localStorage wrapper
export const localStore = {
  getItem: (key: string): string | null => {
    if (hasLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage access failed:', error);
      }
    }
    // Fallback to memory store
    return memoryStore[key] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    if (hasLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
      }
    }
    // Fallback to memory store
    memoryStore[key] = value;
    return true; // Still succeeded with memory fallback
  },
  
  removeItem: (key: string): boolean => {
    if (hasLocalStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
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
    if (hasSessionStorage) {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.warn('sessionStorage access failed:', error);
      }
    }
    // Fallback to memory store
    return memoryStore[key] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    if (hasSessionStorage) {
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('sessionStorage.setItem failed:', error);
      }
    }
    // Fallback to memory store
    memoryStore[key] = value;
    return true;
  },
  
  removeItem: (key: string): boolean => {
    if (hasSessionStorage) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('sessionStorage.removeItem failed:', error);
      }
    }
    // Always clean up memory store
    delete memoryStore[key];
    return true;
  }
};