/**
 * Safe storage utilities with memory fallback
 * Handles environments where storage access is restricted
 */

// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Check if storage is available
const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Safe localStorage wrapper
export const localStore = {
  isAvailable: isStorageAvailable('localStorage'),
  
  getItem: (key: string): string | null => {
    try {
      if (!localStore.isAvailable) {
        return memoryStore[key] || null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return memoryStore[key] || null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (!localStore.isAvailable) {
        memoryStore[key] = value;
        return true;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      memoryStore[key] = value;
      return true; // Still succeeded with memory fallback
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (!localStore.isAvailable) {
        delete memoryStore[key];
        return true;
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      delete memoryStore[key];
      return true; // Still succeeded with memory fallback
    }
  }
};

// Session storage implementation follows the same pattern
export const sessionStore = {
  // Similar implementation as localStore but with sessionStorage
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error);
      return false;
    }
  }
};