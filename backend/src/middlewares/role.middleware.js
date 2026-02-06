exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak (Admin only)" });
  }
  next();
};

exports.asesiOnly = (req, res, next) => {
  if (req.user.role !== "asesi") {
    return res.status(403).json({ message: "Akses ditolak (Asesi only)" });
  }
  next();
};

exports.asesorOnly = (req, res, next) => {
  if (req.user.role !== "asesor") {
    return res.status(403).json({ message: "Akses ditolak (Asesor only)" });
  }
  next();
};

exports.tukOnly = (req, res, next) => {
  if (req.user.role !== "tuk") {
    return res.status(403).json({ message: "Akses ditolak (TUK only)" });
  }
  next();
};
