import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { StoresContext, store } from './store/store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StoresContext.Provider value={store}>
      <App />
    </StoresContext.Provider>
  </React.StrictMode>
)