import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { fetchProperties } from "../api/client";
import { MemoryRouter } from "react-router-dom";
import { FavoritesProvider } from "../hooks/useFavorites";
import ListingsPage from "./ListingsPage";

jest.mock("../api/client", () => ({
  fetchProperties: jest.fn(),
}));

function makeProperties(offset, count) {
  return Array.from({ length: count }, (_, index) => ({
    L_ListingID: offset + index + 1,
    L_Address: `${offset + index + 1} Test Street`,
    L_City: "Seattle",
    L_State: "WA",
    L_SystemPrice: 500000,
  }));
}

function renderPage() {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FavoritesProvider><ListingsPage /></FavoritesProvider></MemoryRouter>);
}

beforeEach(() => {
  window.scrollTo = jest.fn();
  fetchProperties.mockImplementation(({ offset = 0 }) =>
    Promise.resolve({
      results: makeProperties(offset, Math.min(20, 45 - offset)),
      total: 45,
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test("shows the result range and requests the selected page", async () => {
  renderPage();

  expect(await screen.findByText("1 Test Street")).toBeInTheDocument();
  expect(screen.getByText(/Showing/)).toHaveTextContent(
    "Showing 1-20 of 45 properties"
  );

  fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

  expect(await screen.findByText("21 Test Street")).toBeInTheDocument();
  expect(fetchProperties).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 20, offset: 20, sortBy: "ListingContractDate", sortOrder: "desc" }),
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );
  expect(screen.getByText(/Showing/)).toHaveTextContent(
    "Showing 21-40 of 45 properties"
  );
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test("preserves active filters while paging", async () => {
  renderPage();
  await screen.findByText("1 Test Street");

  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Seattle" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() =>
    expect(fetchProperties).toHaveBeenLastCalledWith(
      expect.objectContaining({ city: "Seattle", offset: 0 }),
      expect.any(Object)
    )
  );

  fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
  await waitFor(() =>
    expect(fetchProperties).toHaveBeenLastCalledWith(
      expect.objectContaining({ city: "Seattle", offset: 20 }),
      expect.any(Object)
    )
  );
});

test("applying a new filter resets pagination to page one", async () => {
  renderPage();
  await screen.findByText("1 Test Street");

  fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
  await screen.findByText("21 Test Street");
  expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveAttribute(
    "aria-current",
    "page"
  );

  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Portland" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));

  await waitFor(() =>
    expect(fetchProperties).toHaveBeenLastCalledWith(
      expect.objectContaining({ city: "Portland", offset: 0 }),
      expect.any(Object)
    )
  );
  expect(screen.getByRole("button", { name: "Go to page 1" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("hides pagination when filtered results fit on one page", async () => {
  fetchProperties.mockResolvedValue({ results: makeProperties(0, 8), total: 8 });
  renderPage();

  expect(await screen.findByText("1 Test Street")).toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", { name: "Property listings pagination" })
  ).not.toBeInTheDocument();
  expect(screen.getByText(/Showing/)).toHaveTextContent(
    "Showing 1-8 of 8 properties"
  );
});

test("preserves sorting across pages and resets it when filters change", async () => {
  renderPage();
  await screen.findByText("1 Test Street");
  fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "L_SystemPrice:asc" } });
  await waitFor(() => expect(fetchProperties).toHaveBeenLastCalledWith(
    expect.objectContaining({ sortBy: "L_SystemPrice", sortOrder: "asc", offset: 0 }), expect.any(Object)
  ));
  fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
  await waitFor(() => expect(fetchProperties).toHaveBeenLastCalledWith(
    expect.objectContaining({ sortBy: "L_SystemPrice", sortOrder: "asc", offset: 20 }), expect.any(Object)
  ));
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Seattle" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() => expect(fetchProperties).toHaveBeenLastCalledWith(
    expect.objectContaining({ city: "Seattle", sortBy: "ListingContractDate", sortOrder: "desc", offset: 0 }), expect.any(Object)
  ));
  expect(screen.getByLabelText("Sort by")).toHaveValue("ListingContractDate:desc");
});
