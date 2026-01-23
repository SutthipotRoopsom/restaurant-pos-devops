# Restaurant POS System - Production Flow & Design

## 🧾 Flow การขายจริง

```
ลูกค้านั่งโต๊ะ
   ↓
พนักงานเลือกโต๊ะ
   ↓
เลือกเมนู / จำนวน
   ↓
ยืนยันออเดอร์
   ↓
เลือกวิธีจ่ายเงิน
   ↓
จ่ายแล้ว = ปิดโต๊ะ
```

---

## 👉 จุดพังที่ DevOps ต้องคิด

### 1. ถ้าเน็ตกระตุกกลางออเดอร์
- **Solution**: Offline-first approach
  - ใช้ LocalStorage/IndexedDB เก็บออเดอร์ชั่วคราว
  - Sync ขึ้น server เมื่อเน็ตกลับมา
  - แสดง UI indicator "กำลังบันทึก..." / "บันทึกแล้ว"

### 2. ถ้า refresh หน้าเว็บ
- **Solution**: State persistence
  - เก็บ `orderId` ไว้ใน localStorage
  - โหลด order กลับมาจาก API เมื่อ refresh
  - แสดง modal confirm "มีออเดอร์ค้างอยู่ ต้องการกู้คืนหรือไม่?"

### 3. ถ้า server restart
- **Solution**: Database-first design
  - ทุก state เก็บใน database
  - Orders มี status tracking (open → paid)
  - ไม่พึ่ง in-memory state
  - Use connection pooling + graceful shutdown

---

## 🗄 Database Design (Production-Ready)

### Table: `tables`
```sql
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,              -- เช่น "โต๊ะ 1", "T-01"
    status VARCHAR(20) DEFAULT 'available', -- available | occupied
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tables_status ON tables(status);
```

---

### Table: `menus`
```sql
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),                   -- ข้าว | โรตี | เครื่องดื่ม
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menus_category ON menus(category);
CREATE INDEX idx_menus_active ON menus(active);
```

---

### Table: `orders`
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(20),             -- cash | qr | card
    status VARCHAR(20) DEFAULT 'open',      -- open | paid | cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

---

### Table: `order_items`
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_id INT REFERENCES menus(id),
    qty INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,           -- เก็บราคา snapshot (กรณีเมนูเปลี่ยนราคา)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_id ON order_items(menu_id);
```

---

## 📌 เหตุผล DevOps

| Design Decision | เหตุผล |
|----------------|--------|
| แยก table ชัด | Scale ง่าย, แต่ละ table เป็น entity ชัดเจน |
| เก็บ `payment_method` | Report ได้ว่าลูกค้าจ่ายด้วยวิธีไหนบ้าง |
| เก็บ `status` | Recover กรณี system ล่ม, รู้ว่า order ไหนค้างอยู่ |
| เก็บ `price` snapshot | ถ้าเมนูเปลี่ยนราคา order เก่าไม่พัง |
| Timestamp ทุก table | Audit trail, debug ง่าย |
| Index strategy | Query เร็ว ถึงแม้มี order หลักหมื่น |

---

## 🌐 Backend API Design (Production-Ready)

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 3600,
  "timestamp": "2026-01-21T12:00:00Z"
}
```

---

### Authentication
```http
POST /auth/login
```
**Request:**
```json
{
  "username": "staff001",
  "password": "********"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "staff001",
    "role": "cashier"
  }
}
```

---

### POS Operations

#### 1. ดูโต๊ะทั้งหมด
```http
GET /tables
```
**Response:**
```json
{
  "tables": [
    {"id": 1, "name": "โต๊ะ 1", "status": "available"},
    {"id": 2, "name": "โต๊ะ 2", "status": "occupied"}
  ]
}
```

---

#### 2. สร้างออเดอร์ใหม่ (เปิดโต๊ะ + สั่งอาหาร)
```http
POST /orders
```
**Request:**
```json
{
  "table_id": 1,
  "idempotency_key": "uuid-12345"  // 🔑 สำคัญ! ป้องกันยิงซ้ำ
}
```
**Response:**
```json
{
  "order_id": 101,
  "table_id": 1,
  "status": "open",
  "total_price": 0,
  "created_at": "2026-01-21T12:00:00Z"
}
```

**DevOps Note:**
- ใช้ `idempotency_key` ป้องกัน double-submit
- ถ้ายิงซ้ำด้วย key เดิม → return order เดิม (ไม่สร้างใหม่)

---

#### 3. เพิ่มรายการอาหาร
```http
POST /orders/:id/items
```
**Request:**
```json
{
  "items": [
    {"menu_id": 5, "qty": 2},
    {"menu_id": 10, "qty": 1}
  ],
  "idempotency_key": "uuid-67890"  // 🔑 ป้องกันสั่งซ้ำ
}
```
**Response:**
```json
{
  "order_id": 101,
  "items": [
    {"id": 201, "menu_id": 5, "name": "ผัดไทย", "qty": 2, "price": 60},
    {"id": 202, "menu_id": 10, "name": "น้ำมะนาว", "qty": 1, "price": 25}
  ],
  "total_price": 145
}
```

**DevOps Note:**
- Transaction: เพิ่มรายการ + update total_price ต้องสำเร็จพร้อมกัน
- Retry-safe: ยิงซ้ำไม่ทำให้เมนูซ้ำ

---

#### 4. ชำระเงิน
```http
POST /orders/:id/pay
```
**Request:**
```json
{
  "payment_method": "cash",
  "amount_received": 200,
  "idempotency_key": "uuid-11111"  // 🔑 ป้องกันหักเงินซ้ำ
}
```
**Response:**
```json
{
  "order_id": 101,
  "status": "paid",
  "total_price": 145,
  "amount_received": 200,
  "change": 55,
  "paid_at": "2026-01-21T12:30:00Z"
}
```

**Side Effect:**
- Update `orders.status = 'paid'`
- Update `orders.paid_at = NOW()`
- Update `tables.status = 'available'`

**DevOps Note:**
- **Idempotent**: ยิงซ้ำด้วย key เดิม → return result เดิม (ไม่หักเงินซ้ำ)
- **Atomic**: ทั้ง 3 operations ต้องสำเร็จพร้อมกัน (use database transaction)

---

## 🔐 API ต้อง Idempotent (DevOps Mindset)

### ทำไมต้อง Idempotent?

| สถานการณ์ | ผลกระทบถ้าไม่ idempotent | แก้ไขอย่างไร |
|-----------|------------------------|--------------|
| User กดชำระเงินซ้ำ 3 ครั้ง (เน็ตช้า) | หักเงิน 3 รอบ 💸 | ใช้ `idempotency_key` |
| Retry mechanism ของ frontend | สร้าง order ซ้ำ | Check key ก่อน insert |
| Load balancer retry request | สั่งอาหารซ้ำ 2 รอบ | ใช้ unique constraint + key |

---

### Implementation Pattern

```javascript
// Backend pseudo-code
async function createOrder(tableId, idempotencyKey) {
  // 1. Check if already processed
  const existing = await db.query(
    'SELECT * FROM orders WHERE idempotency_key = ?',
    [idempotencyKey]
  );
  
  if (existing) {
    return existing; // Return existing result (ไม่สร้างใหม่)
  }
  
  // 2. Create new order
  const order = await db.query(
    'INSERT INTO orders (table_id, idempotency_key, status) VALUES (?, ?, ?)',
    [tableId, idempotencyKey, 'open']
  );
  
  return order;
}
```

---

## 🚨 Error Handling

### Network Timeout
```json
{
  "error": "NETWORK_TIMEOUT",
  "message": "เครือข่ายไม่เสถียร กรุณาลองใหม่",
  "retry_after": 3
}
```

### Duplicate Idempotency Key
```json
{
  "error": "DUPLICATE_REQUEST",
  "message": "คำสั่งนี้ถูกประมวลผลแล้ว",
  "original_result": { ... }
}
```

### Table Already Occupied
```json
{
  "error": "TABLE_OCCUPIED",
  "message": "โต๊ะนี้มีลูกค้าอยู่แล้ว",
  "table_id": 1
}
```

---

## 📊 Monitoring & Observability

### Metrics ที่ต้องเก็บ:
- Request rate per endpoint
- Error rate (4xx, 5xx)
- Average response time
- Database connection pool usage
- Number of open orders
- Payment success rate

### Logs ที่ต้องมี:
```
[INFO] Order created: order_id=101, table_id=1
[INFO] Payment processed: order_id=101, method=cash, amount=200
[ERROR] Payment failed: order_id=102, error=insufficient_amount
```

---

## 🔄 Recovery Scenarios

### Server Restart กลางคัน
```sql
-- หา orders ที่ค้างอยู่
SELECT * FROM orders 
WHERE status = 'open' 
AND created_at < NOW() - INTERVAL '2 hours';
```

### Database Backup Strategy
- Full backup: ทุกวัน 3:00 AM
- Incremental backup: ทุก 6 ชั่วโมง
- Retention: เก็บ 30 วัน

---

## 🎯 Production Checklist

- [ ] Database indexes ครบ
- [ ] API มี rate limiting
- [ ] Idempotency keys implemented
- [ ] Error handling ครบทุก endpoint
- [ ] Logging & monitoring setup
- [ ] Backup & restore tested
- [ ] Load testing passed (100+ concurrent users)
- [ ] Security audit done (SQL injection, XSS)
- [ ] Documentation updated