-- เพิ่มข้อมูลโต๊ะ (Tables)
INSERT INTO tables (name, status) VALUES 
('T-01', 'available'),
('T-02', 'available'),
('T-03', 'available'),
('T-04', 'available'),
('T-05', 'occupied');

-- เพิ่มข้อมูลเมนู (Menus)
INSERT INTO menus (name, price, category, active) VALUES 
('ข้าวกะเพราหมูสับ', 50.00, 'food', true),
('ข้าวผัดหมู', 50.00, 'food', true),
('ต้มยำกุ้ง', 120.00, 'food', true),
('ไข่เจียว', 30.00, 'food', true),
('น้ำเปล่า', 10.00, 'drink', true),
('โค้ก', 20.00, 'drink', true),
('กาแฟเย็น', 45.00, 'drink', true);
