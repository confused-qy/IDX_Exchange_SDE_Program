import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOpenHouseCalendar, fetchOpenHouseRange } from "../api/client";
import { calendarDays, formatCalendarTime, monthBounds, parseRemarks, toDateKey } from "../utils/calendar";
import "./OpenHouseCalendarPage.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateFromApi(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function chooseInitialMonth(range) {
  const nearest = dateFromApi(range?.nearestDate);
  if (nearest) return nearest;
  const today = new Date();
  const min = dateFromApi(range?.minDate);
  const max = dateFromApi(range?.maxDate);
  if (!min || !max) return today;
  if (today < min) return min;
  if (today > max) return max;
  return today;
}

function OpenHouseCalendarPage() {
  const [month, setMonth] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDate, setExpandedDate] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchOpenHouseRange({ signal: controller.signal })
      .then((range) => setMonth(chooseInitialMonth(range)))
      .catch((requestError) => { if (!controller.signal.aborted) { setError(requestError.message); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const loadMonth = useCallback(async (visibleMonth, signal) => {
    setLoading(true); setError(""); setExpandedDate("");
    try {
      const bounds = monthBounds(visibleMonth);
      const data = await fetchOpenHouseCalendar(bounds.startDate, bounds.endDate, { signal });
      if (!signal.aborted) setEvents(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (!signal.aborted) { setEvents([]); setError(requestError.message || "Unable to load open houses."); }
    } finally { if (!signal.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    if (!month) return undefined;
    const controller = new AbortController();
    loadMonth(month, controller.signal);
    return () => controller.abort();
  }, [month, loadMonth]);

  const eventsByDate = useMemo(() => events.reduce((map, event) => {
    const key = String(event.OpenHouseDate || event.OH_StartDate).slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(event);
    return map;
  }, {}), [events]);
  const days = month ? calendarDays(month) : [];
  const moveMonth = (amount) => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + amount, 1));

  return (
    <main className="calendar-page">
      <header className="calendar-page__hero"><p>Plan your visits</p><h1>Open House Calendar</h1><span>Browse scheduled tours and open the full property listing.</span></header>
      <section className="calendar-shell" aria-label="Open house month calendar">
        <div className="calendar-toolbar">
          <button type="button" onClick={() => moveMonth(-1)} disabled={!month} aria-label="Previous month">‹</button>
          <h2 aria-live="polite">{month ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month) : "Loading calendar…"}</h2>
          <button type="button" onClick={() => moveMonth(1)} disabled={!month} aria-label="Next month">›</button>
        </div>
        {error && <div className="calendar-message calendar-message--error" role="alert"><p>{error}</p><button type="button" onClick={() => { const controller = new AbortController(); loadMonth(month, controller.signal); }}>Try again</button></div>}
        {!error && <div className="calendar-grid">{weekdays.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{days.map((day) => {
          const key = toDateKey(day); const dayEvents = eventsByDate[key] || []; const outside = day.getMonth() !== month.getMonth();
          return <div className={`calendar-day${outside ? " is-outside" : ""}`} key={key}><span className="calendar-day__number">{day.getDate()}</span><div className="calendar-day__events">{dayEvents.slice(0, 3).map((event) => <Link className="calendar-event" key={event.id} to={`/property/${encodeURIComponent(event.L_ListingID)}`} title={parseRemarks(event.all_data) || event.L_Address || "Open house"}><strong>{formatCalendarTime(event.OH_StartTime)}</strong><span>{event.L_Address || `Listing ${event.L_DisplayId}`}</span>{parseRemarks(event.all_data) && <small>{parseRemarks(event.all_data)}</small>}</Link>)}{dayEvents.length > 3 && <button className="calendar-more" type="button" onClick={() => setExpandedDate(key)}>+ {dayEvents.length - 3} more</button>}</div></div>;
        })}</div>}
        {loading && <div className="calendar-loading" role="status">Loading open houses…</div>}
        {!loading && !error && events.length === 0 && <p className="calendar-empty">No open houses scheduled for this month.</p>}
      </section>
      {expandedDate && <aside className="day-agenda" role="dialog" aria-modal="true" aria-label={`Open houses on ${expandedDate}`}><div className="day-agenda__header"><div><p>Daily schedule</p><h2>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(dateFromApi(expandedDate))}</h2></div><button type="button" aria-label="Close daily schedule" onClick={() => setExpandedDate("")}>×</button></div><div className="day-agenda__list">{(eventsByDate[expandedDate] || []).map((event) => <Link key={event.id} to={`/property/${encodeURIComponent(event.L_ListingID)}`}><strong>{formatCalendarTime(event.OH_StartTime)} – {formatCalendarTime(event.OH_EndTime)}</strong><span>{event.L_Address || `Listing ${event.L_DisplayId}`}</span>{parseRemarks(event.all_data) && <small>{parseRemarks(event.all_data)}</small>}</Link>)}</div></aside>}
    </main>
  );
}
export default OpenHouseCalendarPage;
