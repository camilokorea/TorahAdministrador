import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// El administrador sigue el tema claro/oscuro del sistema.
const media = window.matchMedia?.('(prefers-color-scheme: dark)')
const applyTheme = () => {
  document.documentElement.dataset.theme = media?.matches ? 'dark' : 'light'
}
applyTheme()
media?.addEventListener('change', applyTheme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
