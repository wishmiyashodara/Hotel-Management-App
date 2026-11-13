const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'admin@test.com' });
    if (user) {
      user.password = 'admin123';
      await user.save();
      console.log('Password for admin@test.com has been reset to: admin123');
    } else {
      console.log('User admin@test.com not found.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
