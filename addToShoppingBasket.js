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

app.post('/addToBasket', (req, res) => {
  
  // get the body info
  const body = req.body;

  db.query('SELECT * FROM UserTable WHERE AuthID =?', body.AuthID, (err, data) => {
    if (err) {
      console.log('Error from MySQL', err);
      res.status(500).send(err);
    } else {
      const query = "INSERT INTO ShoppingBasket (FoodItem, UserID) VALUES (?, ?)"
      db.query(query, [body.FoodItem, data[0].UserID], (newErr, data) => {
        if (newErr) {
          res.status(500).send(newErr)
        } else {
          res.status(200).send(data);
        }
         
      }) 
    }
  });
});



module.exports.handler = serverless(app);