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

    # Create cards table
    # TODO: chunk_id column may cause issues
    c.execute('''
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            chunk_id INTEGER default NULL,
            term TEXT DEFAULT '',
            translation TEXT DEFAULT '',
            secondary_translation TEXT DEFAULT '',
            correct_attempts INTEGER DEFAULT 0,
            total_attempts INTEGER DEFAULT 0,
            starred BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
        )
    ''')

    try:
        c.execute('ALTER TABLE cards ADD COLUMN chunk_id INTEGER DEFAULT NULL')
    except sqlite3.OperationalError:
        pass  # Column already exists

    conn.commit()
    conn.close()