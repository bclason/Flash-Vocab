import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';



export default function Quiz() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  const [answers, setAnswers] = useState({}); // array of typed answers
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState([]);

  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    // Fetch all cards from your backend
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => setCards(data))   // Save fetched data into state
      .catch(err => console.error('Failed to fetch cards', err));
  }, [listId]);

  const updateAccuracy = (wrong) => {
    for (const card of cards) {
      let new_correct = card.correct_attempts;
      let new_total = card.total_attempts;
      if (!wrong.some(c => c.id === card.id)) {
        new_correct = card.correct_attempts + 1;
      }
      new_total = card.total_attempts + 1;
      // console.log(`Card ID: ${card.id}, Correct: ${new_correct}, Total: ${new_total}`);

      fetch(`/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct_attempts: new_correct, total_attempts: new_total }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update accuracy');
        }
        // Update the local state with the new values
        setCards(prev => prev.map(c => 
          c.id === card.id 
            ? { ...c, correct_attempts: new_correct, total_attempts: new_total }
            : c
        ));
      })
      .catch(error => console.error('Error updating accuracy:', error));
    }
  }


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
      }}>Full Quiz</h1>
      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '24px',
      }}>
        Feeling confident? Take the Full Quiz to test your full knowledge!
      </p>

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

    {/* Terms and Input Boxes */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {cards.map(card => (
          <div
            key={card.id}
            style={{
              display: 'flex',
              alignItems: 'center',     // vertical center of row
              justifyContent: 'flex-start',
              gap: '1rem',              // space between word and input
              width: '60%',             // row width (centered by parent)
              padding: '0.5rem 0',
            }}>
            <div 
              style={{ 
                fontSize: '2rem', 
                minWidth: '40%', 
                textAlign: 'right'
              }}>
              {isReversed ? card.translation : card.term}
            </div>

            <input
              style={{
                fontSize: '2rem',
                width: '40%',
                padding: '.5rem',
                border: '2px solid #ccc',
                boxSizing: 'border-box'
              }}
              value={answers[card.id] ?? ''}
              onChange={e =>
                setAnswers(prev => ({ ...prev, [card.id]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      {/* Button */}
      <div style={{
        margin: '.5rem',
        justifyContent: 'center',
        display: 'flex'
      }}>
      <button style={{
        fontSize: '2rem',
        fontWeight: 'bold'      
      }}
        onClick={() => {
        // Check answers based on reversed mode
        const wrong = cards.filter(c => {
          const correctAnswer = isReversed ? c.term : c.translation;
          const secondaryAnswer = isReversed ? '' : c.secondary_translation;
          return answers[c.id] !== correctAnswer && (secondaryAnswer ? answers[c.id] !== secondaryAnswer : true);
        });
        setWrongCards(wrong);
        setScore(cards.length - wrong.length);
        setQuizComplete(true);
        updateAccuracy(wrong);
      }}>
        Submit
      </button>
      </div>
      
      {/* Results */}
      {quizComplete && (
        <div style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '2rem',
          fontSize: '24px',
        }}>
          <p style={{
            fontWeight: 'bold'
          }}>Score: {score}/{cards.length}</p>
          <p style={{
            fontWeight: 'bold'
          }}>{quizComplete && score === cards.length ? 'Perfect score!' : 'Terms to work on:'}</p>

          {wrongCards.length > 0 && (
            <ul>
              {wrongCards.map(c => (
                <li key={c.id}>
                  {isReversed ? c.translation : c.term}: {isReversed ? c.term : c.translation}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Reverse Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <button
          type="button"
          onClick={() => {
            // Clear answers and toggle between normal and reversed
            setAnswers({});
            setQuizComplete(false);
            setScore(0);
            setWrongCards([]);
            setIsReversed(!isReversed);
          }}
        >
          {isReversed ? 'Show Terms → Translations' : 'Show Translations → Terms'}
        </button>
      </div>
    </div>
  );
}

