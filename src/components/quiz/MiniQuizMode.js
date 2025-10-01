import { useState, useEffect } from 'react';
import correctSound from '../correct.mp3';
import incorrectSound from '../incorrect.mp3';
import Medley from '../../pages/medley';

export default function MiniQuizMode({ 
  cards, 
  practiceStarredOnly = false, 
  onComplete = null,
  medley,
}) {
  const [remainingCards, setRemainingCards] = useState([]); // Cards that haven't been done yet
  const [answer, setAnswer] = useState('');
  const [currentTerm, setCurrentTerm] = useState(null);
  const [status, setStatus] = useState(null); //correct or incorrect
  const [isReversed, setIsReversed] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
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
    } else if (remainingCards.length === 0 && filteredCards.length > 0 && cards.length > 0 && quizStarted) {
      // All cards completed - show completion screen
      console.log('Mini quiz completed');
      setQuizComplete(true);
      // Auto-advance if in medley mode
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    }
  }, [remainingCards, filteredCards, onComplete, cards.length, quizStarted]);


  const getRandomTerm = () => {
    if (remainingCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const selectedCard = remainingCards[randomIndex];
    
    // console.log(`getRandomTerm - Card ${selectedCard.id} original:`, selectedCard.correct_attempts, selectedCard.total_attempts);
    // console.log(`getRandomTerm - Card ${selectedCard.id} updates:`, cardAccuracyUpdates[selectedCard.id]);
    
    // Apply any accuracy updates we've tracked for this card
    const updatedCard = cardAccuracyUpdates[selectedCard.id] 
      ? { ...selectedCard, ...cardAccuracyUpdates[selectedCard.id] }
      : selectedCard;
      
    // console.log(`getRandomTerm - Card ${selectedCard.id} final:`, updatedCard.correct_attempts, updatedCard.total_attempts);
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
    
    setTotalAttempts(prev => prev + 1);
    
    if (answerLower === correctAnswerLower || (secondaryAnswerLower && answerLower === secondaryAnswerLower)) {
      new Audio(correctSound).play();
      setStatus('correct');
      const updatedTerm = updateAccuracy(true);
      setTimeout(() => {
        setAnswer('');
        setRemainingCards(prev => prev.filter(card => card.id !== currentTerm.id));
        setStatus(null);
      }, 300);
    } else {
      // incorrect
      new Audio(incorrectSound).play();
      setStatus('incorrect');
      const updatedTerm = updateAccuracy(false);
      setTimeout(() => {
        alert(`Incorrect! The correct answer was: ${correctAnswer}`);
      }, 300);
      setTimeout(() => {
        setAnswer('');
        // Get a new random term after incorrect answer
        getRandomTermWithUpdatedAccuracy(updatedTerm);
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
    setTotalAttempts(0);
    // Don't reset cardAccuracyUpdates - keep previous quiz accuracy intact
  };


  const updateAccuracy = (correct) => {
    if (!currentTerm) return currentTerm;
    
    const old_correct = currentTerm.correct_attempts || 0;
    const old_total = currentTerm.total_attempts || 0;
    const new_correct = correct ? old_correct + 1 : old_correct;
    const new_total = old_total + 1;
    
    const old_percentage = old_total > 0 ? ((old_correct / old_total) * 100).toFixed(1) : 'N/A';
    const new_percentage = (new_correct / new_total * 100).toFixed(1);
    
    // console.log(`MINI - Card ${currentTerm.id} (${currentTerm.term}):`);
    // console.log(`  Before: ${old_correct}/${old_total} = ${old_percentage}%`);
    // console.log(`  Answer: ${correct ? 'CORRECT' : 'INCORRECT'}`);
    // console.log(`  After:  ${new_correct}/${new_total} = ${new_percentage}%`);
    
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
      // console.log(`MINI - Database updated successfully`);
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
      // console.log(`Storing accuracy updates:`, newUpdates);
      return newUpdates;
    });
    
    return updatedTerm;
  }

  const getRandomTermWithUpdatedAccuracy = (updatedCurrentTerm) => {
    if (remainingCards.length === 0) return;
    
    // Update the remainingCards array with the new accuracy for the current term
    const updatedRemainingCards = remainingCards.map(card => 
      card.id === updatedCurrentTerm.id ? updatedCurrentTerm : card
    );
    
    const randomIndex = Math.floor(Math.random() * updatedRemainingCards.length);
    const selectedCard = updatedRemainingCards[randomIndex];
    
    // console.log(`getRandomTermWithUpdatedAccuracy - Card ${selectedCard.id}:`, selectedCard.correct_attempts, selectedCard.total_attempts);
    setCurrentTerm(selectedCard);
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

  if (quizComplete && !onComplete) {
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
  } else if (quizComplete && onComplete) {
    // In medley mode, show completion message briefly before auto-advance
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.5rem' }}>
        Mini Quiz Complete! Moving to next mode...
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
