import { useState } from "react";
import "./PropertyFilters.css";

export const EMPTY_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({ onSearch, onClear, disabled = false }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const populatedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );
    onSearch(populatedFilters);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    onClear();
  };

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <div className="property-filters__grid">
        <label>
          City
          <input
            name="city"
            type="text"
            value={filters.city}
            onChange={updateFilter}
            placeholder="e.g. Seattle"
          />
        </label>

        <label>
          ZIP code
          <input
            name="zipcode"
            type="text"
            inputMode="numeric"
            value={filters.zipcode}
            onChange={updateFilter}
            placeholder="e.g. 98101"
          />
        </label>

        <label>
          Min price
          <input
            name="minPrice"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={updateFilter}
            placeholder="No minimum"
          />
        </label>

        <label>
          Max price
          <input
            name="maxPrice"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={updateFilter}
            placeholder="No maximum"
          />
        </label>

        <label>
          Beds
          <select name="beds" value={filters.beds} onChange={updateFilter}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>

        <label>
          Baths
          <select name="baths" value={filters.baths} onChange={updateFilter}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="property-filters__actions">
        <button type="submit" disabled={disabled}>
          Search
        </button>
        <button type="button" className="button--secondary" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;
