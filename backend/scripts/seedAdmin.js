const bcrypt = require("bcryptjs");
const sequelize = require("../src/config/database");
const User = require("../src/models/user.model");
const Role = require("../src/models/role.model");
const ProfileAdmin = require("../src/models/profileAdmin.model");

(async () => {
  await sequelize.authenticate();

  const adminRole = await Role.findOne({ where: { role_name: "admin" } });

  const hash = await bcrypt.hash("adminlsp123", 10);

  const user = await User.create({
    username: "adminlsp",
    password_hash: hash,
    id_role: adminRole.id_role,
    email: "admin@lsp.id",
    no_hp: "08123456789"
  });

  await ProfileAdmin.create({
    id_user: user.id_user,
    nama_lengkap: "Super Admin LSP"
  });

  console.log("✅ Admin berhasil dibuat");
  process.exit();
})();