import { useForm, type SubmitHandler } from "react-hook-form";
import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { type Inputs } from "../types";
import { FormattedMessage, useIntl } from "react-intl";

export default function DodajStan() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<Inputs>();

  const purpose = watch("purpose");
  const intl = useIntl();
  const priceLabel =
    purpose === "Izdavanje"
      ? intl.formatMessage({
          id: "priceMessage.rent",
          defaultMessage: "Mjesecna cijena",
        })
      : intl.formatMessage({
          id: "priceMessage.sale",
          defaultMessage: "Prodajna cijena",
        });

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
    const street = addr.road || addr.residential || addr.street || "";
    const city =
      addr.city || addr.town || addr.village || addr.county || addr.state || "";
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


  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  const M = {
    adrRequired: t("error.addressRequired", "Adresa je obavezna"),
    sqmRequired: t("error.squareMetersRequired", "Kvadratura je obavezna"),
    sqmPositive: t("error.squareMetersPositive", "Kvadratura mora biti pozitivan broj"),
    purposeRequired: t("error.purposeRequired", "Svrha je obavezna"),
    priceRequired: t("error.priceRequired", "Cijena je obavezna"),
    pricePositive: t("error.pricePositive", "Cijena mora biti pozitivan broj"),
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} id="form-add" autoComplete="off">
        <p className="form-title">
          <FormattedMessage id="add.formTitle" defaultMessage="Podaci" />
        </p>
        <label htmlFor="f-address">
          <FormattedMessage id="label.address" defaultMessage="Adresa" />
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            id="f-address"
            placeholder={intl.formatMessage({
              id: "label.address",
              defaultMessage: "Unesite adresu",
            })}
            {...register("address", { required: M.adrRequired })}
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
            <ul>
              {suggestions.map((s) => (
                <li key={s.place_id} onClick={() => handleSuggestionClick(s)}>
                  {formatSuggestion(s)}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.address && <span>{errors.address.message}</span>}

        <label htmlFor="f-squareMeters">
          <FormattedMessage
            id="label.squareMeters"
            defaultMessage="Kvadratura (m²)"
          />
        </label>
        <input
          id="f-squareMeters"
          placeholder="m²"
          type="number"
          step="any"
          {...register("squareMeters", {
            required: M.sqmRequired,
            valueAsNumber: true,
            min: { value: 1, message: M.sqmPositive },
          })}
        />
        {errors.squareMeters && <span>{errors.squareMeters.message}</span>}

        <label htmlFor="f-purpose">
          <FormattedMessage id="label.purpose" defaultMessage="Svrha" />
        </label>
        <select
          id="f-purpose"
          {...register("purpose", { required: M.purposeRequired })}
        >
          <option value="">
            <FormattedMessage
              id="select.purposePlaceholder"
              defaultMessage="Odaberite svrhu"
            />
          </option>
          <option value="Izdavanje">
            <FormattedMessage id="purpose.rent" defaultMessage="Izdavanje" />
          </option>
          <option value="Na prodaju">
            <FormattedMessage id="purpose.sale" defaultMessage="Na prodaju" />
          </option>
        </select>
        {errors.purpose && <span>{errors.purpose.message}</span>}

        <label htmlFor="f-price">{priceLabel}</label>
        <input
          id="f-price"
          placeholder="KM"
          type="number"
          step="any"
          {...register("price", {
            required: M.priceRequired,
            valueAsNumber: true,
            min: { value: 1, message: M.pricePositive },
          })}
        />
        {errors.price && <span>{errors.price.message}</span>}

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p>
              <FormattedMessage
                id="loader.loading"
                defaultMessage="Dodavanje u toku..."
              />
            </p>
          </div>
        ) : (
          <input
            type="submit"
            value={intl.formatMessage({
              id: "button.submit",
              defaultMessage: "Dodavanje u toku...",
            })}
            disabled={loading}
          />
        )}
      </form>
    </div>
  );
}
