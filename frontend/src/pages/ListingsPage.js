import { useCallback, useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import "./ListingsPage.css";

const PAGE_SIZE = 20;

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadProperties = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchProperties({ limit: PAGE_SIZE, offset: 0 });

      if (!data || !Array.isArray(data.results)) {
        throw new Error("The property server returned an unexpected data format.");
      }

      if (!signal.aborted) {
        setProperties(data.results);
        setTotal(Number(data.total) || 0);
      }
    } catch (requestError) {
      if (!signal.aborted) {
        setProperties([]);
        setTotal(0);
        setError(requestError.message || "Unable to load properties.");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProperties(controller.signal);

    return () => controller.abort();
  }, [loadProperties, retryCount]);

  return (
    <main>
      <header className="listings-hero">
        <div className="listings-hero__inner">
          <p className="listings-hero__eyebrow">IDX Exchange</p>
          <h1>Find a place that feels like yours.</h1>
          <p className="listings-hero__copy">
            Explore current homes from our live property database.
          </p>
        </div>
      </header>

      <section className="listings" aria-labelledby="listings-heading">
        <div className="listings__heading">
          <div>
            <p className="listings__label">Available homes</p>
            <h2 id="listings-heading">Property listings</h2>
          </div>
          {!loading && !error && (
            <p className="listings__count" aria-live="polite">
              Showing <strong>{properties.length}</strong> of <strong>{total}</strong> properties
            </p>
          )}
        </div>

        {loading && (
          <div className="state-panel" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <p>Loading properties…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-panel state-panel--error" role="alert">
            <h3>We couldn't load the listings</h3>
            <p>{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="state-panel">
            <h3>No properties found</h3>
            <p>There are no listings to display right now.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.L_ListingID || property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ListingsPage;
