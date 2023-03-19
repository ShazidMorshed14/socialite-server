const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../valuekeys.js");
const User = require("../Models/User/user.jsx");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  //console.log(authorization);

  if (!authorization) {
    return res.status(409).json({ error: "You Must Signin First" });
  } else {
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(409).json({ error: "You Must Signin First" });
      } else {
        const { _id } = payload;
        //console.log(_id);

        User.findOne({ _id: _id })
          .then((foundUser) => {
            if (foundUser) {
              req.user = foundUser;
              next();
            } else {
              return res.status(404).json({ error: "No user exists" });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
};
