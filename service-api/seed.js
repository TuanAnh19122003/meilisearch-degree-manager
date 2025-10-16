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

        await sequelize.sync({ force: true });
        console.log('✅ Database dropped & recreated...');

        // ===================== Departments =====================
        const departmentsData = [
            { code: '7510301', name: 'Công nghệ kỹ thuật điện, điện tử' },
            { code: '7520115', name: 'Kỹ thuật Nhiệt' },
            { code: '7510403', name: 'Công nghệ kỹ thuật Năng lượng' },
            { code: '7510601', name: 'Quản lý công nghiệp' },
            { code: '7510602', name: 'Quản lý năng lượng' },
            { code: '7510605', name: 'Logistics và quản lý chuỗi cung ứng' },
            { code: '7510303', name: 'Công nghệ kỹ thuật điều khiển và tự động hóa' },
            { code: '7510302', name: 'Công nghệ kỹ thuật Điện tử - Viễn thông' },
            { code: '7480201', name: 'Công nghệ thông tin' },
            { code: '75102101', name: 'Công nghệ kỹ thuật cơ khí' },
            { code: '7510102', name: 'Công nghệ kỹ thuật công trình xây dựng' },
            { code: '7340101', name: 'Quản trị kinh doanh' },
            { code: '7340201', name: 'Tài chính – Ngân hàng' },
            { code: '7340301', name: 'Kế toán' },
            { code: '7340302', name: 'Kiểm toán' },
            { code: '7340122', name: 'Thương mại điện tử' },
            { code: '7810103', name: 'Quản trị dịch vụ du lịch và lữ hành' },
            { code: '7520107', name: 'Kỹ thuật Robot' },
            { code: '7460108', name: 'Khoa học dữ liệu' },
            { code: '7480106', name: 'Kỹ thuật máy tính' },
            { code: '7510205', name: 'Công nghệ kỹ thuật ô tô' },
            { code: '7810201', name: 'Quản trị khách sạn' },
            { code: '7340115', name: 'Marketing' },
            { code: '7340205', name: 'Công nghệ tài chính' },
            { code: '7480107', name: 'Trí tuệ nhân tạo' },
            { code: '7460117', name: 'Toán tin' },
            { code: '7380107', name: 'Luật kinh tế' },
            { code: '7220201', name: 'Ngôn ngữ Anh' },
        ];

        await Department.destroy({ where: {} });
        const departments = await Department.bulkCreate(departmentsData, { returning: true });
        console.log(`✅ Created ${departments.length} departments`);

        // ===================== Majors =====================
        const majorsData = [
            ['Hệ thống điện', '7510301'],
            ['Điện công nghiệp và dân dụng', '7510301'],
            ['Tự động hóa hệ thống điện', '7510301'],
            ['Nhiệt điện', '7520115'],
            ['Điện lạnh', '7520115'],
            ['Nhiệt công nghiệp', '7520115'],
            ['Năng lượng tái tạo', '7510403'],
            ['Quản lý công nghiệp', '7510601'],
            ['Quản lý năng lượng', '7510602'],
            ['Logistics và Quản lý chuỗi cung ứng', '7510605'],
            ['Công nghệ kỹ thuật điều khiển', '7510303'],
            ['Tự động hóa và điều khiển thiết bị điện công nghiệp', '7510303'],
            ['Điện tử và kỹ thuật máy tính', '7510302'],
            ['Điện tử viễn thông', '7510302'],
            ['Công nghệ phần mềm', '7480201'],
            ['Hệ thống thương mại điện tử', '7480201'],
            ['Quản trị và an ninh mạng', '7480201'],
            ['Cơ khí chế tạo máy', '75102101'],
            ['Cơ khí ô tô', '75102101'],
            ['Xây dựng công trình điện', '7510102'],
            ['Xây dựng dân dụng và công nghiệp', '7510102'],
            ['Quản trị doanh nghiệp', '7340101'],
            ['Tài chính doanh nghiệp', '7340201'],
            ['Ngân hàng', '7340201'],
            ['Kế toán doanh nghiệp', '7340301'],
            ['Kiểm toán', '7340302'],
            ['Kinh doanh thương mại trực tuyến', '7340122'],
            ['Quản trị dịch vụ du lịch và lữ hành', '7810103'],
            ['Robot tự động hóa công nghiệp', '7520107'],
            ['Khoa học dữ liệu', '7460108'],
            ['Máy tính và hệ thống nhúng', '7480106'],
            ['Công nghệ kỹ thuật ô tô', '7510205'],
            ['Quản trị khách sạn', '7810201'],
            ['Marketing', '7340115'],
            ['Công nghệ tài chính', '7340205'],
            ['Trí tuệ nhân tạo trong tự động hóa', '7480107'],
            ['Toán tin', '7460117'],
            ['Luật kinh tế', '7380107'],
            ['Tiếng Anh thương mại – du lịch', '7220201'],
        ];

        await Major.destroy({ where: {} });
        const majors = await Major.bulkCreate(
            majorsData.map(([name, deptCode], i) => ({
                name,
                code: `${deptCode}-${(i + 1).toString().padStart(2, '0')}`,
                deptId: departments.find(d => d.code === deptCode).id,
            })),
            { returning: true }
        );
        console.log(`✅ Created ${majors.length} majors`);

        // ===================== Courses =====================
        await Course.destroy({ where: {} });
        const courses = await Course.bulkCreate([
            { code: 'MATH101', name: 'Toán cao cấp', credit: 3 },
            { code: 'CS101', name: 'Lập trình cơ bản', credit: 3 },
            { code: 'PHYS101', name: 'Vật lý đại cương', credit: 3 },
            { code: 'EE101', name: 'Điện tử cơ bản', credit: 3 },
            { code: 'BUS101', name: 'Quản trị học', credit: 3 },
        ]);
        console.log(`✅ Created ${courses.length} courses`);

        // ===================== Roles =====================
        await Role.destroy({ where: {} });
        const roles = await Role.bulkCreate(
            [
                { code: 'admin', name: 'Admin', description: 'Quản trị hệ thống' },
                { code: 'staff', name: 'Staff', description: 'Nhân viên' },
                { code: 'student', name: 'Student', description: 'Sinh viên' },
            ],
            { returning: true }
        );
        console.log(`✅ Created ${roles.length} roles`);

        // ===================== Users =====================
        await User.destroy({ where: {} });
        const users = await User.bulkCreate([
            {
                firstname: 'Admin',
                lastname: 'EPU',
                email: 'admin@epu.edu.vn',
                password: 'admin123',
                roleId: roles.find(r => r.code === 'admin').id,
                is_active: true,
            },
            {
                firstname: 'Staff',
                lastname: 'EPU',
                email: 'staff@epu.edu.vn',
                password: 'staff123',
                roleId: roles.find(r => r.code === 'staff').id,
                is_active: true,
            },
        ]);
        console.log(`✅ Created ${users.length} users`);

        // ===================== Students =====================
        console.log('🚀 Generating 25,000 students...');
        const students = [];
        const existingCodes = new Set();
        const vietnameseLastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
        const vietnameseMiddleNames = ['Văn', 'Thị', 'Hữu', 'Quang', 'Minh', 'Ngọc', 'Tuấn', 'Bảo', 'Gia', 'Thanh'];
        const vietnameseFirstNames = ['An', 'Bình', 'Cường', 'Dương', 'Hải', 'Huy', 'Khang', 'Minh', 'Nam', 'Quân', 'Thảo', 'Lan', 'Vy', 'Anh', 'Tuấn'];

        function generateUniqueStudentCode() {
            let code;
            do {
                code = `21${Math.floor(100000000 + Math.random() * 900000000)}`;
            } while (existingCodes.has(code));
            existingCodes.add(code);
            return code;
        }

        // ✅ Hàm loại bỏ dấu tiếng Việt
        function removeVietnameseTones(str) {
            return str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D');
        }

        for (let i = 0; i < 25000; i++) {
            const major = faker.helpers.arrayElement(majors);
            const lastname = faker.helpers.arrayElement(vietnameseLastNames);
            const middlename = faker.helpers.arrayElement(vietnameseMiddleNames);
            const firstname = faker.helpers.arrayElement(vietnameseFirstNames);
            const code = generateUniqueStudentCode();

            // ✅ Email chuẩn: <tên><chữ đầu họ><chữ đầu tên đệm>.<mã>@epu.edu.vn
            const emailPrefixRaw = `${firstname.toLowerCase()}${lastname[0].toLowerCase()}${middlename[0].toLowerCase()}`;
            const emailPrefix = removeVietnameseTones(emailPrefixRaw);
            const email = `${emailPrefix}.${code}@epu.edu.vn`;

            students.push({
                code,
                firstname,
                lastname: `${lastname} ${middlename}`,
                dob: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
                gender: faker.helpers.arrayElement(['male', 'female']),
                email,
                phone: faker.phone.number('09########'),
                address: faker.location.streetAddress(),
                majorId: major.id,
            });
        }


        await Student.destroy({ where: {} });
        const createdStudents = await Student.bulkCreate(students, { returning: true });
        console.log(`✅ Created ${createdStudents.length} students`);


        // ===================== Certificates =====================
        const certificates = createdStudents.map(stu => ({
            studentId: stu.id,
            type: faker.helpers.arrayElement(['BA', 'MA', 'PhD', 'CERT']),
            number: `CERT-${stu.code}`,
            grad_date: faker.date.between({ from: '2022-01-01', to: new Date() }),
            issuer: 'Đại học Điện lực',
            status: faker.helpers.arrayElement(['draft', 'issued', 'revoked']),
        }));
        await Certificate.destroy({ where: {} });
        await Certificate.bulkCreate(certificates);
        console.log(`✅ Created ${certificates.length} certificates`);

        // ===================== Grades =====================
        console.log('🎓 Generating grades...');
        const grades = [];
        for (const student of createdStudents) {
            const selectedCourses = faker.helpers.arrayElements(courses, faker.number.int({ min: 3, max: 6 }));
            for (const course of selectedCourses) {
                grades.push({
                    studentId: student.id,
                    courseId: course.id,
                    grade: faker.number.float({ min: 0, max: 10, precision: 0.01 }),
                    date: faker.date.between({ from: '2022-01-01', to: new Date() }),
                });
            }
        }
        await Grade.destroy({ where: {} });
        await Grade.bulkCreate(grades, { hooks: false });
        console.log(`✅ Created ${grades.length} grades`);

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seed();
