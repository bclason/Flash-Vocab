from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
import sqlite3
from models import init_db
import datetime
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure CORS for production
frontend_url = os.getenv('FRONTEND_URL', 'https://flash-vocab.vercel.app')
allowed_origins = [
    "http://localhost:3000",  # Development
    frontend_url,  # Production
    "https://*.vercel.app"  # Allow all Vercel preview deployments
]

# In development, allow all origins
if os.getenv('FLASK_ENV') == 'development':
    CORS(app)
else:
    CORS(app, 
         origins=allowed_origins,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

client = OpenAI()  # Will automatically use OPENAI_API_KEY from environment

init_db()

DB_FILE = 'database.db'


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


# get all lists
@app.route('/lists', methods=['GET'])
def get_lists():
    conn = get_db_connection()
    lists = conn.execute('SELECT * FROM lists').fetchall()
    conn.close()

    return jsonify([dict(lst) for lst in lists])



@app.route('/lists/<int:id>', methods=['GET'])
def get_list(id):
    conn = get_db_connection()
    list_item = conn.execute('SELECT * FROM lists WHERE id = ?', (id,)).fetchone()
    conn.close()

    if list_item is None:
        return jsonify({'error': 'List not found'}), 404

    return jsonify(dict(list_item))



@app.route('/lists', methods=['POST'])
def create_list():
    data = request.get_json()
    name = data.get('name')
    last_used = (datetime.datetime.now()).timestamp()

    conn = get_db_connection()
    if not name:
        cursor = conn.cursor()
        num_lists = cursor.execute('SELECT COUNT(*) FROM lists').fetchone()[0]
        name = f'List {num_lists + 1}'

    conn.execute('INSERT INTO lists (name, last_used) VALUES (?, ?)', (name, last_used))
    list_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    conn.commit()
    conn.close()

    return jsonify({'id': list_id, 'name': name}), 201


@app.route('/lists/<int:id>', methods=['PUT'])
def update_list(id):
    data = request.get_json()
    name = data.get('name')
    last_used = (datetime.datetime.now()).timestamp()

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    conn.execute('UPDATE lists SET name = ?, last_used = ? WHERE id = ?', (name, last_used, id))
    conn.commit()
    conn.close()

    # return jsonify({'message': 'List updated successfully'})
    return jsonify({'id': id, 'name': name, 'last_used': last_used})


@app.route('/lists/<int:id>', methods=['DELETE'])
def delete_list(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM lists WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'List deleted successfully'})


@app.route('/lists/<int:list_id>/cards', methods=['GET'])
def get_cards_by_list(list_id):
    conn = get_db_connection()
    cards = conn.execute('SELECT * FROM cards WHERE list_id = ?', (list_id,)).fetchall()
    conn.close()

    return jsonify([dict(card) for card in cards])


# do i have to specify the list_id?
@app.route('/cards/<int:id>', methods=['GET'])
def get_card(id):
    conn = get_db_connection()
    card = conn.execute('SELECT * FROM cards WHERE id = ?', (id,)).fetchone()
    conn.close()

    if card is None:
        return jsonify({'error': 'Card not found'}), 404

    return jsonify(dict(card))


# without nesting this under lists i need to specify the list_id
@app.route('/cards', methods=['POST'])
def create_card():
    data = request.get_json()
    list_id = data.get('list_id')

    if not list_id:
        return jsonify({'error': 'List ID is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO cards (list_id) VALUES (?)',
        (list_id,)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': new_id, 'list_id': list_id}), 201


# keeping this seperate from lists should be fine because each card has a unique id
@app.route('/cards/<int:id>', methods=['PUT'])
def update_card(id):
    data = request.get_json()
    
    # Handle field-value format (from edit page)
    field = data.get('field')
    value = data.get('value')
    
    # Handle direct field format (from accuracy updates)
    term = data.get('term')
    translation = data.get('translation')
    secondary_translation = data.get('secondary_translation', '')
    correct_attempts = data.get('correct_attempts')
    total_attempts = data.get('total_attempts')
    starred = data.get('starred')
    chunk_id = data.get('chunk_id')

    conn = get_db_connection()
    
    # Handle accuracy updates
    if correct_attempts is not None and total_attempts is not None:
        conn.execute(
            'UPDATE cards SET correct_attempts = ?, total_attempts = ? WHERE id = ?',
            (correct_attempts, total_attempts, id)
        )
    # Handle single field updates (field-value format)
    elif field and value is not None:
        allowed_fields = ['term', 'translation', 'secondary_translation', 'starred', 'chunk_id']
        if field not in allowed_fields:
            conn.close()
            return jsonify({'error': f'Invalid field: {field}'}), 400
        
        query = f"UPDATE cards SET {field} = ? WHERE id = ?"
        conn.execute(query, (value, id))
    # Handle chunk_id updates
    elif chunk_id is not None:
        conn.execute(
            'UPDATE cards SET chunk_id = ? WHERE id = ?',
            (chunk_id, id)
        )
    # Handle direct field updates (for backward compatibility)
    elif term and translation:
        conn.execute(
            'UPDATE cards SET term = ?, translation = ?, secondary_translation = ? WHERE id = ?',
            (term, translation, secondary_translation, id)
        )
    else:
        conn.close()
        return jsonify({'error': 'Invalid update data - missing required fields'}), 400
    
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card updated successfully'})


@app.route('/cards/<int:id>', methods=['DELETE'])
def delete_card(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM cards WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card deleted successfully'})


@app.route('/lists/<int:list_id>/reset-accuracy', methods=['PUT'])
def reset_list_accuracy(list_id):
    conn = get_db_connection()
    conn.execute(
        'UPDATE cards SET correct_attempts = 0, total_attempts = 0 WHERE list_id = ?', 
        (list_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'All card accuracies reset successfully'})



# Group words using OpenAI (from AISorting.py)
@app.route('/group-words', methods=['POST'])
def group_words():
    try:
        data = request.get_json()
        words = data.get('words', [])
        if not isinstance(words, list) or not all(isinstance(w, str) for w in words):
            return jsonify({'error': 'Invalid input, expected a list of words'}), 400

        print(f"Received words for grouping: {words}")

        # Create a cleaner prompt without problematic Unicode characters
        prompt = f"""You are a JSON generator. Your task is to group all of the given words into sets of 4–6 items each. 
Important rules:
1. Every word must appear in exactly one group. 
2. No group may have fewer than 4 or more than 6 items. 
3. Do not add or remove words. 
4. Return valid JSON only, with no commentary, in this exact format:
{{
  "groups": [
    ["word1", "word2", "word3", "word4"],
    ["word5", "word6", "word7", "word8"]
  ]
}}

Words to group: {words}"""

        print("Sending request to OpenAI...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        print("OpenAI response received")
        print(f"Response content: {response.choices[0].message.content}")

        # Parse the JSON content manually since .parsed might not be available
        import json
        result = json.loads(response.choices[0].message.content)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in group_words: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)