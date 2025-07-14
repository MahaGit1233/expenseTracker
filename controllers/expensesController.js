const Expenses = require("../modals/Expenses");
const db = require("../utils/db-connection");

const addExpenses = async (req, res) => {
  try {
    const { amountSpent, description, category } = req.body;

    const expense = await Expenses.create({
      amountSpent: amountSpent,
      description: description,
      category: category,
    });

    res.status(201).send(`Expense added successfully`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getExpenses = async (req, res) => {
  try {
    const expense = await Expenses.findAll();
    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send("Unable to fetch the expenses");
  }
};

const deleteExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expenses.destroy({
      where: {
        id: id,
      },
    });

    if (expense === 0) {
      return res.status(404).send("Expense not found");
    }

    res.status(200).send("Expense is deleted");
  } catch (error) {
    res.status(500).send("Error encountered deleting expense");
  }
};

module.exports = {
  addExpenses,
  getExpenses,
  deleteExpenses,
};
