import { fireEvent, render, screen, within } from "@testing-library/react";
import Pagination, { getPaginationItems } from "./Pagination";

test("is hidden when there is only one page", () => {
  const { container } = render(
    <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
  );
  expect(container).toBeEmptyDOMElement();
});

test("disables Previous on the first page", () => {
  render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
});

test("disables Next on the last page", () => {
  render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("calls onPageChange for a page number, Previous, and Next", () => {
  const onPageChange = jest.fn();
  render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

  fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));
  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
  expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  expect(onPageChange).toHaveBeenNthCalledWith(3, 6);
});

test("marks the current page", () => {
  render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("shows every page without ellipsis for small totals", () => {
  expect(getPaginationItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
});

test.each([
  [2, [1, 2, 3, 4, 5, "end-ellipsis", 24]],
  [5, [1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 24]],
  [23, [1, "start-ellipsis", 20, 21, 22, 23, 24]],
])("generates correct items around page %i", (currentPage, expected) => {
  expect(getPaginationItems(currentPage, 24)).toEqual(expected);
});

test("renders two ellipses on a middle page", () => {
  render(<Pagination currentPage={5} totalPages={24} onPageChange={jest.fn()} />);
  const pagination = screen.getByRole("navigation", {
    name: "Property listings pagination",
  });
  expect(within(pagination).getAllByText("…")).toHaveLength(2);
});

test("does not duplicate the last page near the end", () => {
  const items = getPaginationItems(23, 24);
  expect(items.filter((item) => item === 24)).toHaveLength(1);

  render(<Pagination currentPage={23} totalPages={24} onPageChange={jest.fn()} />);
  expect(screen.getAllByRole("button", { name: "Go to page 24" })).toHaveLength(1);
});
