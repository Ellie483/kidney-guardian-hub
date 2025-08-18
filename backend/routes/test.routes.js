const express = require('express');
const router = express.Router();
const { getTestMessage } = require('../controllers/test.controller');

// Define route and link controller
router.get('/', getTestMessage);

module.exports = router;
