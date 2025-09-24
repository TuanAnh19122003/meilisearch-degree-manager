const sequelize = require('../config/database');

// Import models
const Role = require('./role.model');
const User = require('./user.model');
const Log = require('./log.model');
const Certificate = require('./certificate.model'); 
const Course = require('./course.model');
const Grade = require('./grade.model');
const Department = require('./department.model');
const Major = require('./major.model');
const Student = require('./student.model');

const db = {
    sequelize,
    Role,
    User,
    Log,
    Certificate,
    Course,
    Grade,
    Department,
    Major,
    Student
};

require('./initRelationships')(db);

sequelize.sync({ force: false })
    .then(() => {
        console.log('Connection successful');
    })
    .catch((error) => {
        console.error('Connection error:', error);
        throw error;
    });

module.exports = db;
