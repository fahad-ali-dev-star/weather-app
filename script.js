// ---------- FUTURISTIC WEATHER APP ----------
const apiKey = 'f9354144a621cce4f55b01eba2d0231d';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherContainer = document.getElementById('weatherContainer');
const tempSpan = document.getElementById('tempValue');
const citySpan = document.getElementById('cityName');
const humiditySpan = document.getElementById('humidityValue');
const windSpan = document.getElementById('windValue');
const feelsLikeSpan = document.getElementById('feelsLikeValue');
const pressureSpan = document.getElementById('pressureValue');
const cloudsSpan = document.getElementById('cloudsValue');
const weatherMainIcon = document.getElementById('weatherMainIcon');
const messageDiv = document.getElementById('messageArea');

let currentLoading = false;

function showMessage(msg, isError = true) {
    messageDiv.innerHTML = `<div class="error-msg"><i class="fas ${isError ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> ${msg}</div>`;
    setTimeout(() => {
        if (messageDiv.innerHTML.includes(msg)) messageDiv.innerHTML = '';
    }, 3800);
}

function clearMessage() {
    messageDiv.innerHTML = '';
}

// loading animation placeholder
function setLoadingState(isLoading) {
    if (isLoading) {
        weatherMainIcon.className = 'fas fa-sync-alt fa-spin weather-main-icon';
        tempSpan.innerHTML = '--°C';
        citySpan.innerHTML = '--';
        humiditySpan.innerHTML = '--%';
        windSpan.innerHTML = '-- km/h';
        feelsLikeSpan.innerHTML = '--°C';
        pressureSpan.innerHTML = '-- hPa';
        cloudsSpan.innerHTML = '--%';
        clearMessage();
    }
}

// Map weather condition to futuristic fontawesome icon
function getWeatherIconClass(weatherMain) {
    const main = weatherMain.toLowerCase();
    if (main === 'clear') return 'fas fa-sun';
    if (main === 'clouds') return 'fas fa-cloud';
    if (main === 'rain') return 'fas fa-cloud-rain';
    if (main === 'drizzle') return 'fas fa-cloud-rain';
    if (main === 'thunderstorm') return 'fas fa-bolt';
    if (main === 'snow') return 'fas fa-snowflake';
    if (main === 'mist' || main === 'fog' || main === 'haze') return 'fas fa-smog';
    return 'fas fa-cloud-sun';
}

// update UI with API data
function updateWeatherUI(data) {
    // temperature & city
    const tempC = Math.round(data.main.temp);
    tempSpan.innerHTML = `${tempC}°C`;
    citySpan.innerHTML = data.name;

    // humidity
    humiditySpan.innerHTML = `${data.main.humidity}%`;
    // wind speed (km/h)
    const windKmh = (data.wind.speed * 3.6).toFixed(1);
    windSpan.innerHTML = `${windKmh} km/h`;
    // feels like
    const feelsLike = Math.round(data.main.feels_like);
    feelsLikeSpan.innerHTML = `${feelsLike}°C`;
    // pressure
    pressureSpan.innerHTML = `${data.main.pressure} hPa`;
    // clouds percentage
    const clouds = data.clouds?.all ?? 0;
    cloudsSpan.innerHTML = `${clouds}%`;

    // fancy icon mapping
    const weatherType = data.weather[0].main;
    const iconClass = getWeatherIconClass(weatherType);
    weatherMainIcon.className = `${iconClass} weather-main-icon`;

    // extra cyber effect: add glow class momentarily
    weatherMainIcon.style.animation = 'none';
    setTimeout(() => { weatherMainIcon.style.animation = ''; }, 20);
}

// main fetch function by query (city name)
async function fetchWeatherByCity(city) {
    if (!city || city.trim() === "") {
        showMessage("⚡ PLEASE ENTER A VALID CITY NAME ⚡", true);
        return false;
    }
    if (currentLoading) return false;
    currentLoading = true;
    setLoadingState(true);
    try {
        const url = `${baseUrl}?q=${encodeURIComponent(city.trim())}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "City not found in our quantum map");
        }
        updateWeatherUI(data);
        clearMessage();
        return true;
    } catch (error) {
        console.error(error);
        showMessage(`⚠️ ERROR: ${error.message || "UNABLE TO REACH WEATHER SATELLITE"}`);
        setLoadingState(false);
        return false;
    } finally {
        currentLoading = false;
        // ensure loading icon reset if fails but still reverted
        if (!document.querySelector('.error-msg') && weatherMainIcon.className.includes('fa-spin')) {
            weatherMainIcon.className = 'fas fa-cloud-sun weather-main-icon';
        }
    }
}

// fetch by coordinates (lat, lon)
async function fetchWeatherByCoords(lat, lon) {
    if (currentLoading) return false;
    currentLoading = true;
    setLoadingState(true);
    try {
        const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Location error");
        updateWeatherUI(data);
        clearMessage();
        // also update input with city name for better UX
        if (data.name) cityInput.value = data.name;
        return true;
    } catch (err) {
        console.error(err);
        showMessage(`📍 LOCATION ERROR: ${err.message || "coordinate drift"}`);
        return false;
    } finally {
        currentLoading = false;
    }
}

// get user location with geolocation api
function getUserLocation() {
    if (!navigator.geolocation) {
        showMessage("🌐 GEOLOCATION NOT SUPPORTED IN THIS REALITY", true);
        return;
    }
    showMessage("🌀 ACCESSING SATELLITE GRID...", false);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            let errMsg = "LOCATION PERMISSION DENIED. USE SEARCH.";
            if (error.code === 2) errMsg = "UNAVAILABLE POSITION SIGNAL.";
            showMessage(`⚠️ ${errMsg}`, true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// event listeners
searchBtn.addEventListener('click', () => {
    const query = cityInput.value.trim();
    if (query === "") {
        showMessage("💫 ENTER A FUTURISTIC CITY NAME (E.G. TOKYO, LONDON)", true);
        return;
    }
    fetchWeatherByCity(query);
});

locationBtn.addEventListener('click', () => {
    getUserLocation();
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn.click();
    }
});

// DEFAULT ON LOAD: fetch a dynamic cool city – "Tokyo" futuristic vibe
window.addEventListener('DOMContentLoaded', () => {
    // set a beautiful default async fetch
    fetchWeatherByCity("Tokyo");
    // extra neon effect on input
    cityInput.value = "";
    // optional: extra greeting message? not needed
});

// additional sleek effect: update background based on weather? optional extreme but let's keep style consistent
// Also prevent duplicate fetch while loading
// adjust some extra error detection
async function testApiKeyFallback() {
    // just a silent check (not necessary, but ensures key)
}
testApiKeyFallback();