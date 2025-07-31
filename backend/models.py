import sqlite3

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # Create lists table
    c.execute('''
    CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # create cards/vocab table
    c.execute('''
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        term TEXT NOT NULL,
        translation TEXT NOT NULL,
        secondary_translation TEXT DEFAULT '',
        correct_attempts INTEGER DEFAULT 0,
        incorrect_attempts INGTEGER DEFAULT 0,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE         
    )
    ''')

    conn.commit()
    conn.close()