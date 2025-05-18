const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  MESSAGE_BROKER_URL,
  CUSTOMER_BINDING_KEY,
  PRODUCT_BINDING_KEY,
  EXCHANGE_NAME,
  QUEUE_NAME,
  SHOPPING_BINDING_KEY,
} = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

// message broker

// create a channel

module.exports.CreateChannel = async () => {
  try {
    // connect to the rabbitMQ server
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    // create a channel inside the connection
    const channel = await connection.createChannel();
    // declare an exchange inside the channel
    // EXCHANGE_NAME -> name of the exchange that is created
    // direct -> exchange type, routes messages based on a exact match between the routing key and the binding key
    // false -> exahcnge is not durable, won't survive a message broker restart
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (error) {
    throw error;
  }
};

// publish a message

module.exports.PublishMessage = async (channel, binding_key, messages) => {
  try {
    console.log("Message has been sent: ", messages);
    // publishes a message to the exchange
    // publish on the exachange with name EXCHANGE_NAME and route the message using the binding_key
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(messages));
  } catch (error) {
    throw error;
  }
};

// subscribe to messages

module.exports.SubscribeMessage = async (channel, service) => {
  // declare a queue with name of QUEUE_NAME
  // the queue name for each service would be ${service_name}_QUEUE
  // each service would create its own queue where it would listen for incoming messages
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  // binds the  queue to the exchange using the binding key
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);
  // start listening for messages on the given queue
  channel.consume(appQueue.queue, (data) => {
    // the callback is executed each time a message arrives
    console.log("Received data in SHOPPING SERVICE");
    console.log(data.content.toString());
    service.SubscribeEvents(data.content.toString());
    channel.ack(data);
  });
};
