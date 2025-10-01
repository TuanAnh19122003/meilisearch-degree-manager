const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_KEY,
});

const userIndex = client.index('users');
const roleIndex = client.index('roles');

(async () => {
    await userIndex.updateSearchableAttributes([
        'firstname', 'lastname', 'email', 'phone', 'role.name'
    ]);

    await userIndex.updateDisplayedAttributes([
        'id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'role', 'image'
    ]);

    await roleIndex.updateSearchableAttributes(['name', 'code']);
    await roleIndex.updateDisplayedAttributes(['id', 'name', 'code', 'description']);
})();

module.exports = { client, userIndex, roleIndex };
