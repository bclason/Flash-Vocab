import { useState, useEffect } from 'react';

export default function MultipleChoiceMode({ 
  cards, 
  listName, 
  onComplete = null,
}) {
  const [remainingCards, setRemainingCards] = useState([...cards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  
  const currentCard = remainingCards[currentCardIndex];

  // Generate 4 multiple choice options
  const generateChoices = (correctCard, allCards) => {
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
  };

  // Reset remaining cards when cards prop changes
  useEffect(() => {
    setRemainingCards([...cards]);
    setCurrentCardIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setQuizComplete(false);
  }, [cards]);

  // Generate choices when card changes
  useEffect(() => {
    if (currentCard && cards.length >= 4) {
      const newChoices = generateChoices(currentCard, cards);
      setChoices(newChoices);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentCardIndex, remainingCards, isReversed, cards]);

  const handleAnswerClick = (choice) => {
    if (showResult) return; // Prevent clicking after answer is shown

    setSelectedAnswer(choice);
    setShowResult(true);
    setTotalAttempts(prev => prev + 1);

    const correctAnswer = isReversed ? currentCard.term : currentCard.translation;
    const isCorrect = choice === correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

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
            setTimeout(() => {
              onComplete();
            }, 1500);
          }
          return;
        }
        
        // Adjust currentCardIndex if needed
        if (currentCardIndex >= newRemainingCards.length) {
          setCurrentCardIndex(0);
        }
      } else {
        // Move to next card (wrong answer stays in the pool)
        if (currentCardIndex < remainingCards.length - 1) {
          setCurrentCardIndex(prev => prev + 1);
        } else {
          setCurrentCardIndex(0); // Loop back to start
        }
      }
      
      // Reset the result display state for the next question
      setShowResult(false);
      setSelectedAnswer(null);
    }, 1000);
  };

  const handleRestart = () => {
    setRemainingCards([...cards]);
    setCurrentCardIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setQuizComplete(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const updateAccuracy = (card, correct) => {
    const new_correct = correct ? card.correct_attempts + 1 : card.correct_attempts;
    const new_total = card.total_attempts + 1;
    
    console.log(`MCQ - Card ${card.id}: correct=${correct}, new_correct=${new_correct}, new_total=${new_total}`);
    
    // Update the database
    fetch(`/cards/${card.id}`, {
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
  } else if (quizComplete && onComplete) {
    // In medley mode, show completion message briefly before auto-advance
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.5rem' }}>
        Multiple Choice Complete! Moving to next mode...
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