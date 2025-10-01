const Role = require('../models/role.model');
const User = require('../models/user.model');
const { roleIndex, userIndex } = require('../config/meili.client');

// Hàm đồng bộ chung cho 1 bảng
async function syncTable(model, index, fields, extraMapper = null) {
    // Xóa toàn bộ dữ liệu cũ trước khi thêm mới
    await index.deleteAllDocuments();

    // Lấy dữ liệu từ DB
    const data = await model.findAll({
        include: model === User ? [{ model: Role, as: 'role', attributes: ['id', 'name', 'code'] }] : []
    });
    if (!data.length) return;

    // Map dữ liệu theo fields + extraMapper nếu có
    const documents = data.map(item => {
        let doc = {};
        fields.forEach(f => doc[f] = item[f]);
        if (extraMapper) doc = { ...doc, ...extraMapper(item) };
        return doc;
    });

    // Add documents vào Meilisearch
    await index.addDocuments(documents);
    console.log(`Đã đồng bộ ${documents.length} bản ghi của ${model.name} lên Meilisearch`);
}

// Đồng bộ tất cả
async function syncAll() {
    try {
        // Đồng bộ Roles
        await syncTable(Role, roleIndex, ['id', 'code', 'name', 'description']);

        // Đồng bộ Users
        await syncTable(
            User,
            userIndex,
            ['id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'image', 'roleId'],
            (item) => ({
                role: item.role ? { id: item.role.id, name: item.role.name, code: item.role.code } : null
            })
        );

        console.log('Đồng bộ dữ liệu Meilisearch hoàn tất!');
    } catch (err) {
        console.error('Lỗi khi đồng bộ Meilisearch:', err);
    }
}

module.exports = { syncAll };
