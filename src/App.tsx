import { Routes, Route, Link, Navigate } from "react-router-dom";
import StanoviMapa from "./pages/Map.tsx";
import DodajStan from "./pages/AddPlace.tsx";
import "./styles/Nav.css";

function App() {
  return (
    <>
      <nav>
        <Link to={"/stanovi-mapa"}>Mapa</Link>
        <Link to={"/dodaj-stan"}>Dodaj stan</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/stanovi-mapa" replace />} />
        <Route path="/stanovi-mapa" element={<StanoviMapa />} />
        <Route path="/dodaj-stan" element={<DodajStan />} />
      </Routes>
    </>
  );
}

export default App;
