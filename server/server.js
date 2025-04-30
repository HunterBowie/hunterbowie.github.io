const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let counter = 0;

// Function to call C++ program
function incrementCounterWithCpp(currentValue) {
    return new Promise((resolve, reject) => {
        // Run the C++ executable
        const executablePath = path.join(__dirname, 'cpp', 'main');
        const cppProcess = spawn(executablePath);

        let result = '';

        cppProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        cppProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
            reject(data.toString());
        });

        cppProcess.on('close', (code) => {
            if (code === 0) {
                resolve(parseInt(result));
            } else {
                reject(`Process exited with code ${code}`);
            }
        });

        // Send input to C++ program
        cppProcess.stdin.write(currentValue.toString());
        cppProcess.stdin.end();
    });
}

// API to get current counter
app.get('/counter', (req, res) => {
  res.json({ counter: counter });
});

// API to increment counter using C++
app.post('/increment', async (req, res) => {
  try {
    counter = await incrementCounterWithCpp(counter);
    res.json({ counter: counter });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
