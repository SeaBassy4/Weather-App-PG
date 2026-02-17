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
