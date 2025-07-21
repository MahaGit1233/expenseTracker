const Expenses = require("../modals/Expenses");
const Users = require("../modals/Users");
const db = require("../utils/db-connection");
const { Sequelize } = require("sequelize");

const getPremiumExpenses = async (req, res) => {
  try {
    const leaderboardExpenses = await Expenses.findAll({
      attributes: [
        "UserId",
        [Sequelize.fn("SUM", Sequelize.col("amountSpent")), "totalSpent"],
      ],
      include: [{ model: Users, attributes: ["Name"] }],
      group: ["UserId"],
      order: [[Sequelize.literal("totalSpent"), "DESC"]],
    });

    res.status(200).send(leaderboardExpenses);
  } catch (error) {
    res.status(500).send("Unable to fetch the expenses");
  }
};

module.exports = {
  getPremiumExpenses,
};
