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


app.get('/basket', function (request, response){
  
  db.query("SELECT * FROM ShoppingBasket", function(err, data){
    if(err){
      console.log("Error from MYSQL", err);
      response.status(500).sendFile(err);
    }else {
      response.status(200).send(data);
    };
  });
});



module.exports.handler = serverless(app);