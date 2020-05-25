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


app.post("/createuser", (req, res) => {

  // get the users data
  const user = req.body;

  const query = "SELECT * FROM UserTable WHERE AuthId = ?";
  db.query(query, user.AuthID, (err, data) => {
    if (err) {
      res.status(500).send(err);

      // if no user is found, add the user to the DB
    } else if (!data.length) {
      const query =
        "INSERT INTO UserTable (FirstName, AuthID ) VALUES (?, ?)";
      db.query(
        query,
        [user.FirstName, user.AuthID],
        (newErr, newData) => {
          if (newErr) {
            res.status(500).send(newErr);
          } else {
            res.status(201).send("User Added");
          }
        }
      );
    }
  });
});

module.exports.handler = serverless(app);
