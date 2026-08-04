import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyFilters from "./PropertyFilters";

test("displays all six filter inputs", () => {
  render(<PropertyFilters onSearch={jest.fn()} onClear={jest.fn()} />);

  expect(screen.getByLabelText("City")).toBeInTheDocument();
  expect(screen.getByLabelText("ZIP code")).toBeInTheDocument();
  expect(screen.getByLabelText("Min price")).toBeInTheDocument();
  expect(screen.getByLabelText("Max price")).toBeInTheDocument();
  expect(screen.getByLabelText("Beds")).toBeInTheDocument();
  expect(screen.getByLabelText("Baths")).toBeInTheDocument();
});

test("submits combined filters without empty values", async () => {
  const onSearch = jest.fn();
  render(<PropertyFilters onSearch={onSearch} onClear={jest.fn()} />);

  await userEvent.type(screen.getByLabelText("City"), "Seattle");
  await userEvent.selectOptions(screen.getByLabelText("Beds"), "3");
  await userEvent.click(screen.getByRole("button", { name: "Search" }));

  expect(onSearch).toHaveBeenCalledWith({ city: "Seattle", beds: "3" });
});

test("clear resets every field and calls onClear", async () => {
  const onClear = jest.fn();
  render(<PropertyFilters onSearch={jest.fn()} onClear={onClear} />);

  await userEvent.type(screen.getByLabelText("City"), "Portland");
  await userEvent.type(screen.getByLabelText("Min price"), "300000");
  await userEvent.selectOptions(screen.getByLabelText("Baths"), "2");
  await userEvent.click(
    screen.getByRole("button", { name: "Clear Filters" })
  );

  expect(screen.getByLabelText("City")).toHaveValue("");
  expect(screen.getByLabelText("Min price")).toHaveValue(null);
  expect(screen.getByLabelText("Baths")).toHaveValue("");
  expect(onClear).toHaveBeenCalledTimes(1);
});
