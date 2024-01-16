const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: String, 
  email: String,
  username: String, 
  accessToken: String,
  avatarUrl: String, 
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
