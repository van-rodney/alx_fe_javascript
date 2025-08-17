// ================= Task 0: Dynamic Quote Generator =================

// Quotes array with objects containing text and category
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Function to display a random quote (Task 0 requirement: showRandomQuote)
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;

  // Save last viewed quote to session storage (Task 1)
  sessionStorage.setItem("lastQuoteIndex", randomIndex);
}

// Function to add a new quote
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    saveQuotes(); // Task 1: save to localStorage
    populateCategories(); // Task 2: update categories if new
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Event listener for the “Show New Quote” button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Show a random quote on page load
showRandomQuote();

// ================= Task 1: Web Storage and JSON =================

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// JSON Export
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
}

// ================= Task 2: Dynamic Filtering =================

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastCategoryFilter") || "all";
  select.value = lastFilter;
  filterQuotes();
}

function filterQuotes() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;
  localStorage.setItem("lastCategoryFilter", selectedCategory);

  const filteredQuotes = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  } else {
    quoteDisplay.textContent = "No quotes in this category.";
  }
}

// Populate categories on page load
populateCategories();

// ================= Task 3: Server Sync and Conflict Resolution =================

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    // Convert mock data to quote format if needed
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Simple conflict resolution: server overwrites local quotes
  quotes = [...serverQuotes, ...quotes.filter(q => q.category !== "Server")];
  saveQuotes();
  populateCategories();

  alert("Quotes synchronized with server!");
}

// Periodically sync every 60 seconds
setInterval(syncQuotes, 60000);