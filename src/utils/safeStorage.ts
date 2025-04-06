/**
 * Safe storage utilities with memory fallback
 */

// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Safe localStorage wrapper
export const localStore = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return memoryStore[key] || null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
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
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      delete memoryStore[key];
      return true; // Still succeeded with memory fallback
    }
  }
};

// Session storage implementation
export const sessionStore = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error);
      return memoryStore[key] || null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error);
      memoryStore[key] = value;
      return true;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error);
      delete memoryStore[key];
      return true;
    }
  }
};