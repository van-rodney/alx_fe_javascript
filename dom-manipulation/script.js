// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// --- DOM Manipulation ---
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Display a random quote
function displayRandomQuote() {
  const filteredQuotes = filterQuotesArray();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add new quote
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

// Populate categories in dropdown
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

// Filter quotes based on selected category
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

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    const serverQuotes = serverData.slice(0,3).map(item => ({ text: item.title, category: "Server" }));
    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error("Error fetching server data:", error);
  }
}

function resolveConflicts(serverQuotes) {
  serverQuotes.forEach(sq => {
    if (!quotes.find(q => q.text === sq.text)) quotes.push(sq);
  });
  saveQuotes();
  populateCategories();
}

// Periodically sync with server every 60s
function syncWithServer() {
  fetchQuotesFromServer();
  setTimeout(syncWithServer, 60000);
}

// --- Initialize ---
loadQuotes();
populateCategories();
displayRandomQuote();
syncWithServer();