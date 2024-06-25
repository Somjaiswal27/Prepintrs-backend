const express = require("express");
const User = require("./Schemas/User");
const router = express.Router();
const Interview = require("./Schemas/Interview");
router.post("/create", (req, res) => {
  const body = req.body;
  var desc;
  if (body.interviewType == "JD Based") {
    body = `${shorten(req.body.JD, 100)}...`;
    console.log(body);
  } else if (body.interviewType == "Custom") {
  }
  const newInterview = new Interview({});
});
module.exports = router;
