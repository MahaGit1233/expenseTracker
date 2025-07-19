const db = require("../utils/db-connection");

const {
  createOrder,
  getPaymentStatus,
} = require("../services/paymentServices");
const { Orders, Users } = require("../modals");

const processPayment = async (req, res) => {
  const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerId = "1";
  const customerPhone = "9999999999";

  try {
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerId,
      customerPhone
    );

    if (paymentSessionId) {
      await Orders.create({
        order_id: orderId,
        user_id: parseInt(customerId),
        amount: orderAmount,
        currency: orderCurrency,
        status: "Pending",
        payment_session_id: paymentSessionId,
        customer_id: customerId,
        customer_phone: customerPhone,
        order_expiry_time: new Date(Date.now() + 60 * 60 * 1000),
      });

      return res
        .status(200)
        .json({ payment_session_id: paymentSessionId, order_id: orderId });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to create payment session" });
    }
  } catch (error) {
    console.error("Error in processPayment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const status = await getPaymentStatus(orderId);
    console.log("Status:", status);

    const order = await Orders.findOne({ where: { order_id: orderId } });

    if (order) {
      order.status = status.toUpperCase();
      await order.save();
    }

    if (status === "Success") {
      const user = await Users.findByPk(order.user_id);
      if (user) {
        user.premium = true;
        await user.save();
      }
    }

    switch (status) {
      case "Success":
        return res
          .status(200)
          .json({ message: "Transaction successful", status });
      case "Pending":
        return res.status(200).json({ message: "Transaction pending", status });
      case "Failure":
        return res.status(200).json({ message: "Transaction failed", status });
      case "NoTransaction":
        return res
          .status(404)
          .json({ message: "No transactions found", status });
      case "Error":
        return res
          .status(500)
          .json({ message: "Could not retrieve transaction status", status });
      default:
        return res.status(500).json({ message: "Unexpected error", status });
    }
  } catch (error) {
    console.error("Error checking payment status:", error.message);
    res
      .status(500)
      .json({ error: "Something went wrong while checking payment status" });
  }
};

module.exports = {
  processPayment,
  paymentStatus,
};
