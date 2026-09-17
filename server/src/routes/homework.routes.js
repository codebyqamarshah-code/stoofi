const express = require("express");
const { getAll, create, update, remove } = require("../controllers/homework.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const router = express.Router();
router.use(protect);
router.route("/").get(getAll).post(authorize('Super Admin', 'Admin', 'Teacher'), upload.single('file'), create);
router.route("/:id").put(authorize('Super Admin', 'Admin', 'Teacher'), update).delete(authorize('Super Admin', 'Admin', 'Teacher'), remove);
module.exports = router;