let limit = 20;
let offset = 1;
const typesURL = "https://pokeapi.co/api/v2/type/?limit=21";
const pokemonURL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
let types;
let pokemons;
let finaldata;

const select = document.querySelector("select");
const pokemonsDiv = document.querySelector("#pokemons");
const search = document.querySelector("#search");
const loadMore = document.querySelector("#loadMore");
const loadingDiv = document.querySelector("#loading");

getTypes();
getPokemons(pokemonURL);

loadMore.addEventListener("click", () => {
    offset += limit;
    getPokemons(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
});

async function getPokemons(URL) {
    pokemons = await getDataFromURl(URL);
    pokemons = pokemons.results;
    
    const promises = pokemons.map((obj) => getDataFromURl(obj.url));
    finaldata = await Promise.all(promises);
    
    displayData(finaldata);
}

search.addEventListener("keyup", (e) => {
    if (e.target.value.length >= 0) {
        const searchedPokemons = finaldata.filter((obj) => obj.name.includes(e.target.value));
        
        pokemonsDiv.innerHTML = searchedPokemons.length === 0 
            ? "<h1>No Pokemons Found</h1>" 
            : "";
        
        if (searchedPokemons.length > 0) displayData(searchedPokemons);
    }
});

select.addEventListener("change", (e) => {
    console.log(e.target.value); // Debugging ke liye

    if (e.target.value === "all") {
        pokemonsDiv.innerHTML = "";
        displayData(finaldata);
    } else {
        const filteredPokemons = finaldata.filter((pokemon) => 
            pokemon.types.some((typeObj) => typeObj.type.name === e.target.value)
        );
         if(filteredPokemons.length==0){
            pokemonsDiv.innerHTML  ="<h1>No Pokemons Found</h1>";
            return;
         }
        console.log(filteredPokemons); // Debugging ke liye

        // **UI Clear Karne Ka Proper Tareeka**
        pokemonsDiv.innerHTML = ""; // Purane Pokemons ko hatao
        displayData(filteredPokemons); // Naye Filtered Pokemons Show Karo
    }
});

const resetButton = document.querySelector("#reset");

resetButton.addEventListener("click", () => {
    pokemonsDiv.innerHTML = ""; // Purane cards hatao
    displayData(finaldata); // Saare Pokémon wapas show karo

    // Flip wale cards wapas normal position pe lao
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("flip");
    });
    
    select.selectedIndex = 0; 

     // Search box ko empty karo
     search.value = "";
});


function displayData(data) {
    loadingDiv.style.display = "block";
    pokemonsDiv.innerHTML = ""; // Old data clear karne ke liye
    const fragment = document.createDocumentFragment();

    data.forEach((obj) => {
        console.log(obj);
        const card = document.createElement("div");
        card.classList.add("card");

        // Front Side
        const front = document.createElement("div");
        front.classList.add("front");

        const img = document.createElement("img");
        img.src = obj.sprites.other.dream_world.front_default;
        img.classList.add("poke-img");

        const name = document.createElement("h2");
        name.innerText = obj.name.toUpperCase();
        name.classList.add("poke-name");

        const type = document.createElement("p");
        const types = obj.types.map(typeObj => typeObj.type.name);
        type.innerHTML = `<strong>Type:</strong> ${types.join(", ")}`;
        type.classList.add("poke-type");

        front.append(img, name, type);

        // Back Side (for Flip Effect)
        const back = document.createElement("div");
        back.classList.add("back");

        const backName = document.createElement("h2");
        backName.innerText = obj.name.toUpperCase();
        backName.classList.add("poke-name");

        const backType = document.createElement("p");
        backType.innerHTML = `<strong>Type:</strong> ${types.join(", ")}`;
        backType.classList.add("poke-type");

        back.append(backName, backType);

        // Set background color based on Pokémon type
        const bgColor = getTypeColor(types[0]); // First type ka color
        front.style.backgroundColor = bgColor;
        back.style.backgroundColor = bgColor;

        // Append front & back to card
        card.append(front, back);
        fragment.append(card);

        // Flip effect on click
        card.addEventListener("click", () => {
            card.classList.toggle("flip");
        });
    });
     

    loadingDiv.style.display = "none";
    pokemonsDiv.append(fragment);
}



async function getTypes() {
    types = await getDataFromURl(typesURL);
    types = types.results;
    createOptions(types);
}

function createOptions(types) {
    const fragment = document.createDocumentFragment();
    
    types.forEach((obj) => {
        const option = document.createElement("option");
        option.innerText = obj.name;
        option.value = obj.name;
        fragment.append(option);
    });
    
    select.append(fragment);
}

async function getDataFromURl(url) {
    const response = await fetch(url);
    return response.json();
}

function getTypeColor(type) {
    const colors = {
        fire: "#F08030",
        water: "#6890F0",
        grass: "#78C850",
        electric: "#F8D030",
        ice: "#98D8D8",
        fighting: "#C03028",
        poison: "#A040A0",
        ground: "#E0C068",
        flying: "#A890F0",
        psychic: "#F85888",
        bug: "#A8B820",
        rock: "#B8A038",
        ghost: "#705898",
        dragon: "#7038F8",
        dark: "#705848",
        steel: "#B8B8D0",
        fairy: "#EE99AC",
        normal: "#A8A878"
    };
    return colors[type] || "#68A090"; // Default color agar type match nahi hota
}
