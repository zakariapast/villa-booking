// config/db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db('villa_booking');
  }
  return db;
}

module.exports = connectToDB;
