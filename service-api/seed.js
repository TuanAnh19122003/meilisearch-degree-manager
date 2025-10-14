const sequelize = require('./src/config/database');
const { faker } = require('@faker-js/faker');

const Department = require('./src/models/department.model');
const Major = require('./src/models/major.model');
const Student = require('./src/models/student.model');
const Course = require('./src/models/course.model');
const Grade = require('./src/models/grade.model');
const Certificate = require('./src/models/certificate.model');
const Role = require('./src/models/role.model');
const User = require('./src/models/user.model');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected...');

        // Reset database
        await sequelize.sync({ force: true });
        console.log('✅ Database synced...');

        // ===================== Departments =====================
        const deptsData = ['Công nghệ thông tin', 'Điện tử', 'Cơ khí', 'Quản trị kinh doanh', 'Toán - Tin'];
        const departments = await Department.bulkCreate(
            deptsData.map((name, i) => ({ code: `DPT-${i + 1}`, name }))
        );
        console.log(`✅ Created ${departments.length} departments`);

        // ===================== Majors =====================
        const majorsData = [
            ['CNTT', 'Công nghệ thông tin', 0],
            ['ĐT', 'Điện tử', 1],
            ['CK', 'Cơ khí', 2],
            ['QTKD', 'Quản trị kinh doanh', 3],
            ['TT', 'Toán - Tin', 4]
        ];
        const majors = await Major.bulkCreate(
            majorsData.map(([code, name, deptIdx]) => ({ code, name, deptId: departments[deptIdx].id }))
        );
        console.log(`✅ Created ${majors.length} majors`);

        // ===================== Courses =====================
        const coursesData = [
            ['MATH101', 'Toán cao cấp', 3],
            ['CS101', 'Lập trình cơ bản', 3],
            ['PHYS101', 'Vật lý đại cương', 3],
            ['EE101', 'Điện tử cơ bản', 3],
            ['BUS101', 'Quản trị học', 3]
        ];
        const courses = await Course.bulkCreate(
            coursesData.map(([code, name, credit]) => ({ code, name, credit }))
        );
        console.log(`✅ Created ${courses.length} courses`);

        // ===================== Roles =====================
        const rolesData = [
            ['admin', 'Admin', 'Quản trị hệ thống'],
            ['staff', 'Staff', 'Nhân viên'],
            ['student', 'Student', 'Sinh viên']
        ];
        const roles = await Role.bulkCreate(
            rolesData.map(([code, name, desc]) => ({ code, name, description: desc }))
        );
        console.log(`✅ Created ${roles.length} roles`);

        // ===================== Users =====================
        const users = await User.bulkCreate([
            { firstname: 'Admin', lastname: 'EPU', email: 'admin@epu.edu.vn', password: 'admin123', roleId: roles[0].id },
            { firstname: 'Staff', lastname: 'EPU', email: 'staff@epu.edu.vn', password: 'staff123', roleId: roles[1].id }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // ===================== Students =====================
        const students = [];
        const vietnameseLastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
        const vietnameseMiddleNames = ['Văn', 'Thị', 'Hữu', 'Quang', 'Minh', 'Ngọc', 'Hoàng', 'Tuấn', 'Bảo', 'Gia'];
        const vietnameseFirstNames = ['An', 'Bình', 'Cường', 'Dương', 'Hải', 'Huy', 'Khang', 'Minh', 'Nam', 'Quân', 'Thảo', 'Lan', 'Vy'];

        for (let i = 1; i <= 10000; i++) {
            const major = faker.helpers.arrayElement(majors);
            const lastname = faker.helpers.arrayElement(vietnameseLastNames);
            const middlename = faker.helpers.arrayElement(vietnameseMiddleNames);
            const firstname = faker.helpers.arrayElement(vietnameseFirstNames);

            // Tên đầy đủ ít nhất 3 chữ
            const fullName = `${lastname} ${middlename} ${firstname}`;

            // MSV 11 chữ số
            const studentCode = `21${Math.floor(100000000 + Math.random() * 900000000)}`;

            const email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}${studentCode}@epu.edu.vn`;

            students.push({
                code: studentCode,
                firstname: firstname,
                lastname: `${lastname} ${middlename}`,
                dob: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
                gender: faker.helpers.arrayElement(['male', 'female', 'other']),
                email,
                phone: faker.phone.number('09########'),
                address: faker.location.streetAddress(),
                majorId: major.id,
                image: null
            });
        }

        const createdStudents = await Student.bulkCreate(students, { hooks: false, returning: true });
        console.log('✅ Created 10,000 students');

        // ===================== Certificates =====================
        const certificates = createdStudents.map((stu, idx) => ({
            studentId: stu.id,
            type: faker.helpers.arrayElement(['BA', 'MA', 'PhD', 'CERT']),
            number: `CERT-${(idx + 1).toString().padStart(6, '0')}`,
            grad_date: faker.date.past({ years: 1 }),
            issuer: 'ĐH Điện lực',
            status: faker.helpers.arrayElement  (['draft', 'issued', 'revoked']),
            file_url: null
        }));

        await Certificate.bulkCreate(certificates, { hooks: false });
        console.log('✅ Created 10,000 certificates');

        // ===================== Grades =====================
        const grades = [];
        for (const student of createdStudents) {
            // Chọn 3-5 khóa học ngẫu nhiên
            const studentCourses = faker.helpers.arrayElements(courses, faker.number.int({ min: 3, max: 5 }));
            for (const course of studentCourses) {
                grades.push({
                    studentId: student.id,
                    courseId: course.id,
                    grade: faker.number.float({ min: 0, max: 10, precision: 0.01 }),
                    date: faker.date.past({ years: 1 })
                });
            }
        }

        await Grade.bulkCreate(grades, { hooks: false });
        console.log(`✅ Created ${grades.length} grades`);

        console.log('🎉 Seeding completed!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seed();
