const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/", paymentController.processPayment);
router.get("/status/:orderId", paymentController.paymentStatus);
router.get("/:orderId", (req, res) => {
  res.send(`<h2>Thank you! Your order has been processed.</h2>`);
});

module.exports = router;
