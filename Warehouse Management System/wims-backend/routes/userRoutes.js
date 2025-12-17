const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware'); 
const router = express.Router();

// User Management (Admin Feature - Req. 1)
// All routes require 'Admin' role access

// GET /api/users: Fetch all users
router.get('/', protect, authorize(['Admin']), userController.getUsers);

// POST /api/users: Create a new user
router.post('/', protect, authorize(['Admin']), userController.createUser);

// PUT /api/users/:id: Update an existing user
router.put('/:id', protect, authorize(['Admin']), userController.updateUser);

// DELETE /api/users/:id: Delete a user
router.delete('/:id', protect, authorize(['Admin']), userController.deleteUser);

module.exports = router;