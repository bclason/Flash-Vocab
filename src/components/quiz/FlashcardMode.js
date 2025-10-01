import { useState } from 'react';
import { FlashcardArray } from 'react-quizlet-flashcard';
import "react-quizlet-flashcard/dist/index.css";

export default function FlashcardMode({ 
  cards, 
  listName, 
  practiceStarredOnly = false, 
  onToggleStarred = null, 
  starredCount = 0, 
  totalCount = 0 
}) {
  const [isReversed, setIsReversed] = useState(false);

  // Filter cards based on practiceStarredOnly prop
  const filteredCards = practiceStarredOnly 
    ? cards.filter(card => card.starred === 1 || card.starred === true)
    : cards;

  const createCards = (cards, reversed) => {
    // Create deck only when cards are available
    if (!cards || cards.length === 0) return [];
    
    return cards.map((card) => ({
      front: {
        html: (
          <div
            style={{
              display: "grid",
              placeItems: "center", // centers both horizontally + vertically
              height: "100%",
              fontSize: "3.5rem",
              textAlign: "center",  // keeps multi-line text centered
            }}>
            {reversed ? card.translation : card.term}
          </div>
        ),
      },
      back: {
        html: (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              fontSize: "3.5rem",
              textAlign: "center",
            }}
          >
            {reversed ? card.term : card.translation}
          </div>
        ),
      }
    }));
  }

  // Create the deck using the filtered cards
  const deck = createCards(filteredCards, isReversed);

  return (
    <div>
      {/* Flashcards */}
      {deck && deck.length > 0 ? (
        <div style={{ 
          padding: '2rem', 
          justifyContent: 'center', 
          alignItems: 'center',
          display: 'flex', 
          }}>
          <FlashcardArray 
            deck={deck} 
            key={`flashcards-${practiceStarredOnly}-${isReversed}-${deck.length}`}
          />
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '18px', padding: '2rem' }}>
          {cards.length === 0 
            ? 'Loading flashcards...' 
            : practiceStarredOnly && starredCount === 0
            ? 'No starred cards found. Star some cards in the edit page first!'
            : practiceStarredOnly 
            ? `No starred cards available (${starredCount} total)`
            : 'No cards found for this list.'
          }
        </p>
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
          {isReversed ? 'Show Terms First' : 'Show Translations First'}
        </button>
      </div>
    </div>
  );
}
