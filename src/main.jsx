
import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import MobileSite from './components/flow/MobileSite'

// 데스크톱일 때만 App.jsx(three.js 3D 포함)를 내려받음
const App = lazy(() => import('./App'))

const IS_MOBILE = window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches

const loading = (
  <div style={{ position: 'fixed', inset: 0, background: '#1a1410', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
    Loading…
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {IS_MOBILE ? <MobileSite /> : <Suspense fallback={loading}><App /></Suspense>}
  </React.StrictMode>
)
