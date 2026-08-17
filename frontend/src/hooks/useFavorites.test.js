import { fireEvent, render, screen } from "@testing-library/react";
import { FavoritesProvider, useFavorites } from "./useFavorites";

function Harness() { const { favoriteCount, isFavorite, toggleFavorite } = useFavorites(); return <><span>{favoriteCount}</span><button onClick={() => toggleFavorite(123)}>{isFavorite(123) ? "Remove" : "Save"}</button></>; }
beforeEach(() => localStorage.clear());
test("persists and removes favorites", () => {
  render(<FavoritesProvider><Harness /></FavoritesProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("1")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("idx-exchange-favorites"))).toEqual(["123"]);
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(screen.getByText("0")).toBeInTheDocument();
});
