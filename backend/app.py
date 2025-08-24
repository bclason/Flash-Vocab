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


# without nesting this under lists i need to specify the list_id
@app.route('/cards', methods=['POST'])
def create_card():
    data = request.get_json()
    list_id = data.get('list_id')

    if not list_id:
        return jsonify({'error': 'List ID is required'}), 400

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO cards (list_id) VALUES (?)',
        (list_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Card created successfully'}), 201


# keeping this seperate from lists should be fine because each card has a unique id
@app.route('/cards/<int:id>', methods=['PUT'])
def update_card(id):
    data = request.get_json()
    term = data.get('term')
    translation = data.get('translation')
    secondary_translation = data.get('secondary_translation', '')
    correct_attempts = data.get('correct_attempts')
    total_attempts = data.get('total_attempts')

    conn = get_db_connection()
    
    # Handle accuracy updates
    if correct_attempts is not None and total_attempts is not None:
        conn.execute(
            'UPDATE cards SET correct_attempts = ?, total_attempts = ? WHERE id = ?',
            (correct_attempts, total_attempts, id)
        )
    # Handle card content updates
    elif term and translation:
        conn.execute(
            'UPDATE cards SET term = ?, translation = ?, secondary_translation = ? WHERE id = ?',
            (term, translation, secondary_translation, id)
        )
    else:
        conn.close()
        return jsonify({'error': 'Invalid update data'}), 400
    
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


if __name__ == '__main__':
    app.run(debug=True)