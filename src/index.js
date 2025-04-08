import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Demarrer from './pages/Demarrer';
import AOS from 'aos';
AOS.init({
  duration: 1000, // Durée de l'animation en millisecondes
})



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Wrap votre application avec le Router */}
        <Routes>
          <Route index element={<App />} /> {/* La route pour le chemin "/" */}
          <Route path="/demarrer" element={<Demarrer />} /> {/* La route pour le chemin "/demarrer" */}
        </Routes>
      </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
