function initializePage() {
    const enterCityInput = document.getElementById("enter-city");
    const searchButton = document.getElementById("search-button");
    const clearHistoryButton = document.getElementById("clear-history");
    const cityNameElement = document.getElementById("city-name");
    const currentPicElement = document.getElementById("current-pic");
    const currentTempElement = document.getElementById("temperature");
    const currentHumidityElement = document.getElementById("humidity");
    const currentWindElement = document.getElementById("wind-speed");
    const currentUVElement = document.getElementById("UV-index");
    const historyElement = document.getElementById("history");
    const fiveDayHeaderElement = document.getElementById("fiveday-header");
    const todayWeatherElement = document.getElementById("today-weather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
  
    const APIKey = "486dbb2a3f41c1227f6b41daac9e4b85";
  
    function fetchWeather(cityName) {
      const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
      axios.get(queryURL)
        .then(function (response) {
          todayWeatherElement.classList.remove("d-none");
  
          const currentDate = new Date(response.data.dt * 1000);
          const day = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          cityNameElement.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
          const weatherPic = response.data.weather[0].icon;
          currentPicElement.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
          currentPicElement.setAttribute("alt", response.data.weather[0].description);
          currentTempElement.innerHTML = "Temperature: " + convertKelvinToFahrenheit(response.data.main.temp) + " &#176F";
          currentHumidityElement.innerHTML = "Humidity: " + response.data.main.humidity + "%";
          currentWindElement.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
  
          const lat = response.data.coord.lat;
          const lon = response.data.coord.lon;
          const UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
          axios.get(UVQueryURL)
            .then(function (response) {
              const UVIndex = document.createElement("span");
  
              if (response.data[0].value < 4) {
                UVIndex.setAttribute("class", "badge badge-success");
              } else if (response.data[0].value < 8) {
                UVIndex.setAttribute("class", "badge badge-warning");
              } else {
                UVIndex.setAttribute("class", "badge badge-danger");
              }
              UVIndex.innerHTML = response.data[0].value;
              currentUVElement.innerHTML = "UV Index: ";
              currentUVElement.append(UVIndex);
            });
  
          const cityID = response.data.id;
          const forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
          axios.get(forecastQueryURL)
            .then(function (response) {
              fiveDayHeaderElement.classList.remove("d-none");
  
              const forecastElements = document.querySelectorAll(".forecast");
              for (let i = 0; i < forecastElements.length; i++) {
                forecastElements[i].innerHTML = "";
                const forecastIndex = i * 8 + 4;
                const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                const forecastDay = forecastDate.getDate();
                const forecastMonth = forecastDate.getMonth() + 1;
                const forecastYear = forecastDate.getFullYear();
                const forecastDateElement = document.createElement("p");
                forecastDateElement.setAttribute("class", "mt-3 mb-0 forecast-date");
                forecastDateElement.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastElements[i].append(forecastDateElement);
  
                const forecastWeatherElement = document.createElement("img");
                forecastWeatherElement.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherElement.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                forecastElements[i].append(forecastWeatherElement);
  
                const forecastTempElement = document.createElement("p");
                forecastTempElement.innerHTML = "Temp: " + convertKelvinToFahrenheit(response.data.list[forecastIndex].main.temp) + " &#176F";
                forecastElements[i].append(forecastTempElement);
  
                const forecastHumidityElement = document.createElement("p");
                forecastHumidityElement.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                forecastElements[i].append(forecastHumidityElement);
              }
            });
        });
    }
  
    searchButton.addEventListener("click", function () {
      const searchTerm = enterCityInput.value;
      fetchWeather(searchTerm);
      searchHistory.push(searchTerm);
      localStorage.setItem("search", JSON.stringify(searchHistory));
      renderSearchHistory();
    });
  
    clearHistoryButton.addEventListener("click", function () {
      localStorage.clear();
      searchHistory = [];
      renderSearchHistory();
    });
  
    function convertKelvinToFahrenheit(K) {
      return Math.floor((K - 273.15) * 1.8 + 32);
    }
  
    function renderSearchHistory() {
      historyElement.innerHTML = "";
      for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
          fetchWeather(historyItem.value);
        });
        historyElement.append(historyItem);
      }
    }
  
    renderSearchHistory();
    if (searchHistory.length > 0) {
      fetchWeather(searchHistory[searchHistory.length - 1]);
    }
  }
  
  initializePage();
  