// ====================
// Task 0: Quotes Array
// ====================
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// ====================
// Task 0: Display Random Quote
// ====================
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote)); // Task 1: last viewed quote
}

// Show quote on page load
const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
if (lastQuote) {
  document.getElementById("quoteDisplay").textContent = `"${lastQuote.text}" — (${lastQuote.category})`;
} else {
  showRandomQuote();
}

// Event listener for "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ====================
// Task 0/1: Add New Quote
// ====================
function createAddQuoteForm() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes(); // Task 1: Save to localStorage
    populateCategories(); // Task 2: Update category filter
    showRandomQuote();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// ====================
// Task 1: Web Storage
// ====================
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ====================
// Task 1: JSON Import/Export
// ====================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====================
// Task 2: Populate Categories & Filter
// ====================
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

  // Restore last selected filter
  const lastFilter = localStorage.getItem('lastFilter') || "all";
  select.value = lastFilter;
  filterQuotes();
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem('lastFilter', selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    document.getElementById("quoteDisplay").textContent = `"${quote.text}" — (${quote.category})`;
  } else {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
  }
}

// Update category dropdown on page load
populateCategories();

// ====================
// Task 3: Server Sync
// ====================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (err) {
    console.error("Error fetching server quotes:", err);
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newQuotesAdded = false;

  serverQuotes.forEach(sq => {
    if (!quotes.some(q => q.text === sq.text)) {
      quotes.push(sq);
      newQuotesAdded = true;
    }
  });

  if (newQuotesAdded) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("New quotes synced from server!");
  }
}

// Periodically sync every 60 seconds
setInterval(syncQuotes, 60000);
// Initial sync on page load
syncQuotes();