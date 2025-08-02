import { useNavigate } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import ListItem from '../components/list_item';




export default function Dashboard({ listData }) {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch all lists from your backend
    fetch('/lists')
      .then(res => res.json())
      .then(data => setLists(data))   // Save fetched data into state
      .catch(err => console.error('Failed to fetch lists', err));
  }, []);


  // create new list
  const handleNew = async () => {
    try {
      const response = await fetch('/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        console.log('List created successfully');
        const data = await response.json();
        const listId = data.id; 
        const newListName = data.name;
        // console.log('New List ID:', listId);
        // console.log('New List Name:', newListName);
        // Redirect to edit page after successful creation
        navigate('/edit', { state: { listName: newListName, listId: listId } });
      } else {
        const errorData = await response.json();
        console.error('Failed to create list:', errorData);
        alert('Failed to create list. Please try again.');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert('An error occurred while creating the list.');
    }
  };


  const handleDel = (id) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      fetch(`/lists/${id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete list');
          }
        })
        .then(() => {
          window.location.reload();
          console.log(`List with id ${id} deleted`);
        });
    }
  };


  const handleEdit = (id) => {
    console.log("id:", id)
    fetch(`/lists/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const listName = data.name;
        navigate('/edit', { state: { listName: listName, listId: id } });
      })
      .catch(err => console.error('Error fetching list:', err));
  };


  // will be handled by dropdown button
  const handlePractice = (id) => {
    // Logic to start practicing the list by id
    console.log(`Starting practice for list with id ${id}`);
  };

  const handleStats = (id) => {
    navigate('/edit');
    // Logic to view stats for the list by id
    console.log(`Viewing stats for list with id ${id}`);
  };



  return (
    <div>
      {/* Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }} className='typewriter'>
        <h1>Welcome to Flash Vocab</h1>
      </div>

      {/* Your Lists Subtitle*/}
      <div style={{
        display: 'flex',
        marginLeft: '1.2rem',
        marginBottom: '1.2rem',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        textDecoration: 'underline',
      }}>
        Your Lists
      </div>

      {/* New List Button */}
      <div style={{
        display: 'flex',
        marginLeft: '1.2rem',
        marginBottom: '.8rem',
        fontSize: '1.5rem',
      }}>
          <button
            type="button"
            onClick={handleNew}
          > + New List</button>
      </div>

      {/* Lists */}
      {[...lists]
      .sort((a, b) => b.last_used - a.last_used)
      .map(list => (
        <ListItem
          key={list.id}
          name={list.name}
          onPractice={() => handlePractice(list.id)}
          onStats={() => handleStats(list.id)}
          onEdit={() => handleEdit(list.id)}
          onDelete={() => handleDel(list.id)}
        />
    ))}


      {/* <div style={{
        textAlign: 'center',
        padding: '2rem',
      }}>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Practice</Accordion.Header>
            <Accordion.Body>
              <Stack direction="horizontal" gap={3}>
                <Button variant="primary" size="lg">Start Flashcards</Button>
                <Button variant="secondary" size="lg">Edit Flashcards</Button>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Lists</Accordion.Header>
            <Accordion.Body>
              <Stack direction="horizontal" gap={3}>
                <Button variant="primary" size="lg">Start Mini Quiz</Button>
                <Button variant="secondary" size="lg">Edit Mini Quiz</Button>
              </Stack>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
    </div> */}
    
    </div>
  );
}



