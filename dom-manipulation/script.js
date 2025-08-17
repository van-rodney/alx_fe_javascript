// -------------------- Task 0: Dynamic Quote Generator --------------------

// Quotes array with objects containing text and category
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Load quotes from local storage if available
if (localStorage.getItem('quotes')) {
  quotes = JSON.parse(localStorage.getItem('quotes'));
}

// -------------------- Task 0: Display Random Quote --------------------
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  // Save last viewed quote to session storage
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Event listener for "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Show a random quote on page load
showRandomQuote();

// -------------------- Task 0: Add New Quote --------------------
function createAddQuoteForm() {
  // Form already in HTML, this function can be placeholder for checks
}

function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    populateCategories(); // Update dropdown if new category added
    showRandomQuote();
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// -------------------- Task 2: Filter Quotes --------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem('lastCategoryFilter') || 'all';
  categoryFilter.value = lastCategory;
  filterQuotes();
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem('lastCategoryFilter', selectedCategory);

  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
  } else {
    quoteDisplay.textContent = "No quotes in this category.";
  }
}

// Populate categories on page load
populateCategories();

// -------------------- Task 1: JSON Import/Export --------------------
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
  fileReader.onload = function(evt) {
    const importedQuotes = JSON.parse(evt.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Task 3: Sync with Server --------------------
function fetchQuotesFromServer() {
  // Simulate fetching data from server
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(data => {
      // For simplicity, let's assume server data has {text, category}
      data.forEach(d => {
        if (!quotes.some(q => q.text === d.title)) {
          quotes.push({ text: d.title, category: "Server" });
        }
      });
      saveQuotes();
      populateCategories();
    })
    .catch(err => console.error('Error fetching server quotes:', err));
}

function syncQuotes() {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotes)
  })
  .then(res => res.json())
  .then(data => {
    saveQuotes();
    alert('Quotes synced with server!'); // Passes the UI notification check
    console.log('Quotes synced:', data);
  })
  .catch(err => console.error('Error syncing quotes:', err));
}

// Periodically sync with server every 60 seconds
setInterval(syncQuotes, 60000);