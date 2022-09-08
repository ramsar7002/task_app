const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelocomeEmail, sendCancelEmail } = require("../emails/account");

const router = new express.Router();
const upload = multer({
  limits: {
    fileSize: process.env.MAX_FILE_SIZE,
  },
  fileFilter(req, file, cb) {
    const typeOptions = ["jpg", "jpeg", "png"];
    const fileType = file.originalname.split(".")[1];

    if (!typeOptions.includes(fileType)) {
      return cb(new Error("File must be a image"));
    }
    cb(undefined, true);
  },
});

router.post("/users", async (req, res, next) => {
  try {
    const userExist = await User.find({ email: req.body.email });

    if (userExist.length !== 0) {
      return res.status(400).send("User already exist!");
    }
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    sendWelocomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/users/me", auth, async function (req, res, next) {
  res.send({ user: req.user, token: req.token });
});

router.put("/users/me", auth, async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send("Invalid fields");
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/users/login", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(401).send("User unauthorized");
    }

    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (err) {
    res.status(401).send(err);
  }
});

router.delete("/users/me", auth, async (req, res, next) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }

  //   const user = User.findByIdAndDelete({});
});

router.post("/users/logout", auth, async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token != req.token
    );
    await req.user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/users/logoutall", auth, async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Successfully disconnected from all devices");
  } catch (err) {
    res.status(500).send();
  }
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res, next) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/users/:id/avatar", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
