const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('timezone');
const countryEl = document.getElementById('country');
const currentTempEl = document.getElementById('current-temp');
const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = '0878813d9b9fdb5af8a555876964d7f6';

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour % 12 || 12;  // 0 => 12 in 12-hr format
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML =
        (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) +
        ` <span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// Search button click handler
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location !== '') {
        getWeatherDataByLocation(location);
        locationInput.value = '';
    }
});

// Fetch weather data for given city name
function getWeatherDataByLocation(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Location not found or API error');
            return res.json();
        })
        .then(data => {
            showWeatherData(data);
        })
        .catch(error => {
            alert(error.message);
            console.error('Error fetching weather data:', error);
        });
}

// Display weather data
function showWeatherData(data) {
    timezone.innerHTML = `Timezone offset: ${data.timezone / 3600} hrs`;
    countryEl.innerHTML = `${data.name}, ${data.sys.country}`;

    const { humidity, pressure, temp } = data.main;
    const { speed: wind_speed } = data.wind;
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const weatherIcon = data.weather[0].icon;
    const weatherDescription = data.weather[0].description;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item"><div>Humidity</div><div>${humidity}%</div></div>
        <div class="weather-item"><div>Pressure</div><div>${pressure} hPa</div></div>
        <div class="weather-item"><div>Wind Speed</div><div>${wind_speed} m/s</div></div>
        <div class="weather-item"><div>Sunrise</div><div>${formatTime(sunrise)}</div></div>
        <div class="weather-item"><div>Sunset</div><div>${formatTime(sunset)}</div></div>
        <div class="weather-item"><div>Description</div><div>${capitalizeFirstLetter(weatherDescription)}</div></div>
    `;

    currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="temp">${Math.round(temp)}°C</div>
        </div>
    `;
}

// Format time like "6:45 AM"
function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert 0 to 12
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

// Capitalize first letter of description
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
