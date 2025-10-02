import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import Droppable from '../hooks/droppable';
import Draggable from '../hooks/draggable';



export default function Chunking() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;

  const [cards, setCards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [cardPositions, setCardPositions] = useState({}); // Track which container each card is in
  const [swapped, setSwapped] = useState(false);

  // Fetch cards from the backend
  useEffect(() => {
    if (!listId) return;
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => {
        // console.log('Fetched cards:', data);
        if (data && Array.isArray(data)) {
          setCards(data);
          // Create groups based on number of cards (aim for 4-5 cards per group)
          const numCards = data.length;
          const cardsPerGroup = 4;
          const numGroups = Math.ceil(numCards / cardsPerGroup);
          const groupIds = Array.from({ length: numGroups }, (_, i) => i + 1); // 1, 2, 3, 4, etc.
          setContainers(groupIds);
          
          // Initialize card positions based on existing chunk_id from database
          const initialPositions = {};
          data.forEach(card => {
            initialPositions[card.id] = card.chunk_id;
          });
          setCardPositions(initialPositions);
        } else {
          console.error('Expected array but got:', data);
          setCards([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch cards', err);
        setCards([]);
      });
  }, [listId]);

  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over) {
      console.log('chunk_id on drop:', over.id);
      // Determine the chunk_id to save (0 for unassigned, over.id for groups)
      const chunkId = over.id === 'unassigned' ? 0 : over.id;
      
      // Check if the target container already has 5 cards (if it's not the unassigned area)
      if (over.id !== 'unassigned') {
        const cardsInTarget = Object.values(cardPositions).filter(pos => pos === over.id).length;
        if (cardsInTarget >= 6) {
          alert('Groups can have a maximum of 6 cards');
          return; // Don't allow the drop
        }
      }
      
      // Always update the database with the new chunk_id
      try {
        const response = await fetch(`/cards/${active.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunk_id: chunkId }),
        });
        if (!response.ok) {
          console.error('Failed to update card chunk');
          return;
        }
      } catch (error) {
        console.error('Error updating card chunk:', error);
        return;
      }
      
      // Update the position of the dragged card
      setCardPositions(prev => ({
        ...prev,
        [active.id]: chunkId
      }));
    }
  };

  const AIsort = async () => {
    try {
      // Extract words based on what's currently displayed (term or translation)
      const words = cards.map(card => swapped ? card.translation : card.term);
      
      if (words.length === 0) {
        alert('No cards to sort!');
        return;
      }

      // Send words to backend for AI grouping
      const response = await fetch('http://localhost:5000/group-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: words }),
      });

      if (!response.ok) {
        console.error('Failed to get AI grouping');
        alert('Failed to get AI grouping. Please try again.');
        return;
      }

      const aiResponse = await response.json();
      console.log('AI grouping response:', aiResponse);

      // Parse the AI response and create new card positions
      const newCardPositions = {};
      const groups = aiResponse.groups || [];
      
      // Update containers to match the number of AI-generated groups
      const numAIGroups = groups.length;
      const newContainers = Array.from({ length: numAIGroups }, (_, i) => i + 1);
      setContainers(newContainers);
      
      // First, set all cards to unassigned (0)
      cards.forEach(card => {
        newCardPositions[card.id] = 0;
      });

      // Then assign cards to groups based on AI suggestions
      groups.forEach((group, groupIndex) => {
        const groupId = groupIndex + 1; // Groups are numbered 1, 2, 3, etc.
        
        group.forEach(wordFromAI => {
          // Find the card that matches this word (based on what was sent to AI)
          const matchingCard = cards.find(card => 
            swapped ? card.translation === wordFromAI : card.term === wordFromAI
          );
          if (matchingCard) {
            newCardPositions[matchingCard.id] = groupId;
          }
        });
      });

      // Update all cards in the database with their new chunk_ids
      const updatePromises = cards.map(async (card) => {
        const newChunkId = newCardPositions[card.id];
        try {
          const response = await fetch(`/cards/${card.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chunk_id: newChunkId }),
          });
          if (!response.ok) {
            console.error(`Failed to update card ${card.id}`);
          }
        } catch (error) {
          console.error(`Error updating card ${card.id}:`, error);
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Update the frontend state
      setCardPositions(newCardPositions);
      
      alert('AI sorting completed successfully!');
      
    } catch (error) {
      console.error('Error during AI sorting:', error);
      alert('An error occurred during AI sorting. Please try again.');
    }
  };


  return (
    <div>
      {/* Home and Medley Mode buttons */}
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
          <button
            type="button"
            onClick={() => navigate('/medley', { state: { listId, listName } })}
          > Medley Mode</button>
      </div>

      {/* Title and List Name */}
      <h1 style= {{
        textAlign: 'center',
        alignItems: 'center',
        fontSize: '52px',
        fontWeight: 'bolder',
      }}>Term Chunking: {listName}</h1>

      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '24px',
        marginLeft: '1.75rem',
        marginRight: '1.75rem',
      }}>
        Grouping terms into small related groups or "chunks" can improve memory retention. Manually group terms in chunks of 4-6 or automatically group with AI. Once grouped, practice one chunk at a time in Medley mode.
      </p>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>
        <div style={{
          display: 'flex',
          marginLeft: '1.5rem'
          }}>
          <button onClick={AIsort} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
            AI Sort
          </button>
        </div>

        <div style={{
          display: 'flex',
          marginLeft: '1rem'
        }}>
          <button onClick={() => setSwapped(!swapped)} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
            Swap Term and Definition
          </button>
        </div>
      </div>
      <div>

      <div style={{ marginTop: '2rem', marginLeft: '.55rem', marginRight: '.55rem' }}>
        <DndContext onDragEnd={handleDragEnd}>
          {/* Unassigned cards */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Unassigned Cards</h3>
            <Droppable id="unassigned">
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: '1rem',
                minHeight: '60px',
                padding: '1rem'
              }}>
                {cards.filter(card => cardPositions[card.id] === 0).map(card => (
                  <Draggable key={card.id} id={card.id}>
                    <div>
                      {swapped ? card.translation : card.term}
                    </div>
                  </Draggable>
                ))}
              </div>
            </Droppable>
          </div>

          {/* Droppable containers */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            gap: '2rem',
            marginTop: '1rem'
          }}>
            {containers.map((id) => (
              <div key={id} style={{ flex: 1 }}>
                <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Group {id}</h4>
                <Droppable id={id}>
                  <div style={{ minHeight: '200px', padding: '1rem' }}>
                    {cards.filter(card => cardPositions[card.id] === id).map(card => (
                      <Draggable key={card.id} id={card.id}>
                        <div style={{ padding: '0.3rem'}}>
                          {swapped ? card.translation : card.term}
                        </div>
                      </Draggable>
                    ))}
                  </div>
                </Droppable>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
      </div>
    </div>
  );
}

