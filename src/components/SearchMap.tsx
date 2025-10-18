import "../styles/SearchMap.css";
// import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

type Inputs = {
  location: string;
  purpose: "Izdavanje" | "Na prodaju";
  minPrice: number;
  maxPrice: number;
};

export default function SearchMap() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    // setValue
  } = useForm<Inputs>();

  const minPrice = watch("minPrice");

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
  };

  return (
    <>
      <div className="search-map">
        <form
          id="searchForm"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <h3>Pretraga</h3>
          <div className="selects">
            <select {...register("location")}>
              <option value="">Izaberi lokaciju</option>
              <option value="Banjaluka">Banjaluka</option>
              <option value="Doboj">Doboj</option>
            </select>
            <select {...register("purpose")}>
              <option value="">Izaberi svrhu</option>
              <option value="Izdavanje">Izdavanje</option>
              <option value="Na prodaju">Na prodaju</option>
            </select>
          </div>
          <label htmlFor="priceRange">Pretrazi po cijeni</label>
          <div className="price-range">
            <h5>Min</h5>
            <input
              id="priceRange"
              type="number"
              placeholder="Min"
              {...register("minPrice", {
                valueAsNumber: true,
                min: { value: 0, message: "Cijena ne može biti negativna" },
                max: { value: 10000, message: "Prevelika cijena" },
              })}
            />
            {errors.minPrice && <span>{errors.minPrice.message}</span>}
            <h5>Max</h5>
            <input
              id="maxPrice"
              type="number"
              placeholder="Max"
              {...register("maxPrice", {
                valueAsNumber: true,
                min: {
                  value: minPrice || 0,
                  message: "Maksimalna cijena mora biti veća od minimalne",
                },
              })}
            />
            {errors.maxPrice && <span>{errors.maxPrice.message}</span>}
          </div>
          <input type="submit" value="Pretrazi" />
        </form>
      </div>
    </>
  );
}
