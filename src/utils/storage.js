// Import the safer storage implementation
import { localStore } from './safeStorage';

// Use the safer implementation that includes memory fallback
const getItem = (key) => {
  return localStore.getItem(key);
};

const setItem = (key, value) => {
  return localStore.setItem(key, value);
};

// Export these safer methods
export { getItem, setItem }