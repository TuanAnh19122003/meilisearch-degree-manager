const path = require('path');
const normalizeName = require('./normalizeName');

function generateMulterStyleFilename(originalName, ext = '.pdf') {
    const cleanName = normalizeName(originalName);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 8);

    const dateStr = `${day}-${month}-${year}`;
    return `${dateStr}-${randomStr}-${cleanName}${ext}`;
}

module.exports = generateMulterStyleFilename;
