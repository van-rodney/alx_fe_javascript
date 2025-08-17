// ===== Task 0 & 1: Quotes array and Web Storage =====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===== Task 0: Display Random Quote =====
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  // Save last viewed quote to sessionStorage (Task 1)
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// ===== Task 0: Create Add Quote Form Dynamically =====
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.insertBefore(formContainer, document.getElementById("categoryFilter"));
}
createAddQuoteForm();

// ===== Task 0: Add Quote Logic =====
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories(); // Task 2: Update categories dynamically
    displayRandomQuote(); // Update DOM
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// ===== Task 1: JSON Import/Export =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== Task 2: Category Filter =====
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastSelectedCategory");
  if (lastFilter) categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  // Display random quote from filtered
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  } else {
    quoteDisplay.textContent = "No quotes available in this category.";
  }
}

// ===== Task 3: Server Sync & Conflict Resolution =====
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();
    return serverQuotes.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Error fetching from server:", err);
    return [];
  }
}

async function syncQuotes() {
  // Fetch server data
  const serverQuotes = await fetchQuotesFromServer();

  // Merge with local quotes (server takes precedence if conflicts)
  serverQuotes.forEach(sq => {
    if (!quotes.some(lq => lq.text === sq.text)) {
      quotes.push(sq);
    }
  });

  saveQuotes();
  populateCategories();
  displayRandomQuote();
  alert("Quotes synced with server!");
}

// Periodic syncing every 60 seconds
setInterval(syncQuotes, 60000);

// ===== Initialize =====
populateCategories();
displayRandomQuote();