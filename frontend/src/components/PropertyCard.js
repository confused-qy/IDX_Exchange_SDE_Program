import { useState } from "react";
import { formatNumber, formatPrice, getFirstPhoto } from "../utils/property";
import "./PropertyCard.css";

function PropertyCard({ property }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = getFirstPhoto(property.L_Photos);
  const address = property.L_Address || "Address unavailable";
  const location = [property.L_City, property.L_State].filter(Boolean).join(", ");

  return (
    <article className="property-card">
      <div className="property-card__media">
        {photoUrl && !imageFailed ? (
          <img
            className="property-card__image"
            src={photoUrl}
            alt={`${address} property`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="property-card__placeholder" role="img" aria-label="No property photo available">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 30 32 10l24 20v25H39V40H25v15H8V30Z" />
              <path d="m18 26 14-11 14 11" />
            </svg>
            <span>No photo available</span>
          </div>
        )}
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
    </article>
  );
}

export default PropertyCard;
