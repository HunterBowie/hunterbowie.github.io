
const counterValue = document.getElementById('counterValue');
const incrementButton = document.getElementById('incrementButton');

// Function to fetch current counter value
async function fetchCounter() {
  const response = await fetch('http://localhost:3000/counter');
  const data = await response.json();
  counterValue.textContent = data.counter;
}

// Function to increment the counter
async function incrementCounter() {
  const response = await fetch('http://localhost:3000/increment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  counterValue.textContent = data.counter;
}

// Fetch initial counter value
fetchCounter();

// Attach click event
incrementButton.addEventListener('click', incrementCounter);
