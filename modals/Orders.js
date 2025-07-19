const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Orders = sequelize.define("Orders", {
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: "INR",
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
  },
  payment_session_id: {
    type: DataTypes.STRING,
  },
  customer_id: {
    type: DataTypes.STRING,
  },
  customer_phone: {
    type: DataTypes.STRING,
  },
  order_expiry_time: {
    type: DataTypes.DATE,
  },
});

module.exports = Orders;
