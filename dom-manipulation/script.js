// Default quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Inspiration" },
  { text: "Don’t let yesterday take up too much of today.", category: "Life" }
];

// --- Local Storage Functions ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// --- Display Random Quote ---
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteText").innerHTML = "No quotes available.";
    document.getElementById("quoteCategory").innerHTML = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteText").innerHTML = `"${quote.text}"`;
  document.getElementById("quoteCategory").innerHTML = `— ${quote.category}`;

  // Save last displayed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// --- Add New Quote ---
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes(); // persist in Local Storage
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// --- Export Quotes to JSON ---
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// --- Import Quotes from JSON ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array of quotes.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Event Listener for Show New Quote Button ---
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// --- Load on Page Startup ---
window.onload = () => {
  loadQuotes();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteText").innerHTML = `"${quote.text}"`;
    document.getElementById("quoteCategory").innerHTML = `— ${quote.category}`;
  } else {
    displayRandomQuote();
  }
};