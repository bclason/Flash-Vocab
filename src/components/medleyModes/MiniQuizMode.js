import { useState, useEffect } from 'react';
import correctSound from '../correct.mp3';
import incorrectSound from '../incorrect.mp3';

// when starred messed up, switching terms with each input

export default function MiniQuizMode({ 
  cards, 
  practiceStarredOnly = false, 
  onComplete = null,
}) {
  const [remainingCards, setRemainingCards] = useState([]); // Cards that haven't been done yet
  const [answer, setAnswer] = useState('');
  const [currentTerm, setCurrentTerm] = useState(null);
  const [status, setStatus] = useState(null); //correct or incorrect
  const [isReversed, setIsReversed] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [cardAccuracyUpdates, setCardAccuracyUpdates] = useState({});

  // Filter cards based on practiceStarredOnly prop
  const filteredCards = practiceStarredOnly 
    ? cards.filter(card => card.starred === 1 || card.starred === true)
    : cards;

  // Initialize remaining cards when cards or filtering changes
  useEffect(() => {
    if (filteredCards.length > 0) {
      setRemainingCards([...filteredCards]);
      setCurrentTerm(null); // Clear current term so a new one gets selected
      setQuizStarted(true); // Mark that quiz has started
    }
  }, [cards, practiceStarredOnly]);


  useEffect(() => {
    if (remainingCards.length > 0 && filteredCards.length > 0) {
      getRandomTerm();
    } else if (remainingCards.length === 0 && filteredCards.length > 0 && quizStarted && !quizComplete) {
      // Quiz completed - set completion state
      console.log('Mini quiz completed');
      setQuizComplete(true);
    }
  }, [remainingCards]);


  const getRandomTerm = () => {
    if (remainingCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const selectedCard = remainingCards[randomIndex];
    
    // Apply any accuracy updates we've tracked for this card
    const updatedCard = cardAccuracyUpdates[selectedCard.id] 
      ? { ...selectedCard, ...cardAccuracyUpdates[selectedCard.id] }
      : selectedCard;
      
    setCurrentTerm(updatedCard);
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
      updateAccuracy(true);
      setTimeout(() => {
        setAnswer('');
        setRemainingCards(prev => prev.filter(card => card.id !== currentTerm.id));
        setStatus(null);
      }, 300);
    } else {
      // incorrect
      new Audio(incorrectSound).play();
      setStatus('incorrect');
      updateAccuracy(false);
      setTimeout(() => {
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
      }, 300);
      setTimeout(() => {
        setAnswer('');
        // New term will be selected automatically by useEffect when remainingCards updates
        setStatus(null);
      }, 300);
    }
  }


  const handleRestart = () => {
    setRemainingCards([...filteredCards]);
    setQuizComplete(false);
    setCurrentTerm(null);
    setAnswer('');
    setStatus(null);
    // Don't reset cardAccuracyUpdates - keep previous quiz accuracy intact
  };


  const updateAccuracy = (correct) => {
    if (!currentTerm) return currentTerm;
    
    const old_correct = currentTerm.correct_attempts || 0;
    const old_total = currentTerm.total_attempts || 0;
    const new_correct = correct ? old_correct + 1 : old_correct;
    const new_total = old_total + 1;

    // Update the database
    fetch(`/cards/${currentTerm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct_attempts: new_correct, total_attempts: new_total }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update accuracy');
      }
    })
    .catch(error => console.error('Error updating accuracy:', error));

    // Create the updated term
    const updatedTerm = {
      ...currentTerm,
      correct_attempts: new_correct,
      total_attempts: new_total
    };
    
    setCurrentTerm(updatedTerm);
    
    // Track accuracy updates for this card
    setCardAccuracyUpdates(prev => {
      const newUpdates = {
        ...prev,
        [currentTerm.id]: {
          correct_attempts: new_correct,
          total_attempts: new_total
        }
      };
      return newUpdates;
    });
    return updatedTerm;
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading cards...
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        No starred cards found. Star some cards in the edit page first!
      </div>
    );
  }

  if (quizComplete && onComplete) {
    // In medley mode, show completion message briefly before auto-advance
    onComplete();
  } else if (quizComplete && !onComplete) {
    // Only show restart button when NOT in medley mode
    return (
        <div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleRestart}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress indicator */}
      <p style={{
        textAlign: 'center',
        fontSize: '1.5rem',
        padding: '1rem',
        fontWeight: '550',
      }}>
        {filteredCards.length - remainingCards.length} / {filteredCards.length} terms completed
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
