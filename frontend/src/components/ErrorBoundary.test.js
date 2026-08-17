import { fireEvent, render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Broken({ fail = true }) { if (fail) throw new Error("test render failure"); return <p>Recovered</p>; }

test("shows recovery UI for render errors", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  render(<ErrorBoundary><Broken /></ErrorBoundary>);
  expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  expect(screen.getByRole("link", { name: "Return to listings" })).toHaveAttribute("href", "/");
  consoleSpy.mockRestore();
});
