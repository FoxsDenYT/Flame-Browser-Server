const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Use body-parser middleware to parse request body as JSON
app.use(bodyParser.json());

app.use(cors());
app.options("*", cors());
app.use("/ui", express.static("static"));
// Define file path for saving browser state
const dataFilePath = "./.browser_state.json";

// Load browser state from file or create a new state if file does not exist
let browserState;
if (fs.existsSync(dataFilePath)) {
  const data = fs.readFileSync(dataFilePath);
  browserState = JSON.parse(data);
} else {
  browserState = {
    users: {},
  };
}

// Define routes for /history, /bookmarks, /settings, and /signup
app.get("/history/:userId", (req, res) => {
  // Return browser history for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send(`User with ID ${userId} not found`);
  }
  const history = user.history;
  res.send(history);
});

app.post("/history/:userId", (req, res) => {
  // Set browser history for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send(`User with ID ${userId} not found`);
  }
  const newHistory = req.body;
  user.history = newHistory;
  saveBrowserState();
  res.send(`Browser history set to ${newHistory}`);
});

app.get("/bookmarks/:userId", (req, res) => {
  // Return browser bookmarks for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send(`User with ID ${userId} not found`);
  }
  const bookmarks = user.bookmarks;
  res.send(bookmarks);
});

app.post("/bookmarks/:userId", (req, res) => {
  // Set browser bookmarks for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send(`User with ID ${userId} not found`);
  }
  const newBookmarks = req.body;
  user.bookmarks = newBookmarks;
  saveBrowserState();
  res.send(`Browser bookmarks set to ${newBookmarks}`);
});

app.get("/settings/:userId", (req, res) => {
  // Return browser settings for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send(`User with ID ${userId} not found`);
  }
  const settings = user.settings;
  res.send(settings);
});

app.post("/settings/:userId", (req, res) => {
  // Set browser settings for the given user
  const userId = req.params.userId;
  const user = browserState.users[userId];
  if (!user) {
    return res.status(404).send("User with ID ${userId} not found");
  }
  const newSettings = req.body;
  user.settings = newSettings;
  saveBrowserState();
  res.send("Browser settings set to ${newSettings}");
});

app.post("/signup", (req, res) => {
  // Create a new user with a unique username and return the user ID
  const userId = uuidv4();
  const username = userId;
  const newUser = {
    username,
    history: [],
    bookmarks: [],
    settings: {},
  };
  browserState.users[userId] = newUser;
  saveBrowserState();
  res.send({ uid: userId });
});

// Save the browser state to file
function saveBrowserState() {
  fs.writeFile(dataFilePath, JSON.stringify(browserState), (err) => {
    if (err) {
      console.error("Error saving browser state:", err);
    } else {
      console.log("Browser state saved to file");
    }
  });
}

// Start the server
var PORT = 8080;
app.listen(PORT, () => {
  console.log("Browser sync API listening on port ${PORT}");
});
