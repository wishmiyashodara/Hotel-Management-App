const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({}, 'name email password');
    console.log('Registered Users:');
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
