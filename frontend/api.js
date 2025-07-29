const API_URL = 'http://localhost:5000/cards';


export async function getCards() {
    const res = await fetch(API_URL);
    return res.json();
}

export async function addCard(card) {
    const res = await fetch(API_URL, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(card)
    });
    
    return res.json();
}

export async function updateCard(card_id, updates) {
    const res = await fetch(`${API_URL}/cards/${card_id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
    });

    if (!res.ok) {
        throw new Error(`Failed to update card with id=${id}`);
    }

    return await res.json();
}

export async function deleteCard(card_id) {
    const res = await fetch(`${API_URL}/cards/${card_id}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        throw new Error(`Failed to delete card with id=${id}`);
    }

    return await res.json();
}

