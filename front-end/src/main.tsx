import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ThemeState } from './interfacesEnumsAndTypes/enums.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme={ThemeState.LIGHT}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
