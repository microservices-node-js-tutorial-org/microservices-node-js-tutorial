const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ msg: "Hello from products" });
});

app.listen(8002, () => console.log("Listening on port 8002"));
