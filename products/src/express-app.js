const express = require("express");
const cors = require("cors");
const { products, appEvents } = require("./api");
const HandleErrors = require("./utils/error-handler");

module.exports = async (app, channel) => {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cors());
  app.use(express.static(__dirname + "/public"));

  // listeners
  // appEvents(app); old way we were passing the events from one service to another

  //api
  products(app, channel); // new way - use the channel

  // error handling
  app.use(HandleErrors);
};
