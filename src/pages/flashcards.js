import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStarredFilter } from '../hooks/useStarredFilter';
import FlashcardMode from '../components/medleyModes/FlashcardMode';



export default function Flashcards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  // Use the custom hook for starred filtering
  const { practiceStarredOnly, togglePracticeStarred, starredCount, totalCount } = useStarredFilter(cards);


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


      {/* Starred, Title, List Name */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        justifyContent: 'center',
      }}>
        <button 
          onClick={togglePracticeStarred}
          title={practiceStarredOnly ? `Practice all cards (${totalCount})` : `Practice only starred cards (${starredCount})`}
          style={{
            fontSize: '3rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
          {practiceStarredOnly ? '★' : '☆'}
        </button>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 'bolder',
        }}>Flashcards: {listName}</h1>
      </div>

      {/* FlashcardMode component */}
      <FlashcardMode 
        cards={cards}
        listName={listName}
        practiceStarredOnly={practiceStarredOnly}
        starredCount={starredCount}
        totalCount={totalCount}
      />
    </div>
  );
}

