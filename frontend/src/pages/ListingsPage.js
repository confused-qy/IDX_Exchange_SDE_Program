import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import SortControls, { DEFAULT_SORT } from "../components/SortControls";
import "./ListingsPage.css";

const PAGE_SIZE = 20;

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(PAGE_SIZE);
  const activeFilters = useRef({});
  const [sort, setSort] = useState(DEFAULT_SORT);
  const requestSequence = useRef(0);
  const activeController = useRef(null);

  const loadProperties = useCallback(async (filters = {}, page = 1, sortValue = DEFAULT_SORT) => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const requestId = ++requestSequence.current;

    setLoading(true);
    setError("");

    try {
      const [sortBy, sortOrder] = sortValue.split(":");
      const data = await fetchProperties(
        { ...filters, sortBy, sortOrder, limit: itemsPerPage, offset: (page - 1) * itemsPerPage },
        { signal: controller.signal }
      );

      if (!data || !Array.isArray(data.results)) {
        throw new Error("The property server returned an unexpected data format.");
      }

      if (!controller.signal.aborted && requestId === requestSequence.current) {
        setProperties(data.results);
        setTotal(Number(data.total) || 0);
      }
    } catch (requestError) {
      if (!controller.signal.aborted && requestId === requestSequence.current) {
        setProperties([]);
        setTotal(0);
        setError(requestError.message || "Unable to load properties.");
      }
    } finally {
      if (!controller.signal.aborted && requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [itemsPerPage]);

  useEffect(() => {
    loadProperties({});

    return () => activeController.current?.abort();
  }, [loadProperties]);

  const handleSearch = (filters) => {
    activeFilters.current = filters;
    setCurrentPage(1);
    setSort(DEFAULT_SORT);
    loadProperties(filters, 1, DEFAULT_SORT);
  };

  const handleClear = () => {
    activeFilters.current = {};
    setCurrentPage(1);
    setSort(DEFAULT_SORT);
    loadProperties({}, 1, DEFAULT_SORT);
  };

  // Round up because even one remaining record needs its own final page.
  const totalPages = Math.ceil(total / itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    loadProperties(activeFilters.current, page, sort);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1);
    loadProperties(activeFilters.current, 1, value);
  };

  const firstResult = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastResult = Math.min(currentPage * itemsPerPage, total);

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

      <PropertyFilters
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={loading}
      />

      <section className="listings" aria-labelledby="listings-heading">
        <div className="listings__heading">
          <div>
            <p className="listings__label">Available homes</p>
            <h2 id="listings-heading">Property listings</h2>
          </div>
          {!loading && !error && (
            <p className="listings__count" aria-live="polite">
              Showing <strong>{firstResult}-{lastResult}</strong> of <strong>{total}</strong> properties
            </p>
          )}
          <SortControls value={sort} onChange={handleSortChange} disabled={loading} />
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
            <button
              type="button"
              onClick={() => loadProperties(activeFilters.current, currentPage, sort)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="state-panel">
            <h3>No properties found</h3>
            <p>Try adjusting or clearing your filters to see more homes.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <>
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.L_ListingID || property.id}
                  property={property}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default ListingsPage;
