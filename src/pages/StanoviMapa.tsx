// src/pages/StanoviMapa.tsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaTrash } from "react-icons/fa";
import { db } from "../Firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Stan = {
  id: string;
  address: string;
  squareMeters: number;
  purpose: string;
  price: number;
  lat: number;
  lng: number;
  priceMessage: string;
};

export default function StanoviMapa() {
  const [stanovi, setStanovi] = useState<Stan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "stanovi"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stan[];
      setStanovi(data);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    // if (!confirm("Da li ste sigurni da želite obrisati ovaj stan?")) return;
    try {
      await deleteDoc(doc(db, "stanovi", id));
      setStanovi((prevStanovi) => prevStanovi.filter((stan) => stan.id !== id));
    } catch (e) {
      console.error("Greška pri brisanju:", e);
      alert("Greška pri brisanju stana.");
    }
  };

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -20],
  });

  return (
    <div className="map-container">
      <MapContainer
        center={[44.7829, 17.2061]}
        minZoom={12}
        maxZoom={18}
        zoom={13}
        maxBounds={[
          [44.7187, 17.1013], // jugozapad
          [44.8648, 17.3145], //  sjeveroistok
        ]}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stanovi
          .filter(
            (stan) =>
              typeof stan.lat === "number" && typeof stan.lng === "number"
          )
          .map((stan) => (
            <Marker
              key={stan.id}
              position={[stan.lat, stan.lng]}
              icon={markerIcon}
            >
              <Popup>
                <div className="popup">
                  <h3>{stan.address}</h3> <br />
                  <span>
                    <b>Povrsina</b>: {stan.squareMeters} m²
                  </span>{" "}
                  <br />
                  <span>
                    {" "}
                    <b>Svrha</b>: {stan.purpose}
                  </span>{" "}
                  <br />
                  <span>
                    <b>{stan.priceMessage}</b>: {stan.price} KM
                  </span>
                  <button
                    title="Obrisi"
                    onClick={() => handleDelete(stan.id)}
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
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
