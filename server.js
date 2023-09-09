// server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// MongoDB connection string
const uri = 'mongodb://localhost:27017';

// MongoDB client
const client = new MongoClient(uri);

const dbname = 'user_info_db';

async function main(){
  await client.connect();
  console.log("Connected");
  const db = client.db(dbname);
  const collection = db.collection('users');

  return 'done';
}

// Call the main function to establish the MongoDB connection
main()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

app.post('/api/insertdata', async(req, res)=>{
  const {userId, userName, userEmail} = req.body;

  try {
    const db = client.db(dbname);
    const collection = db.collection('users');
    const result = await collection.insertOne({userId, userName, userEmail});
    res.status(201).json(result.ops[0]);
  } catch (error) {
    
  }
})

// Define your API routes and handle database operations here


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


