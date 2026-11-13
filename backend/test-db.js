const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = "mongodb://Ima_db_user:Imasha%402001@ac-xbgerh3-shard-00-00.uc3bomy.mongodb.net:27017,ac-xbgerh3-shard-00-01.uc3bomy.mongodb.net:27017,ac-xbgerh3-shard-00-02.uc3bomy.mongodb.net:27017/hotelDB?ssl=true&replicaSet=atlas-onj35r-shard-0&authSource=admin";
console.log('Testing connection to:', uri.replace(/\/\/.*@/, '//<user>:<pass>@'));

mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect:', err);
    process.exit(1);
  });
