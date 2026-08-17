import "./PropertyMap.css";

function PropertyMap({ latitude, longitude }) {
  if (latitude === null || latitude === undefined || latitude === "" || longitude === null || longitude === undefined || longitude === "") return null;
  const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const location = `${latitude},${longitude}`;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key || "")}&q=${encodeURIComponent(location)}&zoom=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;

  return (
    <section className="detail-section property-map" aria-labelledby="map-heading">
      <div className="section-heading"><h2 id="map-heading">Location</h2><a href={directionsUrl} target="_blank" rel="noreferrer">Get Directions ↗</a></div>
      {key ? <iframe title="Property location" src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <p className="map-notice">Add REACT_APP_GOOGLE_MAPS_API_KEY to frontend/.env to display the map.</p>}
    </section>
  );
}
export default PropertyMap;
