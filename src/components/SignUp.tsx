import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { auth } from "../Firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(userCredential.user, {
        displayName: displayName.trim(),
      });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDisplayName("");
    } catch (err: unknown) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  //   const valid =
  //     email.trim().length > 0 &&
  //     password.length >= 6 &&
  //     password === confirmPassword;

  return (
    <div className="container sign-up-container">
      {user ? (
        <>{navigate("/profil", { replace: true })}</>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          aria-label="auth-form"
          id="form-auth"
        >
          <h3>
            <FormattedMessage
              id="auth.signup.header"
              defaultMessage="Registracija"
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
          <label htmlFor="f-username">
            <FormattedMessage
              id="login.username"
              defaultMessage="Korisnicko ime"
            ></FormattedMessage>
          </label>
          <input
            type="text"
            id="f-username"
            placeholder={intl.formatMessage({
              id: "login.username",
              defaultMessage: "Korisnicko ime",
            })}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <label htmlFor="f-password">
            <FormattedMessage id="login.password" defaultMessage="Lozinka" />
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
          <label htmlFor="f-rpassword">
            <FormattedMessage
              id="login.password.repeat"
              defaultMessage="Ponovi lozinku"
            />
          </label>
          <input
            type="password"
            id="f-rpassword"
            placeholder={intl.formatMessage({
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
