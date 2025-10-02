import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NewCard from '../components/new_card';
import Dropdown2 from '../components/dropdown2';



export default function Edit() {
  const [cards, setCards] = useState([]);
  const [sortedCards, setSortedCards] = useState([]);
  const [currentSort, setCurrentSort] = useState('none'); // Track current sort method
  const navigate = useNavigate();
  const [textEntry, setTextEntry] = useState('');
  
  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;


  useEffect(() => {
    // Fetch all cards from your backend
    fetch(`lists/${listId}/cards`)
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setSortedCards(data); // Initialize sorted cards with original data
      })
      .catch(err => console.error('Failed to fetch cards', err));
  }, [listId]);

  // Update sortedCards whenever cards change, reapplying current sort
  useEffect(() => {
    if (currentSort === 'starred') {
      applySortByStarred(cards);
    } else if (currentSort === 'accuracyLowHigh') {
      applySortByAccuracyLowHigh(cards);
    } else if (currentSort === 'accuracyHighLow') {
      applySortByAccuracyHighLow(cards);
    } else {
      setSortedCards([...cards]); // Default: no sort
    }
  }, [cards, currentSort]);

  // Helper functions to apply sorting without changing currentSort state
  const applySortByStarred = (cardsToSort) => {
    const sorted = [...cardsToSort].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return 0;
    });
    setSortedCards(sorted);
  };

  const applySortByAccuracyLowHigh = (cardsToSort) => {
    const sorted = [...cardsToSort].sort((a, b) => {
      const accuracyA = a.total_attempts > 0 ? (a.correct_attempts / a.total_attempts) : 0;
      const accuracyB = b.total_attempts > 0 ? (b.correct_attempts / b.total_attempts) : 0;
      return accuracyA - accuracyB;
    });
    setSortedCards(sorted);
  };

  const applySortByAccuracyHighLow = (cardsToSort) => {
    const sorted = [...cardsToSort].sort((a, b) => {
      const accuracyA = a.total_attempts > 0 ? (a.correct_attempts / a.total_attempts) : 0;
      const accuracyB = b.total_attempts > 0 ? (b.correct_attempts / b.total_attempts) : 0;
      return accuracyB - accuracyA;
    });
    setSortedCards(sorted);
  };


  const handleUpdateList = (event) => {
    setTextEntry(event.target.value);
  };


  // update list name
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(`/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({name: textEntry}),
    });
    if (response.ok) {
      //console.log('List name updated successfully');
    } else {
      console.error('Failed to update list');
    }
  };


  const newCard = async () => {
    try {
      const response = await fetch('/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id: listId }),
      });

      if (response.ok) {
        const newCard = await response.json();
        setCards(prevCards => {
          const updated = [...prevCards, newCard];
          //console.log("Cards state:", updated.map(c => ({ id: c.id, ...c })));
          return updated;
        });
      } else {
        console.error('Failed to create new card');
      }
    } catch (error) {
      console.error('Error creating new card:', error);
    }
  };
  

  const updateCard = async (cardId, field, value) => {
    setCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, [field]: value } : c)
    )
    const response = await fetch(`/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value })
    });
    if (response.ok) {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, [field]: value } : c));
    } else {
      console.error('Failed to update card');
    }
  };


  const handleDeleteCard = async (cardId) => {
      try {
        const response = await fetch(`/cards/${cardId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setCards(cards.filter(card => card.id !== cardId));
        } else {
          const errorData = await response.json();
          console.error('Failed to delete card:', errorData);
          alert('Failed to delete card. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('An error occurred while deleting the card.');
      }
  };


  const resetAccuracy = async () => {
    try {
      const response = await fetch(`/lists/${listId}/reset-accuracy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Update all cards in the local state
        setCards(prevCards => prevCards.map(card => ({
          ...card,
          correct_attempts: 0,
          total_attempts: 0
        })));
        console.log('All card accuracies reset successfully');
      } else {
        console.error('Failed to reset card accuracies');
      }
    } catch (error) {
      console.error('Error resetting card accuracies:', error);
    }
  };

  // Sorting functions that update currentSort state
  const sortByStarred = () => {
    setCurrentSort('starred');
    applySortByStarred(cards);
  };

  const sortByAccuracyLowHigh = () => {
    setCurrentSort('accuracyLowHigh');
    applySortByAccuracyLowHigh(cards);
  };

  const sortByAccuracyHighLow = () => {
    setCurrentSort('accuracyHighLow');
    applySortByAccuracyHighLow(cards);
  };


  return (
    <div>
      {/* Home button */}
      <div style={{
        display: 'flex',
        padding: '.2rem',
        fontSize: '1.5rem',
      }}>
          <button
            type="button"
            onClick={() => navigate('/')}
          > Home</button>
      </div>

      {/* List name */}
      <div style={{
        padding: '2rem',
      }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={textEntry}
          onChange={handleUpdateList}   // keep your existing change handler
          onBlur={handleSubmit}          // call submit when input loses focus
          placeholder={listName}
          style={{
            width: '80%',
            fontSize: '3rem',
            border: '4px dashed #000',
          }}
        />
      </form>
      </div>

      {/* New Card and Reset Accuracy and Sort By Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>
        <div style={{
          display: 'flex',
          marginLeft: '2rem'
          }}>
          <button onClick={newCard} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
            Add New Card
          </button>
        </div>

        <div style={{
          display: 'flex',
          marginLeft: '1rem'
        }}>
          <button onClick={resetAccuracy} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
            Reset Accuracy
          </button>
        </div>

        <div style={{
          display: 'flex',
          marginLeft: '1rem'
        }}>
          <Dropdown2 
            listId={listId} 
            listName={listName}
            onSortByStarred={sortByStarred}
            onSortByAccuracyLowHigh={sortByAccuracyLowHigh}
            onSortByAccuracyHighLow={sortByAccuracyHighLow}
          />
        </div>
      </div>

      {/* Cards */}
      <div style={{ 
            padding: '1rem',  
          }}>
        {/* Render all cards using sortedCards instead of cards */}
        {sortedCards.map(card => (
          <NewCard 
            key={card.id} 
            card={card}
            onFieldChange={updateCard}
            accuracy={(card.correct_attempts / (card.total_attempts || 1)) * 100} // Calculate accuracy as raw percentage number
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

