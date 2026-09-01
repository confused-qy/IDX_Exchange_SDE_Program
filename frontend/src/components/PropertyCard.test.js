import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { FavoritesProvider } from "../hooks/useFavorites";
import PropertyCard from "./PropertyCard";

const property = {
  L_ListingID: "MLS-100",
  L_Address: "100 Market Street",
  L_City: "Seattle",
  L_State: "WA",
  L_Status: "Active",
  L_SystemPrice: 750000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1800,
};

function renderCard() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <PropertyCard property={property} />
      </FavoritesProvider>
    </MemoryRouter>
  );
}

function renderCardWithDestination() {
  return render(
    <MemoryRouter initialEntries={["/"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <Routes>
          <Route path="/" element={<PropertyCard property={property} />} />
          <Route path="/property/:id" element={<h1>Property detail destination</h1>} />
        </Routes>
      </FavoritesProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

test("renders property details and links to the listing", () => {
  renderCard();

  expect(screen.getByText("$750,000")).toBeInTheDocument();
  expect(screen.getByText("100 Market Street")).toBeInTheDocument();
  expect(screen.getByText("Seattle, WA")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View 100 Market Street" })).toHaveAttribute(
    "href",
    "/property/MLS-100"
  );
});

test("clicking the card navigates to the property detail route", () => {
  renderCardWithDestination();

  fireEvent.click(screen.getByRole("link", { name: "View 100 Market Street" }));

  expect(
    screen.getByRole("heading", { name: "Property detail destination" })
  ).toBeInTheDocument();
});

test("adds and removes the property from favorites", () => {
  renderCard();

  const favoriteButton = screen.getByRole("button", {
    name: "Add 100 Market Street to favorites",
  });
  fireEvent.click(favoriteButton);

  expect(
    screen.getByRole("button", { name: "Remove 100 Market Street from favorites" })
  ).toHaveAttribute("aria-pressed", "true");
  expect(window.localStorage.getItem("idx-exchange-favorites")).toBe('["MLS-100"]');
});
