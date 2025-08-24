import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import correctSound from '../components/correct.mp3';
import incorrectSound from '../components/incorrect.mp3';


// TODO: 
// add accuracy changes
// add functionality to reverse term and def (answer with term)
// also add functionality to practice only a subset of cards (likely have to have a screen before quiz)
// checking for lowercase 


export default function MiniQuiz() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);

  const [answer, setAnswer] = useState('');
  const [currentTerm, setCurrentTerm] = useState(null);
  const [status, setStatus] = useState(null); //correct or incorrect

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  useEffect(() => {
    // Fetch all cards from your backend
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => setCards(data))   // Save fetched data into state
      .catch(err => console.error('Failed to fetch cards', err));
  }, [listId]);

  useEffect(() => {
    if (cards.length > 0) {
      getRandomTerm();
    }
  }, [cards]);


  const getRandomTerm = () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentTerm(cards[randomIndex]);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer === currentTerm.translation || answer === currentTerm.secondary_translation) {
      new Audio(correctSound).play();
      setStatus('correct');
      setTimeout(() => {
        setAnswer('');
        getRandomTerm();
        setStatus(null);
      }, 500);
    } else {
      new Audio(incorrectSound).play();
      setStatus('incorrect');
      setTimeout(() => {
        setAnswer('');
      }, 500);
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
      }}>Flash Quiz</h1>

      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '24px',
      }}>
        Speed through your terms and see how many you can get right! Just type and hit enter.
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

      {/* Term and Input */}
      {currentTerm && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2rem 0',
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: status === 'correct' ? 'green' : status === 'incorrect' ? 'red' : 'black',
          }}>{currentTerm.term}</h2>
          <form onSubmit={handleSubmit}>
            <input style={{
              fontSize: '2rem'
            }}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer"
            />
          </form>
        </div>
      )}


    </div>
  );
}

