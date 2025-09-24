const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Major = sequelize.define('Major', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    deptId: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'majors',
    timestamps: true,
});

module.exports = Major;
