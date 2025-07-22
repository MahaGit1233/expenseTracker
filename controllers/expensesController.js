const { Users } = require("../modals");
const Expenses = require("../modals/Expenses");
const sequelize = require("../utils/db-connection");

const addExpenses = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amountSpent, description, category } = req.body;

    const expense = await Expenses.create(
      {
        amountSpent: amountSpent,
        description: description,
        category: category,
        UserId: req.user.id,
      },
      { transaction: transaction }
    );

    const user = await Users.findByPk(req.user.id, {
      transaction: transaction,
    });

    user.totalAmount += Number(amountSpent);
    await user.save({ transaction: transaction });

    await transaction.commit();
    res.status(201).send(`Expense added successfully`);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error.message);
  }
};

const getExpenses = async (req, res) => {
  try {
    const expense = await Expenses.findAll({
      where: { UserId: req.user.id },
    });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).send("Unable to fetch the expenses");
  }
};

const deleteExpenses = async (req, res) => {
  try {
    const transaction = await sequelize.transaction();

    const { id } = req.params;
    const expense = await Expenses.findOne({
      where: {
        id: id,
        UserId: req.user.id,
      },
      transaction: transaction,
    });

    if (expense === 0) {
      await transaction.rollback();
      return res.status(404).send("Expense not found");
    }

    const subtractAmount = expense.amountSpent;
    await expense.destroy({ transaction: transaction });

    const user = await Users.findByPk(req.user.id, {
      transaction: transaction,
    });
    user.totalAmount -= Number(subtractAmount);
    await user.save({ transaction: transaction });

    await transaction.commit();
    res.status(200).send("Expense is deleted");
  } catch (error) {
    await transaction.rollback();
    res.status(500).send("Error encountered deleting expense");
  }
};

module.exports = {
  addExpenses,
  getExpenses,
  deleteExpenses,
};
