import axios from 'axios';

const logoUrl = '/templates/logo.png'; // đường dẫn tới logo

// Hàm helper chuyển ảnh sang Base64
async function toBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Lấy template HTML theo type
async function getTemplate(type) {
    let url = '/templates/ba.html';
    if (type === 'MA') url = '/templates/ma.html';
    else if (type === 'PhD') url = '/templates/phd.html';
    const res = await fetch(url);
    return await res.text();
}

// Hàm chính in văn bằng
export async function printCertificate(studentId, token, API_URL) {
    if (!studentId) return;

    try {
        // Lấy dữ liệu certificate + student + GPA
        const res = await axios.get(`${API_URL}/certificate-print/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cert = res.data.data;
        if (!cert) {
            alert('Không tìm thấy dữ liệu văn bằng');
            return;
        }

        const template = await getTemplate(cert.type);
        const logoBase64 = await toBase64(logoUrl);
        const isDraft = cert.status === 'draft';
        const opacityStyle = isDraft ? 'opacity: 0.3;' : '';

        const html = template
            .replace(/<%= logoBase64 %>/g, logoBase64)
            .replace(/<%= fullname %>/g, `${cert.lastname || ''} ${cert.firstname || ''}`)
            .replace(/<%= dob %>/g, cert.dob || '')
            .replace(/<%= gradYear %>/g, cert.grad_date ? new Date(cert.grad_date).getFullYear().toString() : '')
            .replace(/<%= classification %>/g, cert.hoc_luc || 'Chưa có')
            .replace(/<%= classificationEn %>/g, cert.gpa || '')
            .replace(/<%= number %>/g, cert.number || '')
            .replace('<body>', `<body style="${opacityStyle}">`);

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    } catch (err) {
        console.error(err);
        alert('Lỗi khi tải dữ liệu văn bằng');
    }
}
