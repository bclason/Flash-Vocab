from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from models import init_db
import datetime

app = Flask(__name__)
CORS(app)
# CORS(app, origins=["http://localhost:3000"])

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

# old one
# @app.route('/lists/<int:id>', methods=['GET'])
# def get_list(id):
#     conn = get_db_connection()
#     lst = conn.execute('SELECT * FROM lists WHERE id = ?', (id,)).fetchone()
#     if lst is None:
#         return jsonify({'error': 'List not found'}), 404
#     lst_cards = conn.execute('SELECT * FROM cards WHERE list_id = ?', (id,)).fetchall()
#     conn.close()

#     list_data = {
#         'id': lst['id'],
#         'name': lst['name'],
#         'last_used': lst['last_used'],
#         'cards': [
#             {
#                 'id': card['id'],
#                 'term': card['term'],
#                 'translation': card['translation'],
#                 'secondary_translation': card['secondary_translation'],
#                 'correct_attempts': card['correct_attempts'],
#                 'incorrect_attempts': card['incorrect_attempts']
#             }
#             for card in lst_cards
#         ]
#     }

#     return jsonify(list_data)

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
    card_id = cursor.lastrowid

    # Fetch the full card data so the frontend gets all fields
    card = conn.execute(
        'SELECT * FROM cards WHERE id = ?',
        (card_id,)
    ).fetchone()

    conn.commit()
    conn.close()

    return jsonify(dict(card)), 201


@app.route('/cards/<int:id>', methods=['PUT'])
def update_card(id):
    data = request.get_json()
    field = data.get('field')
    value = data.get('value')

    allowed_fields = ['term', 'translation', 'secondary_translation']
    if field not in allowed_fields:
        return jsonify({'error': 'Invalid field'}), 400

    query = f"UPDATE cards SET {field} = ? WHERE id = ?"
    conn = get_db_connection()
    conn.execute(query, (value, id))
    conn.commit()
    conn.close()

    return jsonify({'success': True})


@app.route('/cards/<int:id>', methods=['DELETE'])
def delete_card(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM cards WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card deleted successfully'})


if __name__ == '__main__':
    app.run(debug=True)