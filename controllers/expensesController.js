const { Users } = require("../modals");
const Expenses = require("../modals/Expenses");
const sequelize = require("../utils/db-connection");
const AWS = require("aws-sdk");

function uploadToS3(data, filename) {
  const BUCKET_NAME = "mahaexpensetracker1";
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  console.log("iam user key", IAM_USER_KEY);
  console.log("iam secret key", IAM_USER_SECRET);

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("something went wrong", err);
        reject(err);
      } else {
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  });
}

const downloadExpenses = async (req, res) => {
  const expenses = await req.user.getExpenses();
  console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  const filename = `Expense${req.user.id}/${new Date()}.txt`;
  const fileUrl = await uploadToS3(stringifiedExpenses, filename);
  res.status(200).json({ fileUrl, success: true });
};

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
  const limit = +req.query.limit || 10;

  try {
    const totalItems = await Expenses.count({ where: { UserId: req.user.id } });
    const expense = await Expenses.findAll({
      where: { UserId: req.user.id },
      offset: (page - 1) * limit,
      limit: limit,
    });
    res.status(200).json({
      expense,
      currentPage: page,
      hasNextPage: limit * page < totalItems,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / limit),
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
  downloadExpenses,
};
