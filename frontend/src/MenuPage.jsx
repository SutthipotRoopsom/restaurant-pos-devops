import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
function MenuPage() {
    const { id } = useParams(); // table ID
    const [table, setTable] = useState(null);
    const [menus, setMenus] = useState([]);

    // โหลดข้อมูลโต๊ะ + เมนู
    useEffect(() => {
        // 1. โหลดข้อมูลโต๊ะ (API ใหม่ที่เราเพิ่งทำ)
        fetch(`http://localhost:4000/tables/${id}`)
            .then(res => res.json())
            .then(data => setTable(data));
        // 2. โหลดเมนูอาหาร
        fetch('http://localhost:4000/menus')
            .then(res => res.json())
            .then(data => setMenus(data));
    }, [id]);
    // ฟังก์ชันเปิดโต๊ะ (Create Order)
    const openTable = () => {
        fetch('http://localhost:4000/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_id: id })
        })
            .then(res => res.json())
            .then(newOrder => {
                alert(`เปิดโต๊ะสำเร็จ! Order ID: ${newOrder.id}`);
                // รีโหลดหน้าจอเพื่อให้เห็น Active Order
                window.location.reload();
            });
    };
    // ฟังก์ชันสั่งอาหาร (Add Item)
    const orderItem = (menuId) => {
        if (!table?.active_order_id) return;
        fetch(`http://localhost:4000/orders/${table.active_order_id}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu_item_id: menuId, quantity: 1 })
        })
            .then(res => Promise.all([res.json(), res.ok]))
            .then(([data, ok]) => {
                if (ok) alert(`สั่ง ${data.price} บาท เรียบร้อย!`);
                else alert('Error: ' + data.error);
            });
    };
    if (!table) return <div>Loading...</div>;
    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <h1 className="text-3xl font-bold text-center mb-6">โต๊ะ: {table.name}</h1>

            {/* ถ้าโต๊ะว่าง -> ปุ่มเปิดโต๊ะ */}
            {table.status === 'available' ? (
                <div className="text-center">
                    <p className="text-xl mb-4 text-gray-600">โต๊ะนี้ยังว่างอยู่</p>
                    <button
                        onClick={openTable}
                        className="bg-green-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-600 shadow-lg"
                    >
                        🟢 เปิดโต๊ะ (Start Order)
                    </button>
                </div>
            ) : (
                /* ถ้าโต๊ะไม่ว่าง -> แสดงเมนูให้สั่ง */
                <div>
                    <div className="bg-yellow-100 p-4 rounded-lg mb-6 text-center border border-yellow-400">
                        📝 Order ID: {table.active_order_id} (กำลังใช้งาน)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menus.map(menu => (
                            <div key={menu.id} className="bg-white p-6 rounded-xl shadow cursor-pointer hover:bg-blue-50" onClick={() => orderItem(menu.id)}>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold">{menu.name}</h3>
                                    <span className="text-green-600 font-bold">{menu.price}.-</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">คลิกเพื่อสั่ง 1 จาน</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
export default MenuPage