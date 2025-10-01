const Role = require('../models/role.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Major = require('../models/major.model');
const StudentGpaService = require('../services/studentGpa.service');
const { roleIndex, userIndex, studentIndex } = require('../config/meili.client');

async function syncTable(model, index, fields, extraMapper = null) {
    // Xóa toàn bộ dữ liệu cũ
    // await index.deleteAllDocuments();

    const data = await model.findAll({
        include: model === User ? [
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
        // Đồng bộ Role
        await syncTable(Role, roleIndex, ['id', 'name', 'code', 'description']);

        // Đồng bộ User
        await syncTable(User, userIndex,
            ['id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'image', 'roleId'],
            item => ({
                role: item.role ? { id: item.role.id, name: item.role.name, code: item.role.code } : null
            })
        );

        // Đồng bộ Student + GPA + hoc_luc
        await syncTable(Student, studentIndex,
            ['id', 'code', 'firstname', 'lastname', 'dob', 'gender', 'email', 'phone', 'address', 'majorId', 'image'],
            async (item) => {
                let gpa = null;
                let hoc_luc = 'Chưa có';

                try {
                    const gpaData = await StudentGpaService.findById(item.id);
                    gpa = gpaData.gpa;
                    hoc_luc = gpaData.hoc_luc || 'Chưa có';
                    //console.log(`Student ${item.id} GPA: ${gpa}, Hoc luc: ${hoc_luc}`);
                } catch (err) {
                    //console.log(`Student ${item.id} chưa có GPA`);
                }

                return {
                    major: item.major ? { id: item.major.id, name: item.major.name } : null,
                    gpa,
                    hoc_luc
                };
            }
        );

        console.log('Đồng bộ Meilisearch hoàn tất!');
    } catch (err) {
        console.error('Lỗi khi đồng bộ Meilisearch:', err);
    }
}

module.exports = { syncAll };
