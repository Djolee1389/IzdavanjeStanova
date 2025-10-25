import { useForm, type SubmitHandler } from "react-hook-form";
import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";

type Inputs = {
  address: string;
  squareMeters: number;
  price: number;
  purpose: "Izdavanje" | "Na prodaju";
};

export default function DodajStan() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue, // added
  } = useForm<Inputs>();

  const purpose = watch("purpose");

  const priceLabel =
    purpose === "Izdavanje" ? "Mjesecna cijena" : "Prodajna cijena";

  const [loading, setLoading] = useState(false);

  // Location autocomplete
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const formatSuggestion = (item: any) => {
    const addr = item.address || {};
    const house = addr.house_number ? ` ${addr.house_number}` : "";
    const street =
      addr.road ||
      addr.pedestrian ||
      addr.footway ||
      addr.path ||
      addr.residential ||
      addr.street ||
      "";
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state ||
      "";
    const left = street ? `${street}${house}` : "";
    if (left && city) return `${left}, ${city}`;
    if (left) return left;
    if (city) return city;
    return (item.display_name || "").split(",").slice(0, 3).join(", ");
  };

  // Debounced suggestions fetch
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=ba&q=${encodeURIComponent(
            query
          )}`,
          { signal: ac.signal, headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setSuggestions(
          arr.filter(
            (d: any) => (d.address?.country_code || "").toLowerCase() === "ba"
          )
        );
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query]);

  const handleSuggestionClick = (item: any) => {
    const label = formatSuggestion(item);
    setValue("address", label);
    setQuery(label);
    setSuggestions([]);
    setSelectedLocation({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);

      let lat: number | undefined;
      let lon: number | undefined;

      if (selectedLocation) {
        lat = selectedLocation.lat;
        lon = selectedLocation.lon;
      } else {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ba&q=${encodeURIComponent(
            data.address
          )}`
        );
        const locations = await res.json();

        if (!locations.length) {
          alert("Nije pronađena lokacija za ovu adresu!");
          setLoading(false);
          return;
        }
        const baLoc = locations.find(
          (l: any) => (l.address?.country_code || "").toLowerCase() === "ba"
        );
        const chosen = baLoc || locations[0];

        lat = parseFloat(chosen.lat);
        lon = parseFloat(chosen.lon);
      }

      await addDoc(collection(db, "stanovi"), {
        address: data.address,
        squareMeters: data.squareMeters,
        price: data.price,
        purpose: data.purpose,
        lat: lat,
        lng: lon,
        publishDate: new Date().toISOString(),
        priceMessage: priceLabel,
      });

      reset();
      setSelectedLocation(null);
      setQuery("");
      setSuggestions([]);
      setLoading(false);
    } catch (e) {
      console.error("Greška pri dodavanju:", e);
      alert("Greška pri upisu u bazu.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} id="form1" autoComplete="off">
        <p className="form-title">PODACI</p>
        <label htmlFor="f-address">Adresa</label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            id="f-address"
            placeholder="Adresa"
            {...register("address", { required: "Adresa je obavezna" })}
            value={query || ""}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setValue("address", v);
              setSelectedLocation(null);
            }}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                zIndex: 50,
                left: 0,
                right: 0,
                background: "#fff",
                listStyle: "none",
                margin: 0,
                padding: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  onClick={() => handleSuggestionClick(s)}
                  style={{ padding: "8px 10px", cursor: "pointer" }}
                >
                  {formatSuggestion(s)}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.address && <span>{errors.address.message}</span>}

        <label htmlFor="f-squareMeters">Kvadratura</label>
        <input
          id="f-squareMeters"
          placeholder="m²"
          type="number"
          step="any"
          {...register("squareMeters", {
            required: "Kvadratura je obavezna",
            valueAsNumber: true,
            min: { value: 1, message: "Kvadratura mora biti pozitivna" },
          })}
        />
        {errors.squareMeters && <span>{errors.squareMeters.message}</span>}

        <label htmlFor="f-purpose">Svrha</label>
        <select
          id="f-purpose"
          {...register("purpose", { required: "Svrha je obavezna" })}
        >
          <option value="">Odaberite svrhu</option>
          <option value="Izdavanje">Izdavanje</option>
          <option value="Na prodaju">Prodaja</option>
        </select>
        {errors.purpose && <span>{errors.purpose.message}</span>}

        <label htmlFor="f-price">{priceLabel}</label>
        <input
          id="f-price"
          placeholder="KM"
          type="number"
          step="any"
          {...register("price", {
            required: "Cijena je obavezna",
            valueAsNumber: true,
            min: { value: 1, message: "Cijena mora biti pozitivna" },
          })}
        />
        {errors.price && <span>{errors.price.message}</span>}

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Dodavanje u toku...</p>
          </div>
        ) : (
          <input type="submit" value="Dodaj" disabled={loading} />
        )}
      </form>
    </div>
  );
}
