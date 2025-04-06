import { localStore, sessionStore } from '../utils/safeStorage';

function ExampleComponent() {
  // Instead of:
  // const savedData = localStorage.getItem('userData');
  
  // Use:
  const savedData = localStore.getItem('userData');
  
  const saveData = (data: string) => {
    // Returns boolean indicating success
    const saved = localStore.setItem('userData', data);
    if (!saved) {
      // Handle the error case - maybe use in-memory fallback
      console.log('Could not save data to storage');
    }
  };
  
  // Rest of component...
}