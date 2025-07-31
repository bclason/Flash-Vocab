import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// New list should have the automatic name List 1, List 2, etc.
export default function Edit() {
  const [newList, setNewList] = useState('');

  // update list name
  const handleUpdateList = async (id) => {
    const response = await fetch(`/api/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newList }),
    });

    if (response.ok) {
      // Optionally: refetch lists or update state
      window.location.reload(); // or call a prop like `refreshLists()`
    } else {
      console.error('Failed to update list');
    }
  };
  
  return (
    <div className="min-h-screen h-screen m-0 bg-stone-100">
      <div className="flex h-1/5 justify-center items-center mx-auto">
        <h1 className="text-5xl">Edit List</h1>
      </div>
    </div>
  );
}

