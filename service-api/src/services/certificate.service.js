const Certificate = require('../models/certificate.model');
const { Sequelize } = require('sequelize');
const { certificateIndex } = require('../config/meili.client');
const Student = require('../models/student.model');

class CertificateService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            include: [
                {
                    model: require('../models/student.model'),
                    as: 'student',
                    attributes: ['id', 'lastname', 'firstname', 'dob', 'code']
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
            include: [
                {
                    model: require('../models/student.model'),
                    as: 'student',
                    attributes: ['id', 'lastname', 'firstname', 'code']
                }
            ]
        });
        if (!certificate) throw new Error("Không tìm thấy certificate");
        return certificate;
    }

    static async create(data) {
        const cert = await Certificate.create(data);
        const student = cert.studentId ? await Student.findByPk(cert.studentId) : null;

        await certificateIndex.addDocuments([{
            id: cert.id,
            number: cert.number,
            type: cert.type,
            grad_date: cert.grad_date,
            issuer: cert.issuer,
            status: cert.status,
            file_url: cert.file_url,
            student: student ? { id: student.id, code: student.code, firstname: student.firstname, lastname: student.lastname } : null
        }]);

        return cert;
    }

    // Trong update
    static async update(id, data) {
        const cert = await Certificate.findOne({ where: { id } });
        if (!cert) throw new Error("Không tìm thấy certificate");

        const updated = await cert.update(data);
        const student = updated.studentId ? await Student.findByPk(updated.studentId) : null;

        await certificateIndex.updateDocuments([{
            id: updated.id,
            number: updated.number,
            type: updated.type,
            grad_date: updated.grad_date,
            issuer: updated.issuer,
            status: updated.status,
            file_url: updated.file_url,
            student: student ? { id: student.id, code: student.code, firstname: student.firstname, lastname: student.lastname } : null
        }]);

        return updated;
    }

    static async delete(id) {
        return await Certificate.destroy({ where: { id } });
    }

    static async total() {
        const count = await Certificate.count();
        return count;
    }

    // Lấy thống kê theo trạng thái
    static async statsByStatus() {
        const statsRaw = await Certificate.findAll({
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['status'],
            raw: true
        });

        const result = { draft: 0, issued: 0, revoked: 0 };
        statsRaw.forEach(item => {
            result[item.status] = parseInt(item.count);
        });

        return result;
    }

    // Lấy thống kê theo năm (PostgreSQL)
    static async statsByYear() {
        const certificates = await Certificate.findAll({
            attributes: [
                [Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "grad_date"')), 'year'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['year'],
            order: [['year', 'ASC']],
            raw: true
        });

        return certificates.map(c => ({
            year: parseInt(c.year),
            count: parseInt(c.count)
        }));
    }

    // Lấy recent certificates
    static async recent(limit = 5) {
        const all = await Certificate.findAll({
            order: [['createdAt', 'DESC']],
            limit
        });
        return all;
    }

}

module.exports = CertificateService;
