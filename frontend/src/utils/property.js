export function parsePhotos(rawPhotos) {
  if (rawPhotos === null || rawPhotos === undefined || rawPhotos === "") {
    return [];
  }

  let photos = rawPhotos;

  if (typeof rawPhotos === "string") {
    try {
      // The MLS import stores photo arrays as JSON text, while tests and newer
      // callers may already supply arrays. Normalizing both shapes here keeps the
      // rendering components simple and contains malformed legacy data safely.
      photos = JSON.parse(rawPhotos);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .filter(
    (photo) => typeof photo === "string" && photo.trim().length > 0
    )
    .map((photo) => photo.trim());
}

export function getFirstPhoto(rawPhotos) {
  return parsePhotos(rawPhotos)[0] || null;
}

export function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("en-US").format(number) : "—";
}
