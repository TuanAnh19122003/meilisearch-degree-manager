const Grade = require('../models/grade.model');

class GradeService {
    static async findAll(){
        const data = await Grade.findAll({
            order:[['createdAt','ASC']],
            include:[
                {
                    model: require('../models/student.model'),
                    as:'student',
                    attributes:['id','lastname','firstname']
                },
                {
                    model: require('../models/course.model'),
                    as:'course',
                    attributes:['id','name']
                }
            ]
        });
        return data;
    }

    static async create(data){
        const grade = await Grade.create(data);
        return grade;
    }

    static async update(id, data) {
        const grade = await Grade.findOne({ where: { id: id } });
        if (!grade) throw new Error("Không tìm thấy grade");
        return await grade.update(data);
    }

    static async delete(id) {
        return await Grade.destroy({ where: { id: id } })
    }
}

module.exports = GradeService;