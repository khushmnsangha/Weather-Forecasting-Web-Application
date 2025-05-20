const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezoneEl = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const currentTempEl = document.getElementById('current-temp');
const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');

const API_KEY = '0878813d9b9fdb5af8a555876964d7f6';

// Update time and date every second
setInterval(() => {
  const now = moment(); // using Moment.js from your HTML
  timeEl.innerHTML = now.format('hh:mm A');
  dateEl.innerHTML = now.format('dddd, D MMMM');
}, 1000);

// Search button click handler
searchBtn.addEventListener('click', () => {
  const location = locationInput.value.trim();
  if (location) {
    getWeatherData(location);
    locationInput.value = '';
  }
});

// Fetch weather data for the given city name
function getWeatherData(location) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`)
    .then(res => {
      if (!res.ok) throw new Error('Location not found');
      return res.json();
    })
    .then(data => {
      displayWeatherData(data);
    })
    .catch(err => {
      alert(err.message);
      console.error(err);
    });
}

// Display current weather data
function displayWeatherData(data) {
  // Update timezone and country
  timezoneEl.textContent = `UTC${formatTimezoneOffset(data.timezone)}`;
  countryEl.textContent = `${data.name}, ${data.sys.country}`;

  // Prepare weather items: humidity, pressure, wind speed, sunrise, sunset
  const { humidity, pressure, temp } = data.main;
  const { speed: windSpeed } = data.wind;
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  const weatherIcon = data.weather[0].icon;
  const weatherDescription = capitalizeFirstLetter(data.weather[0].description);

  currentWeatherItemsEl.innerHTML = `
    <div>Humidity: ${humidity}%</div>
    <div>Pressure: ${pressure} hPa</div>
    <div>Wind Speed: ${windSpeed} m/s</div>
    <div>Sunrise: ${formatTime(sunrise)}</div>
    <div>Sunset: ${formatTime(sunset)}</div>
    <div>Description: ${weatherDescription}</div>
  `;

  currentTempEl.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="weather icon" class="w-icon" />
    <div class="other">
      <div class="temp">${Math.round(temp)}&#176; C</div>
    </div>
  `;
}

// Helper to format sunrise/sunset times
function formatTime(date) {
  return moment(date).format('h:mm A');
}

// Helper to format timezone offset from seconds to e.g. +5:30
function formatTimezoneOffset(offsetInSeconds) {
  const hours = Math.floor(offsetInSeconds / 3600);
  const minutes = Math.abs(offsetInSeconds % 3600) / 60;
  return `${hours >= 0 ? '+' : '-'}${Math.abs(hours)}:${minutes < 10 ? '0' : ''}${minutes}`;
}

// Capitalize first letter of string
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
