export const role = (...r) => (req, res, next) => (r.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden for your role" }));
