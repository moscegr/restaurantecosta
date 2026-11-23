import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'timon-costa-chica-jwt-dev-secret-change-in-prod';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id.toString(),
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Inicia sesión con tu PIN.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada. Ingresa tu PIN nuevamente.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permiso denegado. Tu rol (${req.user.role}) no tiene acceso a esta acción.`,
      });
    }
    next();
  };
}
