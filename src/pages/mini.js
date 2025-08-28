import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import correctSound from '../components/correct.mp3';
import incorrectSound from '../components/incorrect.mp3';


// TODO: 
// not updating accuracy correctly
// also add functionality to practice only a subset of cards (likely have to have a screen before quiz)
// checking for lowercase 


export default function MiniQuiz() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [remainingCards, setRemainingCards] = useState([]); // Cards that haven't been done yet

  const [answer, setAnswer] = useState('');
  const [currentTerm, setCurrentTerm] = useState(null);
  const [status, setStatus] = useState(null); //correct or incorrect

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    // Fetch all cards from your backend
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setRemainingCards([...data]); // Initialize remaining cards with all cards
      })
      .catch(err => console.error('Failed to fetch cards', err));
  }, [listId]);

  useEffect(() => {
    if (remainingCards.length > 0) {
      getRandomTerm();
    } else if (cards.length > 0) {
      // All cards completed - show completion message or restart
      alert(`Congratulations! You've completed all ${cards.length} terms!`);
      setRemainingCards([...cards]); // Reset for another round
      getRandomTerm();
    }
  }, [remainingCards]);


  const getRandomTerm = () => {
    if (remainingCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const selectedCard = remainingCards[randomIndex];
    
    // Find the most up-to-date version of this card from the cards array
    setCards(currentCards => {
      const upToDateCard = currentCards.find(card => card.id === selectedCard.id);
      setCurrentTerm(upToDateCard || selectedCard);
      return currentCards; // Return unchanged cards array
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = isReversed ? currentTerm.term : currentTerm.translation;
    const secondaryAnswer = isReversed ? '' : currentTerm.secondary_translation;
    
    // Check if answer matches correct answer or secondary translation
    if (answer === correctAnswer || (secondaryAnswer && answer === secondaryAnswer)) {
      new Audio(correctSound).play();
      setStatus('correct');
      setTimeout(() => {
        setAnswer('');
        setRemainingCards(prev => prev.filter(card => card.id !== currentTerm.id));
        setStatus(null);
      }, 300);
      updateAccuracy(true);
      // console.log(currentTerm.correct_attempts);
      // console.log(currentTerm.total_attempts);
    } else {
      // incorrect
      new Audio(incorrectSound).play();
      setStatus('incorrect');
      setTimeout(() => {
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
      }, 300);
      setTimeout(() => {
        setAnswer('');
        getRandomTerm(); // Try the same term again or get a new one
        setStatus(null);
      }, 300);
      updateAccuracy(false);
      // console.log(currentTerm.correct_attempts);
      // console.log(currentTerm.total_attempts);
    }
  }

  const updateAccuracy = (correct) => {
    // Use functional state update to get the most current values
    setCurrentTerm(prevTerm => {
      const new_correct = correct ? prevTerm.correct_attempts + 1 : prevTerm.correct_attempts;
      const new_total = prevTerm.total_attempts + 1;
      
      console.log(`BEFORE: correct_attempts=${prevTerm.correct_attempts}, total_attempts=${prevTerm.total_attempts}`);
      console.log(`CALCULATING: correct=${correct}, new_correct=${new_correct}, new_total=${new_total}`);
      
      // Update the database
      fetch(`/cards/${prevTerm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct_attempts: new_correct, total_attempts: new_total }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update accuracy');
        }
        console.log(`DATABASE UPDATED: correct_attempts=${new_correct}, total_attempts=${new_total}`);
      })
      .catch(error => console.error('Error updating accuracy:', error));

      // Also update the cards array
      setCards(prev => prev.map(card => 
        card.id === prevTerm.id 
          ? { ...card, correct_attempts: new_correct, total_attempts: new_total }
          : card
      ));

      // Return the updated current term
      const updatedTerm = {
        ...prevTerm,
        correct_attempts: new_correct,
        total_attempts: new_total
      };
      
      console.log(`AFTER STATE UPDATE: correct_attempts=${updatedTerm.correct_attempts}, total_attempts=${updatedTerm.total_attempts}`);
      return updatedTerm;
    });
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

      {/* List Name and Progress */}
      <h1 style={{
        padding: '.5rem',
        alignItems: 'center',
        fontSize: '42px',
        textDecoration: 'underline',
        justifyContent: 'center',
        display: 'flex'
      }}>{listName}
      </h1>

      {/* Progress indicator */}
      <p style={{
        textAlign: 'center',
        fontSize: '20px',
        margin: '1rem 0',
      }}>
        Progress: {cards.length - remainingCards.length} / {cards.length} terms completed
      </p>

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
          }}>{isReversed ? currentTerm.translation : currentTerm.term}</h2>
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
          {isReversed ? 'Display Terms' : 'Display Translations'}
        </button>
      </div>
    </div>
  );
}

