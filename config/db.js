// config/db.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db('villa_booking'); // You can name your DB anything
  }
  return db;
}

module.exports = connectToDB;
