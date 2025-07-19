const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  "TEST430329ae80e0f32e41a393d78b923034",
  "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

exports.createOrder = async (
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerId,
  customerPhone
) => {
  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const formattedExpiryDate = expiryDate.toISOString();

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,

      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
      },

      order_meta: {
        return_url: `http://localhost:4000/payment/${orderId}`,
        payment_methods: "ccc,upi,nb",
      },
      order_expiry_time: formattedExpiryDate,
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data.payment_session_id;
  } catch (error) {
    console.log("Error creating order:", error.message);
  }
};

exports.getPaymentStatus = async (orderId) => {
  try {
    console.log("orderId:", orderId);
    const response = await cashfree.PGOrderFetchPayments(orderId);

    let getOrderResponse = response.data;
    let orderStatus;

    if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "SUCCESS"
      ).length > 0
    ) {
      return (orderStatus = "Success");
    } else if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "PENDING"
      ).length > 0
    ) {
      return (orderStatus = "Pending");
    } else {
      return (orderStatus = "Failure");
    }
  } catch (error) {
    console.log("Error fetching order status:", error.message);
    return "Error";
  }
};
