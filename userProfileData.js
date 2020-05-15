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

app.get('/profile/:userId', (request, response) => {
  const { userId } = request.params;


  db.query('SELECT * FROM UserTable', (err, data) => {
    if (err) {
      console.log('Error from MySQL', err);
      response.status(500).send(err);
    } else {
      response.status(200).send(data);
    }
  });
});



module.exports.handler = serverless(app);