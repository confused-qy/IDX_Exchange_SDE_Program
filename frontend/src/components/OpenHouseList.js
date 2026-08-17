import "./OpenHouseList.css";

function remarksFor(openHouse) {
  try {
    const data = typeof openHouse.all_data === "string" ? JSON.parse(openHouse.all_data) : openHouse.all_data;
    return data?.OpenHouseRemarks || "";
  } catch { return ""; }
}
function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}
function formatTime(value) {
  if (!value) return "Time unavailable";
  const match = String(value).match(/(?:T|^)(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function OpenHouseList({ openHouses }) {
  return <section className="detail-section" aria-labelledby="open-houses-heading"><h2 id="open-houses-heading">Open houses</h2>{!openHouses?.length ? <p>No open houses scheduled</p> : <div className="open-house-list">{openHouses.map((item) => { const remarks = remarksFor(item); return <article className="open-house" key={item.id || `${item.OpenHouseDate}-${item.OH_StartTime}`}><h3>{formatDate(item.OH_StartDate || item.OpenHouseDate)}</h3><p className="open-house__time">{formatTime(item.OH_StartTime || item.API_OH_StartDate)} – {formatTime(item.OH_EndTime || item.API_OH_EndDate)}</p>{remarks && <p>{remarks}</p>}</article>; })}</div>}</section>;
}
export default OpenHouseList;
