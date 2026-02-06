const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("users", {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255)
  },
  id_role: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING(100)
  },
  no_hp: {
    type: DataTypes.STRING(15)
  },
  status_user: {
    type: DataTypes.ENUM("aktif", "nonaktif"),
    defaultValue: "aktif"
  },
  created_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: "users",
  timestamps: false
});

module.exports = User;
