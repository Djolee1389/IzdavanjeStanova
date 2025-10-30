import "../styles/SearchMap.css";
import { useForm, type SubmitHandler } from "react-hook-form";
import cityCoords from "../CityCoords.json";
import type { CityKey, SearchMapProps, SearchInputs } from "../types";
import { FormattedMessage, useIntl } from "react-intl";

export default function SearchMap({
  onCityChange,
  onPurposeChange,
  onPriceChange,
}: SearchMapProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SearchInputs>();

  const minPrice = watch("minPrice");

  const onSubmit: SubmitHandler<SearchInputs> = (data) => {
    handleCityChange({
      target: { value: data.location },
    } as React.ChangeEvent<HTMLSelectElement>);
    handlePurposeChange({
      target: { value: data.purpose },
    } as React.ChangeEvent<HTMLSelectElement>);
    handlePriceChange(data.minPrice, data.maxPrice);

    // console.log(data);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value as CityKey;
    if (selectedCity) {
      onCityChange(selectedCity);
    }
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPurpose = e.target.value as "" | "Izdavanje" | "Na prodaju";
    onPurposeChange(selectedPurpose);
  };

  const handlePriceChange = (minPrice: number, maxPrice: number) => {
    if (onPriceChange) {
      onPriceChange(minPrice, maxPrice);
    }
  };

  const intl = useIntl();

  return (
    <div className="search-map">
      <form
        id="searchForm"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <h3>
          <FormattedMessage id="search.label" defaultMessage="Pretraga" />
        </h3>
        <div className="selects">
          <select {...register("location")}>
            <option value="">
              <FormattedMessage
                id="choose.location"
                defaultMessage="Izaberi lokaciju"
              />
            </option>
            {Object.keys(cityCoords)
              .sort()
              .map((city) => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
          </select>
          <select {...register("purpose")}>
            <option value="">
              <FormattedMessage id="choose.purpose" defaultMessage="Sve" />
            </option>
            <option value="Izdavanje">
              <FormattedMessage id="purpose.rent" defaultMessage="Izdavanje" />
            </option>
            <option value="Na prodaju">
              <FormattedMessage id="purpose.sale" defaultMessage="Na prodaju" />
            </option>
          </select>
        </div>
        <label htmlFor="priceRange">
          <FormattedMessage
            id="price.search"
            defaultMessage="Pretraži po cijeni"
          />
        </label>
        <div className="price-range">
          <h5>Min</h5>
          <input
            id="priceRange"
            type="number"
            placeholder="Min"
            {...register("minPrice", {
              valueAsNumber: true,
              min: { value: 0, message: "Cijena ne može biti negativna" },
              // max: { value: 10000, message: "Prevelika cijena" },
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
        <input
          type="submit"
          value={intl.formatMessage({
            id: "button.search",
            defaultMessage: "Pretraži",
          })}
        />
      </form>
    </div>
  );
}
