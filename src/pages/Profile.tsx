import "../styles/Profile.css";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";
import { useNavigate } from "react-router";

function Profile() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const formatError = (err: unknown) => {
    if (!err) return "Unknown error";
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return "Unknown error";
    }
  };

  const handleLogout = async () => {
    confirm("Are you sure you want to log out?");
    setError(null);
    try {
      await signOut(auth);
      navigate("/prijava", { replace: true });
    } catch (err: unknown) {
      setError(formatError(err));
    }
  };
  return (
    <div>
      <h1>Profile Page</h1>
      <button onClick={handleLogout}>Logout</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Profile;
