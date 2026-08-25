import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
