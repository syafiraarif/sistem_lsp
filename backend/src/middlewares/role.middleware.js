exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {  
    return res.status(403).json({ message: "Akses ditolak (Admin only)" });
  }
  next();
};

exports.asesiOnly = (req, res, next) => {
  if (req.user.role !== "ASESI") {  
    return res.status(403).json({ message: "Akses ditolak (Asesi only)" });
  }
  next();
};

exports.asesorOnly = (req, res, next) => {
  if (req.user.role !== "ASESOR") {  
    return res.status(403).json({ message: "Akses ditolak (Asesor only)" });
  }
  next();
};

exports.tukOnly = (req, res, next) => {
  if (req.user.role !== "TUK") { 
    return res.status(403).json({ message: "Akses ditolak (TUK only)" });
  }
  next();
};