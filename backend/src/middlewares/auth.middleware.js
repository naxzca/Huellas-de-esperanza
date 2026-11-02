const jwt = require('jsonwebtoken');

exports.requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Debes iniciar sesión.' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Esta acción requiere permisos de administrador.' });
    }
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'La sesión no es válida o expiró.' });
  }
};
