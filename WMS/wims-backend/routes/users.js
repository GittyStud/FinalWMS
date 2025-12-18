const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["Admin"]), userController.getAllUsers);
router.post("/", authenticate, authorize(["Admin"]), userController.createUser);
router.put(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  userController.deleteUser
);

module.exports = router;
