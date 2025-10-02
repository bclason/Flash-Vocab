import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStarredFilter } from '../hooks/useStarredFilter';
import MiniQuizMode from '../components/medleyModes/MiniQuizMode';

export default function MiniQuiz() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  const { filteredCards, practiceStarredOnly, togglePracticeStarred, starredCount, totalCount } = useStarredFilter(cards);

  // Fetch all cards when the component mounts
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

  return (
    <div>
      {/* Home button */}
      <div style={{
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        padding: '.2rem',
        fontSize: '1.5rem',
      }}>
          <button
            type="button"
            onClick={() => navigate('/')}
          > Home</button>
      </div>

      {/* Starred, Title, List */}
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
          }}>
          {practiceStarredOnly ? '★' : '☆'}
        </button>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 'bolder',
        }}>Flash Quiz: {listName}</h1>
      </div>

      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '1.5rem',
      }}>
        Speed through your terms and see how many you can get right! Just type and hit enter.
      </p>

      {/* MiniQuizMode component */}
      <MiniQuizMode 
        cards={cards}
        practiceStarredOnly={practiceStarredOnly}
      />
    </div>
  );
}
