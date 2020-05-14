const serverlessHTTP = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/basket', (req, res) => {
  res.send("Success!");
})



module.exports.handler = serverless(app);