const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "sharedbread",
  connectionLimit: 10,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

// get user profile info
app.post("/profile", (req, res) => {
  // get the users info
  const user = req.body;

  const query = "SELECT * FROM UserTable WHERE AuthId = ?";
  db.query(query, user.AuthID, (err, data) => {
    if (err) {
      res.status(500).send(err);

      // if no user is found, add the user to the DB
    } else {
      const query =
        "SELECT Amount, Date, FoodItem FROM UserTable JOIN FoodDonations ON FoodDonations.UserID = UserTable.UserID WHERE AuthID =?";
      db.query(query, user.AuthID, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(data);
        }
      });
    }
  });
});

module.exports.handler = serverless(app);
