import { Routes, Route, Link } from "react-router-dom";
import Mapa from "./pages/StanoviMapa.tsx";
import MainPage from "./pages/MainPage.tsx";

function App() {
  return (
    <>
      <nav>
        <Link to={"/"}>Mapa</Link>
        <Link to={"/MainPage"}>Dodaj stan</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Mapa />} />
        <Route path="/MainPage" element={<MainPage />} />
      </Routes>
    </>
  );
}

export default App;
