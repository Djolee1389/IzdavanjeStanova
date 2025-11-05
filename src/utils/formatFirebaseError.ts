import { FirebaseError } from "firebase/app";
import type { IntlShape } from "react-intl";

export function formatFirebaseError(error: unknown, intl:IntlShape): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email address is already registered.";
      case "auth/invalid-email":
        return intl.formatMessage({
          id:"error.invalidCredentials"
        });
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return intl.formatMessage({
          id:"error.invalidCredentials"
        });
      case "auth/too-many-requests":
        return "Too many login attempts. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  if (error instanceof Error) return error.message;
  return String(error);
}
