document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "497779107bce2879ad9744abc3746d13"; // Replace with your OpenWeatherMap API key
    const searchBox = document.getElementById("search-box");
    const searchButton = document.getElementById("search-button");
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const weatherCondition = document.getElementById("weather-condition");
    const humidity = document.getElementById("humidity");
    const wind = document.getElementById("wind");
    const pressure = document.getElementById("pressure");
    const sunriseElement = document.getElementById("sunrise");
    const sunsetElement = document.getElementById("sunset");
    const hourlyList = document.getElementById("hourly-list");

    // Dynamic background based on weather condition
    const weatherBackgrounds = {
        Clear: "linear-gradient(135deg, #1e3c72, #2a5298)", // Darker blue for sunny
        Clouds: "linear-gradient(135deg, #4a5568, #2d3748)", // Darker gray for cloudy
        Rain: "linear-gradient(135deg, #2c3e50, #34495e)", // Darker blue for rainy
        Snow: "linear-gradient(135deg, #2c3e50, #4a6fa5)", // Darker blue for snowy
        Thunderstorm: "linear-gradient(135deg, #1c1c1c, #4a4a4a)", // Dark gray for stormy
        Drizzle: "linear-gradient(135deg, #2c3e50, #5d6d7e)", // Darker blue for drizzle
        Mist: "linear-gradient(135deg, #4a5568, #718096)", // Darker gray for misty
    };

    // Fetch weather data
    async function fetchWeather(city) {
        try {
            console.log("Fetching weather for:", city);
            const currentResponse = await fetch('https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric');
            const currentData = await currentResponse.json();
            console.log("Current Weather Response:", currentData);

            if (currentData.cod !== 200) {
                alert("Error: " + currentData.message);
                return;
            }

            // Update current weather UI
            cityName.textContent = currentData.name + ", " + currentData.sys.country;
            temperature.textContent = currentData.main.temp + "°C";
            weatherCondition.textContent = currentData.weather[0].main;
            humidity.textContent = currentData.main.humidity + "%";
            wind.textContent = currentData.wind.speed + " m/s";
            pressure.textContent = currentData.main.pressure + " hPa";

            // Update background based on weather condition
            const weatherMain = currentData.weather[0].main;
            document.body.style.background = weatherBackgrounds[weatherMain] || "linear-gradient(135deg, #1e3c72, #2a5298)";

            // Fetch hourly forecast
            const forecastResponse = await fetch('https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric');
            const forecastData = await forecastResponse.json();
            console.log("Hourly Forecast Response:", forecastData);

            if (forecastData.cod !== "200") {
                alert("Error fetching hourly data: " + forecastData.message);
                return;
            }

            // Update hourly weather UI
            updateHourlyWeather(forecastData.list, currentData.timezone);

            // Update sunrise and sunset times
            const sunriseTime = new Date((currentData.sys.sunrise + currentData.timezone) * 1000).toLocaleTimeString();
            const sunsetTime = new Date((currentData.sys.sunset + currentData.timezone) * 1000).toLocaleTimeString();
            sunriseElement.textContent = '🌞 Sunrise: ${sunriseTime}';
            sunsetElement.textContent = '🌞 Sunset: ${sunsetTime}';
        } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("Failed to fetch weather data. Please try again.");
        }
    }

    // Update hourly weather
    function updateHourlyWeather(hourlyData, timezoneOffset) {
        hourlyList.innerHTML = ""; // Clear previous data

        // Display the next 4 hours of data
        for (let i = 0; i < 4; i++) {
            const hourData = hourlyData[i];
            const utcTime = new Date(hourData.dt * 1000); // Convert timestamp to milliseconds
            const localTime = new Date(utcTime.getTime() + timezoneOffset * 1000); // Adjust for city's timezone
            const hourTime = localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }); // Format as local time
            const hourTemp = hourData.main.temp;
            const hourIcon = hourData.weather[0].icon;

            const hourElement = document.createElement("div");
            hourElement.className = "hour";
            hourElement.innerHTML = `
                <p>${hourTime}</p>
                <p><img src="http://openweathermap.org/img/wn/${hourIcon}.png" alt="${hourData.weather[0].description}"></p>
                <p>${hourTemp}°C</p>
            `;
            hourlyList.appendChild(hourElement);
        }
    }

    // Get user's location
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    fetchWeather("New Delhi"); // Fallback to default city
                }
            );
        } else {
            fetchWeather("New Delhi"); // Fallback to default city
        }
    }

    // Fetch weather by coordinates
    async function fetchWeatherByCoords(lat, lon) {
        try {
            const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric');
            const data = await response.json();
            fetchWeather(data.name); // Fetch weather for the detected city
        } catch (error) {
            console.error("Error fetching weather by coordinates:", error);
        }
    }

    // Default city on load
    getLocation();

    // Handle search
    searchButton.addEventListener("click", function () {
        if (searchBox.value.trim() !== "") {
            fetchWeather(searchBox.value.trim());
        }
    });

    searchBox.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && searchBox.value.trim() !== "") {
            fetchWeather(searchBox.value.trim());
        }
    });
});