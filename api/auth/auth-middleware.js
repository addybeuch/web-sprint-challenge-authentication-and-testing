const { findBy } = require("../users/users-model");

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const check = await findBy({ username }).first();
  if (!check) {
    res.status(401).json({ message: "username taken" });
  } else {
    next();
  }
};

module.exports = {
  checkUsernameExists,
};
