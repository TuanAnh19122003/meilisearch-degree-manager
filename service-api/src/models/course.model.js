const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    credit: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'courses',
    timestamps: true,
});

module.exports = Course;
