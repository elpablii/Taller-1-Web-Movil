const url = 'https://pokeapi.co/api/v2/pokemon/ditto';

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
    .catch(console.error);
