// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// --- DOM Elements ---
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// --- Display a Random Quote ---
function displayRandomQuote() {
  const filteredQuotes = filterQuotesArray();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// --- Add a New Quote ---
function createAddQuoteForm() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// --- Populate Categories ---
function populateCategories() {
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const lastCategory = localStorage.getItem("lastCategory") || "all";
  categoryFilter.value = lastCategory;
}

// --- Filter Quotes Based on Category ---
function filterQuotesArray() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategory", selected);
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

categoryFilter.addEventListener("change", displayRandomQuote);

// --- Web Storage ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
}

// --- JSON Import/Export ---
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(evt) {
    const importedQuotes = JSON.parse(evt.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Server Sync ---
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Sync local quotes to server and fetch updates
async function syncQuotes() {
  try {
    // POST local quotes to server
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    // Fetch updated server data
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: add only new quotes
    const newQuotes = serverQuotes.filter(sq => !quotes.find(q => q.text === sq.text));
    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
      alert(`${newQuotes.length} new quote(s) synced from server!`);
    }

  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Periodically sync every 60 seconds
function periodicSync() {
  syncQuotes();
  setTimeout(periodicSync, 60000);
}

// --- Initialize App ---
loadQuotes();
populateCategories();
displayRandomQuote();
periodicSync();