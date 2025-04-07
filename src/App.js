import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { FaSmile, FaFrown, FaMeh, FaPaperPlane, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'; // Importer les icônes
import './App.css';

//const HUGGINGFACE_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;

const API_URL = process.env.REACT_APP_API_URL// <<< VÉRIFIEZ CELLE-CI

const SentimentDisplay = ({ result }) => {
  if (!result) return null;

  let IconComponent;
  switch (result.sentiment) {
    case 'Positif':
      IconComponent = FaSmile;
      break;
    case 'Négatif':
      IconComponent = FaFrown;
      break;
    default: // Neutre
      IconComponent = FaMeh;
      break;
  }

  return (
    <div className={`result-container result-${result.sentiment.toLowerCase()}`}>
      <IconComponent className="sentiment-icon" size={40} />
      <div className="result-text">
        <p className="sentiment-label">
          Sentiment : <strong>{result.sentiment}</strong>
        </p>
        <p className="sentiment-details">
          (Basé sur "{result.originalLabel}" avec une confiance de {result.score})
        </p>
      </div>
    </div>
  );
};

function App() {
  const [inputText, setInputText] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    if (sentimentResult) setSentimentResult(null);
    if (error) setError('');
  };

  // Fonction pour mapper le label "X stars" en sentiment
  const mapResultToSentiment = (result) => {
    const label = result.label.toLowerCase(); // ex: "1 star", "5 stars"
    let sentiment = 'Neutre'; // Par défaut (pour 3 stars)

    // Logique basée sur les étoiles
    if (label.includes('1 star') || label.includes('2 stars')) {
      sentiment = 'Négatif';
    } else if (label.includes('4 stars') || label.includes('5 stars')) {
      sentiment = 'Positif';
    }
    // 3 stars reste Neutre

    return {
      sentiment,
      score: result.score.toFixed(3),
      originalLabel: result.label
    };
  }

  const analyzeSentiment = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Veuillez entrer du texte à analyser.');
      return;
    }

    setLoading(true);
    setError('');
    setSentimentResult(null);

    try {
      const response = await axios.post(
        API_URL,
        { text: inputText },
        {
          timeout: 15000
        }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0]) && response.data[0].length > 0) {
        
          const resultsArray = response.data[0];

          // --- IMPORTANT : Trier les résultats par score décroissant ---
          // Car l'API ne garantit pas l'ordre pour les modèles multi-labels comme celui-ci
          resultsArray.sort((a, b) => b.score - a.score);
          // --- FIN DU TRI ---

          const topResult = resultsArray[0]; // Prend le résultat avec le score le plus élevé après tri

          if (topResult && topResult.label && typeof topResult.score === 'number') {
             const mappedResult = mapResultToSentiment(topResult); // Utiliser la fonction adaptée aux étoiles
             setSentimentResult(mappedResult);
          } else {
             console.error("Le format du résultat principal est inattendu:", topResult);
             throw new Error("Le format de la réponse de l'API est inattendu (résultat principal).");
          }
      } else {
          console.error("Format de réponse global inattendu:", response.data);
          // Gestion spécifique si le modèle est en cours de chargement mais renvoie quand même une structure inattendue
           if (response.data && response.data.error && response.data.error.includes("currently loading")) {
               const estimatedTime = response.data.estimated_time ? ` Environ ${Math.ceil(response.data.estimated_time)}s.` : '';
               throw new Error(`Le modèle est en cours de chargement sur Hugging Face.${estimatedTime} Veuillez réessayer dans quelques instants.`);
           } else {
               throw new Error("Le format de la réponse de l'API est invalide ou vide.");
           }
      }

    } catch (err) {
      console.error("Erreur détaillée lors de l'analyse :", err);
      let errorMessage = "Une erreur est survenue lors de l'analyse.";

       if (err.code === 'ECONNABORTED') {
            errorMessage = "La requête a expiré. Le modèle prend peut-être du temps à répondre ou votre connexion est lente.";
       } else if (err.response) {
        console.error("Erreur API - Status:", err.response.status);
        console.error("Erreur API - Data:", err.response.data);
        errorMessage = `Erreur API (${err.response.status}): `;
        if (err.response.data && err.response.data.error) {
            errorMessage += err.response.data.error;
            if (err.response.status === 503 && err.response.data.error.includes("currently loading")) {
                 const estimatedTime = err.response.data.estimated_time ? ` Environ ${Math.ceil(err.response.data.estimated_time)}s.` : '';
                 errorMessage = `Le modèle est en cours de chargement sur Hugging Face.${estimatedTime} Veuillez réessayer dans quelques instants.`;
            }
        } else {
            errorMessage += err.message;
        }
        if (err.response.status === 401) {
            errorMessage = "Erreur d'authentification (401). Vérifiez votre clé API Hugging Face.";
        }
      } else if (err.request) {
        errorMessage = "Pas de réponse reçue du serveur. Vérifiez votre connexion internet ou l'état de l'API Hugging Face.";
      } else {
        errorMessage = `Erreur de configuration ou autre: ${err.message}`;
      }
      setError(errorMessage);
      setSentimentResult(null);
    } finally {
      setLoading(false);
    }
  }, [inputText]);

  return (
    <div className="App">
      <div className="sentiment-analyzer-card">
        <h1>Analyse de Sentiment Avancée</h1>
        <p className="subtitle">Entrez une phrase en français et découvrez son émotion !</p>

        <div className="input-area">
          <textarea
            rows="4"
            placeholder="Exemple: J'ai passé une journée absolument merveilleuse !"
            value={inputText}
            onChange={handleInputChange}
            disabled={loading}
            aria-label="Texte à analyser"
          />
          <button
            onClick={analyzeSentiment}
            disabled={loading || !inputText.trim()}
            className="analyze-button"
            aria-live="polite"
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Analyse...
              </>
            ) : (
              <>
                Analyser <FaPaperPlane style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <FaExclamationTriangle style={{ marginRight: '8px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        {sentimentResult && !loading && <SentimentDisplay result={sentimentResult} />}

      </div>
       <footer className="app-footer">
           Propulsé par un modèle Hugging Face
           <a href="https://huggingface.co/cmarkea/distilcamembert-base-sentiment" target="_blank" rel="noopener noreferrer">DistilCamemBERT</a> via Hugging Face
        </footer>
    </div>
  );
}

export default App;