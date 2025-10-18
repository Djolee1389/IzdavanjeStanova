import { useForm, type SubmitHandler } from "react-hook-form";
import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";
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
  } = useForm<Inputs>();

  const purpose = watch("purpose");

  const priceLabel =
    purpose === "Izdavanje" ? "Mjesecna cijena" : "Prodajna cijena";

  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          data.address
        )}`
      );
      const locations = await res.json();

      if (!locations.length) {
        alert("Nije pronađena lokacija za ovu adresu!");
        return;
      }

      const { lat, lon } = locations[0];

      await addDoc(collection(db, "stanovi"), {
        address: data.address,
        squareMeters: data.squareMeters,
        price: data.price,
        purpose: data.purpose,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        publishDate: new Date().toISOString(),
        priceMessage: priceLabel,
      });
      // alert("Stan uspješno dodat u bazu!");
      reset();
      setLoading(false);
    } catch (e) {
      console.error("Greška pri dodavanju:", e);
      alert("Greška pri upisu u bazu.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} id="form1" autoComplete="off">
        <p className="form-title">PODACI</p>
        <label htmlFor="f-address">Adresa</label>
        <input
          id="f-address"
          placeholder="Adresa"
          {...register("address", { required: "Adresa je obavezna" })}
        />
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
