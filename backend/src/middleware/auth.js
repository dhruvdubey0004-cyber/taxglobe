const jwt = require('jsonwebtoken');

// Permissive auth middleware: parses token if valid, allows guests/expired tokens without breaking the app
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'taxglobe_secret_123';
    req.user = jwt.verify(token, secret);
    next();
  } catch (e) {
    // Expired or invalid token: set user to null so public features (treaties, calculator, simulator) keep working
    req.user = null;
    next();
  }
};
