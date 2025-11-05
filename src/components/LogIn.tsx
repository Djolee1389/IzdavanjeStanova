import React, { useState, useEffect } from "react";
import { auth } from "../Firebase";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { Link } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { formatFirebaseError } from "../utils/formatFirebaseError";

const LogIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const intl = useIntl();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // const formatError = (err: unknown) => {
  //   if (!err) return "Unknown error";
  //   if (err instanceof Error) return err.message;
  //   try {
  //     return String(err);
  //   } catch {
  //     return "Unknown error";
  //   }
  // };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      setError(formatFirebaseError(err, intl));
      // console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // const valid = email.trim().length > 0 && password.length >= 6;

  if (user) {
    navigate("/profil", { replace: true });
    return null;
  }

  return (
    <div className="container sign-up-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        aria-label="auth-form"
        id="form-auth"
      >
        <h3>
          <FormattedMessage
            id="auth.login.header"
            defaultMessage="Prijava"
          ></FormattedMessage>
        </h3>
        <label htmlFor="f-email">Email</label>
        <input
          type="email"
          id="f-email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="f-password">
          <FormattedMessage
            id="login.password"
            defaultMessage="Lozinka"
          ></FormattedMessage>
        </label>
        <input
          type="password"
          id="f-password"
          placeholder={intl.formatMessage({
            id: "login.password",
            defaultMessage: "Lozinka",
          })}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span>{error}</span>}
        <div className="buttons-wrapper">
          <button type="button" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <FormattedMessage id="auth.loading" defaultMessage="Loading..." />
            ) : (
              <FormattedMessage id="auth.login" defaultMessage="Log In" />
            )}
          </button>
          <Link to="/registracija">
            <FormattedMessage
              id="login.signupLink"
              defaultMessage="Nemate nalog? Registrujte se"
            />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LogIn;
