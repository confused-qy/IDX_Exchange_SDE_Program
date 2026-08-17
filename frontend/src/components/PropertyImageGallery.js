import { useEffect, useState } from "react";
import { parsePhotos } from "../utils/property";
import "./PropertyImageGallery.css";

function PropertyImageGallery({ photos: rawPhotos, address }) {
  const photos = parsePhotos(rawPhotos);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => setIndex(0), [rawPhotos]);
  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % photos.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photos.length]);

  if (!photos.length) return <div className="gallery-placeholder">No photos available</div>;
  const move = (direction) => setIndex((value) => (value + direction + photos.length) % photos.length);

  return (
    <>
      <section className="gallery" aria-label="Property photos">
        <button className="gallery__main" type="button" onClick={() => setLightboxOpen(true)} aria-label="Open full-screen photo">
          <img src={photos[index]} alt={`${address}, view ${index + 1}`} />
          <span>{index + 1} / {photos.length}</span>
        </button>
        {photos.length > 1 && (
          <div className="gallery__thumbnails">
            {photos.map((photo, photoIndex) => (
              <button className={photoIndex === index ? "is-active" : ""} type="button" key={`${photo}-${photoIndex}`} onClick={() => setIndex(photoIndex)} aria-label={`Show photo ${photoIndex + 1}`}>
                <img src={photo} alt="" />
              </button>
            ))}
          </div>
        )}
      </section>
      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Property photo viewer" tabIndex="-1" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightboxOpen(false); }}>
          <button className="lightbox__close" type="button" aria-label="Close photo viewer" onClick={() => setLightboxOpen(false)}>×</button>
          {photos.length > 1 && <button className="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Previous photo" onClick={() => move(-1)}>‹</button>}
          <img src={photos[index]} alt={`${address}, full-screen view ${index + 1}`} />
          {photos.length > 1 && <button className="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Next photo" onClick={() => move(1)}>›</button>}
        </div>
      )}
    </>
  );
}

export default PropertyImageGallery;
