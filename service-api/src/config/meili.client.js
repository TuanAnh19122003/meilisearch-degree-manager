const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_KEY,
});

const userIndex = client.index('users');
const roleIndex = client.index('roles');
const studentIndex = client.index('students');

(async () => {
    // User
    await userIndex.updateSearchableAttributes([
        'firstname', 'lastname', 'email', 'phone', 'role.name'
    ]);

    await userIndex.updateDisplayedAttributes([
        'id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'role', 'image'
    ]);

    // Role
    await roleIndex.updateSearchableAttributes(['name', 'code']);
    await roleIndex.updateDisplayedAttributes(['id', 'name', 'code', 'description']);

    // Student
    await studentIndex.updateSearchableAttributes([
        'firstname', 'lastname', 'email', 'phone', 'code', 'major.name'
    ]);

    await studentIndex.updateDisplayedAttributes([
        'id', 'code', 'firstname', 'lastname', 'dob', 'gender', 'email', 'phone', 'address', 'major', 'image', 'gpa', 'hoc_luc'
    ]);

    // Thêm filterable attributes
    await studentIndex.updateFilterableAttributes(['code','email']);

})();

module.exports = { client, userIndex, roleIndex, studentIndex };
