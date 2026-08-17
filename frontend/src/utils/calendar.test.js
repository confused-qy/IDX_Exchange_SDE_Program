import { calendarDays, formatCalendarTime, monthBounds, parseRemarks, toDateKey } from "./calendar";

test("builds stable month boundaries and a six-week grid", () => {
  const month = new Date(2026, 5, 15);
  expect(monthBounds(month)).toEqual({ startDate: "2026-06-01", endDate: "2026-06-30" });
  const days = calendarDays(month);
  expect(days).toHaveLength(42);
  expect(days[0].getDay()).toBe(0);
  expect(toDateKey(days[0])).toBe("2026-05-31");
});

test("parses remarks safely and formats event time", () => {
  expect(parseRemarks('{"OpenHouseRemarks":"Come visit"}')).toBe("Come visit");
  expect(parseRemarks("broken json")).toBe("");
  expect(formatCalendarTime("13:30:00")).toBe("1:30 PM");
});
