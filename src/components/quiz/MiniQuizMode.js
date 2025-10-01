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
    // console.log('MiniQuizMode useEffect:', { 
    //   remainingCardsLength: remainingCards.length, 
    //   filteredCardsLength: filteredCards.length, 
    //   cardsLength: cards.length,
    //   quizStarted
    // });
    
    if (remainingCards.length > 0 && filteredCards.length > 0) {
      getRandomTerm();
    } else if (remainingCards.length === 0 && filteredCards.length > 0 && cards.length > 0 && quizStarted) {
      // All cards completed - show completion screen
      console.log('Mini quiz completed');
      setQuizComplete(true);
    }
  }, [remainingCards, filteredCards, onComplete, cards.length, quizStarted]);

  const getRandomTerm = () => {
    if (remainingCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const selectedCard = remainingCards[randomIndex];
    
    // Find the most up-to-date version of this card from the cards array
    const upToDateCard = cards.find(card => card.id === selectedCard.id);
    setCurrentTerm(upToDateCard || selectedCard);
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
      setTotalAttempts(prev => prev + 1);
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
      setTotalAttempts(prev => prev + 1);
    }
  }

  const handleRestart = () => {
    setRemainingCards([...filteredCards]);
    setQuizComplete(false);
    setCurrentTerm(null);
    setAnswer('');
    setStatus(null);
    setTotalAttempts(0);
  };

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

  if (quizComplete) {
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
