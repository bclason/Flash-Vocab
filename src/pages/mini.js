import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import correctSound from '../components/correct.mp3';
import incorrectSound from '../components/incorrect.mp3';
import { useStarredFilter } from '../hooks/useStarredFilter';



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
  const [starred, setIsStarred] = useState(false);
  const { filteredCards, practiceStarredOnly, togglePracticeStarred, starredCount, totalCount } = useStarredFilter(cards);

  // Fetch all cards when the component mounts (all set)
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
    // This runs when the star button is clicked (practiceStarredOnly changes)
    if (cards.length > 0) {
      setRemainingCards([...filteredCards]); // Switch between starred and all cards
      // Clear current term so a new one gets selected from the new set
      setCurrentTerm(null);
    } 
  }, [starred]);


  useEffect(() => {
    if (remainingCards.length > 0 && filteredCards.length > 0) {
      getRandomTerm();
    } else if (remainingCards.length === 0 && filteredCards.length > 0 && cards.length > 0) {
      // All cards completed - show completion message or restart
      // Only show if we have cards loaded (prevents initial load alert)
      alert(`Congratulations! You've completed all ${filteredCards.length} terms!`);
      setRemainingCards([...filteredCards]); // Reset for another round
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
    
    // Check if answer matches correct answer or secondary translation (case-insensitive)
    const answerLower = answer.toLowerCase().trim();
    const correctAnswerLower = correctAnswer.toLowerCase().trim();
    const secondaryAnswerLower = secondaryAnswer ? secondaryAnswer.toLowerCase().trim() : '';
    
    if (answerLower === correctAnswerLower || (secondaryAnswerLower && answerLower === secondaryAnswerLower)) {
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
          onClick={() => {
            togglePracticeStarred();
            setIsStarred(!starred);
          }}
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

      {/* Progress indicator */}
      <p style={{
        textAlign: 'center',
        fontSize: '1.5rem',
        padding: '1rem',
        fontWeight: '550',
      }}>
        {filteredCards.length === 0 ? 'No starred cards found' : `${filteredCards.length - remainingCards.length} / ${filteredCards.length} terms completed`}
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
