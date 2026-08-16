const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk07Hasil = sequelize.define(
    "fr_ak07_hasil",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        id_fr_ak07: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bagian: {
            type: DataTypes.ENUM("A", "B"),
            allowNull: true
        },
        acuan_pembanding: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        metode_asesmen: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        instrumen_asesmen: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "fr_ak07_hasil",
        timestamps: false
    }
);

module.exports = FrAk07Hasil;