import "../styles/Profile.css";
import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { Stan } from "../types";
import { FaTrash } from "react-icons/fa";
import { useIntl } from "react-intl";
import { IoExitOutline } from "react-icons/io5";

function Profile() {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stanovi, setStanovi] = useState<Stan[]>([]);
  const navigate = useNavigate();
  const intl = useIntl();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "stanovi"));
      const data = querySnapshot.docs.map((doc) => {
        const stan = doc.data();
        const priceLabel =
          stan.purpose === "Izdavanje"
            ? intl.formatMessage({
                id: "priceMessage.rent",
                defaultMessage: "Mjesecna cijena",
              })
            : intl.formatMessage({
                id: "priceMessage.sale",
                defaultMessage: "Prodajna cijena",
              });

        const purposeLabel =
          stan.purpose === "Izdavanje"
            ? intl.formatMessage({
                id: "popup.purposeRent",
                defaultMessage: "Izdavanje",
              })
            : intl.formatMessage({
                id: "popup.purposeSale",
                defaultMessage: "Na prodaju",
              });
        return {
          id: doc.id,
          ...stan,
          priceMessage: priceLabel,
          purpose: purposeLabel,
        } as Stan;
      });
      setStanovi(data);
    };
    fetchData();
  }, [intl]);

  const userFiltered = stanovi.filter((stan) => stan.userEmail == user?.email);

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
    const ok = confirm("Are you sure you want to log out?");
    if (!ok) return;
    setError(null);
    try {
      await signOut(auth);
      navigate("/prijava", { replace: true });
    } catch (err: unknown) {
      setError(formatError(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovaj stan?")) return;
    try {
      await deleteDoc(doc(db, "stanovi", id));
      setStanovi((prevStanovi) => prevStanovi.filter((stan) => stan.id !== id));
    } catch (e) {
      console.error("Greška pri brisanju:", e);
      alert("Greška pri brisanju stana.");
    }
  };

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <h1>{user?.displayName}</h1>

          <button onClick={handleLogout} className="logout-button">
            {intl.formatMessage({
              id: "auth.logout",
              defaultMessage: "Odjavite se",
            })}{" "}
            &nbsp;
            <IoExitOutline />
          </button>
          {error && <span className="error-message">{error}</span>}
        </div>
        <hr />
        <section style={{ marginTop: 20, width: "100%" }}>
          <h2>
            {intl.formatMessage({
              id: "profile.appartments",
              defaultMessage: "Vasi apartmani",
            })}{" "}
            &nbsp; ({userFiltered.length})
          </h2>
          {userFiltered.length === 0 ? (
            <p style={{marginTop:"10px"}}>
              {intl.formatMessage({
                id: "profile.active.appartments",
                defaultMessage: "Nemate aktivnih oglasa",
              })}
            </p>
          ) : (
            <ul>
              {userFiltered.map((s: any) => (
                <li key={s.id}>
                  <div className="user-appartment">
                    <h4>{s.address}</h4> <br />
                    <b>
                      {intl.formatMessage({
                        id: "label.squareMeters",
                        defaultMessage: "Površina",
                      })}
                      :
                    </b>
                    &nbsp;{s.squareMeters} m²
                    <br />
                    <b>
                      {intl.formatMessage({
                        id: "label.purpose",
                        defaultMessage: "Svrha",
                      })}
                      :
                    </b>
                    &nbsp;{s.purpose}
                    <br />
                    <b>{s.priceMessage}:</b> {s.price} KM
                    <button
                      title={intl.formatMessage({
                        id: "button.delete",
                        defaultMessage: "Obriši",
                      })}
                      onClick={() => handleDelete(s.id)}
                      style={{
                        height: "30px",
                        aspectRatio: "1",
                        border: "none",
                        color: "red",
                        backgroundColor: "transparent",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "10px",
                        position: "absolute",
                        bottom: "5px",
                        right: "15px",
                        fontSize: "18px",
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
