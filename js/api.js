import { CONFIG } from "./config.js";
import { CircuitBreaker } from "./circuitBreaker.js";

async function retryFetch(url, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error API");
    return await res.json();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryFetch(url, retries - 1, delay);
  }
}

const weatherBreaker = new CircuitBreaker(retryFetch);
const tripBreaker = new CircuitBreaker(retryFetch);

export function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${CONFIG.OPEN_WEATHER_KEY}&units=metric&lang=es`;
  return weatherBreaker.fire(url);
}

export function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${CONFIG.OPEN_WEATHER_KEY}&units=metric&lang=es`;
  return weatherBreaker.fire(url);
}

export function getPlaces(lat, lon) {
  const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&apikey=${CONFIG.OPEN_TRIP_KEY}`;
  return tripBreaker.fire(url);
}

export function getCitySuggestions(query) {
  if (!query) return Promise.resolve([]);

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${CONFIG.OPEN_WEATHER_KEY}`;

  return weatherBreaker.fire(url);
}

export function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPEN_WEATHER_KEY}&units=metric&lang=es`;

  return weatherBreaker.fire(url);
}

export function getForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.OPEN_WEATHER_KEY}&units=metric&lang=es`;

  return weatherBreaker.fire(url);
}
