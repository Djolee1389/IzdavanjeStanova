import { useForm, type SubmitHandler } from "react-hook-form";
import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";

type Inputs = {
  adresa: string;
  kvadratura: number;
  cijena: number;
  svrha: "Izdavanje" | "Na prodaju";
};

export default function MainPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<Inputs>();

  const svrha = watch("svrha");
  const cijenaLabel =
    svrha === "Izdavanje" ? "Mjesecna cijena" : "Prodajna cijena";

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          data.adresa
        )}`
      );
      const locations = await res.json();

      if (!locations.length) {
        alert("Nije pronađena lokacija za ovu adresu!");
        return;
      }

      const { lat, lon } = locations[0];

      await addDoc(collection(db, "stanovi"), {
        adresa: data.adresa,
        kvadratura: data.kvadratura,
        cijena: data.cijena,
        svrha: data.svrha,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        datum: new Date().toISOString(),
        cijenaPoruka: cijenaLabel,
      });
      // alert("Stan uspješno dodat u bazu!");
      reset();
    } catch (e) {
      console.error("Greška pri dodavanju:", e);
      alert("Greška pri upisu u bazu.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} id="forma1" autoComplete="off">
        <p>PODACI</p>
        <label htmlFor="f-adresa">Adresa</label>
        <input
          id="f-adresa"
          placeholder="Adresa"
          {...register("adresa", { required: "Adresa je obavezna" })}
        />
        {errors.adresa && <span>{errors.adresa.message}</span>}

        <label htmlFor="f-kvadratura">Kvadratura</label>
        <input
          id="f-kvadratura"
          placeholder="m²"
          type="number"
          step="any"
          {...register("kvadratura", {
            required: "Kvadratura je obavezna",
            valueAsNumber: true,
            min: { value: 1, message: "Kvadratura mora biti pozitivna" },
          })}
        />
        {errors.kvadratura && <span>{errors.kvadratura.message}</span>}

        <label htmlFor="f-svrha">Svrha</label>
        <select
          id="f-svrha"
          {...register("svrha", { required: "Svrha je obavezna" })}
        >
          <option value="">Odaberite svrhu</option>
          <option value="Izdavanje">Izdavanje</option>
          <option value="Na prodaju">Prodaja</option>
        </select>
        {errors.svrha && <span>{errors.svrha.message}</span>}

        <label htmlFor="f-cijena">{cijenaLabel}</label>
        <input
          id="f-cijena"
          placeholder="KM"
          type="number"
          step="any"
          {...register("cijena", {
            required: "Cijena je obavezna",
            valueAsNumber: true,
            min: { value: 1, message: "Cijena mora biti pozitivna" },
          })}
        />
        {errors.cijena && <span>{errors.cijena.message}</span>}

        <input type="submit" value={"Dodaj"} />
      </form>
    </div>
  );
}
