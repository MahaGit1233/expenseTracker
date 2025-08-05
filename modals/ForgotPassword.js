const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const ForgotPassword = sequelize.define("ForgotPasswordRequests", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ForgotPassword;
