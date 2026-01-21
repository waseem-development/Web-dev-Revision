const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/friendly", (req, res) => {
  res.send("I am here man");
});
app.get("/waseem", (req, res) => {
  res.send(
    '<h1 style="background-color: black; color: white;">Hey I am Waseem broooooooooo </h1>',
  );
});
app.get("/naeem", () => {
  res.send(
    '<h2 style="background-color: red; color: white;">I am a h2 element</h1>',
  );
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
