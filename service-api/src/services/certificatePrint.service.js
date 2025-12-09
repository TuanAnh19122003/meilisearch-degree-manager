const { QueryTypes } = require('sequelize');
const Certificate = require('../models/certificate.model');
const sequelize = require('../config/database');

class CertificatePrintService {
    static async findAll() {
        return await sequelize.query(
            'SELECT * FROM print_certificate_view ORDER BY student_id ASC',
            { type: QueryTypes.SELECT }
        );
    }

    static async findByStudentId(studentId) {
        const data = await sequelize.query(
            'SELECT * FROM print_certificate_view WHERE student_id = :id',
            {
                replacements: { id: studentId },
                type: QueryTypes.SELECT
            }
        );

        if (data.length === 0) throw new Error("Không tìm thấy văn bằng cho sinh viên này");
        return data[0];
    }

    static async saveFile(certificateId, fileUrl) {
        const cert = await Certificate.findByPk(certificateId);
        if (!cert) throw new Error("Certificate not found");

        cert.file_url = fileUrl;
        await cert.save();

        // SYNC vào Meilisearch
        const { syncCertificate } = require('./meiliSync.service');
        syncCertificate(certificateId).catch(console.error);

        return cert;
    }

}

module.exports = CertificatePrintService;
