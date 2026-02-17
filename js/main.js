import { getWeather, getForecast, getPlaces } from "./api.js";
import { climateSuggestion } from "./recommendations.js";
import {
  saveFavorite,
  getFavorites,
  removeFavorite,
  isFavorite,
} from "./storage.js";

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const weatherSection = document.getElementById("weatherSection");
const forecastSection = document.getElementById("forecastSection");
const recommendationsSection = document.getElementById(
  "recommendationsSection",
);
const favoritesList = document.getElementById("favoritesList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();

  try {
    const weather = await getWeather(city);
    const forecast = await getForecast(city);

    renderWeather(weather);
    renderForecast(forecast);
    renderRecommendations(weather);
  } catch (error) {
    alert(error.message);
  }
});

function renderWeather(data) {
  weatherSection.classList.remove("hidden");

  const favorite = isFavorite(data.name);

  weatherSection.innerHTML = `
    <h2 class="text-xl font-bold">${data.name}</h2>
    <p class="text-3xl">${data.main.temp}°C</p>
    <p>${data.weather[0].description}</p>
    
    <button id="favBtn"
      class="mt-3 px-4 py-1 rounded transition 
      ${
        favorite
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-yellow-400 hover:bg-yellow-500"
      }">
      ${favorite ? "✓ Guardado" : "⭐ Guardar Favorito"}
    </button>
  `;

  const favBtn = document.getElementById("favBtn");

  favBtn.addEventListener("click", () => {
    if (isFavorite(data.name)) {
      removeFavorite(data.name);
    } else {
      saveFavorite(data.name);
    }

    renderWeather(data); // 🔄 re-render botón
    renderFavorites();
  });
}
async function renderRecommendations(weather) {
  recommendationsSection.classList.remove("hidden");

  const suggestion = climateSuggestion(weather.weather[0].main);

  recommendationsSection.innerHTML = `
    <h2 class="font-bold text-lg mb-2">Recomendaciones</h2>
    <p class="mb-2">${suggestion}</p>
  `;
}

function renderFavorites() {
  favoritesList.innerHTML = "";

  const favorites = getFavorites();

  favorites.forEach((city) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center bg-slate-100 p-2 rounded hover:bg-slate-200 transition";

    li.innerHTML = `
      <span class="cursor-pointer font-medium">${city}</span>
      <button class="text-red-500 hover:text-red-700">
        🗑️
      </button>
    `;

    // 🔄 Cargar clima al hacer click en ciudad
    li.querySelector("span").addEventListener("click", async () => {
      try {
        const weather = await getWeather(city);
        const forecast = await getForecast(city);

        renderWeather(weather);
        renderForecast(forecast);
        renderRecommendations(weather);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        alert(error.message);
      }
    });

    // 🗑️ Eliminar favorito
    li.querySelector("button").addEventListener("click", () => {
      removeFavorite(city);
      renderFavorites();
    });

    favoritesList.appendChild(li);
  });
}

function renderForecast(data) {
  forecastSection.classList.remove("hidden");
  forecastSection.innerHTML = "";

  const daily = data.list.filter((item) => item.dt_txt.includes("12:00:00"));

  daily.forEach((day) => {
    const card = document.createElement("div");
    card.className = "bg-white p-3 rounded shadow text-center";

    card.innerHTML = `
      <p class="font-semibold">
        ${new Date(day.dt_txt).toLocaleDateString()}
      </p>
      <p class="text-xl">${day.main.temp}°C</p>
      <p class="text-sm capitalize">
        ${day.weather[0].description}
      </p>
    `;

    forecastSection.appendChild(card);
  });
}

renderFavorites();
