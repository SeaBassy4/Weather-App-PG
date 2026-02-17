import {
  getWeather,
  getForecast,
  getPlaces,
  getCitySuggestions,
  getWeatherByCoords,
  getForecastByCoords,
} from "./api.js";
import { climateSuggestion } from "./recommendations.js";
import {
  saveFavorite,
  getFavorites,
  removeFavorite,
  isFavorite,
  getSearchHistory,
  addToSearchHistory,
} from "./storage.js";

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const weatherSection = document.getElementById("weatherSection");
const forecastSection = document.getElementById("forecastSection");
const recommendationsSection = document.getElementById(
  "recommendationsSection",
);
const favoritesList = document.getElementById("favoritesList");
let currentWeatherData = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();

  try {
    const weather = await getWeather(city);
    const forecast = await getForecast(city);

    renderWeather(weather);
    renderForecast(forecast);
    renderRecommendations(weather);

    addToSearchHistory(city);
    renderHistory();
  } catch (error) {
    alert(error.message);
  }
});

function renderWeather(data) {
  currentWeatherData = data;
  weatherSection.classList.remove("hidden");

  const favorite = isFavorite(data.name);
  const icon = getWeatherIcon(data.weather[0].icon);

  weatherSection.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">${data.name}</h2>
      <span class="text-5xl">${icon}</span>
    </div>

    <p class="text-3xl mt-2">${Math.round(data.main.temp)}°C</p>
    <p class="capitalize">${data.weather[0].description}</p>
    
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

    renderWeather(data);
    renderFavorites();
  });
}

function getWeatherIcon(iconCode) {
  const iconMap = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };

  return iconMap[iconCode] || "☀️";
}

async function renderRecommendations(weather) {
  recommendationsSection.classList.remove("hidden");

  const suggestion = climateSuggestion(weather.weather[0].main);

  recommendationsSection.innerHTML = `
    <h2 class="font-bold text-lg mb-2">Recomendaciones</h2>
    <p class="mb-2">${suggestion}</p>
  `;
}

const historyList = document.getElementById("historyList");

function renderHistory() {
  historyList.innerHTML = "";

  const history = getSearchHistory();

  history.forEach((city) => {
    const li = document.createElement("li");
    li.className =
      "cursor-pointer bg-slate-100 dark:bg-slate-600 dark:hover:bg-slate-500 p-2 rounded hover:bg-slate-200 transition-colors duration-300";

    li.textContent = city;

    li.addEventListener("click", async () => {
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

    historyList.appendChild(li);
  });
}

function renderFavorites() {
  favoritesList.innerHTML = "";

  const favorites = getFavorites();

  favorites.forEach((city) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center bg-slate-100 dark:bg-slate-600 dark:hover:bg-slate-500 p-2 rounded hover:bg-slate-200 transition-colors duration-300";

    li.innerHTML = `
      <span class="cursor-pointer font-medium">${city}</span>
      <button class="text-red-500 dark:text-red-400 hover:text-red-700">
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

      if (
        currentWeatherData &&
        currentWeatherData.name.toLowerCase() === city.toLowerCase()
      ) {
        renderWeather(currentWeatherData);
      }
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
    card.className =
      "bg-white dark:bg-slate-700 dark:text-white p-3 rounded shadow text-center transition-colors duration-300";

    const icon = getWeatherIcon(day.weather[0].icon);

    card.innerHTML = `
      <p class="font-semibold">
        ${new Date(day.dt_txt).toLocaleDateString()}
      </p>
      <p class="text-4xl">${icon}</p>
      <p class="text-xl">${Math.round(day.main.temp)}°C</p>
      <p class="text-sm capitalize">
        ${day.weather[0].description}
      </p>
    `;

    forecastSection.appendChild(card);
  });
}

const themeToggle = document.getElementById("themeToggle");

if (!themeToggle) {
  console.error("No se encontró el botón themeToggle");
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  const isDark = document.documentElement.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.textContent = isDark ? "☀️" : "🌙";

  console.log("Dark mode:", isDark);
});

// AUTOCOMPLETE IN SEARCHBAR

const suggestionsList = document.getElementById("suggestions");

let debounceTimeout;

input.addEventListener("input", () => {
  const query = input.value.trim();

  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    if (query.length < 3) {
      suggestionsList.classList.add("hidden");
      return;
    }

    try {
      const cities = await getCitySuggestions(query);
      renderSuggestions(cities);
    } catch (error) {
      console.error(error);
    }
  }, 300);
});

function renderSuggestions(cities) {
  suggestionsList.innerHTML = "";

  if (!cities.length) {
    suggestionsList.classList.add("hidden");
    return;
  }

  cities.forEach((city) => {
    const li = document.createElement("li");

    li.className =
      "p-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200";

    li.textContent = `${city.name}${
      city.state ? ", " + city.state : ""
    }, ${city.country}`;

    li.addEventListener("click", async () => {
      try {
        suggestionsList.classList.add("hidden");

        const weather = await getWeatherByCoords(city.lat, city.lon);
        const forecast = await getForecastByCoords(city.lat, city.lon);

        renderWeather(weather);
        renderForecast(forecast);
        renderRecommendations(weather);

        addToSearchHistory(city.name);
        renderHistory();

        input.value = `${city.name}, ${city.country}`;
      } catch (error) {
        alert(error.message);
      }
    });

    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.remove("hidden");
}

// Cerrar sugerencias al hacer click fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest("#cityInput")) {
    suggestionsList.classList.add("hidden");
  }
});

renderHistory();
renderFavorites();
