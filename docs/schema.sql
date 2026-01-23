CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  category VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  total_price NUMERIC(10,2) DEFAULT 0,
  payment_method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id),
  qty INTEGER NOT NULL,
  price NUMERIC(8,2) NOT NULL
);


-- เมนูอาหาร
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- รายการอาหารในแต่ละ order
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL
);
