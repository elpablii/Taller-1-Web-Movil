/**
 * const url = 'https://pokeapi.co/api/v2/pokemon/ditto';

fetch(url)
    .then(response => response.json())
    .then(data => {
        // Obtener el nombre del Pokémon
        const nombrePokemon = data.name;

        // Obtener la URL de la primera habilidad
        const abilityUrl = data.abilities[0].ability.url;

        // Mostrar el nombre en el documento
        document.getElementById('nombre-pokemon').textContent = nombrePokemon;

        // Obtener detalles de la habilidad
        fetch(abilityUrl)
            .then(res => res.json())
            .then(abilityData => console.log(abilityData))
            .catch(console.error);
    })
    .catch(console.error);*/

document.addEventListener("DOMContentLoaded", () => {

    const countriesContainer = document.getElementById("countries-container");
    const weatherContainer =  document.getElementById("weather-container");
    const videogamesContainer = document.getElementById("videogames-container");
    const footballContainer = document.getElementById("football-container");

    const getCountries = async() => {

        const url = "https://restcountries.com/v3.1/all";

        countriesContainer.innerHTML = '<p class="text-center col-span-full"> Cargando los países...</p>';

        try{
            const response = await fetch(url);

            if (!response.ok){
                throw new Error("Error en la solicitud: ${response.status}");
            }

            const countries = await response.json();

            countriesContainer.innerHTML = '';

            countries.slice(0, 20).forEach(country => {

                const countryCard = document.createElement('div');
                countryCard.className = 'border rounded-lg p-4 shadow-md bg-white hover:shadow-xl transition-shadow duration-300';

                const countryName = country.name.common;
                const countryCapital = country.capital ? country.capital[0] : 'N/A';
                const countryFlag = country.flags.svg;

                countryCard.innerHTML = `
                    <img src="${countryFlag}" alt="Bandera de ${countryName}" class="w-full h-32 object-cover mb-2 rounded-md">
                    <h3 class="font-bold text-lg mb-1">${countryName}</h3>
                    <p class="text-gray-700">Capital: ${countryCapital}</p>
                `;

                countriesContainer.appendChild(countryCard);

            });

        } catch (error) {
            console.error("Falló la obtención de los países:", error);
            countriesContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar los países. Intente de nuevo más tarde.</p>';
        }
    };


    const getWeather = async() => {

        const url = "https://api.openweathermap.org/data/2.5/weather?q=Coquimbo&appid=c66f8053624fdea5889e29ddb3ce5019&units=metric&lang=es";

        weatherContainer.innerHTML = '<p class="text-center col-span-full"> Cargando el tiempo...</p>';

        try{
            const response = await fetch(url);

            if (!response.ok){
                throw new Error("Error en la solicitud: ${response.status}");
            }

            const weatherData = await response.json();

            weatherContainer.innerHTML = '';

            const weatherCard = document.createElement('div');
            weatherCard.className = 'border rounded-lg p-4 shadow-md bg-white';

            const cityName = weatherData.name;
            const temperature = weatherData.main.temp;
            const description = weatherData.weather[0].description;

            weatherCard.innerHTML = `
                <h3 class="font-bold text-2xl">${cityName}</h3>
                <p class="text-4xl font-light">${temperature.toFixed(1)}°C</p>
                <p class="text-gray-600 capitalize">${description}</p>
            `;

            weatherContainer.appendChild(weatherCard);

        } catch (error) {
            console.error("Falló la obtención del clima:", error);
            weatherContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar los países. Intente de nuevo más tarde.</p>';
        }
    };

    const getVideogames = async() => {

        const apiKey = 'e4cbaf721d1041219bf966887cbd1765';
        const url = `https://api.rawg.io/api/games?key=${apiKey}&page_size=20`;

        videogamesContainer.innerHTML = '<p class="text-center col-span-full"> Cargando los videojuegos...</p>';

        try{
            
            if (apiKey === 'TU_API_KEY'){
                throw new Error("API Key de RAWG no configurada.");
            }
            
            const response = await fetch(url);

            if (!response.ok){
                throw new Error("Error en la solicitud: ${response.status}");
            }

            const data = await response.json();

            videogamesContainer.innerHTML = '';

            data.results.forEach(game => {

                const gameCard = document.createElement('div');
                gameCard.className = 'border rounded-lg p-4 shadow-md bg-white hover:shadow-xl transition-shadow duration-300';

                const gameName = game.name;
                const gameImage = game.background_image;
                const gameRating = game.rating;

                gameCard.innerHTML = `
                    <img src="${gameImage}" alt="Imagen de ${gameName}" class="w-full h-32 object-cover mb-2 rounded-md">
                    <h3 class="font-bold text-lg mb-1">${gameName}</h3>
                    <p class="text-gray-700">Rating: ${gameRating}</p>
                `;

                videogamesContainer.appendChild(gameCard);

            });

        } catch (error) {
            console.error("Falló la obtención de los juegos:", error);
            videogamesContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar los países. Intente de nuevo más tarde.</p>';
        }
    };


    const getFootball = async () => {

        const apiKey = 'eb96a081fad2536f452fe7b4cd686592';
        const url = 'https://v3.football.api-sports.io/fixtures?live=all';

        footballContainer.innerHTML = '<p class="text-center col-span-full">Cargando partidos de fútbol...</p>';

        try {
            if (apiKey === 'TU_API_KEY') {
                throw new Error('La API Key no está configurada.');
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': apiKey
                }
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            
            if (data.results === 0) {
                 footballContainer.innerHTML = `<p class="text-center col-span-full">No hay partidos en vivo en este momento.</p>`;
                 return;
            }

            footballContainer.innerHTML = '';

            data.response.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'border rounded-lg p-4 shadow-md bg-white hover:shadow-xl transition-shadow duration-300 flex flex-col items-center';

                const homeTeam = match.teams.home;
                const awayTeam = match.teams.away;
                const score = match.goals;
                const league = match.league;

                matchCard.innerHTML = `
                    <p class="text-sm text-gray-500 mb-2">${league.name}</p>
                    <div class="flex justify-around items-center w-full">
                        <div class="flex flex-col items-center w-2/5 text-center">
                            <img src="${homeTeam.logo}" alt="Logo ${homeTeam.name}" class="w-12 h-12 mb-1">
                            <span class="font-semibold">${homeTeam.name}</span>
                        </div>
                        <div class="text-2xl font-bold">
                            <span>${score.home} - ${score.away}</span>
                        </div>
                        <div class="flex flex-col items-center w-2/5 text-center">
                            <img src="${awayTeam.logo}" alt="Logo ${awayTeam.name}" class="w-12 h-12 mb-1">
                            <span class="font-semibold">${awayTeam.name}</span>
                        </div>
                    </div>
                `;
                footballContainer.appendChild(matchCard);
            });

        } catch (error) {
            console.error('Falló la obtención de datos de fútbol:', error);
            footballContainer.innerHTML = `<p class="text-center col-span-full text-red-500">Error al cargar los partidos. Revisa que tu API Key sea correcta.</p>`;
        }
    };


    getCountries();
    getWeather();
    getVideogames();
    getFootball();

});
