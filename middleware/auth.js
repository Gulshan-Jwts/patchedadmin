const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const publicPaths = ["/login"];

  const path = req.path;

  if (publicPaths.includes(path)) {
    return next();
  }

  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    return next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};