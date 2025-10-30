import { Routes, Route, Link, Navigate } from "react-router-dom";
import StanoviMapa from "./pages/Map.tsx";
import DodajStan from "./pages/AddPlace.tsx";
import { FormattedMessage } from "react-intl";
import "./styles/Nav.css";

function App({ setLocale }: { setLocale: (lang: "sr" | "en") => void }) {
  return (
    <>
      <nav>
        <Link to={"/stanovi-mapa"}>
          <FormattedMessage id="nav.map" defaultMessage="Mapa" />
        </Link>
        <Link to={"/dodaj-stan"}>
          <FormattedMessage id="nav.add" defaultMessage="Dodaj" />
        </Link>
        <div className="language-container">
          <select name="" id="language" onChange={(e) => setLocale(e.target.value as "sr" | "en")}>
            <option value="sr">SR</option>
            <option value="en">EN</option>
          </select>
        </div>
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
