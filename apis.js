// Estado global de la aplicación
const AppState = {
    currentView: 'home',
    currentSection: null,
    data: {
        countries: [],
        weather: [],
        videogames: [],
        football: []
    },
    filteredData: {
        countries: [],
        weather: [],
        videogames: [],
        football: []
    },
    searchTerm: '',
    sortBy: '',
    loading: {
        countries: false,
        weather: false,
        videogames: false,
        football: false
    }
};

// Configuración de APIs
const API_CONFIG = {
    countries: {
        key: 'sb1qj74dSiFbR08qkglbfcIOQ6I1AXcpqwi4nALH',
        url: 'https://countryapi.io/api/all'
    },
    weather: {
        key: 'c66f8053624fdea5889e29ddb3ce5019',
        url: 'https://api.openweathermap.org/data/2.5/weather'
    },
    videogames: {
        key: 'e4cbaf721d1041219bf966887cbd1765',
        url: 'https://api.rawg.io/api/games'
    },
    football: {
        key: 'eb96a081fad2536f452fe7b4cd686592',
        url: 'https://v3.football.api-sports.io/fixtures'
    }
};

// Sistema de navegación SPA
function showSection(section) {
    AppState.currentView = section;
    AppState.currentSection = section;
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="showSection('${section}')"]`)?.classList.add('active');
    
    // Mostrar/ocultar vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    
    const targetView = document.getElementById(`${section}-view`) || document.getElementById('home-view');
    targetView.style.display = 'block';
    setTimeout(() => targetView.classList.add('active'), 50);
    
    // Mostrar/ocultar controles según la vista
    const controlsSection = document.getElementById('controls-section');
    if (section === 'home') {
        controlsSection.classList.add('hidden');
    } else {
        controlsSection.classList.remove('hidden');
        setupControls(section);
        loadSectionData(section);
    }
    
    // Actualizar URL sin recargar
    window.history.pushState({section}, '', `#${section}`);
}

// Configurar controles de filtrado y ordenamiento
function setupControls(section) {
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    
    // Configurar opciones de ordenamiento según la sección
    const sortOptions = {
        countries: [
            { value: 'name', text: 'Nombre A-Z' },
            { value: 'name-desc', text: 'Nombre Z-A' },
            { value: 'capital', text: 'Capital A-Z' }
        ],
        videogames: [
            { value: 'name', text: 'Nombre A-Z' },
            { value: 'name-desc', text: 'Nombre Z-A' },
            { value: 'rating', text: 'Rating (Mayor)' },
            { value: 'rating-desc', text: 'Rating (Menor)' },
            { value: 'released', text: 'Más Reciente' }
        ],
        weather: [
            { value: 'name', text: 'Ciudad A-Z' },
            { value: 'temp', text: 'Temperatura (Mayor)' },
            { value: 'temp-desc', text: 'Temperatura (Menor)' }
        ],
        football: [
            { value: 'league', text: 'Liga A-Z' },
            { value: 'home-team', text: 'Equipo Local' }
        ]
    };
    
    // Limpiar y rellenar opciones de ordenamiento
    sortSelect.innerHTML = '<option value="">Ordenar por...</option>';
    if (sortOptions[section]) {
        sortOptions[section].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            sortSelect.appendChild(optionElement);
        });
    }
    
    // Event listeners para filtros
    searchInput.oninput = () => filterAndSort(section);
    sortSelect.onchange = () => filterAndSort(section);
}

// Cargar datos de una sección específica
async function loadSectionData(section) {
    if (AppState.data[section].length > 0) {
        AppState.filteredData[section] = [...AppState.data[section]];
        renderSection(section);
        return;
    }
    
    AppState.loading[section] = true;
    const container = document.getElementById(`${section}-full-container`);
    
    try {
        switch (section) {
            case 'countries':
                await getCountries(true);
                break;
            case 'weather':
                await getWeather(true);
                break;
            case 'videogames':
                await getVideogames(true);
                break;
            case 'football':
                await getFootball(true);
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        container.innerHTML = `<p class="text-center col-span-full text-red-500">Error al cargar ${section}</p>`;
    } finally {
        AppState.loading[section] = false;
    }
}

// Funciones de API mejoradas
const getCountries = async(fullLoad = false) => {
    const container = fullLoad ? 
        document.getElementById("countries-full-container") : 
        document.getElementById("countries-container");
    
    if (AppState.loading.countries) return;
    AppState.loading.countries = true;
    
    container.innerHTML = '<p class="text-center col-span-full loading">Cargando países...</p>';

    try {
        const apiKey = API_CONFIG.countries.key;
        const url = `${API_CONFIG.countries.url}?apikey=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        const countriesList = Object.values(data);
        
        AppState.data.countries = countriesList;
        AppState.filteredData.countries = [...countriesList];

        renderCountries(container, fullLoad ? countriesList : countriesList.slice(0, 20), fullLoad);
        
        if (fullLoad) updateResultsCount('countries');

    } catch (error) {
        console.error("Error al obtener países:", error);
        container.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar países</p>';
    } finally {
        AppState.loading.countries = false;
    }
};

const getWeather = async(fullLoad = false) => {
    const container = fullLoad ? 
        document.getElementById("weather-full-container") : 
        document.getElementById("weather-container");
    
    if (AppState.loading.weather) return;
    AppState.loading.weather = true;
    
    container.innerHTML = '<p class="text-center col-span-full loading">Cargando clima...</p>';

    try {
        // Para demo, obtenemos clima de varias ciudades
        const cities = ['Coquimbo', 'Santiago', 'Valparaiso', 'Antofagasta', 'Temuco'];
        const weatherPromises = cities.map(city => 
            fetch(`${API_CONFIG.weather.url}?q=${city}&appid=${API_CONFIG.weather.key}&units=metric&lang=es`)
                .then(res => res.json())
        );
        
        const weatherDataArray = await Promise.all(weatherPromises);
        AppState.data.weather = weatherDataArray;
        AppState.filteredData.weather = [...weatherDataArray];

        renderWeather(container, weatherDataArray, fullLoad);
        
        if (fullLoad) updateResultsCount('weather');

    } catch (error) {
        console.error("Error al obtener clima:", error);
        container.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar clima</p>';
    } finally {
        AppState.loading.weather = false;
    }
};

const getVideogames = async(fullLoad = false) => {
    const container = fullLoad ? 
        document.getElementById("videogames-full-container") : 
        document.getElementById("videogames-container");
    
    if (AppState.loading.videogames) return;
    AppState.loading.videogames = true;
    
    container.innerHTML = '<p class="text-center col-span-full loading">Cargando videojuegos...</p>';

    try {
        const apiKey = API_CONFIG.videogames.key;
        const pageSize = fullLoad ? 40 : 20;
        const url = `${API_CONFIG.videogames.url}?key=${apiKey}&page_size=${pageSize}`;
            
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        AppState.data.videogames = data.results;
        AppState.filteredData.videogames = [...data.results];

        renderVideogames(container, data.results, fullLoad);
        
        if (fullLoad) updateResultsCount('videogames');

    } catch (error) {
        console.error("Error al obtener videojuegos:", error);
        container.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar videojuegos</p>';
    } finally {
        AppState.loading.videogames = false;
    }
};

const getFootball = async(fullLoad = false) => {
    const container = fullLoad ? 
        document.getElementById("football-full-container") : 
        document.getElementById("football-container");
    
    if (AppState.loading.football) return;
    AppState.loading.football = true;
    
    container.innerHTML = '<p class="text-center col-span-full loading">Cargando partidos...</p>';

    try {
        const url = `${API_CONFIG.football.url}?live=all`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_CONFIG.football.key
            }
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        
        if (data.results === 0) {
            container.innerHTML = '<p class="text-center col-span-full">No hay partidos en vivo</p>';
            return;
        }

        AppState.data.football = data.response;
        AppState.filteredData.football = [...data.response];

        renderFootball(container, data.response, fullLoad);
        
        if (fullLoad) updateResultsCount('football');

    } catch (error) {
        console.error('Error al obtener fútbol:', error);
        container.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar partidos</p>';
    } finally {
        AppState.loading.football = false;
    }
};

// Funciones de renderizado
function renderCountries(container, countries, fullLoad = false) {
    container.innerHTML = '';
    
    countries.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'border rounded-lg p-4 shadow-md bg-white card-hover cursor-pointer transition-all duration-300';
        
        const countryName = country.name;
        const countryCapital = country.capital || 'N/A';
        const countryFlag = country.flag?.large || country.flag?.medium || '';

        countryCard.innerHTML = `
            <img src="${countryFlag}" alt="Bandera de ${countryName}" class="w-full h-32 object-cover mb-2 rounded-md">
            <h3 class="font-bold text-lg mb-1">${countryName}</h3>
            <p class="text-gray-700">Capital: ${countryCapital}</p>
            ${fullLoad ? `<p class="text-sm text-gray-500 mt-1">Click para ver detalles</p>` : ''}
        `;

        if (fullLoad) {
            countryCard.onclick = () => showDetail('country', country);
        }

        container.appendChild(countryCard);
    });
}

function renderWeather(container, weatherArray, fullLoad = false) {
    container.innerHTML = '';
    
    weatherArray.forEach(weatherData => {
        if (!weatherData.name) return;
        
        const weatherCard = document.createElement('div');
        weatherCard.className = 'border rounded-lg p-4 shadow-md bg-white card-hover cursor-pointer transition-all duration-300';

        const cityName = weatherData.name;
        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;

        weatherCard.innerHTML = `
            <div class="text-center">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="mx-auto mb-2">
                <h3 class="font-bold text-2xl">${cityName}</h3>
                <p class="text-4xl font-light">${temperature.toFixed(1)}°C</p>
                <p class="text-gray-600 capitalize">${description}</p>
                ${fullLoad ? `<p class="text-sm text-gray-500 mt-1">Click para ver detalles</p>` : ''}
            </div>
        `;

        if (fullLoad) {
            weatherCard.onclick = () => showDetail('weather', weatherData);
        }

        container.appendChild(weatherCard);
    });
}

function renderVideogames(container, games, fullLoad = false) {
    container.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'border rounded-lg p-4 shadow-md bg-white card-hover cursor-pointer transition-all duration-300';

        const gameName = game.name;
        const gameImage = game.background_image || '';
        const gameRating = game.rating || 0;
        const gameReleased = game.released || 'N/A';

        gameCard.innerHTML = `
            <img src="${gameImage}" alt="Imagen de ${gameName}" class="w-full h-32 object-cover mb-2 rounded-md">
            <h3 class="font-bold text-lg mb-1">${gameName}</h3>
            <p class="text-gray-700">Rating: ${gameRating}</p>
            <p class="text-gray-500 text-sm">Lanzado: ${gameReleased}</p>
            ${fullLoad ? `<p class="text-sm text-gray-500 mt-1">Click para ver detalles</p>` : ''}
        `;

        if (fullLoad) {
            gameCard.onclick = () => showDetail('game', game);
        }

        container.appendChild(gameCard);
    });
}

function renderFootball(container, matches, fullLoad = false) {
    container.innerHTML = '';
    
    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'border rounded-lg p-4 shadow-md bg-white card-hover cursor-pointer transition-all duration-300 flex flex-col items-center';

        const homeTeam = match.teams.home;
        const awayTeam = match.teams.away;
        const score = match.goals;
        const league = match.league;

        matchCard.innerHTML = `
            <p class="text-sm text-gray-500 mb-2">${league.name}</p>
            <div class="flex justify-around items-center w-full">
                <div class="flex flex-col items-center w-2/5 text-center">
                    <img src="${homeTeam.logo}" alt="Logo ${homeTeam.name}" class="w-12 h-12 mb-1">
                    <span class="font-semibold text-sm">${homeTeam.name}</span>
                </div>
                <div class="text-2xl font-bold">
                    <span>${score.home} - ${score.away}</span>
                </div>
                <div class="flex flex-col items-center w-2/5 text-center">
                    <img src="${awayTeam.logo}" alt="Logo ${awayTeam.name}" class="w-12 h-12 mb-1">
                    <span class="font-semibold text-sm">${awayTeam.name}</span>
                </div>
            </div>
            ${fullLoad ? `<p class="text-sm text-gray-500 mt-2">Click para ver detalles</p>` : ''}
        `;
        
        if (fullLoad) {
            matchCard.onclick = () => showDetail('match', match);
        }

        container.appendChild(matchCard);
    });
}

// Sistema de filtrado y ordenamiento
function filterAndSort(section) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;
    
    let filteredData = [...AppState.data[section]];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
        filteredData = filteredData.filter(item => {
            switch (section) {
                case 'countries':
                    return item.name.toLowerCase().includes(searchTerm) || 
                           (item.capital && item.capital.toLowerCase().includes(searchTerm));
                case 'videogames':
                    return item.name.toLowerCase().includes(searchTerm);
                case 'weather':
                    return item.name.toLowerCase().includes(searchTerm);
                case 'football':
                    return item.teams.home.name.toLowerCase().includes(searchTerm) ||
                           item.teams.away.name.toLowerCase().includes(searchTerm) ||
                           item.league.name.toLowerCase().includes(searchTerm);
                default:
                    return true;
            }
        });
    }
    
    // Aplicar ordenamiento
    if (sortBy) {
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    const nameDescA = (a.name || '').toLowerCase();
                    const nameDescB = (b.name || '').toLowerCase();
                    return nameDescB.localeCompare(nameDescA);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'rating-desc':
                    return (a.rating || 0) - (b.rating || 0);
                case 'capital':
                    const capA = (a.capital || '').toLowerCase();
                    const capB = (b.capital || '').toLowerCase();
                    return capA.localeCompare(capB);
                case 'temp':
                    return (b.main?.temp || 0) - (a.main?.temp || 0);
                case 'temp-desc':
                    return (a.main?.temp || 0) - (b.main?.temp || 0);
                case 'league':
                    return (a.league?.name || '').localeCompare(b.league?.name || '');
                case 'released':
                    return new Date(b.released || 0) - new Date(a.released || 0);
                default:
                    return 0;
            }
        });
    }
    
    AppState.filteredData[section] = filteredData;
    renderSection(section);
    updateResultsCount(section);
}

function renderSection(section) {
    const container = document.getElementById(`${section}-full-container`);
    const data = AppState.filteredData[section];
    
    switch (section) {
        case 'countries':
            renderCountries(container, data, true);
            break;
        case 'videogames':
            renderVideogames(container, data, true);
            break;
        case 'weather':
            renderWeather(container, data, true);
            break;
        case 'football':
            renderFootball(container, data, true);
            break;
    }
}

function updateResultsCount(section) {
    const resultsCount = document.getElementById('results-count');
    const total = AppState.data[section].length;
    const filtered = AppState.filteredData[section].length;
    
    if (total === filtered) {
        resultsCount.textContent = `${total} resultados`;
    } else {
        resultsCount.textContent = `${filtered} de ${total} resultados`;
    }
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('sort-select').value = '';
    
    if (AppState.currentSection) {
        AppState.filteredData[AppState.currentSection] = [...AppState.data[AppState.currentSection]];
        renderSection(AppState.currentSection);
        updateResultsCount(AppState.currentSection);
    }
}

// Sistema de vista de detalle
function showDetail(type, item) {
    AppState.currentView = 'detail';
    
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    
    const detailView = document.getElementById('detail-view');
    const detailContent = document.getElementById('detail-content');
    
    // Generar contenido de detalle según el tipo
    let detailHTML = '';
    
    switch (type) {
        case 'country':
            detailHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div class="md:flex">
                            <div class="md:w-1/2">
                                <img src="${item.flag?.large || item.flag?.medium}" alt="Bandera de ${item.name}" class="w-full h-64 md:h-full object-cover">
                            </div>
                            <div class="md:w-1/2 p-6">
                                <h1 class="text-3xl font-bold mb-4">${item.name}</h1>
                                <div class="space-y-3">
                                    <p><strong>Capital:</strong> ${item.capital || 'N/A'}</p>
                                    <p><strong>Región:</strong> ${item.region || 'N/A'}</p>
                                    <p><strong>Población:</strong> ${item.population ? item.population.toLocaleString() : 'N/A'}</p>
                                    <p><strong>Área:</strong> ${item.area ? item.area.toLocaleString() + ' km²' : 'N/A'}</p>
                                    <p><strong>Moneda:</strong> ${item.currencies ? Object.values(item.currencies)[0]?.name : 'N/A'}</p>
                                    <p><strong>Idiomas:</strong> ${item.languages ? Object.values(item.languages).join(', ') : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'game':
            detailHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img src="${item.background_image}" alt="${item.name}" class="w-full h-64 object-cover">
                        <div class="p-6">
                            <h1 class="text-3xl font-bold mb-4">${item.name}</h1>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 class="font-bold text-lg mb-2">Información General</h3>
                                    <div class="space-y-2">
                                        <p><strong>Rating:</strong> ${item.rating}/5</p>
                                        <p><strong>Lanzado:</strong> ${item.released || 'N/A'}</p>
                                        <p><strong>Géneros:</strong> ${item.genres ? item.genres.map(g => g.name).join(', ') : 'N/A'}</p>
                                        <p><strong>Plataformas:</strong> ${item.platforms ? item.platforms.slice(0, 3).map(p => p.platform.name).join(', ') : 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg mb-2">Estadísticas</h3>
                                    <div class="space-y-2">
                                        <p><strong>Metacritic:</strong> ${item.metacritic || 'N/A'}</p>
                                        <p><strong>Rating Count:</strong> ${item.ratings_count || 0}</p>
                                        <p><strong>Reviews Count:</strong> ${item.reviews_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'weather':
            detailHTML = `
                <div class="max-w-2xl mx-auto">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <div class="text-center">
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png" alt="${item.weather[0].description}" class="mx-auto mb-4">
                            <h1 class="text-4xl font-bold mb-2">${item.name}</h1>
                            <p class="text-6xl font-light text-blue-600 mb-4">${item.main.temp.toFixed(1)}°C</p>
                            <p class="text-xl text-gray-600 capitalize mb-6">${item.weather[0].description}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded-lg text-center">
                                <p class="text-gray-500">Sensación térmica</p>
                                <p class="text-2xl font-semibold">${item.main.feels_like.toFixed(1)}°C</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg text-center">
                                <p class="text-gray-500">Humedad</p>
                                <p class="text-2xl font-semibold">${item.main.humidity}%</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg text-center">
                                <p class="text-gray-500">Presión</p>
                                <p class="text-2xl font-semibold">${item.main.pressure} hPa</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg text-center">
                                <p class="text-gray-500">Viento</p>
                                <p class="text-2xl font-semibold">${item.wind?.speed || 0} m/s</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'match':
            detailHTML = `
                <div class="max-w-3xl mx-auto">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <div class="text-center mb-6">
                            <h2 class="text-xl text-gray-600 mb-4">${item.league.name}</h2>
                            <div class="flex justify-center items-center space-x-8">
                                <div class="text-center">
                                    <img src="${item.teams.home.logo}" alt="${item.teams.home.name}" class="w-20 h-20 mx-auto mb-2">
                                    <h3 class="font-bold text-lg">${item.teams.home.name}</h3>
                                </div>
                                <div class="text-center">
                                    <div class="text-4xl font-bold text-blue-600">${item.goals.home} - ${item.goals.away}</div>
                                    <div class="text-sm text-gray-500 mt-2">EN VIVO</div>
                                </div>
                                <div class="text-center">
                                    <img src="${item.teams.away.logo}" alt="${item.teams.away.name}" class="w-20 h-20 mx-auto mb-2">
                                    <h3 class="font-bold text-lg">${item.teams.away.name}</h3>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-bold mb-2">Información del Partido</h4>
                                <p><strong>Liga:</strong> ${item.league.name}</p>
                                <p><strong>Estadio:</strong> ${item.fixture?.venue?.name || 'N/A'}</p>
                                <p><strong>Ciudad:</strong> ${item.fixture?.venue?.city || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 class="font-bold mb-2">Estado</h4>
                                <p><strong>Tiempo:</strong> ${item.fixture?.status?.elapsed || 0}'</p>
                                <p><strong>Estado:</strong> ${item.fixture?.status?.long || 'En vivo'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    detailContent.innerHTML = detailHTML;
    detailView.style.display = 'block';
    setTimeout(() => detailView.classList.add('active'), 50);
}

function goBack() {
    if (AppState.currentSection) {
        showSection(AppState.currentSection);
    } else {
        showSection('home');
    }
}

// Manejo de historial del navegador
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.section) {
        showSection(event.state.section);
    } else {
        showSection('home');
    }
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    // Cargar datos iniciales para la vista home
    getCountries();
    getWeather();
    getVideogames();
    getFootball();
    
    // Manejar navegación inicial desde URL
    const hash = window.location.hash.slice(1);
    if (hash && ['countries', 'weather', 'videogames', 'football'].includes(hash)) {
        showSection(hash);
    } else {
        showSection('home');
    }
});
