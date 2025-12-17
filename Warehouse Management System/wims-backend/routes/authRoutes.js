const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Corrected Path

router.post('/register', authController.register); // New Endpoint
router.post('/login', authController.login);

module.exports = router;