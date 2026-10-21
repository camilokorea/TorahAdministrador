import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { captureInstallPrompt } from './lib/install'

// Escuchar desde el inicio el aviso de instalación del navegador (llega una sola vez y muy temprano).
captureInstallPrompt()

// Service worker: permite instalar el administrador como app. Solo en el sitio publicado.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

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
