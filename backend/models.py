import sqlite3

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term TEXT NOT NULL,
        translation TEXT NOT NULL,
        secondary_translation TEXT DEFAULT '',
        correct_attempts INTEGER DEFAULT 0,
        incorrect_attempts INGTEGER DEFAULT 0
    )
    ''')
    conn.commit()
    conn.close()