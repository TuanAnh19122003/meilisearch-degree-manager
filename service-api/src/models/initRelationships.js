module.exports = (db) => {
    const { Department, Major, Student, Course, Grade, Certificate, Role, User, Log } = db;

    // Department ↔ Major
    Major.belongsTo(Department, { foreignKey: 'deptId', as: 'department' });
    Department.hasMany(Major, { foreignKey: 'deptId', as: 'majors' });

    // Major ↔ Student
    Student.belongsTo(Major, { foreignKey: 'majorId', as: 'major' });
    Major.hasMany(Student, { foreignKey: 'majorId', as: 'students' });

    // Student ↔ Certificate
    Certificate.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(Certificate, { foreignKey: 'studentId', as: 'certificates' });

    // Student ↔ Grade
    Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });

    // Course ↔ Grade
    Grade.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
    Course.hasMany(Grade, { foreignKey: 'courseId', as: 'grades' });

    // Role ↔ User
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

    // User ↔ Log
    Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
};
