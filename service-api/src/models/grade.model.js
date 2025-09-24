const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    grade: { type: DataTypes.DECIMAL(4, 2), allowNull: false }
}, {
    tableName: 'grades',
    timestamps: true,
});

module.exports = Grade;
