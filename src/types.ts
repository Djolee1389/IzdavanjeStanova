export type CityKey = keyof typeof import("./CityCoords.json");

export type Inputs = {
  address: string;
  squareMeters: number;
  price: number;
  purpose: "Izdavanje" | "Na prodaju";
};

// Search related types

export type SearchInputs = {
  location: string;
  purpose: "Izdavanje" | "Na prodaju";
  minPrice: number;
  maxPrice: number;
};

export interface SearchMapProps {
  onCityChange: (city: CityKey) => void;
  onPurposeChange: (purpose: "" | "Izdavanje" | "Na prodaju") => void;
  onPriceChange?: (minPrice: number, maxPrice: number) => void;
}

// Map related types
export type Stan = {
  id: string;
  address: string;
  squareMeters: number;
  purpose: string;
  price: number;
  lat: number;
  lng: number;
  priceMessage: string;
  userEmail: string;
};

import type { LatLngTuple } from "leaflet";

export interface CityCoordinates {
  lat: number;
  lng: number;
  maxBounds: [LatLngTuple, LatLngTuple];
}
