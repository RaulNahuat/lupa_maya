import { Routes, Route, Navigate } from "react-router-dom"
import LevelMap from "./pages/player/LevelMap"
import LevelPlay from "./pages/player/LevelPlay"

function App() {
  return (
    <Routes> 
      <Route path="/" element={<Navigate to="/map" replace/>} />
      <Route path="/map" element={<LevelMap />} />
      <Route path="/level/:id" element={<LevelPlay />} />
    </Routes>
  )
}

export default App
