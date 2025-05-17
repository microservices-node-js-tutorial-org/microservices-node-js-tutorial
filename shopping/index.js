const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ msg: "Hello from shopping" });
});

app.listen(8003, () => console.log("Listening on port 8003"));
