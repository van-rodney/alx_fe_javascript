// ===== Quotes Array =====
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// ===== DOM Elements =====
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ===== Local Storage Handling =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem("quotes"));
  if (storedQuotes) quotes = storedQuotes;
}

// ===== Show Random Quote (Task 0) =====
function showRandomQuote() {
  const filteredQuotes = filterQuotesArray();
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ===== Add New Quote (Task 1) =====
function createAddQuoteForm() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("New quote added successfully!");
  showRandomQuote();
}

// ===== Filter Quotes (Task 2) =====
function populateCategories() {
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) categoryFilter.value = lastCategory;
}

function filterQuotesArray() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory);
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

// ===== JSON Import/Export =====
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
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Server Sync (Task 3) =====
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    // POST local quotes to server
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });

    // GET server data
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert server data to quote objects
    const serverQuotes = serverData.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Merge new quotes and resolve conflicts
    const newQuotes = serverQuotes.filter(sq => !quotes.find(q => q.text === sq.text));
    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert(`${newQuotes.length} new quote(s) synced from server!`);
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Periodically sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// ===== Event Listeners =====
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// ===== Initialize =====
loadQuotes();
populateCategories();

// Restore last session quote
const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
if (lastQuote) {
  quoteDisplay.textContent = `"${lastQuote.text}" — (${lastQuote.category})`;
} else {
  showRandomQuote();
}