const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'admin@test.com' });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('Successfully updated admin@test.com to admin role.');
    } else {
      console.log('User admin@test.com not found.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
