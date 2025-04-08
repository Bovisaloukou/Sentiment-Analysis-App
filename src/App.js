 // Importer les icônes
 import React, { useEffect } from 'react';
 import Aos from 'aos';
 import './App.css';
 
 function App() {
   useEffect(() => {
     Aos.init({
       duration: 1000, // Durée de l'animation en millisecondes
     });
   }, []);
 
   return (
     <div className="App">
     <div className='sentiment-analyzer-first-card'>
     <div data-aos="fade-up">
         <h1 className="app-title">Bienvenue sur la plateforme qui révèle les sentiments </h1>
           <a href='/demarrer'>
           <button 
            //  onClick={() => navigate('/demarrer')}
             className="button-commencer" 
             aria-label="Commencer l'analyse de sentiment" 
             data-aos="fade-up" data-aos-delay="200">
             Commencer
           </button>
           </a> 
       </div>
     </div>
       
    
       <footer className="app-footer">
         Propulsé par un modèle Hugging Face
         <a href="https://huggingface.co/cmarkea/distilcamembert-base-sentiment" target="_blank" rel="noopener noreferrer">DistilCamemBERT</a> via Hugging Face
       </footer>
     </div>
   );
 }
 
 export default App;