import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ToastProvider } from './components/ui'
import { WalletProvider } from './context/WalletContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Streams from './pages/Streams'
import AgentConsolePage from './pages/AgentConsolePage'
import Docs from './pages/Docs'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/streams" element={<Layout><Streams /></Layout>} />
      <Route path="/agent" element={<Layout><AgentConsolePage /></Layout>} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/docs/:section" element={<Docs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WalletProvider>
          <AppRoutes />
        </WalletProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
