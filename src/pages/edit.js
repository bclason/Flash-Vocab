import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NewCard from '../components/new_card';
import { Card } from 'react-bootstrap';



export default function Edit() {
  const [cards, setCards] = useState([]);
  const navigate = useNavigate();
  const [textEntry, setTextEntry] = useState('');
  
  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;


  useEffect(() => {
    // Fetch all cards from your backend
    fetch('/cards')
      .then(res => res.json())
      .then(data => setCards(data))   // Save fetched data into state
      .catch(err => console.error('Failed to fetch cards', err));
  }, []);


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
      console.log('List name updated successfully');
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
        setCards([...cards, newCard]);
      } else {
        console.error('Failed to create new card');
      }
    } catch (error) {
      console.error('Error creating new card:', error);
    }
  };


  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        const response = await fetch(`/cards/${cardId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setCards(cards.filter(card => card.id !== cardId));
          console.log('Card deleted successfully');
        } else {
          const errorData = await response.json();
          console.error('Failed to delete card:', errorData);
          alert('Failed to delete card. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('An error occurred while deleting the card.');
      }
    }
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

      <div style={{
        display: 'flex',
        marginLeft: '2rem',}}>
        <button onClick={newCard} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
          Add New Card
        </button>
      </div>


      {/* Cards */}
      <div>
        {/* Render all cards */}
        {cards.map(card => (
          <NewCard 
            key={card.id}
            accuracy={card.correct_attempts / (card.total_attempts || 1)} // Calculate accuracy
            onDelete={() => handleDeleteCard(card.id)}  // ← Use card.id from the map
          />
        ))}
      </div>

    </div>
  );
}

