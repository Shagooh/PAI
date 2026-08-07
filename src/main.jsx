import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App'

const globalStyles = document.createElement('style')
globalStyles.innerHTML = `
  html {
    scrollbar-gutter: stable;
  }
`
document.head.appendChild(globalStyles)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
