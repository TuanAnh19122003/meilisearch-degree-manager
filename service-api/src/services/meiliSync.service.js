const Role = require('../models/role.model');
const User = require('../models/user.model');
const { roleIndex, userIndex } = require('../config/meili.client');

async function syncTable(model, index, fields, extraMapper = null) {
    // Xóa toàn bộ dữ liệu cũ
    await index.deleteAllDocuments();

    const data = await model.findAll({
        include: model === User ? [
            { model: Role, as: 'role', attributes: ['id','name','code'] }
        ] : []
    });

    if (!data.length) return;

    const documents = data.map(item => {
        let doc = {};
        fields.forEach(f => doc[f] = item[f]);
        if (extraMapper) doc = { ...doc, ...extraMapper(item) };
        return doc;
    });

    await index.addDocuments(documents);
    console.log(`Đã đồng bộ ${documents.length} bản ghi của ${model.name} lên Meilisearch`);
}

async function syncAll() {
    try {
        await syncTable(Role, roleIndex, ['id','name','code','description']);
        await syncTable(User, userIndex,
            ['id','firstname','lastname','email','phone','is_active','image','roleId'],
            item => ({ role: item.role ? { id: item.role.id, name: item.role.name, code: item.role.code } : null })
        );
        console.log('Đồng bộ Meilisearch hoàn tất!');
    } catch (err) {
        console.error('Lỗi khi đồng bộ Meilisearch:', err);
    }
}

module.exports = { syncAll };
