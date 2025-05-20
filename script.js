const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = '9c863cc17741c132a322bcaed8bfb52c';

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = 
        (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) +
        ` <span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

// Handle search button click
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location !== '') {
        getWeatherDataByLocation(location);
        locationInput.value = '';
    }
});

// Get weather data by city name
function getWeatherDataByLocation(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            const { coord } = data;
            if (coord) {
                const { lat, lon } = coord;
                fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
                    .then(res => res.json())
                    .then(data => showWeatherData(data, location));
            } else {
                alert('Location not found!');
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data!');
        });
}

// Display weather data on the page
function showWeatherData(data, location) {
    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = location;

    const { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item"><div>Humidity</div><div>${humidity}%</div></div>
        <div class="weather-item"><div>Pressure</div><div>${pressure}</div></div>
        <div class="weather-item"><div>Wind Speed</div><div>${wind_speed} m/s</div></div>
        <div class="weather-item"><div>Sunrise</div><div>${moment(sunrise * 1000).format('hh:mm A')}</div></div>
        <div class="weather-item"><div>Sunset</div><div>${moment(sunset * 1000).format('hh:mm A')}</div></div>
    `;

    const current = data.current;
    const icon = current.weather[0].icon;
    const nightTemp = data.daily[0].temp.night;
    const dayTemp = data.daily[0].temp.day;

    currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${moment(current.dt * 1000).format('dddd')}</div>
            <div class="temp">Night - ${nightTemp}&#176;C</div>
            <div class="temp">Day - ${dayTemp}&#176;C</div>
        </div>
    `;

    let forecastHTML = '';
    data.daily.slice(1, 6).forEach(day => {
        const icon = day.weather[0].icon;
        forecastHTML += `
            <div class="weather-forecast-item">
                <div class="day">${moment(day.dt * 1000).format('ddd')}</div>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
        `;
    });

    weatherForecastEl.innerHTML = forecastHTML;
}
