const { Users } = require("../modals");
const Expenses = require("../modals/Expenses");
const sequelize = require("../utils/db-connection");

const addExpenses = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amountSpent, description, category, date } = req.body;

    const expense = await Expenses.create(
      {
        amountSpent: amountSpent,
        description: description,
        category: category,
        date: date,
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
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error.message);
  }
};

const getExpenses = async (req, res) => {
  const page = +req.query.page || 1;
  const itemsPerPage = 10;

  try {
    const totalItems = await Expenses.count({ where: { UserId: req.user.id } });
    const expense = await Expenses.findAll({
      where: { UserId: req.user.id },
      offset: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
    });
    res.status(200).json({
      expense,
      currentPage: page,
      hasNextPage: itemsPerPage * page < totalItems,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / itemsPerPage),
    });
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
