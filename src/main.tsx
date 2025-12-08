// MSW disabled - Using real Django backend API
// To re-enable MSW for development without backend:
// Uncomment the lines below
// if (import.meta.env.DEV) {
//   const { worker } = await import('./mocks/browser')
//   await worker.start({
//     onUnhandledRequest: 'bypass',
//   })
// }


import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile-fixes.css'

// CRITICAL: react-pdf required styles for TextLayer and AnnotationLayer
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
