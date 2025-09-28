const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // nếu là admin thì qua luôn
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }

    // nếu là chính chủ (id trong token == id trong params) thì cũng cho phép
    if (req.user && req.params.id && parseInt(req.params.id) === req.user.id) {
      return next();
    }

    return res.status(403).json({ message: "Access denied" });
  };
};
module.exports = roleMiddleware;