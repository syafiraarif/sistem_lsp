const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const { secret, expiresIn } = require("../../config/jwt");

exports.login = async (req,res)=>{
  const { username, password } = req.body;

  const user = await User.findOne({
    where:{ username },
    include: Role
  });
  if(!user) return res.status(401).json({message:"User tidak ditemukan"});

  const valid = await bcrypt.compare(password, user.password_hash);
  if(!valid) return res.status(401).json({message:"Password salah"});

  const token = jwt.sign({
    id_user: user.id_user,
    role: user.role.role_name
  }, secret, { expiresIn });

  res.json({ token });
};


exports.logout = async (req, res) => {
  res.json({ message: "Logout berhasil (client hapus token)" });
};
