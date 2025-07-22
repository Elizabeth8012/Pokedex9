


// updated js new and modified functions

let currentId = 1;
let currentPage = 1;
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];


/* updated*/ 


async function fetchPokemon(query) {
  const card = document.getElementById("pokemonCard");
  const nameElem = document.getElementById("pokemonName");
  const imageElem = document.getElementById("pokemonImage");
  const input = document.getElementById("pokemonInput");

  const idOrName = query || input.value.trim().toLowerCase();

  if (!idOrName) {
    alert("Please enter a Pokémon name or ID.");
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!response.ok) throw new Error("Not found");
    const data = await response.json();
    currentId = data.id;

    input.value = data.name;

    nameElem.textContent = capitalize(data.name);
    imageElem.src = data.sprites.other["official-artwork"].front_default;

    document.getElementById("pokemonTypes").textContent = data.types
      .map(t => capitalize(t.type.name)).join(", ");

    document.getElementById("pokemonHeight").textContent = data.height;
    document.getElementById("pokemonWeight").textContent = data.weight;

    const statsList = document.querySelector("#pokemonStats ul");
    statsList.innerHTML = "";
    data.stats.forEach(stat => {
      const li = document.createElement("li");
      li.textContent = `${capitalize(stat.stat.name)}: ${stat.base_stat}`;
      statsList.appendChild(li);
    });

    card.classList.remove("hidden");
    document.getElementById("gridContainer").classList.add("hidden");
  } catch (error) {
    alert("Pokémon not found!");
    card.classList.add("hidden");
  }
  playSound();

/*  card-showed
const card = document.getElementById("pokemonCard");
card.classList.remove("hidden");
setTimeout(() => card.classList.add("show"), 10);
// hide-
card.classList.remove("show");
setTimeout(() => card.classList.add("hidden"), 400);

*/
}

function searchPokemon() {
  const input = document.getElementById("pokemonInput").value;
  fetchPokemon(input);
}

function changePokemon(offset) {
  let newId = currentId + offset;
  if (newId < 1) newId = 1;
  if (newId > 898) newId = 898;
  fetchPokemon(newId);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

async function loadGrid() {
  const grid = document.getElementById("gridContainer");
  grid.innerHTML = "";
  grid.classList.remove("hidden");
  document.getElementById("pokemonCard").classList.add("hidden");

  for (let i = 1; i <= 20; i++) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await res.json();

      const div = document.createElement("div");
      div.className = "grid-item";
      div.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}" />
        <p>${capitalize(data.name)}</p>
      `;
      div.onclick = () => fetchPokemon(data.id);
      grid.appendChild(div);
    } catch {
      // skip failed fetch
    }
  }
}


// updated ends here
function updateFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function toggleFavorite(id, name, sprite) {
  const index = favorites.findIndex(p => p.id === id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ id, name, sprite });
  }
  updateFavorites();
  applyFilters(); // re-render grid if filters are active
}

function isFavorite(id) {
  return favorites.some(p => p.id === id);
}

function renderFavorites() {
  const container = document.getElementById("favoritesContainer");
  container.innerHTML = "";
  favorites.forEach(pokemon => {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.innerHTML = `
      <img src="${pokemon.sprite}" alt="${pokemon.name}" />
      <p>${capitalize(pokemon.name)}</p>
    `;
    div.onclick = () => fetchPokemon(pokemon.id);
    container.appendChild(div);
  });
}

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

async function loadGrid(page = 1) {
  currentPage = page;
  const grid = document.getElementById("gridContainer");
  const pagination = document.getElementById("pagination");
  const start = (page - 1) * 20 + 1;
  const end = start + 19;

  grid.innerHTML = "";
  grid.classList.remove("hidden");
  pagination.classList.remove("hidden");
  document.getElementById("pokemonCard").classList.add("hidden");
  document.getElementById("pageIndicator").textContent = `Page ${page}`;

  showLoader();
  for (let i = start; i <= end; i++) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await res.json();
      const div = document.createElement("div");
      div.className = "grid-item";
      div.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}" />
        <p>${capitalize(data.name)}</p>
        <span class="star" onclick="event.stopPropagation(); toggleFavorite(${data.id}, '${data.name}', '${data.sprites.front_default}')">
          ${isFavorite(data.id) ? "⭐" : "☆"}
        </span>
      `;
      div.onclick = () => fetchPokemon(data.id);
      grid.appendChild(div);
    } catch {
      // skip failed fetch
    }
  }
  hideLoader();
}

function changePage(offset) {
  const newPage = currentPage + offset;
  if (newPage < 1 || newPage > 45) return; // Max ~898 / 20 ≈ 45 pages
  loadGrid(newPage);
}

// Call once on load to show favorites
renderFavorites();


// updatedjs
let allNames = [];

async function preloadPokemonNames() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await res.json();
    allNames = data.results.map(p => p.name);
  } catch (e) {
    console.error("Failed to load Pokémon names.");
  }
}
preloadPokemonNames();




// live search
async function applyFilters() {
  const showFavorites = document.getElementById("showFavoritesOnly").checked;
  const selectedType = document.getElementById("typeFilter").value;
  const grid = document.getElementById("gridContainer");
  const pagination = document.getElementById("pagination");

  grid.innerHTML = "";
  pagination.classList.add("hidden");
  grid.classList.remove("hidden");
  document.getElementById("pokemonCard").classList.add("hidden");

  showLoader();

  let pokemonList = [];

  if (showFavorites) {
    pokemonList = favorites.map(f => f.id);
  } else {
    const start = (currentPage - 1) * 20 + 1;
    const end = start + 19;
    pokemonList = Array.from({ length: 20 }, (_, i) => i + start);
  }

  for (let id of pokemonList) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      const hasType = selectedType === "" || data.types.some(t => t.type.name === selectedType);

      if (hasType) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `
          <img src="${data.sprites.front_default}" alt="${data.name}" />
          <p>${capitalize(data.name)}</p>
          <span class="star" onclick="event.stopPropagation(); toggleFavorite(${data.id}, '${data.name}', '${data.sprites.front_default}')">
            ${isFavorite(data.id) ? "⭐" : "☆"}
          </span>
        `;
        div.onclick = () => fetchPokemon(data.id);
        grid.appendChild(div);
      }
    } catch {
      // skip failed
    }
  }

  hideLoader();
}


// fav & type
async function applyFilters() {
  const showFavorites = document.getElementById("showFavoritesOnly").checked;
  const selectedType = document.getElementById("typeFilter").value;
  const grid = document.getElementById("gridContainer");
  const pagination = document.getElementById("pagination");

  grid.innerHTML = "";
  pagination.classList.add("hidden");
  grid.classList.remove("hidden");
  document.getElementById("pokemonCard").classList.add("hidden");

  showLoader();

  let pokemonList = [];

  if (showFavorites) {
    pokemonList = favorites.map(f => f.id);
  } else {
    const start = (currentPage - 1) * 20 + 1;
    const end = start + 19;
    pokemonList = Array.from({ length: 20 }, (_, i) => i + start);
  }

  for (let id of pokemonList) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      const hasType = selectedType === "" || data.types.some(t => t.type.name === selectedType);

      if (hasType) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `
          <img src="${data.sprites.front_default}" alt="${data.name}" />
          <p>${capitalize(data.name)}</p>
          <span class="star" onclick="event.stopPropagation(); toggleFavorite(${data.id}, '${data.name}', '${data.sprites.front_default}')">
            ${isFavorite(data.id) ? "⭐" : "☆"}
          </span>
        `;
        div.onclick = () => fetchPokemon(data.id);
        grid.appendChild(div);
      }
    } catch {
      // skip failed
    }
  }

  hideLoader();
}


/* updat togglefav

function toggleFavorite(id, name, sprite) {
  const index = favorites.findIndex(p => p.id === id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ id, name, sprite });
  }
  updateFavorites();
  applyFilters(); // re-render grid if filters are active
}

hasta aque toggle*/



function startVoiceSearch() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.toLowerCase();
    document.getElementById("pokemonInput").value = spoken;
    fetchPokemon(spoken);
  };

  recognition.onerror = () => {
    alert("Voice recognition failed.");
  };

  recognition.start();
}



async function battle() {
  const name1 = document.getElementById("battlePoke1").value.toLowerCase().trim();
  const name2 = document.getElementById("battlePoke2").value.toLowerCase().trim();
  const resultDiv = document.getElementById("battleResult");

  if (!name1 || !name2) {
    resultDiv.textContent = "Please enter two Pokémon.";
    return;
  }

  try {
    const res1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${name1}`);
    const res2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${name2}`);
    const poke1 = await res1.json();
    const poke2 = await res2.json();

    const total1 = poke1.stats.reduce((sum, s) => sum + s.base_stat, 0);
    const total2 = poke2.stats.reduce((sum, s) => sum + s.base_stat, 0);

    const nameA = capitalize(poke1.name);
    const nameB = capitalize(poke2.name);

    if (total1 === total2) {
      resultDiv.textContent = `${nameA} and ${nameB} are equally strong!`;
    } else if (total1 > total2) {
      resultDiv.textContent = `${nameA} wins with ${total1} vs ${total2}!`;
    } else {
      resultDiv.textContent = `${nameB} wins with ${total2} vs ${total1}!`;
    }
  } catch {
    resultDiv.textContent = "Could not fetch one or both Pokémon.";
  }
}



function exportFavorites() {
  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "my-pokemon-favorites.json";
  link.click();

  URL.revokeObjectURL(url);
}



async function loadEvolutionChain(speciesUrl) {
  const evoList = document.getElementById("evoList");
  evoList.innerHTML = "...loading...";

  try {
    const speciesRes = await fetch(speciesUrl);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const chain = [];
    let current = evoData.chain;
    while (current) {
      chain.push(capitalize(current.species.name));
      current = current.evolves_to[0];
    }

    evoList.innerHTML = "";
    chain.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      evoList.appendChild(li);
    });
  } catch {
    evoList.innerHTML = "<li>Evolution data unavailable.</li>";
  }
}
// fetch poke after stats
loadEvolutionChain(data.species.url);


// sound
const sound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

function playSound() {
  sound.play().catch(() => {}); // suppress autoplay error
}



// export
function exportFavorites() {
  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "my-pokemon-favorites.json";
  link.click();

  URL.revokeObjectURL(url);
}


// register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("Service Worker Registered"));
  });
}
