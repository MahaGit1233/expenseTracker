const Expenses = require("../modals/Expenses");
const Users = require("../modals/Users");
const db = require("../utils/db-connection");
const { Sequelize } = require("sequelize");

const getPremiumExpenses = async (req, res) => {
  try {
    const leaderboardExpenses = await Users.findAll({
      attributes: ["name", "totalAmount"],
      order: [["totalAmount", "DESC"]],
    });

    res.status(200).json(leaderboardExpenses);
  } catch (error) {
    res.status(500).send("Unable to fetch the expenses");
  }
};

module.exports = {
  getPremiumExpenses,
};
