import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { auth } from "../Firebase";
import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsername("");
    } catch (err: unknown) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    confirm("Are you sure you want to log out?");
    setError(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      setError(formatError(err));
    }
  };

  //   const valid =
  //     email.trim().length > 0 &&
  //     password.length >= 6 &&
  //     password === confirmPassword;

  return (
    
    <div className="sign-up-container">
      {user ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p>Welcome, {username}</p>
          <button onClick={handleLogout} disabled={loading}>
            Logout
          </button>
        </div>

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
          <label htmlFor="f-username">Username</label>
          <input
            type="text"
            id="f-username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="f-password">
            <FormattedMessage id="login.password" defaultMessage="Lozinka" />
          </label>
          <input
            type="password"
            id="f-password"
            placeholder={useIntl().formatMessage({
              id: "login.password",
              defaultMessage: "Lozinka",
            })}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="f-rpassword">
            <FormattedMessage
              id="login.password.repeat"
              defaultMessage="Ponovi lozinku"
            />
          </label>
          <input
            type="password"
            id="f-rpassword"
            placeholder={useIntl().formatMessage({
              id: "login.password.repeat",
              defaultMessage: "Ponovi lozinku",
            })}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="button" onClick={handleSignup} disabled={loading}>
            {loading ? (
              <FormattedMessage id="auth.loading" defaultMessage="Loading..." />
            ) : (
              <FormattedMessage id="auth.signup" defaultMessage="Sign Up" />
            )}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SignUp;
