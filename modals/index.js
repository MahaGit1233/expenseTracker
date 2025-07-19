const Users = require("./Users");
const Expenses = require("./Expenses");
const Orders = require("./Orders");

Users.hasMany(Expenses);
Expenses.belongsTo(Users);

Users.hasMany(Orders);
Orders.belongsTo(Users);

module.exports = {
  Users,
  Expenses,
  Orders,
};
