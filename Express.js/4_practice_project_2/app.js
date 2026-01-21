require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, "./data/data.txt");
const imagePath = path.join(__dirname, "./images/samurai.png");
const videoPath = path.join(__dirname, "./videos/sample.mp4");

// Home route
app.get("/", (req, res) => {
  console.log("url =", req.url);
  console.log("method =", req.method);
  res.send("Welcome to the Home Page");
});

// Data route
app.get("/data", async (req, res) => {
  try {
    const content = await fs.readFile(dataPath, "utf8");
    res.type("text/plain").send(content);
  } catch (err) {
    res.status(500).send("Failed to read data file");
  }
});

// Image route
app.get("/image", async (req, res) => {
  try {
    const image = await fs.readFile(imagePath);
    res.type("image/png").send(image);
  } catch (err) {
    res.status(500).send("Failed to read image");
  }
});

// Video route
app.get("/video", async (req, res) => {
  try {
    const video = await fs.readFile(videoPath);
    res.type("video/mp4").send(video);
  } catch (err) {
    res.status(500).send("Failed to read video");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Localhost server is running at PORT ${PORT}`);
});
