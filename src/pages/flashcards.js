import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FlashcardArray } from 'react-quizlet-flashcard';
import "react-quizlet-flashcard/dist/index.css";
import { useStarredFilter } from '../hooks/useStarredFilter';



export default function Flashcards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [isReversed, setIsReversed] = useState(false);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  // Use the custom hook for starred filtering
  const { filteredCards, practiceStarredOnly, togglePracticeStarred, starredCount, totalCount } = useStarredFilter(cards);


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
        console.log('Cards with starred field:', data.map(card => ({ id: card.id, term: card.term, starred: card.starred })));
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

  // Create the deck using the filtered cards
  const deck = createCards(filteredCards, isReversed);
  console.log('Filtered cards:', filteredCards);
  console.log('Deck created:', deck);
  console.log('Practice starred only:', practiceStarredOnly);
  console.log('Starred count:', starredCount);
  

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

    {/* Container to center everything */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '2rem',   // pushes it down a bit from the very top
    }}>

      {/* Row with button + title */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',  // space between star and text
      }}>
        <button 
          onClick={togglePracticeStarred}
          title={practiceStarredOnly ? `Practice all cards (${totalCount})` : `Practice only starred cards (${starredCount})`}
          style={{
            fontSize: '2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {practiceStarredOnly ? '★' : '☆'}
        </button>

        <h1 style={{
          fontSize: '42px',
          textDecoration: 'underline',
          margin: 0,
        }}>
          {listName}
        </h1>
      </div>
    </div>



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
          {cards.length === 0 
            ? 'Loading flashcards...' 
            : practiceStarredOnly && starredCount === 0
            ? 'No starred cards found. Star some cards in the edit page first!'
            : practiceStarredOnly 
            ? `No starred cards available (${starredCount} total)`
            : 'No cards found for this list.'
          }
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

