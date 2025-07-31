import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import ListItem from '../components/list_item';




export default function Dashboard({ listData }) {
  //const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState('');
  const navigate = useNavigate();


  // create new list
  const handleNew = async () => {
    // Redirect to edit page with a new list
    navigate('/edit');
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newList }),
    });

    if (response.ok) {
      // Optionally: refetch lists or update state
      window.location.reload(); // or call a prop like `refreshLists()`
    } else {
      console.error('Failed to create list');
    }
  };


  const handleDel = (id) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete list');
          }
        })
        .then(() => {
          console.log(`List with id ${id} deleted`);
        });
    }
  };


  // will be handled by dropdown button
  const handlePractice = (id) => {
    // Logic to start practicing the list by id
    console.log(`Starting practice for list with id ${id}`);
  };

  const handleStats = (id) => {
    // Logic to view stats for the list by id
    console.log(`Viewing stats for list with id ${id}`);
  };

  const handleEdit = (id) => {
    // Logic to edit the list by id
    console.log(`Editing list with id ${id}`);
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
      {/* <div>
      {listData
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))  // recent first
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
      </div> */}


      {/* <div style={{ 
        textAlign: 'center',
        padding: '2rem',
       }}>
      <DropdownButton
        id="dropdown-button-large"
        size="lg"
        variant="primary"
        title="Practice"
      >
        
        <Dropdown.Item eventKey="4">Add List</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item eventKey="1">List 1</Dropdown.Item>
        <Dropdown.Item eventKey="2">List 2</Dropdown.Item>
        <Dropdown.Item eventKey="3">List 3</Dropdown.Item>
      </DropdownButton>
      </div>


      <div style={{ 
        textAlign: 'center',
       }}>
      <DropdownButton
        id="dropdown-button-large"
        size="lg"
        variant="primary"
        title="Lists"
      >
        <Dropdown.Item eventKey="4">Add List</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item eventKey="1">List 1</Dropdown.Item>
        <Dropdown.Item eventKey="2">List 2</Dropdown.Item>
        <Dropdown.Item eventKey="3">List 3</Dropdown.Item>
      </DropdownButton>
      </div> */}


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

    {/* add handling for titles that would overlap with buttons (must be dynamic for different screen sizes) */}
    <div>
      <ListItem
        name="List 1"
        onEdit={() => console.log('Edit List 1')}
        onDelete={() => console.log('Delete List 1')}
        onPractice={() => console.log('Practice List 1')}
        onStats={() => console.log('Stats List 1')}
      />
      <ListItem
        name="List 2"
        onEdit={() => console.log('Edit List 2')}
        onDelete={() => console.log('Delete List 2')}
        onPractice={() => console.log('Practice List 2')}
        onStats={() => console.log('Stats List 2')}
      />
      <ListItem
        name="List 3"
        onEdit={() => console.log('Edit List 3')}
        onDelete={() => console.log('Delete List 3')}
        onPractice={() => console.log('Practice List 3')}
        onStats={() => console.log('Stats List 3')}
      />
    </div>

    </div>
  );
}



