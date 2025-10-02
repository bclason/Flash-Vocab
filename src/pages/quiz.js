import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStarredFilter } from '../hooks/useStarredFilter';
import FullQuizMode from '../components/medleyModes/FullQuizMode';

export default function Quiz() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  const { filteredCards, practiceStarredOnly, togglePracticeStarred, starredCount, totalCount } = useStarredFilter(cards);

  // Fetch all cards from your backend
  useEffect(() => {
    if (!listId) return;
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
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
      <button 
        onClick={togglePracticeStarred}
        title={practiceStarredOnly ? `Practice all cards (${totalCount})` : `Practice only starred cards (${starredCount})`}
        style={{
          fontSize: '3rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {practiceStarredOnly ? '★' : '☆'}
      </button>

      <h1 style={{
        textAlign: 'center',
        alignItems: 'center',
        fontSize: '52px',
        fontWeight: 'bolder',
      }}>Full Quiz: {listName}</h1>
    </div>

      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '24px',
      }}>
        Feeling confident? Take the Full Quiz to test your full knowledge!
      </p>

      {/* FullQuizMode component */}
      <FullQuizMode 
        cards={cards}
        practiceStarredOnly={practiceStarredOnly}
      />
    </div>
  );
}

