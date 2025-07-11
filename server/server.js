const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 2000;

app.use(cors());
app.use(express.json());

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

app.post("/get_move/test", (req, res) => {
  const boardData = req.body;

  if (data === undefined || typeof data !== "object") {
    return res.status(400).json({ error: "Invalid data format" });
  }

  res.json({
    move: { start: "a7", end: "a6", attack: false },
    number: getRandomInt(1, 10),
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
