import { BrowserRouter, Route, Routes } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import SiteNav from "./components/SiteNav";
import { FavoritesProvider } from "./hooks/useFavorites";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FavoritesProvider>
        <SiteNav />
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  );
}

export default App;
