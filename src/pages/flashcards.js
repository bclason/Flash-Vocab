import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FlashcardArray } from 'react-quizlet-flashcard';
import "react-quizlet-flashcard/dist/index.css";



export default function Flashcards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [isReversed, setIsReversed] = useState(false);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;


  useEffect(() => {
    if (!listId) return;
    // Fetch all cards from your backend
    fetch(`lists/${listId}/cards`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched cards:', data);
        if (data && Array.isArray(data)) {
          setCards(data);
        } else {
          console.error('Expected array but got:', data);
          setCards([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch cards', err);
        setCards([]);
      });
  }, [listId]);



  const createCards = (cards, reversed) => {
    // Create deck only when cards are available
    if (!cards || cards.length === 0) return [];
    
    return cards.map((card) => ({
      front: {
        html: (
          <div
            style={{
              display: "grid",
              placeItems: "center", // centers both horizontally + vertically
              height: "100%",
              fontSize: "3.5rem",
              textAlign: "center",  // keeps multi-line text centered
            }}>
            {reversed ? card.translation : card.term}
          </div>
        ),
      },
      back: {
        html: (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              fontSize: "3.5rem",
              textAlign: "center",
            }}
          >
            {reversed ? card.term : card.translation}
          </div>
        ),
      }
    }));
  }

  // Create the deck using the function
  const deck = createCards(cards, isReversed);
  

  return (
    <div>
      {/* Home button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '.2rem',
        fontSize: '1.5rem',
      }}>
          <button
            type="button"
            onClick={() => navigate('/')}
          > Home</button>
      </div>
      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        alignItems: 'center',
        fontSize: '52px',
        fontWeight: 'bolder',
      }}>Flashcards</h1>

      {/* List Name */}
      <h1 style={{
        padding: '.5rem',
        alignItems: 'center',
        fontSize: '42px',
        textDecoration: 'underline',
        justifyContent: 'center',
        display: 'flex'
      }}>{listName}
      </h1>

      {/* Flashcards */}
      {deck && deck.length > 0 ? (
        <div style={{ 
          padding: '2rem', 
          justifyContent: 'center', 
          alignItems: 'center',
          display: 'flex', 
          }}>
          <FlashcardArray deck={deck} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '18px', padding: '2rem' }}>
          {cards.length === 0 ? 'Loading flashcards...' : 'No cards found for this list.'}
        </p>
      )}

      {/* Reverse Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <button
          type="button"
          onClick={() => {
            // Toggle between normal and reversed
            setIsReversed(!isReversed);
          }}
        >
          {isReversed ? 'Show Terms First' : 'Show Translations First'}
        </button>
      </div>
    </div>
  );
}

