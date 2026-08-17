import { useEffect, useState } from "react";
import { parsePhotos } from "../utils/property";
import "./PropertyImageCarousel.css";

function PropertyImageCarousel({ photos: rawPhotos, address }) {
  const photos = parsePhotos(rawPhotos);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});

  useEffect(() => setIndex(0), [rawPhotos]);

  const changePhoto = (event, direction) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + direction + photos.length) % photos.length);
  };

  if (!photos.length || failed[index]) {
    return (
      <div className="property-card__placeholder" role="img" aria-label="No property photo available">
        <span>No photo available</span>
      </div>
    );
  }

  return (
    <div className="card-carousel">
      <img
        className="property-card__image"
        src={photos[index]}
        alt={`${address}, view ${index + 1}`}
        loading="lazy"
        onError={() => setFailed((value) => ({ ...value, [index]: true }))}
      />
      {photos.length > 1 && (
        <>
          <button className="card-carousel__arrow card-carousel__arrow--prev" type="button" aria-label="Previous photo" onClick={(event) => changePhoto(event, -1)}>‹</button>
          <button className="card-carousel__arrow card-carousel__arrow--next" type="button" aria-label="Next photo" onClick={(event) => changePhoto(event, 1)}>›</button>
          <span className="card-carousel__counter">{index + 1} / {photos.length}</span>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;
