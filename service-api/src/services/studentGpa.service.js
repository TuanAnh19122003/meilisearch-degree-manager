const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

class StudentGpaService {
    static async findAll() {
        return await sequelize.query(
            'SELECT * FROM student_gpa ORDER BY student_id ASC',
            { type: QueryTypes.SELECT }
        );
    }

    static async findById(id) {
        const data = await sequelize.query(
            'SELECT * FROM student_gpa WHERE student_id = :id',
            {
                replacements: { id },
                type: QueryTypes.SELECT
            }
        );

        if (data.length === 0) throw new Error("Không tìm thấy GPA cho sinh viên này");
        return data[0];
    }
}

module.exports = StudentGpaService;
