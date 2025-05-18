const { CUSTOMER_BINDING_KEY } = require("../config");
const ShoppingService = require("../services/shopping-service");
const {
  PublishCustomerEvent,
  SubscribeMessage,
  PublishMessage,
} = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new ShoppingService();
  // By default we use the shopping binding key because the shopping service would be listening
  // on its own binding_key route (defined in the function itself)
  SubscribeMessage(channel, service);
  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnId } = req.body;

    try {
      const { data } = await service.PlaceOrder({ _id, txnId });

      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");
      // use the CUSTOMER_BINDING_KEY because we are sending the payload to the customer
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const { data } = await service.GetCard(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
