import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // <--- ของใหม่!

function TableList() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('http://localhost:4000/tables')
            .then(res => res.json())
            .then(data => {
                setTables(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);
    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
                🍽️ เลือกโต๊ะอาหาร
            </h1>
            {/* ... (โค้ดแสดงผลเหมือนเดิม) ... */}
            {/* แต่ตรง div ที่เป็น card ให้เพิ่ม Link */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <Link to={`/table/${table.id}`} key={table.id}> {/* <--- หุ้มด้วย Link */}
                        <div className={`p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform ${table.status === 'available' ? 'bg-white border-b-4 border-green-500' : 'bg-red-50 border-b-4 border-red-500'
                            }`}>
                            <h2 className="text-2xl font-bold mb-2">{table.name}</h2>
                            <p>{table.status}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default TableList