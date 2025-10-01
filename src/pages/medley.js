import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FlashcardMode from '../components/quiz/FlashcardMode';
import MiniQuizMode from '../components/quiz/MiniQuizMode';
import FullQuizMode from '../components/quiz/FullQuizMode';
import MultipleChoiceMode from '../components/quiz/MultipleChoiceMode';

// check if accuracy is being updated properly in medley mode
// flash quiz in both doesnt update accuracy
// quiz does in both
// after quiz, make button for restart chunk

export default function Medley() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [availableChunks, setAvailableChunks] = useState([]);
  const [currentChunkId, setCurrentChunkId] = useState(1); // Start with chunk 1
  
  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;
  const passedChunkId = state?.chunk_id; // chunk_id passed from grouping

  const [currentMode, setCurrentMode] = useState(null); // Start with no mode selected
  const [completedModes, setCompletedModes] = useState([]);

  const modes = ['flashcards', 'multipleChoice', 'mini', 'quiz'];

  // Fetch all cards and determine available chunks
  useEffect(() => {
    if (!listId) return;
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched all cards:', data);
        if (data && Array.isArray(data)) {
          setAllCards(data);
          
          // Get unique chunk_ids (excluding 0 for unassigned cards)
          const chunks = [...new Set(data.map(card => card.chunk_id).filter(id => id > 0))].sort();
          setAvailableChunks(chunks);
          
          // Set initial chunk - use passed chunk_id or default to 1
          const initialChunk = passedChunkId && chunks.includes(passedChunkId) ? passedChunkId : (chunks[0] || 1);
          setCurrentChunkId(initialChunk);
          
        } else {
          console.error('Expected array but got:', data);
          setAllCards([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch cards', err);
        setAllCards([]);
      });
  }, [listId, passedChunkId]);


  // Update cards when chunk changes
  useEffect(() => {
    const chunkCards = allCards.filter(card => card.chunk_id === currentChunkId);
    setCards(chunkCards);
    console.log(`Cards for chunk ${currentChunkId}:`, chunkCards);
  }, [allCards, currentChunkId]);


  const handleNext = () => {
    const currentIndex = modes.indexOf(currentMode);
    if (currentIndex < modes.length - 1) {
      // Move to next mode
      setCompletedModes([...completedModes, currentMode]);
      setCurrentMode(modes[currentIndex + 1]);
    } else {
      // Current mode is 'quiz' (last mode), move to next chunk
      const chunkIndex = availableChunks.indexOf(currentChunkId);
      if (chunkIndex < availableChunks.length - 1) {
        setCurrentChunkId(availableChunks[chunkIndex + 1]);
        setCurrentMode(null);
        setCompletedModes([]);
      } else {
        alert('You have completed all chunks in this list!');
        setCurrentChunkId(availableChunks[0]);
        setCurrentMode(null);
        setCompletedModes([]);
      }
    }
  };

  const renderCurrentMode = () => {
    switch(currentMode) {
      case 'flashcards': 
        return <FlashcardMode cards={cards} onComplete={handleNext} />;
      case 'multipleChoice': 
        return <MultipleChoiceMode cards={cards} onComplete={handleNext} listName={listName} />;
      case 'mini': 
        return <MiniQuizMode cards={cards} onComplete={handleNext} />;
      case 'quiz': 
        console.log('Medley FullQuizMode - cards:', cards, 'chunk:', currentChunkId);
        return <FullQuizMode cards={cards} onComplete={handleNext} />;
      default: 
        return <div>Mode selection</div>;
    }
  };

  return (
    <div>
      {/* Home and Navigation buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '.2rem',
        fontSize: '1.5rem',
        flexDirection: 'row',
      }}>
          <button
            type="button"
            onClick={() => navigate('/')}
          > Home</button>
          
          {!currentMode && (
            <button
              type="button"
              onClick={() => navigate('/grouping', { state: { listId, listName } })}
            >
              Chunking
            </button>
          )}
          {currentMode && (
            <button
              type="button"
              onClick={() => handleNext()}
            >
              Next
            </button>
          )}

      </div>

        {/* Title and Chunk Selection */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '52px',
            fontWeight: 'bolder',
            marginBottom: '1rem',
          }}>Medley Mode: {listName} Chunk {currentChunkId}</h1>
        </div>

        {/* Description - only show when no mode is active */}
        {currentMode === null && (
          <p style={{
            textAlign: 'center',
            fontSize: '24px',
            marginLeft: '1.75rem',
            marginRight: '1.75rem',
          }}>
            Practice each chunk individually with a combination of flashcard, multiple-choice, flash quiz, and full quiz modes. Click Chunking to assign or adjust groups.
          </p>
        )}

        {/* Show start button or current mode */}
        {currentMode === null ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '2.5rem',
            marginTop: '4rem',
          }}>
            <button onClick={() => setCurrentMode('flashcards')}>Start</button>
          </div>
        ) : (
          <div>
            {/* Current mode component */}
            {renderCurrentMode()}
          </div>
        )}
    </div>
  );
}

