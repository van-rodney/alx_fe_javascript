// ------------------------
// Quotes array with objects
// ------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// ------------------------
// Save quotes to localStorage
// ------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------------
// Display a random quote
// ------------------------
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// ------------------------
// Add a new quote
// ------------------------
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
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

// ------------------------
// Populate category dropdown
// ------------------------
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  select.value = selectedCategory || 'all';
}

// ------------------------
// Filter quotes
// ------------------------
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }

  localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// ------------------------
// JSON Import/Export
// ------------------------
function exportToJson() {
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
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// ------------------------
// Fetch quotes from server (Task 3)
// ------------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Simulate server data as quotes
    const serverQuotes = data.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server"
    }));
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
  } catch (err) {
    console.error("Error fetching quotes from server:", err);
  }
}

// ------------------------
// Sync quotes to server (mock POST)
// ------------------------
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });
    if (response.ok) {
      console.log("Quotes synced successfully with server.");
    }
  } catch (err) {
    console.error("Error syncing quotes:", err);
  }
}

// ------------------------
// Periodic server sync every 30 seconds
// ------------------------
setInterval(async () => {
  await fetchQuotesFromServer();
  await syncQuotes();
}, 30000);

// ------------------------
// Initialize
// ------------------------
window.addEventListener("DOMContentLoaded", () => {
  populateCategories();

  const lastCategory = localStorage.getItem("lastSelectedCategory");
  if (lastCategory) {
    document.getElementById("categoryFilter").value = lastCategory;
    filterQuotes();
  } else {
    displayRandomQuote();
  }

  fetchQuotesFromServer();
});