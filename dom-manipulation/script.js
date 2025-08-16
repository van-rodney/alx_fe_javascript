// Quotes array with objects containing text and category
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" — (${quote.category})`;
}

// Function to add a new quote
function addQuote(text, category) {
  if (text && category) {
    quotes.push({ text, category });
    showRandomQuote();
  }
}

// Function to dynamically create the Add Quote form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  // Input for quote text
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter quote text";

  // Input for category
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  // Button to add quote
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", () => {
    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();
    addQuote(newText, newCategory);
    textInput.value = "";
    categoryInput.value = "";
    alert("New quote added!");
  });

  // Append inputs and button to container
  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Event listener for the “Show New Quote” button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Create the add quote form dynamically
createAddQuoteForm();

// Show a random quote on page load
showRandomQuote();