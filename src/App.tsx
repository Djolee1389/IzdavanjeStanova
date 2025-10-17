import { Routes, Route, Link, Navigate } from "react-router-dom";
import Mapa from "./pages/StanoviMapa.tsx";
import DodajStan from "./pages/DodajStan.tsx";

function App() {
  return (
    <>
      <nav>
        <Link to={"/stanovi-mapa"}>Mapa</Link>
        <Link to={"/dodaj-stan"}>Dodaj stan</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/stanovi-mapa" replace />} />
        <Route path="/stanovi-mapa" element={<Mapa />} />
        <Route path="/dodaj-stan" element={<DodajStan />} />
      </Routes>
    </>
  );
}

export default App;
