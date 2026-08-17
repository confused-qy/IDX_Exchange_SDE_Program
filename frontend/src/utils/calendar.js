export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthBounds(date) {
  return {
    startDate: toDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    endDate: toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

export function calendarDays(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = new Date(date.getFullYear(), date.getMonth(), 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index));
}

export function parseRemarks(allData) {
  try {
    const parsed = typeof allData === "string" ? JSON.parse(allData) : allData;
    return parsed?.OpenHouseRemarks || "";
  } catch { return ""; }
}

export function formatCalendarTime(value) {
  const match = String(value || "").match(/(?:T|^)(\d{1,2}):(\d{2})/);
  if (!match) return "Time unavailable";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
    .format(new Date(2000, 0, 1, Number(match[1]), Number(match[2])));
}
