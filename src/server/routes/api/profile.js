const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Validation Load
const validateProfileInput = require("../validation/profile");
const validateExperienceInput = require("../validation/experience");
const validateEducationInput = require("../validation/education");

//Load Profile Model
const Profile = require("../../models/Profile");

//Load User Profile
const User = require("../../models/User");

// @route  GET/api/profile/test
// @desc   Test profile route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

// @route  GET/api/profile
// @desc   Get current users profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user.";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route  POST/api/profile
// @desc   Add profile to the user
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    //Check Validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(404).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.company) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //Skills-  split into array
    if (typeof req.body.skills != undefined)
      profileFields.skills = req.body.skills.split(",");

    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          {
            useFindAndModify: false,
            new: true,
            upsert: true,
          }
        ).then((profile) => res.json(profile));
      } else {
        //Create
        //if handle exist
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          //Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
