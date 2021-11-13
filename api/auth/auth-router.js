const Users = require("../users/users-model");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const jwt = require("jsonwebtoken");
const {
  checkUsernameExists,
  checkUsernameAvailable,
} = require("./auth-middleware");

router.post("/register", checkUsernameAvailable, (req, res, next) => {
  if (req.body.username && req.body.password) {
    let user = req.body;
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcrypt.hashSync(user.password, rounds);
    user.password = hash;

    Users.add(user)
      .then((saved) => {
        res.status(201).json(saved);
      })
      .catch(next);
  } else {
    res.status(400).json({ message: "username and password required" });
  }
});

router.post("/login", checkUsernameExists, (req, res, next) => {
  if (req.body.username && req.body.password) {
    let { username, password } = req.body;

    Users.findBy({ username })
      .then(([user]) => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = buildToken(user);
          res.status(200).json({
            message: `${user.username} is back`,
            token,
          });
        } else {
          next({ status: 401, message: "Invalid Credentials" });
        }
      })
      .catch(next);
  } else {
    res.status(400).json({ message: "username and password required" });
  }
});

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
