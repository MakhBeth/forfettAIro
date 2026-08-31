import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { runCrossDomainMigration, runLegacyOriginHandoff } from './lib/utils/crossDomainMigration'

async function boot() {
  if (await runLegacyOriginHandoff()) return

  await runCrossDomainMigration()
  // Senza storage persistente Chrome può evincere IndexedDB quando il disco è
  // quasi pieno (successo il 2026-08-31: dati utente cancellati dal browser).
  navigator.storage?.persist?.().catch(() => {})
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  )
}

boot()
