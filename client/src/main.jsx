import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem('theme')
const systemUsesDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
const startingTheme = savedTheme || (systemUsesDarkMode ? 'dark' : 'light')

document.documentElement.setAttribute('data-theme', startingTheme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
