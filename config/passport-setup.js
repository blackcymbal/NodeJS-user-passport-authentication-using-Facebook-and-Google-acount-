const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const FacebookStrategy = require("passport-facebook");
const keys = require("./keys");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      //options for the google start
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          // if not, create user in our db
          new User({
            googleId: profile.id,
            username: profile.displayName,
            thumbnail: profile._json.picture,
          })
            .save()
            .then((newUser) => {
              console.log("created new user: ", newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      // options for google strategy
      clientID: keys.google.client_id_fb,
      clientSecret: keys.google.clientSecret_fb,
      callbackURL: "/auth/facebook/secrets",
    },
    (accessToken, refreshToken, public_profile, done) => {
      // check if user already exists in our own db
      console.log(public_profile);
      User.findOne({ facebookId: public_profile.id }).then((currentUser2) => {
        if (currentUser2) {
          // already have this user
          console.log("user is: ", currentUser2);
          done(null, currentUser2);
        } else {
          // if not, create user in our db
          new User({
            facebookId: public_profile.id,
            username: public_profile.displayName,
            thumbnail: public_profile._json.picture,
          })
            .save()
            .then((newUser) => {
              console.log("created new user: ", newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);
