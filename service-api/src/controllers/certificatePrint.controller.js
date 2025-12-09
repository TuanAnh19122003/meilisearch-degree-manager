const CertificatePrintService = require('../services/certificatePrint.service');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const generateMulterStyleFilename = require('../utils/fileNaming');

class CertificatePrintController {
    async findAll(req, res) {
        try {
            const data = await CertificatePrintService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy tất cả văn bằng thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu văn bằng',
                error: error.message
            });
        }
    }

    async findByStudentId(req, res) {
        try {
            const data = await CertificatePrintService.findByStudentId(req.params.studentId);
            res.status(200).json({
                success: true,
                message: 'Lấy văn bằng của sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy văn bằng cho sinh viên này',
                error: error.message
            });
        }
    }

    async uploadFile(req, res) {
        try {
            if (!req.file) return res.status(400).json({ success: false, message: "Chưa có file upload" });

            const fileUrl = `uploads/${req.file.filename}`;
            const updated = await CertificatePrintService.saveFile(req.params.certificateId, fileUrl);

            res.status(200).json({
                success: true,
                message: 'Lưu file văn bằng thành công',
                data: updated
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu file văn bằng',
                error: error.message
            });
        }
    }

    async generatePDF(req, res) {
        try {
            const { cert_id, html } = req.body;

            if (!cert_id || !html)
                return res.status(400).json({ success: false, message: "Thiếu cert_id hoặc html" });

            const uploadDir = path.join(process.cwd(), 'src', 'uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true
            });

            await browser.close();

            // --- DÙNG TÊN FILE GIỐNG MULTER ---
            const filename = generateMulterStyleFilename(`cert-${cert_id}`, '.pdf');
            const filepath = path.join(uploadDir, filename);

            fs.writeFileSync(filepath, pdfBuffer);

            const fileUrl = `uploads/${filename}`;

            const updated = await CertificatePrintService.saveFile(cert_id, fileUrl);

            return res.json({
                success: true,
                message: "Tạo PDF thành công",
                data: updated
            });

        } catch (error) {
            console.error("PDF Error:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi generate PDF",
                error: error.message
            });
        }
    }
}

module.exports = new CertificatePrintController();
