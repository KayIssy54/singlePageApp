const form = document.querySelector("form");
const input = document.getElementById("wordInput");
const result = document.getElementById("result");
const suggestionsBox = document.getElementById("suggestions");

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];


async function fetchWord(word) {
  try {
    result.innerHTML = `<p class="text-muted">Searching...</p>`;

    const response = await fetch(API_URL + word);

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    displayWord(data[0]);
  } catch (error) {
    result.innerHTML = `
      <div class="alert alert-danger">
        ${error.message || "Something went wrong. Try again."}
      </div>
    `;
  }
}


function displayWord(data) {
  const word = data.word;
  const phonetic = data.phonetic || "";
  const audio = data.phonetics.find(p => p.audio)?.audio || "";

  let meaningsHTML = "";

  data.meanings.forEach(meaning => {
    const synonyms = [
      ...new Set(
        meaning.definitions.flatMap(d => d.synonyms || [] )
      )
    ];

    meaningsHTML += `
      <div class="mb-3">
        <h6 class="text-primary">${meaning.partOfSpeech}</h6>
        <ul>
          ${meaning.definitions
            .slice(0, 3)
            .map(def => `
              <li>
                ${def.definition}
                ${def.example ? `<br><em class="text-muted">Example: ${def.example}</em>` : ""}
              </li>
            `).join("")}
        </ul>

        ${
          synonyms.length>0
          ? `<p><strong>Synonyms:</strong> ${synonyms.join(",")}</p>`
          :""
        }
      </div>
    `;
  });

  const isFavorite = favorites.includes(word);

  result.innerHTML = `
    <div>
      <h3>
        ${word}
        <button class="btn btn-sm btn-warning ms-2" id="favBtn">
          ${isFavorite ? "★ Saved" : "☆ Save"}
        </button>
      </h3>

      <p class="text-muted">${phonetic}</p>

      ${audio ? `<audio controls src="${audio}"></audio>` : ""}

      <hr>

      ${meaningsHTML}
    </div>
  `;

  document.getElementById("favBtn").addEventListener("click", () => toggleFavorite(word));
}


function toggleFavorite(word) {
  if (favorites.includes(word)) {
    favorites = favorites.filter(w => w !== word);
  } else {
    favorites.push(word);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  fetchWord(word); // refresh UI
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const word = input.value.trim();
  if (!word) return;

  fetchWord(word);
  suggestionsBox.innerHTML = "";
});



function highlightFavorites() {
  const favBtn = document.querySelectorAll(".fav-word");
  favBtn.forEach(btn => {
    if (favorites.includes(btn.dataset.word)) {
      btn.classList.add("bg-warning");
    }
  });
}