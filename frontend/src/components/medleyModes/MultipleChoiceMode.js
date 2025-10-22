import { useState, useEffect, useCallback } from 'react';
import config from '../../config';

export default function MultipleChoiceMode({ 
  cards, 
  onComplete = null,
}) {
  const [remainingCards, setRemainingCards] = useState([...cards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [cardAttempts, setCardAttempts] = useState({}); // Track attempts per card
  
  const currentCard = remainingCards[currentCardIndex];

  // Generate 4 multiple choice options
  const generateChoices = useCallback((correctCard, allCards) => {
    if (!correctCard || allCards.length < 4) return [];

    const correctAnswer = isReversed ? correctCard.term : correctCard.translation;
    
    // Get 3 random incorrect answers
    const otherCards = allCards.filter(card => card.id !== correctCard.id);
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
    const incorrectAnswers = shuffledOthers
      .slice(0, 3)
      .map(card => isReversed ? card.term : card.translation);

    // Combine correct and incorrect answers, then shuffle
    const allChoices = [correctAnswer, ...incorrectAnswers];
    return allChoices.sort(() => Math.random() - 0.5);
  }, [isReversed]);

  // Reset remaining cards when cards prop changes
  useEffect(() => {
    setRemainingCards([...cards]);
    setCurrentCardIndex(0);
    setQuizComplete(false);
  }, [cards]);

  // Generate choices when current card changes
  useEffect(() => {
    if (currentCard && cards.length >= 4) {
      const newChoices = generateChoices(currentCard, cards);
      setChoices(newChoices);
    }
  }, [currentCard, cards, generateChoices]);

  // Reset UI state when card changes
  useEffect(() => {
    if (currentCard) {
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentCard]);

  const handleAnswerClick = (choice) => {
    if (showResult) return; // Prevent clicking after answer is shown

    setSelectedAnswer(choice);
    setShowResult(true);

    const correctAnswer = isReversed ? currentCard.term : currentCard.translation;
    const isCorrect = choice === correctAnswer;

    // Update accuracy for this card
    updateAccuracy(currentCard, isCorrect);

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      if (isCorrect) {
        // Remove the current card from remaining cards (got it right)
        const newRemainingCards = remainingCards.filter((_, index) => index !== currentCardIndex);
        setRemainingCards(newRemainingCards);
        // Check if quiz is complete
        if (newRemainingCards.length === 0) {
          setQuizComplete(true);
          // Auto-advance if in medley mode
          if (onComplete) {
            onComplete();
          }
          return;
        }
        
        // Adjust currentCardIndex if needed
        if (currentCardIndex >= newRemainingCards.length) {
          setCurrentCardIndex(0);
        }
      } else {
        // Move to next card (wrong answer stays in the pool)
        if (remainingCards.length > 1) {
          if (currentCardIndex < remainingCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
          } else {
            setCurrentCardIndex(0); // Loop back to start
          }
        }
        // If only 1 card left, stay on the same card (don't change index)
      }
      // Reset the result display state for the next question
      setShowResult(false);
      setSelectedAnswer(null);
    }, 1000);
  };


  const handleRestart = () => {
    setRemainingCards([...cards]);
    setCurrentCardIndex(0);
    setQuizComplete(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setCardAttempts({}); // Reset session tracking
  };


  const updateAccuracy = (card, correct) => {
    // Get current attempts for this card (including session updates)
    const currentAttempts = cardAttempts[card.id] || { 
      correct: card.correct_attempts || 0, 
      total: card.total_attempts || 0 
    };
    
    const new_correct = correct ? currentAttempts.correct + 1 : currentAttempts.correct;
    const new_total = currentAttempts.total + 1;
    
    // Update our session tracking
    setCardAttempts(prev => ({
      ...prev,
      [card.id]: { correct: new_correct, total: new_total }
    }));
    
    console.log(`MCQ - Card ${card.id}: correct=${correct}, new_correct=${new_correct}, new_total=${new_total}`);
    
    // Update the database
    fetch(`${config.API_BASE_URL}/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct_attempts: new_correct, total_attempts: new_total }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update accuracy');
      }
      console.log(`MCQ - Database updated for card ${card.id}: ${new_correct}/${new_total}`);
    })
    .catch(error => console.error('Error updating accuracy:', error));
  };

  const getButtonStyle = (choice) => {
    if (!showResult) {
      return {
        padding: '1rem',
        fontSize: '1.75rem',
        cursor: 'pointer',
        minHeight: '80px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      };
    }

    const correctAnswer = isReversed ? currentCard.term : currentCard.translation;
    const isCorrect = choice === correctAnswer;
    const isSelected = choice === selectedAnswer;

    let backgroundColor = '#f8f9fa';
    let borderColor = '#dee2e6';

    if (isCorrect) {
      backgroundColor = '#d4edda';
      borderColor = '#28a745';
    } else if (isSelected && !isCorrect) {
      backgroundColor = '#f8d7da';
      borderColor = '#dc3545';
    }

    return {
      padding: '1rem',
      fontSize: '1.75rem',
      backgroundColor,
      border: `2px solid ${borderColor}`,
      cursor: 'pointer',
      minHeight: '80px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    };
  };

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading cards...
      </div>
    );
  }

  if (cards.length < 4) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Need at least 4 cards for multiple choice!
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
  }

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        No more cards to practice!
      </div>
    );
  }


  return (
    <div style={{ textAlign: 'center' }}>

      {/* Question */}
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        padding: '2rem',
        borderRadius: '12px',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isReversed ? currentCard.translation : currentCard.term}
      </div>

      {/* Multiple Choice Buttons - 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(choice)}
            style={getButtonStyle(choice)}
            disabled={showResult}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* Reverse Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '2rem',
      }}>
        <button
          type="button"
          onClick={() => {
            // Toggle between normal and reversed
            setIsReversed(!isReversed);
          }}
        >
          {isReversed ? 'Show Terms First' : 'Show Translations First'}
        </button>
      </div>
    </div>
  );
}