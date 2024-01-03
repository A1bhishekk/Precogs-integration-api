const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: String, // GitHub user ID
  username: String, // GitHub username
  accessToken: String, // GitHub access token
  avatarUrl: String, // GitHub avatar URL
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
