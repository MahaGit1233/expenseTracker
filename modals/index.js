const Users = require("./Users");
const Expenses = require("./Expenses");
const Orders = require("./Orders");
const ForgotPassword = require("./ForgotPassword");

Users.hasMany(Expenses);
Expenses.belongsTo(Users);

Users.hasMany(Orders);
Orders.belongsTo(Users);

Users.hasMany(ForgotPassword);
ForgotPassword.belongsTo(Users);

module.exports = {
  Users,
  Expenses,
  Orders,
  ForgotPassword,
};
