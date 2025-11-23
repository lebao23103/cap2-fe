// MSW disabled - Using real Django backend API
// To re-enable MSW for development without backend:
// Uncomment the lines below
// if (import.meta.env.DEV) {
//   const { worker } = await import('./mocks/browser')
//   await worker.start({
//     onUnhandledRequest: 'bypass',
//   })
// }

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile-fixes.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
