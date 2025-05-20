const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezoneEl = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = '0878813d9b9fdb5af8a555876964d7f6'; // your new API key

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour % 12 || 12;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML =
        (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) +
        ` <span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// Search button event listener
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location !== '') {
        getWeatherDataByLocation(location);
        locationInput.value = '';
    }
});

// Fetch weather data from OpenWeatherMap using only /weather endpoint
function getWeatherDataByLocation(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Location not found or API key invalid');
            return res.json();
        })
        .then(data => showWeatherData(data))
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert(error.message);
        });
}

// Display weather data on the page
function showWeatherData(data) {
    timezoneEl.innerHTML = `UTC ${data.timezone >= 0 ? '+' : ''}${data.timezone / 3600}`;
    countryEl.innerHTML = `${data.name}, ${data.sys.country}`;

    const { humidity, pressure, temp, temp_min, temp_max } = data.main;
    const windSpeed = data.wind.speed;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const weatherIcon = data.weather[0].icon;
    const description = data.weather[0].description;

    currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${description}" class="w-icon" />
        <div class="other">
            <div class="temp">${temp}&#176;C</div>
            <div>${description.charAt(0).toUpperCase() + description.slice(1)}</div>
            <div>Min: ${temp_min}&#176;C | Max: ${temp_max}&#176;C</div>
        </div>
    `;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item"><div>Humidity</div><div>${humidity}%</div></div>
        <div class="weather-item"><div>Pressure</div><div>${pressure} hPa</div></div>
        <div class="weather-item"><div>Wind Speed</div><div>${windSpeed} m/s</div></div>
        <div class="weather-item"><div>Sunrise</div><div>${new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
        <div class="weather-item"><div>Sunset</div><div>${new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
    `;

    weatherForecastEl.innerHTML = `<p>Forecast data not available on this plan.</p>`;
}
