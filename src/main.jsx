import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const style = document.createElement('style');
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scroll-behavior: smooth; /* Düymələrə basanda səhifənin yumşaq enməsi üçün */
  }
  body, html {
    width: 100%;
    background-color: #050816; /* Tünd ESG mövzusuna uyğun fon */
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)