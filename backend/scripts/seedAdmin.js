const bcrypt = require("bcryptjs");
const sequelize = require("../src/config/database");
const User = require("../src/models/user.model");
const Role = require("../src/models/role.model");
const ProfileAdmin = require("../src/models/profileAdmin.model");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi database berhasil");

    let adminRole = await Role.findOne({ where: { role_name: "admin" } });
    
    if (!adminRole) {
      adminRole = await Role.create({
        role_name: "admin",
        deskripsi: "Administrator"
      });
      console.log("✅ Role 'admin' berhasil dibuat");
    } else {
      console.log("ℹ️ Role 'admin' sudah ada");
    }

    const existingUser = await User.findOne({ where: { username: "adminlsp" } });
    if (existingUser) {
      console.log("⚠️ User 'adminlsp' sudah ada!");
      process.exit();
    }

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

    console.log("✅ Admin berhasil dibuat!");
    console.log("   Username: adminlsp");
    console.log("   Password: adminlsp123");
    
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();