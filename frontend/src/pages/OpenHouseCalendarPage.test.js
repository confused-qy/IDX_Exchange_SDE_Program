import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fetchOpenHouseCalendar, fetchOpenHouseRange } from "../api/client";
import OpenHouseCalendarPage from "./OpenHouseCalendarPage";

jest.mock("../api/client", () => ({ fetchOpenHouseCalendar: jest.fn(), fetchOpenHouseRange: jest.fn() }));

test("loads the available month and links events to their property", async () => {
  fetchOpenHouseRange.mockResolvedValue({ minDate: "2026-06-16", maxDate: "2026-06-24", nearestDate: "2026-06-20" });
  fetchOpenHouseCalendar.mockResolvedValue([{ id: 7, L_ListingID: "abc-123", L_Address: "7 Test Street", OpenHouseDate: "2026-06-20", OH_StartTime: "13:00:00", all_data: '{"OpenHouseRemarks":"Welcome!"}' }]);
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><OpenHouseCalendarPage /></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: "June 2026" })).toBeInTheDocument();
  expect(fetchOpenHouseCalendar).toHaveBeenCalledWith("2026-06-01", "2026-06-30", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  const event = await screen.findByRole("link", { name: /7 Test Street/ });
  expect(event).toHaveAttribute("href", "/property/abc-123");
  expect(event).toHaveTextContent("Welcome!");
});

test("shows a friendly empty state", async () => {
  fetchOpenHouseRange.mockResolvedValue({ minDate: "2026-06-16", maxDate: "2026-06-24", nearestDate: "2026-06-20" });
  fetchOpenHouseCalendar.mockResolvedValue([]);
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><OpenHouseCalendarPage /></MemoryRouter>);
  expect(await screen.findByText("No open houses scheduled for this month.")).toBeInTheDocument();
});
