import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFavoriteProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import { useFavorites } from "../hooks/useFavorites";
import "./FavoritesPage.css";

function FavoritesPage() {
  const { favorites, favoriteCount } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(Boolean(favorites.length));
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    if (!favorites.length) { setProperties([]); setLoading(false); setError(""); return () => controller.abort(); }
    setLoading(true); setError("");
    fetchFavoriteProperties(favorites, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setProperties(Array.isArray(data) ? data : []); })
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError.message || "Unable to load favorites."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [favorites]);
  return <main className="favorites-page"><Link className="property-detail__back" to="/">← Back to listings</Link><header><p>Saved homes</p><h1>Your favorites</h1><span>{favoriteCount} saved</span></header>{loading && <div className="state-panel" role="status">Loading favorites…</div>}{error && <div className="state-panel state-panel--error" role="alert">{error}</div>}{!loading && !error && !properties.length && <div className="state-panel"><h2>No favorites yet</h2><p>Use the heart button on a listing to save it here.</p><Link to="/">Browse listings</Link></div>}{!loading && !error && properties.length > 0 && <div className="property-grid">{properties.map((property) => <PropertyCard key={property.L_ListingID || property.id} property={property} />)}</div>}</main>;
}
export default FavoritesPage;
