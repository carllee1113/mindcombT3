import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { StoreProvider } from './store/store'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)