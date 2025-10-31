const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_KEY,
});

const userIndex = client.index('users');
const roleIndex = client.index('roles');
const studentIndex = client.index('students');
const certificateIndex = client.index('certificates');
const courseIndex = client.index('courses');
const departmentIndex = client.index('departments');
const majorIndex = client.index('majors');

(async () => {
    // Tạo indexes với primary key nếu chưa tồn tại
    await client.createIndex('users', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('roles', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('students', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('certificates', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('courses', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('departments', { primaryKey: 'id' }).catch(() => {});
    await client.createIndex('majors', { primaryKey: 'id' }).catch(() => {});


    // User
    await userIndex.updateSearchableAttributes(['firstname', 'lastname', 'email', 'phone', 'role.name']);
    await userIndex.updateDisplayedAttributes(['id', 'firstname', 'lastname', 'email', 'phone', 'is_active', 'role', 'image']);

    // Role
    await roleIndex.updateSearchableAttributes(['name', 'code']);
    await roleIndex.updateDisplayedAttributes(['id', 'name', 'code', 'description']);

    // Student
    await studentIndex.updateSearchableAttributes(['firstname', 'lastname', 'email', 'phone', 'code', 'major.name']);
    await studentIndex.updateDisplayedAttributes(['id', 'code', 'firstname', 'lastname', 'dob', 'gender', 'email', 'phone', 'address', 'major', 'image', 'gpa', 'hoc_luc']);
    await studentIndex.updateFilterableAttributes(['code', 'email']);

    // Certificate
    await certificateIndex.updateSearchableAttributes(['number', 'type', 'issuer', 'student.firstname', 'student.lastname', 'student.code']);
    await certificateIndex.updateDisplayedAttributes(['id', 'number', 'type', 'grad_date', 'issuer', 'status', 'file_url', 'student']);
    await certificateIndex.updateFilterableAttributes(['number', 'status', 'student.code', 'student.firstname', 'student.lastname']);

    // Course
    await courseIndex.updateSearchableAttributes(['name', 'code']);
    await courseIndex.updateDisplayedAttributes(['id', 'name', 'code', 'credit']);
    await courseIndex.updateFilterableAttributes(['code', 'name', 'credit']);

    // Department
    await departmentIndex.updateSearchableAttributes(['name', 'code']);
    await departmentIndex.updateDisplayedAttributes(['code', 'name']);
    await departmentIndex.updateFilterableAttributes(['id', 'code', 'name']);

    // Major
    await majorIndex.updateSearchableAttributes(['name', 'code', 'department.name', 'department.code']);
    await majorIndex.updateDisplayedAttributes(['id', 'code', 'name', 'deptId', 'department']);
    await majorIndex.updateFilterableAttributes(['id', 'code', 'name', 'deptId', 'department.name', 'department.code']);
})();

module.exports = { client, userIndex, roleIndex, studentIndex, certificateIndex, courseIndex, departmentIndex, majorIndex };
