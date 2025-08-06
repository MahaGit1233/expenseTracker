const { Sequelize } = require("sequelize");

console.log("db name:", process.env.DB_NAME);
console.log("db password:", process.env.DB_PASSWORD);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database is created");
  } catch (error) {
    console.log(error);
  }
})();

module.exports = sequelize;
