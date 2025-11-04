import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import StanoviMapa from "./pages/Map.tsx";
import DodajStan from "./pages/AddPlace.tsx";
import { FormattedMessage } from "react-intl";
import LogIn from "./components/LogIn.tsx";
import SignUp from "./components/SignUp.tsx";
import "./styles/Nav.css";
import Profile from "./pages/Profile.tsx";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

import { FaUser} from "react-icons/fa6";

function App({ setLocale }: { setLocale: (lang: "sr" | "en") => void }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
      return unsubscribe;
    }, []);

  return (
    <>
      <nav>
        <div className="nav-section-left">
          <Link to={"/stanovi-mapa"}>
            <FormattedMessage id="nav.map" defaultMessage="Mapa" />
          </Link>

          {user && (
            <Link to={"/dodaj-stan"}>
              <FormattedMessage id="nav.add" defaultMessage="Dodaj" />
            </Link>
          )}
        </div>
        <div className="nav-section-right">
          {user ? (
            <Link to={"/profil"}>
              <FaUser size={24} />
            </Link>
          ) : (
            <Link to={"/prijava"}>
              <FormattedMessage id="auth.login.header" defaultMessage="Prijava" />
            </Link>
          )}

          <select
            name=""
            id="language"
            onChange={(e) => setLocale(e.target.value as "sr" | "en")}
          >
            <option value="sr">SR</option>
            <option value="en">EN</option>
          </select>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/stanovi-mapa" replace />} />
        <Route path="/stanovi-mapa" element={<StanoviMapa />} />
        <Route path="/dodaj-stan" element={<DodajStan />} />
        <Route path="/prijava" element={<LogIn />} />
        <Route path="/registracija" element={<SignUp />} />
        <Route path="/profil" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
