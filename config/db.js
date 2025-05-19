// config/db.js

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

let cachedClient;

async function connectToDB() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(uri, {
    tls: true,                            // ✅ Required for MongoDB Atlas
    tlsAllowInvalidCertificates: false,  // ✅ Ensure secure connection
    retryWrites: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedClient = client.db(); // use default DB from URI (/villa_booking)
  return cachedClient;
}

module.exports = connectToDB;
