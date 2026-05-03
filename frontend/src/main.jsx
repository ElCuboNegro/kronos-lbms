import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Telemetry } from './utils/telemetry'

Telemetry.init()

const root = document.getElementById('root')
createRoot(root).render(<StrictMode><App /></StrictMode>)
