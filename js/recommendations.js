export function climateSuggestion(weatherMain) {
  const map = {
    Clear: "☀️ Ideal para playa y actividades al aire libre.",
    Rain: "🌧️ Buen día para visitar museos o cafeterías.",
    Clouds: "☁️ Perfecto para caminar por la ciudad.",
    Snow: "❄️ Ideal para fotos y actividades invernales.",
  };

  return map[weatherMain] || "Explora atracciones locales.";
}
