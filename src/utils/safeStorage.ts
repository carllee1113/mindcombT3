// Memory fallback when storage is unavailable
const memoryStore: Record<string, string> = {};

// Safe localStorage wrapper
export const localStore = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access failed:', error);
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
      return true;
    }
  }
};

// Similar implementation for sessionStorage
export const sessionStore = {
  // Implementation similar to localStore but with sessionStorage
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage access failed:', error);
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