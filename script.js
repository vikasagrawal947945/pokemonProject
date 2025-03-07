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
    const copy = finaldata;
    
    if (e.target.value === "all") displayData(finaldata);
    else {
        displayData(
            copy.filter((pokemon) => 
                pokemon.types.some((type) => type.type.name === e.target.value)
            )
        );
    }
});

async function getPokemons(URL) {
    pokemons = await getDataFromURl(URL);
    pokemons = pokemons.results;
    
    const promises = pokemons.map((obj) => getDataFromURl(obj.url));
    finaldata = await Promise.all(promises);
    
    displayData(finaldata);
}

function displayData(data) {
    loadingDiv.style.display = "block";
    const fragment = document.createDocumentFragment();
    
    data.forEach((obj) => {
        const div = document.createElement("div");
        const img = document.createElement("img");
        const name = document.createElement("h2");
        const type = document.createElement("p");
        div.classList.add("parent");
        
        img.src = obj.sprites.other.dream_world.front_default;
        name.innerText = obj.name;
        
        const types=[];
        obj.types.forEach((object) => object.type.name);
        type.innerHTML = `<strong>Type:</strong> ${types.toString()}`;
        
        div.append(img, name, type);
        fragment.append(div);
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