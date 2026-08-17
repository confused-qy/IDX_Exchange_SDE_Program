import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import "./SiteNav.css";

function SiteNav() {
  const { favoriteCount } = useFavorites();
  return <nav className="site-nav" aria-label="Main navigation"><Link to="/">Listings</Link><Link to="/favorites">Favorites <span>{favoriteCount}</span></Link></nav>;
}
export default SiteNav;
