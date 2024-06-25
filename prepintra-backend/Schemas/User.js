const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  about: {
    type: String,
  },
  weakness: {
    type: [String],
  },
  power: {
    type: [String],
  },
  openaiResumeID: {
    type: String,
  },
  resumeFileID: {
    type: String,
  },
  interview: [
    {
      interviewID: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      stage: {
        type: Number,
      },
      JD: {
        type: String,
      },
      customPrompt: { type: String },
      topicToBeCovered: {
        type: [String],
      },
      programmingLanguage: {
        type: String,
      },
      experience: {
        type: String,
      },
      hardness: {
        type: String,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Export the model
module.exports = User;
