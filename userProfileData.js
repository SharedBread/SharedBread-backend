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
app.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;
  // get the new users info
  const newUser = req.body;

  const query = "SELECT * FROM UserTable WHERE AuthId = ?";
  db.query(query, userId, (err, data) => {
    if (err) {
      res.status(500).send(err);

    // if no user is found, add the user to the DB
    } else if (!data.length) {
      const query =
        "INSERT INTO UserTable (FirstName, PostCode, AuthID ) VALUES (?, ?, ?)";
      db.query(
        query,
        [newUser.FirstName, newUser.PostCode, newUser.AuthID],
        (newErr, newData) => {
          if (newErr) {
            res.status(500).send(newErr);
          } else {
            res.status(200).send('User Added');
          }
        }
      );
    } else {
      const query = "SELECT * FROM FoodDonations WHERE UserID = ?"
      db.query(query, data[0].UserID, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(data);
        }
      })
      
    }
  });
});

module.exports.handler = serverless(app);
