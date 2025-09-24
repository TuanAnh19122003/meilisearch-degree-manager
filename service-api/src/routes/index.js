const express = require('express');
const router = express.Router();

const role = require('./role.routes');

router.use('/roles', role);

module.exports = router;