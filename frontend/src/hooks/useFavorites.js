import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "idx-exchange-favorites";
const FavoritesContext = createContext(null);

function readFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? [...new Set(value.filter((id) => id != null).map(String))] : [];
  } catch { return []; }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavorites);
  const update = useCallback((updater) => {
    setFavorites((current) => {
      const next = updater(current);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const toggleFavorite = useCallback((id) => {
    const normalized = String(id);
    update((current) => current.includes(normalized) ? current.filter((value) => value !== normalized) : [...current, normalized]);
  }, [update]);
  const value = useMemo(() => ({
    favorites,
    favoriteCount: favorites.length,
    isFavorite: (id) => favorites.includes(String(id)),
    toggleFavorite,
  }), [favorites, toggleFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
