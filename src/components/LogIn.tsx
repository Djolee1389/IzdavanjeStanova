import React, { useState, useEffect } from "react";
import { auth } from "../Firebase";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { Link } from "react-router";
import { FormattedMessage } from "react-intl";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const formatError = (err: unknown) => {
    if (!err) return "Unknown error";
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return "Unknown error";
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const valid = email.trim().length > 0 && password.length >= 6;

  return (
    <div className="sign-up-container">
      {user ? (
        <>
          {navigate("/profil", { replace: true })}
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          aria-label="auth-form"
          id="form-auth"
        >
          <label htmlFor="f-email">Email</label>
          <input
            type="email"
            id="f-email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="f-password">Password</label>
          <input
            type="password"
            id="f-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="buttons-wrapper">
            <button
              type="button"
              onClick={handleLogin}
              disabled={!valid || loading}
              style={{ marginLeft: 8 }}
            >
              {loading ? (
                <FormattedMessage
                  id="auth.loading"
                  defaultMessage="Loading..."
                />
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
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SignUp;
