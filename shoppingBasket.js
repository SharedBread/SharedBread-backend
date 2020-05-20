const serverless = require("serverless-http");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'sharedbread',
  connectionLimit: 10,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

 
app.get('/basket', function (request, response) {

  const data = request.body;

  db.query(`SELECT * FROM ShoppingBasket WHERE UserID=?`, [data.UserID], function (err, data) {
    if (err) {
      console.log("Error from MYSQL", err);
      response.status(500).send(err);
    } else {
      response.status(200).send(data);
    }
  });
});



app.post('/basket', function (request, response) {

  const data = request.body;

  //chaing get, post and delete into one 
  //add items into FoodDonations table from ShoppingBasket table , SELECT FoodItem FROM ShoppingBasket WHERE UserID=? 
  const query = `INSERT INTO FoodDonations (FoodItem, Date, Amount, UserID) VALUES (?, ?, ?, ?) `;
  db.query(
    query,
    [data.FoodItem, data.Date, data.Amount, data.UserID, data.ID],
    function (err, results) {
      if (err) {
        console.log("Error from MySQL", err);
        response.status(500).send(err);
      } else {

        db.query("DELETE FROM ShoppingBasket WHERE ID=?", data.ID, (err) => {
          if (err) {
            console.log("Error from MySQL", err);
            response.status(500).send(err);
          } else {

            const query = `SELECT * FROM ShoppingBasket WHERE UserID =?`;
            db.query(query, [data.UserID], (err, results) => {
              if (err) {
                console.log("Error from MySQL", err)
                response.status(500).send(err)
              } else {
                response.status(200).send(results)
              }
            })
          }
        })
      }
    }
  );
});


app.delete('/basket', function (request, response) {
  
  const data = request.body

  const query = "DELETE FROM ShoppingBasket WHERE ID= ?";
  db.query(query, [data.ID], (err, data) => {
    if (err) {
      console.log("Error from MySQL", err);
      response.status(500).send(err);
    } else {

      const query = `SELECT * FROM ShoppingBasket WHERE UserID =?`;
      db.query(query, [data.UserID], (err, results) => {
        if (err) {
          console.log("Error from MySQL", err)
          response.status(500).send(err)
        } else {
          response.status(200).send(results)
        }
      })
    }
  });
});


module.exports.handler = serverless(app);