const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const port = 5000;

const monoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://test:sparta@cluster0.tef1s.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", () => {
  console.log("root");
});

app.listen(port, () => {
  console.log("connect server");
});
