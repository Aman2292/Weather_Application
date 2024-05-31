document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '2ac800b4aee6b6a4697d403e2d8a764b';
    const searchBar = document.getElementById('searchBar');
    const celsiusBtn = document.getElementById('celsius');
    const fahrenheitBtn = document.getElementById('fahrenheit');
    const todayTab = document.getElementById('todayTab');
    const weekTab = document.getElementById('weekTab');
    const currentWeatherSection = document.getElementById('currentWeather');
    const dayCardsContainer = document.getElementById('dayCards');
    dayCardsContainer.style.display = 'none';

    let isCelsius = true;

    const toFahrenheit = (celsius) => (celsius * 9 / 5) + 32;

    const updateWeatherInfo = async (city) => {
        try {
            const units = isCelsius ? 'metric' : 'imperial';
            const tempUnit = isCelsius ? '°C' : '°F';

            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`);
            const weatherData = await weatherResponse.json();

            const uvResponse = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`);
            const uvData = await uvResponse.json();

            updateUI(weatherData, uvData, tempUnit);
            currentWeatherSection.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${city}')`;
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateUI = (data, uvData, tempUnit) => {
        document.getElementById('temperature').textContent = `${data.main.temp}${tempUnit}`;
        document.getElementById('dateTime').textContent = new Date().toLocaleString();
        document.getElementById('weatherDescription').textContent = data.weather[0].description;
        document.getElementById('rainChance').textContent = `${data.clouds.all}%`;
        document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('windStatus').textContent = `${data.wind.speed} km/h ${data.wind.deg}`;
        document.getElementById('sunTimes').innerHTML = `<div>${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</div><div>${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</div>`;
        document.getElementById('humidity').innerHTML = `${data.main.humidity}% <span>${getHumidityStatus(data.main.humidity)}</span>`;
        document.getElementById('visibility').innerHTML = `${data.visibility / 1000} km <span>${getVisibilityStatus(data.visibility)}</span>`;
        document.getElementById('airQuality').innerHTML = `${data.main.aqi} <span>${getAirQualityStatus(data.main.aqi)}</span>`;
        document.getElementById('uvIndex').innerHTML = `${uvData.value} <span>${getUVStatus(uvData.value)}</span>`;
    };

    const getHumidityStatus = (humidity) => {
        if (humidity < 30) return 'Low';
        if (humidity < 60) return 'Normal';
        return 'High';
    };

    const getVisibilityStatus = (visibility) => {
        if (visibility > 8000) return 'Good';
        if (visibility > 4000) return 'Average';
        return 'Poor';
    };

    const getAirQualityStatus = (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        return 'Unhealthy';
    };

    const getUVStatus = (uvIndex) => {
        if (uvIndex <= 2) return 'Low';
        if (uvIndex <= 5) return 'Moderate';
        if (uvIndex <= 7) return 'High';
        if (uvIndex <= 10) return 'Very High';
        return 'Extreme';
    };

    const updateWeekForecast = async (city) => {
        try {
            const units = isCelsius ? 'metric' : 'imperial';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}`);
            const data = await response.json();
            const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
            renderWeekForecast(dailyData);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    };

    const renderWeekForecast = (forecastData) => {
        const dayCards = document.querySelectorAll('.day-card');
        forecastData.forEach((day, index) => {
            const dayCard = dayCards[index];
            const dayOfWeek = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const iconClass = getWeatherIcon(day.weather[0].icon);
            const tempMax = isCelsius ? day.main.temp_max.toFixed(1) + '°C' : toFahrenheit(day.main.temp_max).toFixed(1) + '°F';
            const tempMin = isCelsius ? day.main.temp_min.toFixed(1) + '°C' : toFahrenheit(day.main.temp_min).toFixed(1) + '°F';

            dayCard.querySelector('.day').textContent = dayOfWeek;
            dayCard.querySelector('.icon i').className = `fas ${iconClass}`;
            dayCard.querySelector('.temp-range').textContent = `${tempMax} - ${tempMin}`;
        });
    };

    const getWeatherIcon = (icon) => {
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud-meatball',
            '04n': 'fa-cloud-meatball',
            '09d': 'fa-cloud-showers-heavy',
            '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };
        return iconMap[icon] || 'fa-question';
    };

    celsiusBtn.addEventListener('click', () => {
        isCelsius = true;
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        updateWeatherInfo(searchBar.value);
        updateWeekForecast(searchBar.value);
    });

    fahrenheitBtn.addEventListener('click', () => {
        isCelsius = false;
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.add('active');
        updateWeatherInfo(searchBar.value);
        updateWeekForecast(searchBar.value);
    });

    searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            updateWeatherInfo(searchBar.value);
            updateWeekForecast(searchBar.value);
        }
    });

    todayTab.addEventListener('click', () => {
        todayTab.classList.add('active');
        weekTab.classList.remove('active');
        currentWeatherSection.style.display = 'flex';
        dayCardsContainer.style.display = 'none';
        document.querySelector('.highlights').style.display = 'flex';
    });

    weekTab.addEventListener('click', () => {
        weekTab.classList.add('active');
        todayTab.classList.remove('active');
        currentWeatherSection.style.display = 'flex';
        dayCardsContainer.style.display = 'flex';
        document.querySelector('.highlights').style.display = 'none';
        updateWeekForecast(searchBar.value);
    });

    updateWeatherInfo('New York'); // Default city
    updateWeekForecast('New York');
});
