import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TableList from './TableList'
import MenuPage from './MenuPage'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableList />} />
        <Route path="/table/:id" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App