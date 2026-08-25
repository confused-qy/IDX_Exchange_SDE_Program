import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatNumber, formatPrice } from "../utils/property";
import PropertyImageCarousel from "./PropertyImageCarousel";
import { useFavorites } from "../hooks/useFavorites";
import "./PropertyCard.css";

function PropertyCard({ property }) {
  const address = property.L_Address || "Address unavailable";
  const location = [property.L_City, property.L_State].filter(Boolean).join(", ");
  const id = property.L_ListingID || property.id;
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(id);

  return (
    <article className="property-card">
      <Link
        className="property-card__link"
        to={`/property/${encodeURIComponent(id)}`}
        aria-label={`View ${address}`}
      >
      <div className="property-card__media">
        <PropertyImageCarousel photos={property.L_Photos} address={address} />
        <span className="property-card__status">{property.L_Status || "For sale"}</span>
      </div>

      <div className="property-card__body">
        <p className="property-card__price">{formatPrice(property.L_SystemPrice)}</p>
        <h2 className="property-card__address">{address}</h2>
        <p className="property-card__location">{location || "Location unavailable"}</p>

        <dl className="property-card__facts">
          <div>
            <dt>Beds</dt>
            <dd>{formatNumber(property.L_Keyword2)}</dd>
          </div>
          <div>
            <dt>Baths</dt>
            <dd>{formatNumber(property.LM_Dec_3)}</dd>
          </div>
          <div>
            <dt>Sq ft</dt>
            <dd>{formatNumber(property.LM_Int2_3)}</dd>
          </div>
        </dl>
      </div>
      </Link>
      <button
        className={`property-card__favorite${saved ? " is-favorite" : ""}`}
        type="button"
        aria-label={saved ? `Remove ${address} from favorites` : `Add ${address} to favorites`}
        aria-pressed={saved}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(id); }}
      >
        {saved ? "♥" : "♡"}
      </button>
    </article>
  );
}

const identifierType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);
const numericValueType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: identifierType,
    L_ListingID: identifierType,
    L_Address: PropTypes.string,
    L_City: PropTypes.string,
    L_State: PropTypes.string,
    L_Photos: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    L_Status: PropTypes.string,
    L_SystemPrice: numericValueType,
    L_Keyword2: numericValueType,
    LM_Dec_3: numericValueType,
    LM_Int2_3: numericValueType,
  }).isRequired,
};

export default PropertyCard;
