import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOpenHouses, fetchPropertyDetail } from "../api/client";
import OpenHouseList from "../components/OpenHouseList";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import { formatNumber, formatPrice } from "../utils/property";
import "./PropertyDetailPage.css";

const detailFields = [
  ["Property type", "L_Type_"], ["Status", "L_Status"], ["Lot size", "L_Keyword1"],
  ["Garage spaces", "L_Keyword5"], ["Subdivision", "SubdivisionName"], ["Days on market", "DaysOnMarket"],
  ["Flooring", "Flooring"], ["High school district", "HighSchoolDistrict"], ["Association fee", "AssociationFee"],
];

function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    Promise.all([fetchPropertyDetail(id, { signal: controller.signal }), fetchOpenHouses(id, { signal: controller.signal })])
      .then(([propertyData, openHouseData]) => { setProperty(propertyData); setOpenHouses(Array.isArray(openHouseData) ? openHouseData : []); })
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError.message || "Unable to load this property."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  if (loading) return <main className="detail-state" role="status">Loading property…</main>;
  if (error || !property) return <main className="detail-state"><h1>Property not found</h1><p>{error || "This listing is unavailable."}</p><Link to="/">← Back to listings</Link></main>;

  const address = property.L_Address || "Address unavailable";
  const cityLine = [property.L_City, property.L_State, property.L_Zip].filter(Boolean).join(", ");
  const availableDetails = detailFields.filter(([, key]) => property[key] !== null && property[key] !== undefined && property[key] !== "");

  return (
    <main className="property-detail">
      <Link className="property-detail__back" to="/">← Back to listings</Link>
      <PropertyImageGallery photos={property.L_Photos} address={address} />
      <header className="property-detail__header">
        <div><p className="property-detail__price">{formatPrice(property.L_SystemPrice)}</p><h1>{address}</h1><p>{cityLine || "Location unavailable"}</p></div>
        <span>{property.L_Status || "For sale"}</span>
      </header>
      <dl className="property-detail__stats">
        <div><dt>Beds</dt><dd>{formatNumber(property.L_Keyword2)}</dd></div>
        <div><dt>Baths</dt><dd>{formatNumber(property.LM_Dec_3)}</dd></div>
        <div><dt>Square feet</dt><dd>{formatNumber(property.LM_Int2_3)}</dd></div>
        <div><dt>Year built</dt><dd>{formatNumber(property.YearBuilt)}</dd></div>
      </dl>
      <section className="detail-section"><h2>About this home</h2><p className="property-detail__description">{property.L_Remarks || "No description is available for this property."}</p></section>
      <section className="detail-section"><h2>Property details</h2>{availableDetails.length ? <dl className="property-detail__facts">{availableDetails.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{key === "AssociationFee" ? formatPrice(property[key]) : String(property[key])}</dd></div>)}</dl> : <p>No additional property details available.</p>}</section>
      <OpenHouseList openHouses={openHouses} />
      <PropertyMap latitude={property.LMD_MP_Latitude} longitude={property.LMD_MP_Longitude} />
    </main>
  );
}
export default PropertyDetailPage;
