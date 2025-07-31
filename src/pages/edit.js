import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';



export default function Edit() {
  const [newList, setNewList] = useState('');
  const navigate = useNavigate();
  const [textEntry, setTextEntry] = useState('');
  
  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;


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
  


  return (
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
  );
}

