// -------------------- Task 0: Quotes and Random Display --------------------

// Quotes array with objects containing text and category
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Load quotes from local storage if available
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}
// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result); // parse JSON file
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes); // add imported quotes to existing array
        saveQuotes(); // update localStorage if you have this function
        alert("Quotes imported successfully!");
        displayRandomQuote(); // refresh displayed quote
      } else {
        alert("Invalid JSON format. Make sure it is an array of quotes.");
      }
    } catch (error) {
      alert("Error parsing JSON file: " + error);
    }
  };
  fileReader.readAsText(event.target.files[0]); // read file as text
}
// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2); // convert quotes array to JSON string
  const blob = new Blob([dataStr], { type: "application/json" }); // create a Blob
  const url = URL.createObjectURL(blob); // create a download link
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json"; // name of the downloaded file
  document.body.appendChild(a);
  a.click(); // trigger download
  document.body.removeChild(a); // remove the temporary link
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- Task 0: Display Random Quote --------------------
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Event listener for "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Show a random quote on page load
showRandomQuote();

// -------------------- Task 0: Add New Quote --------------------
function createAddQuoteForm() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// -------------------- Task 2: Dynamic Category Filter --------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  } else {
    quoteDisplay.textContent = "No quotes in this category.";
  }
}

// Initialize categories on page load
populateCategories();

// -------------------- Task 3: Server Sync --------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Mock API
    const data = await response.json();

    // Transform server data into quotes format
    const serverQuotes = data.map(item => ({
      text: item.title,
      category: "Server Quote"
    }));

    // Merge server quotes with local quotes (avoid duplicates)
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    showRandomQuote();

    // Notification
    alert("Quotes synced with server!");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// Periodically fetch from server every 30 seconds
setInterval(fetchQuotesFromServer, 30000)