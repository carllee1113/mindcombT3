// 内存存储作为备用
const memoryStore: Record<string, string> = {};

// 安全的localStorage包装器
export const localStore = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage访问失败:', error);
      return memoryStore[key] || null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage访问失败:', error);
      memoryStore[key] = value;
      return true; // 使用内存备份仍然成功
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage访问失败:', error);
      delete memoryStore[key];
      return true;
    }
  }
};

// sessionStorage实现
export const sessionStore = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage访问失败:', error);
      return memoryStore[key] || null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('sessionStorage访问失败:', error);
      memoryStore[key] = value;
      return true;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('sessionStorage访问失败:', error);
      delete memoryStore[key];
      return true;
    }
  }
};