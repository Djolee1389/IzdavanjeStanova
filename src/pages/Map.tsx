import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { collection, getDocs} from "firebase/firestore";
import { db } from "../Firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import SearchMap from "../components/SearchMap";
import cityCoords from "../CityCoords.json";
import type { CityKey, Stan, CityCoordinates } from "../types";
import { useIntl } from "react-intl";

function MapController({ city }: { city: CityKey }) {
  const map = useMap();

  useEffect(() => {
    if (city && cityCoords[city]) {
      const coords = cityCoords[city] as CityCoordinates;
      map.setView([coords.lat, coords.lng], 13);
      map.setMaxBounds([coords.maxBounds[0], coords.maxBounds[1]]);
    }
  }, [city, map]);

  return null;
}

export default function StanoviMapa() {
  const intl = useIntl();

  const [stanovi, setStanovi] = useState<Stan[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityKey>("banjaluka");
  const [selectedPurpose, setSelectedPurpose] = useState<
    "" | "Izdavanje" | "Na prodaju"
  >("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "stanovi"));
      const data = querySnapshot.docs.map((doc) => {
        const stan = doc.data();

        const priceLabel = stan.purpose === "Izdavanje" 
          ? intl.formatMessage({ id: "priceMessage.rent", defaultMessage: "Mjesecna cijena" })
          : intl.formatMessage({ id: "priceMessage.sale", defaultMessage: "Prodajna cijena" });

        const purposeLabel = stan.purpose === "Izdavanje"
          ? intl.formatMessage({ id: "popup.purposeRent", defaultMessage: "Izdavanje" })
          : intl.formatMessage({ id: "popup.purposeSale", defaultMessage: "Na prodaju" });

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

  const handleCityChange = (city: CityKey) => {
    setSelectedCity(city);
  };

  const handlePurposeChange = (purpose: "" | "Izdavanje" | "Na prodaju") => {
    setSelectedPurpose(purpose);
  };
  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const filteredStanovi = stanovi
    .filter(
      (stan) => typeof stan.lat === "number" && typeof stan.lng === "number"
    )
    .filter((stan) => !selectedPurpose || stan.purpose === selectedPurpose)
    .filter((stan) => {
      if (minPrice !== undefined && stan.price < minPrice) return false;
      if (maxPrice !== undefined && stan.price > maxPrice) return false;
      return true;
    });

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -20],
  });

  return (
    <div className="map-container">
      <MapContainer
        center={
          [
            cityCoords[selectedCity].lat,
            cityCoords[selectedCity].lng,
          ] as LatLngTuple
        }
        minZoom={12}
        maxZoom={18}
        zoom={13}
        maxBounds={[
          cityCoords[selectedCity].maxBounds[0] as LatLngTuple,
          cityCoords[selectedCity].maxBounds[1] as LatLngTuple,
        ]}
        style={{ height: "100%", width: "100%" }}
      >
        <MapController city={selectedCity} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredStanovi.map((stan) => (
          <Marker
            key={stan.id}
            position={[stan.lat, stan.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div className="popup">
                <h3>{stan.address}</h3> <br />
                <b>
                  {intl.formatMessage({
                    id: "label.squareMeters",
                    defaultMessage: "Površina",
                  })}:
                </b>
                  &nbsp;{stan.squareMeters} m²
                <br />
                <b>
                  {intl.formatMessage({
                    id: "label.purpose",
                    defaultMessage: "Svrha",
                  })}:
                </b>
                &nbsp;{stan.purpose}
                <br />
                <b>{stan.priceMessage}:</b> {stan.price} KM
                
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <SearchMap
        onCityChange={handleCityChange}
        onPurposeChange={handlePurposeChange}
        onPriceChange={handlePriceChange}
      />
    </div>
  );
}
