const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');


const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = 'your-api-key';

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM'

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month]

}, 1000);

const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location-input');

searchBtn.addEventListener('click', () => {
    const location = locationInput.value;
    if (location.trim() !== '') {
        getWeatherDataByLocation(location);
        locationInput.value = '';
    }
});

function getWeatherDataByLocation(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => {
            const { coord } = data;
            if (coord) {
                const { lat, lon } = coord;
                fetch(
                    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`
                )
                    .then((res) => res.json())
                    .then((data) => {
                        showWeatherData(data, location);
                    });
            } else {
                console.log('Location not found.');
            }
        })
        .catch((error) => {
            console.log('Error:', error);
        });
}

function showWeatherData(data, location) {
    const timezone = document.getElementById('time-zone');
    const countryEl = document.getElementById('country');
    const currentWeatherItemsEl = document.getElementById('current-weather-items');
    const currentTempEl = document.getElementById('current-temp');
    const weatherForecastEl = document.getElementById('weather-forecast');

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = location;

    // Display current weather data
    const { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure}</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed}</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${window.moment(sunset * 1000).format('HH:mm a')}</div>
        </div>
    `;

    // Display current temperature and icon
    const currentIcon = data.current.weather[0].icon;
    const currentNightTemp = data.daily[0].temp.night;
    const currentDayTemp = data.daily[0].temp.day;

    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${currentIcon}.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${window.moment(data.current.dt * 1000).format('dddd')}</div>
            <div class="temp">Night - ${currentNightTemp}&#176;C</div>
            <div class="temp">Day - ${currentDayTemp}&#176;C</div>
        </div>
    `;

    // Display weather forecast for the next days
    let weatherForecastItems = '';
    data.daily.slice(1).forEach((day) => {
        const forecastIcon = day.weather[0].icon;
        const forecastNightTemp = day.temp.night;
        const forecastDayTemp = day.temp.day;
        const forecastDayName = window.moment(day.dt * 1000).format('ddd');

        weatherForecastItems += `
            <div class="weather-forecast-item">
                <div class="day">${forecastDayName}</div>
                <img src="http://openweathermap.org/img/wn/${forecastIcon}.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${forecastNightTemp}&#176;C</div>
                <div class="temp">Day - ${forecastDayTemp}&#176;C</div>
            </div>
        `;
    });

    weatherForecastEl.innerHTML = weatherForecastItems;
}
