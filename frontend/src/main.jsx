import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { SiteProvider } from './context/SiteContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteProvider>
          <App />
        </SiteProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
