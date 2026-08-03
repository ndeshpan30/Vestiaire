-- SQLite Local Database Schema for Vestiaire
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    material TEXT,
    pattern TEXT,
    formality INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_seasons (
    item_id INTEGER NOT NULL,
    season TEXT NOT NULL,
    PRIMARY KEY (item_id, season),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    occasion TEXT,
    weather TEXT,
    rationale TEXT,
    accessory_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outfit_items (
    outfit_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    role_in_outfit TEXT,
    PRIMARY KEY (outfit_id, item_id),
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
