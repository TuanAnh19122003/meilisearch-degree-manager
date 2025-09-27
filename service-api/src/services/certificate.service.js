const Certificate = require('../models/certificate.model');

class CertificateService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
             include:[
                {
                    model: require('../models/student.model'),
                    as:'student',
                    attributes:['id','lastname','firstname','dob']
                }
            ],
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        };

        const certificates = await Certificate.findAndCountAll(queryOptions);
        return certificates;
    }

    static async findById(id) {
        const certificate = await Certificate.findOne({ 
            where: { id },
            include:[
                {
                    model: require('../models/student.model'),
                    as:'student',
                    attributes:['id','lastname','firstname']
                }
            ] 
        });
        if (!certificate) throw new Error("Không tìm thấy certificate");
        return certificate;
    }

    static async create(data) {
        return await Certificate.create(data);
    }

    static async update(id, data) {
        const certificate = await Certificate.findOne({ where: { id } });
        if (!certificate) throw new Error("Không tìm thấy certificate");
        return await certificate.update(data);
    }

    static async delete(id) {
        return await Certificate.destroy({ where: { id } });
    }
}

module.exports = CertificateService;
