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

app.get("/basket/:id", function (request, response) {
  const { id } = request.params;

  db.query("SELECT * FROM UserTable WHERE AuthID = ?", [`${id}`], function (
    err,
    data
  ) {
    if (err) {
      console.log("Error from MYSQL", err);
      response.status(500).send(err);
    } else {
      db.query(
        `SELECT * FROM ShoppingBasket WHERE UserID=?`,
        [`${data[0].UserID}`],
        function (err, result) {
          if (err) {
            console.log("Error from MYSQL", err);
            response.status(500).send(err);
          } else {
            response.status(200).send(result);
          }
        }
      );
    }
  });
});

app.post("/basket", function (request, response) {
  const data = request.body;

  db.query(
    "SELECT * FROM UserTable WHERE AuthID = ?",
    [`${data.AuthID}`],
    function (err, results) {
      if (err) {
        console.log("Error from MYSQL", err);
        response.status(500).send(err);
      } else {
        //chaing get, post and delete into one
        //add items into FoodDonations table from ShoppingBasket table , SELECT FoodItem FROM ShoppingBasket WHERE UserID=?
        const query = `INSERT INTO FoodDonations (FoodItem, Date, Amount, UserID) VALUES (?, ?, ?, ?) `;
        db.query(
          query,
          [data.FoodItem, data.Date, data.Amount, results[0].UserID, data.ID],
          function (err, results) {
            if (err) {
              console.log("Error from MySQL", err);
              response.status(500).send(err);
            } else {
              db.query(
                "DELETE FROM ShoppingBasket WHERE ID=?",
                data.ID,
                (err) => {
                  if (err) {
                    console.log("Error from MySQL", err);
                    response.status(500).send(err);
                  } else {
                    const query = `SELECT * FROM ShoppingBasket WHERE UserID =?`;
                    db.query(query, [data.UserID], (err, results) => {
                      if (err) {
                        console.log("Error from MySQL", err);
                        response.status(500).send(err);
                      } else {
                        response.status(200).send(results);
                      }
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.delete("/basket/:id", function (request, response) {
  const { id } = request.params;

  const query = "DELETE FROM ShoppingBasket WHERE ID= ?";
  db.query(query, [id], (err, data) => {
    if (err) {
      console.log("Error from MySQL", err);
      response.status(500).send(err);
    } else {
      response.status(200).send("deleted");
    }
  });
});

module.exports.handler = serverless(app);
