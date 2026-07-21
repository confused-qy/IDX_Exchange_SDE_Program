export function getFirstPhoto(rawPhotos) {
  if (rawPhotos === null || rawPhotos === undefined || rawPhotos === "") {
    return null;
  }

  let photos = rawPhotos;

  if (typeof rawPhotos === "string") {
    try {
      photos = JSON.parse(rawPhotos);
    } catch (error) {
      return null;
    }
  }

  if (!Array.isArray(photos)) {
    return null;
  }

  const firstValidPhoto = photos.find(
    (photo) => typeof photo === "string" && photo.trim().length > 0
  );

  return firstValidPhoto ? firstValidPhoto.trim() : null;
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
