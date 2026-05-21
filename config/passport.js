import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
import {
  Strategy as GoogleStrategy
} from "passport-google-oauth20";

import User from "../models/User.js";



passport.use(

  new GoogleStrategy(

    {

      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
"https://authentication-ejs.onrender.com/auth/google/callback",

    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {

      try {

        let user =
          await User.findOne({

            email:
              profile.emails[0].value,

          });

        // CREATE USER

        if (!user) {

          user =
            await User.create({

              name:
                profile.displayName,

              email:
                profile.emails[0].value,

              password:
                "google-auth-user",

            });

        }

        done(null, user);

      } catch (error) {

        done(error, null);

      }

    }

  )

);



/* =====================================
   SERIALIZE USER
===================================== */

passport.serializeUser(

  (user, done) => {

    done(null, user.id);

});

/* =====================================
   DESERIALIZE USER
===================================== */

passport.deserializeUser(

  async (id, done) => {

    const user =
      await User.findById(id);

    done(null, user);

});
