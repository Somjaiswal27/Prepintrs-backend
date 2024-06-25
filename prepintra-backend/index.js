const express = require("express");
const mongoose = require("mongoose");
const User = require("./Schemas/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");
const app = express();
const MongoStore = require("connect-mongo");
require("dotenv").config();
const OpenAI = require("openai");

// Every middle ware being used
const uri = `mongodb+srv://${process.env.MONGOOSE_USERNAME}:${process.env.MONGOOSE_PASSWORD}@prepintra-cluster.rxo0do4.mongodb.net/?retryWrites=true&w=majority&appName=Prepintra-cluster`;
mongoose.connect(uri);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust to match the client's origin
    credentials: true, // Critical for cookies to be sent back and forth
  })
);
app.use(
  session({
    secret: "gjlbljkjkl",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: uri,
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 * 30 }, // Cookie expires after one month (30 days)
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, function (
    email,
    password,
    done
  ) {
    User.findOne({ email: email })
      .exec()
      .then(function (user, err) {
        if (err) {
          console.log(err);
          return done(null, false, { message: "Error on the server." });
        }
        if (!user) {
          return done(null, false, {
            message: "Account from this email doesn't exist.",
          });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: "The password is incorrect." });
        }
        return done(null, user);
      });
  })
);

// Google authentication setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ googleId: profile.id })
        .exec()
        .then(function (user, err) {
          if (err) {
            return done(null, false, { message: "Error on the server." });
          }
          if (!user) {
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            });
            user.save().then(function (err) {
              if (err)
                return done(null, false, { message: "Error saving the user." });
              return done(null, user);
            });
          } else {
            return done(null, user);
          }
        });
    }
  )
);

// Serializing and deserializing user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    if (!user) {
      return done("user not found");
    }
    done(null, user);
  });
});
// passport setup

const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const saltRounds = 12;
const key = "123456";
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/"); // To the frontend part
  }
);

app.post("/login", (req, res) => {
  const body = req.body;

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.send({ hasError: true, error: "Error on the server." });
    }
    if (!user) {
      return res.send({ hasError: true, error: info.message });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.send({ hasError: true, error: "Error logging in." });
      }
      return res.send({ hasError: false });
    });
  })(req, res);
});
app.get("/authenticated", function (req, res) {
  return res.send({ authenticated: req.isAuthenticated(), user: req.user });
});
app.get("/currentuser", function (req, res) {
  console.log(req.user);
  return res.send({ user: req.user });
});
app.post("/userbyuid", async function (req, res) {
  const user = await User.findById(req.body.uid);

  return res.send({ user: user });
});

app.post("/register", (req, res) => {
  const { email, password, name } = req.body;

  User.exists({ email: email }).then((existingUser) => {
    if (existingUser) {
      return res.send({
        hasError: true,
        error: "The account with this email exists.",
      });
    }
    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if (err) {
        return res.send({
          hasError: true,
          error: "Error hashing the password.",
        });
      }
      const newUser = new User({
        email,
        password: hashedPassword,
        name,
      });
      newUser.save().then((doc) => {
        return res.send({ hasError: false });
      });
    });
  });
});
app.post("/updateUser", (req, res) => {
  User.updateOne({ _id: req.body._id }, req.body)
    .then((result) => {
      if (result) {
        res.send({
          hasError: false,
        });
      }
    })
    .catch((e) => {
      res.send({ hasError: true, error: e });
    });
});
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});
// all the route inside InterviewRoutes would be added with /interview/route
const interviewRoutes = require("./InterviewRoutes");
app.use("/interview", interviewRoutes);

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
