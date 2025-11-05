import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { auth } from "../Firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
// import { formatFirebaseError } from "../utils/formatFirebaseError";
import type { FormData } from "../types.ts";

const SignUp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const intl = useIntl();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>();

  const password = watch("password");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/profil", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: FormData) => {
    // setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password
      );
      await updateProfile(userCredential.user, {
        displayName: data.displayName.trim(),
      });
      reset();
    } catch (err: unknown) {
      // setError(formatFirebaseError(err, intl));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container sign-up-container">
      <form onSubmit={handleSubmit(onSubmit)} id="form-auth">
        <h3>
          <FormattedMessage
            id="auth.signup.header"
            defaultMessage="Registracija"
          />
        </h3>

        <label htmlFor="f-email">Email</label>
        <input
          type="email"
          id="f-email"
          placeholder="Email"
          {...register("email", {
            required: intl.formatMessage({
              id: "error.emailRequired",
              defaultMessage: "Email adresa je obavezna",
            }),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: intl.formatMessage({
                id: "error.invalidEmail",
                defaultMessage: "Neispravan format Email adrese",
              }),
            },
          })}
        />
        {errors.email && (
          <span style={{ color: "red" }}>{errors.email.message}</span>
        )}

        <label htmlFor="f-username">
          <FormattedMessage
            id="login.username"
            defaultMessage="Korisničko ime"
          />
        </label>
        <input
          type="text"
          id="f-username"
          placeholder={intl.formatMessage({
            id: "login.username",
            defaultMessage: "Korisničko ime",
          })}
          {...register("displayName", {
            required: intl.formatMessage({
              id: "error.usernameRequired",
              defaultMessage: "Korisnicko ime je obavezno",
            }),
          })}
        />
        {errors.displayName && (
          <span style={{ color: "red" }}>{errors.displayName.message}</span>
        )}

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
          {...register("password", {
            required: intl.formatMessage({
              id: "error.passwordRequired",
              defaultMessage: "Lozinka je obavezna",
            }),
            minLength: {
              value: 6,
              message: intl.formatMessage({
                id: "error.shortPassword",
                defaultMessage: "Lozinka je prekratka",
              }),
            },
          })}
        />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password.message}</span>
        )}

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
          {...register("confirmPassword", {
            validate: (value) =>
              value === password ||
              intl.formatMessage({
                id: "error.passwordMismatch",
                defaultMessage: "Lozinke se ne poklapaju",
              }),
          })}
        />
        {errors.confirmPassword && (
          <span style={{ color: "red" }}>{errors.confirmPassword.message}</span>
        )}

        {/* {errors && <span style={{ color: "red" }}>{errors}</span>} */}

        <button type="submit" disabled={loading} style={{ margin: "20px 0" }}>
          {loading ? (
            <FormattedMessage id="auth.loading" defaultMessage="Loading..." />
          ) : (
            <FormattedMessage id="auth.signup" defaultMessage="Sign Up" />
          )}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
