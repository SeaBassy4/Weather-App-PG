export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavorite(city) {
  const favorites = getFavorites();

  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

export function removeFavorite(city) {
  let favorites = getFavorites();
  favorites = favorites.filter((fav) => fav !== city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

export function isFavorite(city) {
  return getFavorites().includes(city);
}

// HISTORIAL

export function getSearchHistory() {
  return JSON.parse(localStorage.getItem("searchHistory")) || [];
}

export function addToSearchHistory(city) {
  let history = getSearchHistory();

  // Evitar duplicados recientes
  history = history.filter((item) => item.toLowerCase() !== city.toLowerCase());

  history.unshift(city); // agregar al inicio

  if (history.length > 5) {
    history.pop(); // eliminar la más vieja
  }

  localStorage.setItem("searchHistory", JSON.stringify(history));
}
