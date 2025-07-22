const { Users } = require("../modals");
const sequelize = require("../utils/db-connection");
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const client = Sib.ApiClient.instance;

const apikey = client.authentications["api-key"];
console.log("loaded api_key:", process.env.API_KEY);
apikey.apikey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: "maharush5409@gmail.com",
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetLink = `http://localhost:3000/password/resetpassword/${user.id}`;

    tranEmailApi.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "Rest password link",
      htmlContent: `
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <a href=${resetLink}>Reset Password</a>
        `,
    });

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  forgotPassword,
};
