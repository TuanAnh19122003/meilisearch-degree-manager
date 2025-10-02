const Role = require('../models/role.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Major = require('../models/major.model');
const StudentGpaService = require('../services/studentGpa.service');
const Certificate = require('../models/certificate.model');
const Course = require('../models/course.model');

const { roleIndex, userIndex, studentIndex, certificateIndex, courseIndex } = require('../config/meili.client');

async function syncTable(model, index, fields, extraMapper = null) {
    // Xóa toàn bộ dữ liệu cũ (nếu muốn làm fresh sync thì bỏ comment dòng này)
    // await index.deleteAllDocuments();

    const data = await model.findAll({
        include: model === Certificate ? [
            {
                model: require('../models/student.model'),
                as: 'student',
                attributes: ['id', 'code', 'firstname', 'lastname']
            }
        ] : model === User ? [
            { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        ] : model === Student ? [
            { model: Major, as: 'major', attributes: ['id', 'name'] }
        ] : []
    });

    if (!data.length) return;

    const documents = await Promise.all(data.map(async (item) => {
        let doc = {};
        fields.forEach(f => doc[f] = item[f]);
        if (extraMapper) doc = { ...doc, ...(await extraMapper(item)) };
        return doc;
    }));

    await index.addDocuments(documents);
    console.log(`Đã đồng bộ ${documents.length} bản ghi của ${model.name} lên Meilisearch`);
}

async function syncAll() {
    try {
        // Role
        await syncTable(Role, roleIndex, ['id', 'name', 'code', 'description']);

        // User
        await syncTable(User, userIndex,
            ['id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'image', 'roleId'],
            item => ({ role: item.role ? { id: item.role.id, name: item.role.name, code: item.role.code } : null })
        );

        // Student + GPA + hoc_luc
        await syncTable(Student, studentIndex,
            ['id', 'code', 'firstname', 'lastname', 'dob', 'gender', 'email', 'phone', 'address', 'majorId', 'image'],
            async (item) => {
                let gpa = null, hoc_luc = 'Chưa có';
                try {
                    const gpaData = await StudentGpaService.findById(item.id);
                    gpa = gpaData.gpa;
                    hoc_luc = gpaData.hoc_luc || 'Chưa có';
                } catch { }
                return { major: item.major ? { id: item.major.id, name: item.major.name } : null, gpa, hoc_luc };
            }
        );

        // Certificate
        await syncTable(Certificate, certificateIndex,
            ['id', 'studentId', 'number', 'type', 'grad_date', 'issuer', 'status', 'file_url'],
            async (item) => {
                return { student: item.student ? { id: item.student.id, code: item.student.code, firstname: item.student.firstname, lastname: item.student.lastname } : null };
            }
        );

        // Course (không cần join)
        await syncTable(Course, courseIndex,
            ['id', 'code', 'name', 'credit']
        );

        console.log('✅ Đồng bộ Meilisearch hoàn tất!');
    } catch (err) {
        console.error('❌ Lỗi khi đồng bộ Meilisearch:', err);
    }
}

module.exports = { syncAll };
