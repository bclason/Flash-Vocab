from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from models import init_db

app = Flask(__name__)
CORS(app)

init_db()

DB_FILE = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/cards', methods=['GET'])
def get_cards():
    conn = get_db_connection()
    cards = conn.execute('SELECT * FROM cards').fetchall()
    conn.close()
    return jsonify([dict(card) for card in cards])

@app.route('/cards', methods=['POST'])
def add_card():
    data = request.get_json()
    term = data.get('term')
    translation = data.get('translation')
    secondary_translation = data.get('secondary_translation')

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO cards (term, translation, secondary_translation) VALUES (?, ?, ?)',
        (term, translation, secondary_translation)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card added successfully'}), 201

@app.route('/cards/<int:card_id>', methods=['PUT'])
def update_card(card_id):
    data = request.get_json()

    fields = []
    values = []

    for field in ['term', 'translation', 'secondary_translation', 'correct_attempts', 'incorrect_attempts']:
        if field in data:
            fields.append(f"{field} = ?")
            values.append(data[field])

    if not fields:
        return jsonify({'error': 'No valid fields to update'}), 400

    values.append(card_id)  # for WHERE clause

    sql = f"UPDATE cards SET {', '.join(fields)} WHERE id = ?"

    conn = get_db_connection()
    conn.execute(sql, values)
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card updated successfully'})

@app.route('/cards/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    conn = get_db_connection()
    conn.exectue('DELETE FROM cards WHERE id = ?', (card_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card deleted successfully'})

    

    


if __name__ == '__main__':
    app.run(debug=True)