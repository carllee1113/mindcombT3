// Add error handling to localStorage access
const getItem = (key) => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('localStorage access failed:', error)
    return null
  }
}

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn('localStorage access failed:', error)
  }
}

// Export these safer methods
export { getItem, setItem }