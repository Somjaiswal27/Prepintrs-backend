const mongoose = require("mongoose");

const Interview = new mongoose.Schema({
  userID: {
    type: String,
    require: true,
  },
  body: {
    type: String,
    require: true,
  },
  interviewID: {
    type: String,
    require: true,
  },
  thread: {
    type: String,
    require: true,
  },
  stage: String,
  roundIndex: Number,
  Hardness: String,
  Experience: String,
  interviewName: String,
  interviewType: {
    type: String,
    require: true,
  },
  customPrompt: String,
  programmingLanguage: String,
  JD: String,
  interviewLink: String,
  topicsToBeCovered: [String],
});

module.exports = Interview;
