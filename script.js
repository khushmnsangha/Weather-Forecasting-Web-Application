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

const API_KEY = '0878813d9b9fdb5af8a555876964d7f6';

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();

    // Convert to 12-hour format, 12 instead of 0
    let hoursIn12HrFormat = hour % 12;
    hoursIn12HrFormat = hoursIn12HrFormat === 0 ? 12 : hoursIn12HrFormat;

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
    } else {
        alert('Please enter a location');
    }
});

// Fetch weather data by city name using async/await for clarity
async function getWeatherDataByLocation(location) {
    try {
        // Get current weather data to find coordinates
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`);
        if (!response.ok) throw new Error('Location not found!');
        const data = await response.json();

        if (!data.coord) {
            alert('Location coordinates not found!');
            return;
        }
        const { lat, lon } = data.coord;

        // Fetch detailed weather info (One Call API)
        const oneCallResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`);
        if (!oneCallResponse.ok) throw new Error('Failed to get detailed weather data');
        const weatherData = await oneCallResponse.json();

        showWeatherData(weatherData, location);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message);
    }
}

// Display weather data on the page
function showWeatherData(data, location) {
    timezone.innerHTML = data.timezone || 'N/A';
    countryEl.innerHTML = location;

    const current = data.current;
    if (!current) {
        alert('Current weather data is not available');
        return;
    }

    const { humidity, pressure, sunrise, sunset, wind_speed, weather, dt } = current;

    // You need to include moment.js in your HTML for these moment calls to work
    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item"><div>Humidity</div><div>${humidity !== undefined ? humidity + '%' : 'N/A'}</div></div>
        <div class="weather-item"><div>Pressure</div><div>${pressure !== undefined ? pressure + ' hPa' : 'N/A'}</div></div>
        <div class="weather-item"><div>Wind Speed</div><div>${wind_speed !== undefined ? wind_speed + ' m/s' : 'N/A'}</div></div>
        <div class="weather-item"><div>Sunrise</div><div>${sunrise ? moment(sunrise * 1000).format('hh:mm A') : 'N/A'}</div></div>
        <div class="weather-item"><div>Sunset</div><div>${sunset ? moment(sunset * 1000).format('hh:mm A') : 'N/A'}</div></div>
    `;

    const icon = weather && weather[0] ? weather[0].icon : '01d';
    const nightTemp = data.daily && data.daily[0] && data.daily[0].temp ? data.daily[0].temp.night : 'N/A';
    const dayTemp = data.daily && data.daily[0] && data.daily[0].temp ? data.daily[0].temp.day : 'N/A';

    currentTempEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${dt ? moment(dt * 1000).format('dddd') : 'N/A'}</div>
            <div class="temp">Night - ${nightTemp}&#176;C</div>
            <div class="temp">Day - ${dayTemp}&#176;C</div>
        </div>
    `;

    let forecastHTML = '';
    if (data.daily && data.daily.length > 1) {
        data.daily.slice(1, 6).forEach(day => {
            const icon = day.weather && day.weather[0] ? day.weather[0].icon : '01d';
            const dayName = day.dt ? moment(day.dt * 1000).format('ddd') : 'N/A';
            const nightTemp = day.temp ? day.temp.night : 'N/A';
            const dayTemp = day.temp ? day.temp.day : 'N/A';

            forecastHTML += `
                <div class="weather-forecast-item">
                    <div class="day">${dayName}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="w-icon">
                    <div class="temp">Night - ${nightTemp}&#176;C</div>
                    <div class="temp">Day - ${dayTemp}&#176;C</div>
                </div>
            `;
        });
    } else {
        forecastHTML = '<div>No forecast data available</div>';
    }

    weatherForecastEl.innerHTML = forecastHTML;
}
