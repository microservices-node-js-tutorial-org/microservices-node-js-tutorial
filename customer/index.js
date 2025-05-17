const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ msg: "Hello from customer" });
});

app.listen(8001, () => console.log("Listening on port 8001"));
